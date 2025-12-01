
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, Download, CheckCircle2, Loader2,
  ChevronRight, ChevronDown, Edit3, Save, Wand2,
  Lock, RotateCcw, ArrowRightCircle, RefreshCw, Paperclip, TableProperties,
  LogOut, ArrowLeft, Cloud, CloudLightning, Stethoscope, RefreshCcw,
  BookOpen, History, AlertTriangle, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { PlanSection, AppContextState, SectionStatus, SectionType, FinancialYear, BusinessGoal, ProjectAsset, DiagnosisResponse, UploadedFile, User, Project, ProjectVersion } from './types';
import { INITIAL_SECTIONS, DEFAULT_METHODOLOGY, IMAGE_PROMPTS } from './constants';
import { generateSectionContent, generateFinancialData, generateMissingQuestions, generateGlobalDiagnosis, generateProjectImage, generateValueMatrix } from './services/gemini';
import { ContextManager } from './components/ContextManager';
import { FinancialChart } from './components/FinancialChart';
import { ValueMatrixViewer } from './components/ValueMatrixViewer';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { LiveDocumentPreview } from './components/LiveDocumentPreview';

const STORAGE_KEY_PROJECTS = 'scine_saas_projects';
const STORAGE_KEY_USER = 'scine_saas_user';

const hasGeminiKey = () => {
    const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) || {};
    const processEnv = (typeof process !== 'undefined' ? (process as any).env : undefined) || {};
    return Boolean(metaEnv.GEMINI_API_KEY || metaEnv.VITE_API_KEY || processEnv.GEMINI_API_KEY || processEnv.VITE_API_KEY || processEnv.API_KEY);
};

type ViewState = 'auth' | 'dashboard' | 'editor' | 'preview';

const App: React.FC = () => {
  // --- GLOBAL SAAS STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // --- EDITOR STATE (Active Project) ---
  const [sections, setSections] = useState<PlanSection[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string>('context');
  const [contextState, setContextState] = useState<AppContextState>({
    methodology: DEFAULT_METHODOLOGY,
    businessGoal: BusinessGoal.FINANCING_BRDE, 
    rawContext: '',
    uploadedFiles: [],
    assets: []
  });
  // diagnosisHistory replaces single diagnosis
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisResponse[]>([]); 
  const [isDiagnosisLoading, setIsDiagnosisLoading] = useState(false);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showImageGen, setShowImageGen] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [imageGenType, setImageGenType] = useState<'logo' | 'map' | 'floorplan'>('logo');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [refinementText, setRefinementText] = useState('');
  const [refinementFile, setRefinementFile] = useState<{name: string, content: string} | null>(null);
  const refinementFileInputRef = useRef<HTMLInputElement>(null);
  
  // --- INITIALIZATION ---
  useEffect(() => {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
          setCurrentView('dashboard');
      }
      const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (savedProjects) {
          try {
              setProjects(JSON.parse(savedProjects));
          } catch (e) {
              console.error("Failed to load projects", e);
          }
      }
  }, []);

  useEffect(() => {
      if (projects.length > 0) {
          localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      }
  }, [projects]);

  // --- PROJECT LOGIC ---
  const handleLogin = (email: string, name: string) => {
      const user = { id: email, email, name };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      setCurrentUser(user);
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
      localStorage.removeItem(STORAGE_KEY_USER);
      setCurrentUser(null);
      setCurrentView('auth');
  };

  const handleCreateProject = (name: string) => {
      const newProject: Project = {
          id: Date.now().toString(),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentData: {
              sections: INITIAL_SECTIONS,
              contextState: {
                  methodology: DEFAULT_METHODOLOGY,
                  businessGoal: BusinessGoal.FINANCING_BRDE,
                  rawContext: '',
                  uploadedFiles: [],
                  assets: []
              },
              diagnosisHistory: []
          },
          versions: []
      };
      setProjects(prev => [newProject, ...prev]);
  };

  const handleOpenProject = (id: string) => {
      const project = projects.find(p => p.id === id);
      if (project) {
          setActiveProjectId(id);
          setSections(project.currentData.sections);
          setContextState(project.currentData.contextState);
          setDiagnosisHistory(project.currentData.diagnosisHistory || []);
          setActiveSectionId('context');
          setExpandedChapters([]);
          setCurrentView('editor');
      }
  };

  const handleDeleteProject = (id: string) => {
      setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Auto-save
  useEffect(() => {
      if (activeProjectId && (currentView === 'editor' || currentView === 'preview')) {
          const timeout = setTimeout(() => {
              setProjects(prev => prev.map(p => {
                  if (p.id === activeProjectId) {
                      return {
                          ...p,
                          updatedAt: Date.now(),
                          currentData: {
                              sections,
                              contextState: {
                                  ...contextState,
                                  uploadedFiles: contextState.uploadedFiles.map(f => ({
                                      name: f.name,
                                      type: f.type,
                                      content: f.content.length > 5000 ? "" : f.content 
                                  })),
                                  assets: contextState.assets
                              },
                              diagnosisHistory
                          }
                      };
                  }
                  return p;
              }));
          }, 2000);
          return () => clearTimeout(timeout);
      }
  }, [sections, contextState, diagnosisHistory, activeProjectId, currentView]);

  const handleCreateVersion = (summary: string) => {
      if (!activeProjectId) return;
      setProjects(prev => prev.map(p => {
          if (p.id === activeProjectId) {
              const newVersion: ProjectVersion = {
                  id: Date.now().toString(),
                  versionNumber: p.versions.length + 1,
                  createdAt: Date.now(),
                  summary,
                  data: JSON.parse(JSON.stringify(p.currentData)) 
              };
              alert(`Versão V${newVersion.versionNumber} salva!`);
              return { ...p, versions: [newVersion, ...p.versions] };
          }
          return p;
      }));
  };

  // --- EDITOR LOGIC ---
  const sectionsByChapter = useMemo(() => {
    const groups: { [key: string]: PlanSection[] } = {};
    sections.forEach(section => {
        if (!groups[section.chapter]) groups[section.chapter] = [];
        groups[section.chapter].push(section);
    });
    return groups;
  }, [sections]);

  const toggleChapter = (chapter: string) => {
      setExpandedChapters(prev => prev.includes(chapter) ? prev.filter(c => c !== chapter) : [...prev, chapter]);
  };

  const getIndentationClass = (id: string) => {
    const parts = id.split('.').length;
    if (parts === 3) return 'pl-2'; 
    if (parts === 4) return 'pl-4'; 
    return '';
  };

  const getGroupPrefix = (id: string) => {
      const parts = id.split('.');
      return parts.length >= 3 ? parts.slice(0, 2).join('.') + '.' : null;
  };

  const getGroupSiblings = (section: PlanSection) => {
      const prefix = getGroupPrefix(section.id);
      return prefix ? sections.filter(s => s.id.startsWith(prefix)) : [];
  };

  const isConclusionSection = (s: PlanSection) => s.title.includes('Conclusão') || s.title.includes('Veredito') || s.title.includes('SÍNTESE');
  const isIntroSection = (s: PlanSection) => s.id.endsWith('.0');

  const isSectionUnlockable = (section: PlanSection) => {
      if (isIntroSection(section)) {
          const siblings = getGroupSiblings(section);
          const conclusion = siblings.find(s => isConclusionSection(s));
          return conclusion ? conclusion.status === SectionStatus.COMPLETED : (siblings.filter(s => s.id !== section.id).every(c => c.status === SectionStatus.COMPLETED));
      }
      if (isConclusionSection(section)) {
          const siblings = getGroupSiblings(section);
          const content = siblings.filter(s => !isIntroSection(s) && !isConclusionSection(s));
          return content.length > 0 && content.every(s => s.status === SectionStatus.COMPLETED);
      }
      return true;
  };

  const isChapter1Unlockable = useMemo(() => {
      const financialSection = sections.find(s => s.chapter.includes('FINANCEIRO'));
      return financialSection ? financialSection.status === SectionStatus.COMPLETED : false;
  }, [sections]);

  const isMatrixValid = useMemo(() => {
      const entries = contextState.valueMatrix?.entries;
      return Array.isArray(entries) && entries.length > 0;
  }, [contextState.valueMatrix]);

  const getFullContext = () => {
    return `OBJETIVO: ${contextState.businessGoal}
    METODOLOGIA: ${contextState.methodology}
    ANOTAÇÕES: ${contextState.rawContext}
    ARQUIVOS: ${contextState.uploadedFiles.filter(f => f.type === 'text' && f.content.length > 0).map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n')}`;
  };

  const activeSection = sections.find(s => s.id === activeSectionId);

  const handleGenerateMatrix = async () => {
    if (!hasGeminiKey()) {
        alert("Configure a GEMINI_API_KEY ou VITE_API_KEY antes de consolidar a matriz.");
        return;
    }

    setIsMatrixLoading(true);
    try {
        const fullContext = getFullContext();
        const matrixResult = await generateValueMatrix(fullContext);
        setContextState(prev => ({ ...prev, valueMatrix: matrixResult }));
    } catch (e) {
        alert("Erro ao consolidar a matriz.");
        console.error(e);
    }
    setIsMatrixLoading(false);
  };

  const handleRunDiagnosis = async () => {
    if (!isMatrixValid) {
        alert("A matriz ainda não foi consolidada. Gere ou importe uma matriz válida.");
        return;
    }

    setIsDiagnosisLoading(true);
    try {
        if (!hasGeminiKey()) {
            alert("Configure a GEMINI_API_KEY ou VITE_API_KEY antes de rodar o diagnóstico.");
            setIsDiagnosisLoading(false);
            return;
        }
        const fullContext = getFullContext();
        const diagResult = await generateGlobalDiagnosis(fullContext, diagnosisHistory);
        setDiagnosisHistory(prev => [...prev, diagResult]);

        // Add suggested sections
        if (diagResult.suggestedSections?.length > 0) {
            const newSections: PlanSection[] = diagResult.suggestedSections.map((s, idx) => ({
                id: `ai-gen-${Date.now()}-${idx}`,
                chapter: s.chapter,
                title: s.title,
                description: s.description,
                content: '',
                status: SectionStatus.PENDING,
                type: SectionType.TEXT,
                isAiGenerated: true
            }));
            setSections(prev => [...prev, ...newSections]);
        }
    } catch (e) {
        alert("Erro no diagnóstico.");
        console.error(e);
    }
    setIsDiagnosisLoading(false);
  };

  // ... (handleGenerateSection, handleGenerateImage, etc. same as before) ...
  const handleGenerateSection = async (skipAnalysis = false, isContinuation = false, isRefinement = false) => {
      if (!activeSection) return;
      if (!hasGeminiKey()) {
          alert("Configure a GEMINI_API_KEY ou VITE_API_KEY antes de gerar conteúdo.");
          return;
      }
      const isSynthesis = isIntroSection(activeSection) || isConclusionSection(activeSection);

      if (!skipAnalysis && activeSection.status === SectionStatus.PENDING && !isContinuation && !isRefinement && !isSynthesis) {
          handleGenerateSection(true);
          return;
      }
      setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, status: SectionStatus.GENERATING } : s));
      try {
        const fullContext = getFullContext();
        const goalContext = contextState.businessGoal === BusinessGoal.FINANCING_BRDE ? "Solicitação de Financiamento BRDE/FSA (Inovação/Acessibilidade)." : "Plano de Negócios Geral";
        const answers = activeSection.userAnswers || "Sem respostas.";
        const prevSec = sections.filter(s => s.status === SectionStatus.COMPLETED && s.id !== activeSection.id).map(s => `### ${s.chapter} - ${s.title}\n${s.content}`).join('\n\n');
        
        let childContent = "";
        if (isSynthesis) {
            const siblings = getGroupSiblings(activeSection);
            childContent = siblings.filter(s => s.id !== activeSection.id && s.status === SectionStatus.COMPLETED).map(c => `### ${c.title}\n${c.content}`).join('\n\n');
        }

        if (activeSection.type === SectionType.FINANCIAL && !isRefinement) {
            const { analysis, data } = await generateFinancialData(fullContext, contextState.methodology, goalContext, answers, prevSec, contextState.valueMatrix);
            setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, content: analysis, financialData: data, status: SectionStatus.COMPLETED } : s));
        } else {
            const current = isContinuation ? activeSection.content : (isRefinement ? activeSection.content : "");
            const refInst = isRefinement ? refinementText : "";
            const refCtx = isRefinement && refinementFile ? refinementFile.content : "";
            const newContent = await generateSectionContent(activeSection.title, activeSection.description, contextState.methodology, fullContext, goalContext, answers, prevSec, current, refInst, refCtx, childContent, contextState.valueMatrix);
            setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, content: isContinuation ? (s.content + "\n\n" + newContent) : newContent, status: SectionStatus.COMPLETED } : s));
            if(isRefinement) { setRefinementText(''); setRefinementFile(null); }
        }
      } catch (error) { alert("Erro ao gerar."); setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, status: activeSection.content ? SectionStatus.COMPLETED : SectionStatus.PENDING } : s)); }
  };

  const handleStartEditing = () => { if(activeSection) { setEditedContent(activeSection.content); setIsEditing(true); } };
  const handleSaveEdit = () => { if(activeSection) { setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, content: editedContent } : s)); setIsEditing(false); } };
  const handleGenerateImage = async () => {
     setIsGeneratingImage(true);
     try {
       const prompt = IMAGE_PROMPTS[imageGenType].replace('[DESCRIPTION]', imageGenPrompt);
       const base64 = await generateProjectImage(prompt, imageGenType);
       const newAsset: ProjectAsset = { id: Math.random().toString(36).substring(7), type: imageGenType, data: base64, description: imageGenPrompt };
       setContextState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
       setShowImageGen(false);
     } catch(e) { alert("Erro imagem"); }
     setIsGeneratingImage(false);
  };
  const handleRefinementFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await new Promise<string>(r => { const reader = new FileReader(); reader.onload = (ev) => r(ev.target?.result as string || ""); reader.readAsText(file); });
      setRefinementFile({ name: file.name, content: text });
  };

  // --- RENDER ---
  if (currentView === 'auth') return <AuthScreen onLogin={handleLogin} />;
  if (currentView === 'dashboard' && currentUser) return <Dashboard user={currentUser} projects={projects} onCreateProject={handleCreateProject} onOpenProject={handleOpenProject} onDeleteProject={handleDeleteProject} onLogout={handleLogout} />;
  if (currentView === 'preview' && activeProjectId) return <LiveDocumentPreview projectName={projects.find(p => p.id === activeProjectId)?.name || 'Projeto'} sections={sections} onClose={() => setCurrentView('editor')} />;

  const activeProject = projects.find(p => p.id === activeProjectId);
  const latestDiagnosis = diagnosisHistory.length > 0 ? diagnosisHistory[diagnosisHistory.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-orange-900 text-white flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0 z-20">
        <div className="p-6 border-b border-orange-800 bg-orange-950">
          <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
              <ArrowLeft className="w-4 h-4 text-orange-300" />
              <span className="text-xs font-medium text-orange-200 hover:text-white">Voltar ao Painel</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-lg truncate" title={activeProject?.name}><LayoutDashboard className="text-orange-400 shrink-0" /><span className="truncate">{activeProject?.name || 'Projeto'}</span></div>
          <div className="mt-3 flex items-center gap-2">
             <button onClick={() => setCurrentView('preview')} className="w-full flex items-center justify-center gap-2 text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-2 rounded border border-green-600 font-bold"><BookOpen className="w-3 h-3" /> VISUALIZAR DOCUMENTO</button>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveSectionId('context')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-4 ${activeSectionId === 'context' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-100 hover:bg-orange-800'}`}><FileText className="w-4 h-4" /> Central de Arquivos</button>
          {isMatrixValid && (
              <button onClick={() => setActiveSectionId('matrix')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-4 ${activeSectionId === 'matrix' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-100 hover:bg-orange-800'}`}><TableProperties className="w-4 h-4" /> 0. MATRIZ DE DADOS</button>
          )}
          {Object.entries(sectionsByChapter).map(([chapter, val]) => {
              const isExpanded = expandedChapters.includes(chapter);
              const isSummary = chapter.startsWith('1.');
              const isLockedSummary = isSummary && !isChapter1Unlockable;
              return (
                  <div key={chapter} className="mb-1">
                      <button onClick={() => toggleChapter(chapter)} className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-orange-200 hover:text-white hover:bg-orange-800/50 rounded text-left"><span className="truncate pr-2">{chapter}</span><div className="flex items-center gap-1">{isLockedSummary && <Lock className="w-3 h-3 text-orange-500" />}{isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</div></button>
                      {isExpanded && (
                          <div className="ml-2 border-l border-orange-700 pl-2 mt-1 space-y-1">
                              {(val as PlanSection[]).map(section => {
                                  const isLocked = isSectionUnlockable(section) === false;
                                  const isDisabled = (isSummary && !isChapter1Unlockable) || isLocked;
                                  return (
                                      <button key={section.id} disabled={isDisabled} onClick={() => { setActiveSectionId(section.id); setIsEditing(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all text-left group ${activeSectionId === section.id ? 'bg-orange-600/40 text-white border border-orange-500/50' : (isDisabled ? 'text-orange-500 cursor-not-allowed opacity-60' : 'text-orange-200 hover:bg-orange-800 hover:text-white')}`}><span className={`truncate ${getIndentationClass(section.id)}`}>{section.title}</span><div className="flex items-center gap-1">{isLocked && <Lock className="w-3 h-3 text-orange-500/80" />}{section.status === SectionStatus.COMPLETED && <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />}</div></button>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              );
          })}
        </nav>
        <div className="p-4 border-t border-orange-800 bg-orange-950/30 flex gap-2"><button onClick={() => handleCreateVersion(`Versão ${activeProject?.versions.length ? activeProject.versions.length + 1 : 1} - Auto`)} className="flex-1 flex items-center justify-center gap-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 px-2 py-2 rounded text-xs transition-colors"><Save className="w-3 h-3" /> Salvar Versão</button></div>
      </aside>

      <main className="flex-1 bg-gray-50 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 pb-20">
          <header className="mb-6 flex justify-between items-start border-b border-gray-200 pb-6">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">{activeSectionId === 'context' ? 'Central de Arquivos' : (activeSectionId === 'matrix' ? '0. Matriz de Dados' : activeSection?.title)}</h1>
                <p className="text-gray-500 mt-2 text-sm max-w-3xl">{activeSectionId === 'context' ? 'Faça o upload e rode o diagnóstico evolutivo.' : activeSection?.description}</p>
             </div>
             {activeSectionId === 'context' && (
                 <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleGenerateMatrix} disabled={isMatrixLoading} className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors text-white shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                        {isMatrixLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TableProperties className="w-4 h-4" />} Consolidar Matriz
                    </button>
                    <button onClick={handleRunDiagnosis} disabled={isDiagnosisLoading || !isMatrixValid} className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-white shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                        {isDiagnosisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />} {diagnosisHistory.length > 0 ? 'Atualizar Diagnóstico' : 'Iniciar Diagnóstico'}
                    </button>
                 </div>
             )}
          </header>

          {activeSectionId === 'context' && (
             <div className="space-y-8">
                {!isMatrixValid && (
                   <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-4 flex gap-3 items-start">
                      <div className="mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">A matriz ainda não foi consolidada. Gere ou importe uma matriz válida.</p>
                        <p className="text-xs text-yellow-800">Use o botão "Consolidar Matriz" para processar o Canvas + SWOT antes de executar o diagnóstico global.</p>
                      </div>
                   </div>
                )}
                {latestDiagnosis && (
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
                       <div className="flex items-center justify-between mb-4">
                           <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><History className="w-5 h-5 text-purple-600" /> Histórico de Análises</h2>
                           <span className="text-xs font-mono text-gray-400">{new Date(latestDiagnosis.timestamp).toLocaleString()}</span>
                       </div>
                       
                       <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                           <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Entendimento do Projeto</h3>
                           <p className="text-gray-800 text-sm leading-relaxed">{latestDiagnosis.projectSummary}</p>
                       </div>

                       <div className="space-y-4">
                           <h3 className="text-sm font-bold text-gray-700 border-b pb-2">Status das Pendências (Gaps)</h3>
                           {latestDiagnosis?.gaps?.map(gap => (
                               <div key={gap.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                                   <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${gap.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : (gap.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600')}`}>
                                       {gap.status === 'RESOLVED' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                   </div>
                                   <div className="flex-1">
                                       <div className="flex justify-between items-center mb-1">
                                           <span className={`text-sm font-bold ${gap.status === 'RESOLVED' ? 'text-green-700' : 'text-gray-800'}`}>{gap.description}</span>
                                           <span className="text-xs font-mono px-2 py-1 bg-gray-100 rounded">{gap.resolutionScore}%</span>
                                       </div>
                                       <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                           <div className={`h-1.5 rounded-full ${gap.status === 'RESOLVED' ? 'bg-green-500' : (gap.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500')}`} style={{ width: `${gap.resolutionScore}%` }}></div>
                                       </div>
                                       <p className="text-xs text-gray-500 italic">IA: "{gap.aiFeedback}"</p>
                                   </div>
                               </div>
                           ))}
                           {latestDiagnosis?.gaps?.length === 0 && <p className="text-sm text-gray-500 italic">Nenhuma pendência crítica identificada.</p>}
                       </div>
                   </div>
                )}
                <ContextManager state={contextState} onUpdate={(ns) => setContextState(p => ({ ...p, ...ns }))} />
             </div>
          )}

          {activeSectionId === 'matrix' && isMatrixValid && contextState.valueMatrix && <ValueMatrixViewer matrix={contextState.valueMatrix} />}

          {activeSection && activeSectionId !== 'context' && activeSectionId !== 'matrix' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">STATUS: {activeSection.status}</span>
                 <div className="flex gap-2">
                    {activeSection.status === SectionStatus.COMPLETED && !isEditing && <button onClick={handleStartEditing} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700"><Edit3 size={14} /> Editar</button>}
                    {isEditing && <button onClick={handleSaveEdit} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-xs font-medium"><Save size={14} /> Salvar</button>}
                    {!isEditing && <button onClick={() => handleGenerateSection(true, false, false)} disabled={activeSection.status === SectionStatus.GENERATING || isSectionUnlockable(activeSection) === false} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-bold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">{activeSection.status === SectionStatus.GENERATING ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}{activeSection.status === SectionStatus.COMPLETED ? 'Regerar' : 'Gerar Conteúdo'}</button>}
                 </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] p-8">
                  {isEditing ? (
                     <textarea className="w-full h-[600px] p-4 font-mono text-sm bg-slate-900 border border-slate-700 rounded-lg outline-none text-gray-50 resize-none" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
                  ) : (
                      activeSection.content ? (
                          <div className="prose prose-orange max-w-none text-gray-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                  p: ({node, ...props}) => <p className="text-gray-800 leading-relaxed mb-4" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-800" {...props} />,
                                  li: ({node, ...props}) => <li className="text-gray-800 mb-1 ml-4" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-orange-900 mt-8 mb-4" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-orange-800 mt-6 mb-3" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-orange-800 mt-6 mb-3 pb-2 border-b border-orange-100" {...props} />,
                                  table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-orange-200 shadow-sm"><table className="min-w-full divide-y divide-orange-200" {...props} /></div>,
                                  thead: ({node, ...props}) => <thead className="bg-orange-100" {...props} />,
                                  th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-orange-900 uppercase tracking-wider" {...props} />,
                                  td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-t border-orange-100 odd:bg-white even:bg-orange-50" {...props} />,
                              }}>{activeSection.content}</ReactMarkdown>
                          </div>
                      ) : (
                          <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-2">
                                {isSectionUnlockable(activeSection) === false && <Lock className="w-8 h-8 text-gray-300 mb-2" />}
                                <span>Conteúdo ainda não gerado.</span>
                          </div>
                      )
                  )}
                  {activeSection.type === SectionType.FINANCIAL && activeSection.financialData && <FinancialChart data={activeSection.financialData} />}
              </div>
              {activeSection.status === SectionStatus.COMPLETED && !isEditing && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3"><RefreshCw className="w-4 h-4 text-blue-600" /> Refinar e Ajustar</h3>
                      <div className="space-y-3">
                          <textarea className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500" placeholder="Instruções para refinar..." value={refinementText} onChange={(e) => setRefinementText(e.target.value)} />
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <input type="file" className="hidden" onChange={handleRefinementFileUpload} ref={refinementFileInputRef} />
                                  <button onClick={() => refinementFileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"><Paperclip size={14} /> {refinementFile ? refinementFile.name : "Anexar arquivo"}</button>
                              </div>
                              <div className="flex gap-2">
                                {activeSection.content && activeSection.content.length > 500 && <button onClick={() => handleGenerateSection(true, true, false)} disabled={activeSection.status === SectionStatus.GENERATING} className="flex items-center gap-1 px-3 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100"><ArrowRightCircle size={14} /> Continuar Escrevendo</button>}
                                <button onClick={() => handleGenerateSection(true, false, true)} disabled={!refinementText || activeSection.status === SectionStatus.GENERATING} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-50">Solicitar Revisão IA</button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
            </div>
          )}
        </div>
      </main>
      {showImageGen && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Gerar Imagem</h3>
                <textarea value={imageGenPrompt} onChange={e => setImageGenPrompt(e.target.value)} className="w-full border p-2 rounded mb-4 text-gray-900" placeholder="Descrição..." />
                <div className="flex justify-end gap-2"><button onClick={() => setShowImageGen(false)} className="px-4 py-2 text-gray-600">Cancelar</button><button onClick={handleGenerateImage} className="px-4 py-2 bg-purple-600 text-white rounded">Gerar</button></div>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;
