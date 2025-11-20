
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, Download, CheckCircle2, Loader2,
  ChevronRight, ChevronDown, Edit3, Save, Wand2,
  Lock, RotateCcw, ArrowRightCircle, RefreshCw, Paperclip, TableProperties,
  LogOut, ArrowLeft, Cloud, CloudLightning, Stethoscope, RefreshCcw,
  BookOpen
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
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [isDiagnosisLoading, setIsDiagnosisLoading] = useState(false);
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
      // Load User
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
          setCurrentView('dashboard');
      }
      // Load Projects
      const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (savedProjects) {
          try {
              setProjects(JSON.parse(savedProjects));
          } catch (e) {
              console.error("Failed to load projects", e);
          }
      }
  }, []);

  // Save Projects Effect
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
              diagnosis: null
          },
          versions: []
      };
      setProjects(prev => [newProject, ...prev]);
  };

  const handleOpenProject = (id: string) => {
      const project = projects.find(p => p.id === id);
      if (project) {
          setActiveProjectId(id);
          // Restore Editor State from Project
          setSections(project.currentData.sections);
          setContextState(project.currentData.contextState);
          setDiagnosis(project.currentData.diagnosis);
          // Reset View State
          setActiveSectionId('context');
          setExpandedChapters([]);
          setCurrentView('editor');
      }
  };

  const handleDeleteProject = (id: string) => {
      // No need for window.confirm here, the Dashboard UI handles it
      setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Auto-save current project state to the projects array
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
                                  // Don't save huge text content in project list to save memory, 
                                  // but we need it for the active session. 
                                  // For simplicity in this demo, we save it, but in prod we'd use DB.
                                  uploadedFiles: contextState.uploadedFiles.map(f => ({
                                      name: f.name,
                                      type: f.type,
                                      content: f.content.length > 5000 ? "" : f.content // Truncate huge files for storage safety
                                  })),
                                  assets: contextState.assets
                              },
                              diagnosis
                          }
                      };
                  }
                  return p;
              }));
          }, 2000); // Debounce save
          return () => clearTimeout(timeout);
      }
  }, [sections, contextState, diagnosis, activeProjectId, currentView]);

  const handleCreateVersion = (summary: string) => {
      if (!activeProjectId) return;
      setProjects(prev => prev.map(p => {
          if (p.id === activeProjectId) {
              const newVersion: ProjectVersion = {
                  id: Date.now().toString(),
                  versionNumber: p.versions.length + 1,
                  createdAt: Date.now(),
                  summary,
                  data: JSON.parse(JSON.stringify(p.currentData)) // Deep copy
              };
              alert(`Versão V${newVersion.versionNumber} salva no histórico!`);
              return { ...p, versions: [newVersion, ...p.versions] };
          }
          return p;
      }));
  };

  // --- EDITOR LOGIC (Moved from old App component) ---

  const sectionsByChapter = useMemo(() => {
    const groups: { [key: string]: PlanSection[] } = {};
    sections.forEach(section => {
        if (!groups[section.chapter]) {
            groups[section.chapter] = [];
        }
        groups[section.chapter].push(section);
    });
    return groups;
  }, [sections]);

  const toggleChapter = (chapter: string) => {
      setExpandedChapters(prev => 
          prev.includes(chapter) ? prev.filter(c => c !== chapter) : [...prev, chapter]
      );
  };

  const getIndentationClass = (id: string) => {
    const parts = id.split('.').length;
    if (parts === 3) return 'pl-2'; 
    if (parts === 4) return 'pl-4'; 
    return '';
  };

  const getGroupPrefix = (id: string) => {
      const parts = id.split('.');
      if (parts.length >= 3) {
          return parts.slice(0, 2).join('.') + '.';
      }
      return null;
  };

  const getGroupSiblings = (section: PlanSection) => {
      const prefix = getGroupPrefix(section.id);
      if (!prefix) return [];
      return sections.filter(s => s.id.startsWith(prefix));
  };

  const isConclusionSection = (section: PlanSection) => {
      return section.title.includes('Conclusão') || section.title.includes('Veredito') || section.title.includes('SÍNTESE');
  };

  const isIntroSection = (section: PlanSection) => {
      return section.id.endsWith('.0');
  };

  const isSectionUnlockable = (section: PlanSection) => {
      if (isIntroSection(section)) {
          const siblings = getGroupSiblings(section);
          const conclusion = siblings.find(s => isConclusionSection(s));
          if (conclusion) {
              return conclusion.status === SectionStatus.COMPLETED;
          }
          const children = siblings.filter(s => s.id !== section.id);
          return children.length > 0 && children.every(c => c.status === SectionStatus.COMPLETED);
      }
      if (isConclusionSection(section)) {
          const siblings = getGroupSiblings(section);
          const contentSections = siblings.filter(s => !isIntroSection(s) && !isConclusionSection(s));
          return contentSections.length > 0 && contentSections.every(s => s.status === SectionStatus.COMPLETED);
      }
      return true;
  };

  const isChapter1Unlockable = useMemo(() => {
      const financialSection = sections.find(s => s.chapter.includes('FINANCEIRO'));
      return financialSection ? financialSection.status === SectionStatus.COMPLETED : false;
  }, [sections]);

  const getFullContext = () => {
    return `
    OBJETIVO: ${contextState.businessGoal}
    METODOLOGIA: ${contextState.methodology}
    ANOTAÇÕES: ${contextState.rawContext}
    ARQUIVOS:
    ${contextState.uploadedFiles.filter(f => f.type === 'text' && f.content.length > 0).map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n')}
    IMAGENS:
    ${contextState.assets.map(a => `[IMAGEM: ${a.description}]`).join('\n')}
    `;
  };

  const activeSection = sections.find(s => s.id === activeSectionId);

  const handleRunDiagnosis = async () => {
    setIsDiagnosisLoading(true);
    setDiagnosis(null);
    const fullContext = getFullContext();

    try {
        const [diagResult, matrixResult] = await Promise.all([
            generateGlobalDiagnosis(fullContext),
            generateValueMatrix(fullContext)
        ]);

        setDiagnosis(diagResult);
        setContextState(prev => ({ ...prev, valueMatrix: matrixResult }));

        if (diagResult.suggestedSections && diagResult.suggestedSections.length > 0) {
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
            const newChapters = Array.from(new Set(newSections.map(s => s.chapter)));
            setExpandedChapters(prev => [...prev, ...newChapters]);
        }
    } catch (e) {
        alert("Erro ao gerar diagnóstico. Verifique se os arquivos têm conteúdo de texto.");
        console.error(e);
    }
    setIsDiagnosisLoading(false);
  };

  const handleGenerateSection = async (skipAnalysis = false, isContinuation = false, isRefinement = false) => {
      if (!activeSection) return;
      const isSynthesis = isIntroSection(activeSection) || isConclusionSection(activeSection);

      if (!skipAnalysis && activeSection.status === SectionStatus.PENDING && !isContinuation && !isRefinement && !isSynthesis) {
          handleGenerateSection(true);
          return;
      }

      setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, status: SectionStatus.GENERATING } : s));

      try {
        const fullContext = getFullContext();
        const goalContext = contextState.businessGoal === BusinessGoal.FINANCING_BRDE ? "Solicitação de Financiamento BRDE/FSA (Inovação/Acessibilidade)." : "Plano de Negócios Geral";
        const answers = activeSection.userAnswers || "Sem respostas adicionais.";
        
        const previousSectionsContent = sections
            .filter(s => s.status === SectionStatus.COMPLETED && s.id !== activeSection.id)
            .map(s => `### ${s.chapter} - ${s.title}\n${s.content}`)
            .join('\n\n');

        let childrenContent = "";
        if (isSynthesis) {
            const siblings = getGroupSiblings(activeSection);
            const sourceSections = siblings.filter(s => s.id !== activeSection.id && s.status === SectionStatus.COMPLETED);
            childrenContent = sourceSections.map(c => `### ${c.title}\n${c.content}`).join('\n\n');
        }

        if (activeSection.type === SectionType.FINANCIAL && !isRefinement) {
            const { analysis, data } = await generateFinancialData(fullContext, contextState.methodology, goalContext, answers, previousSectionsContent, contextState.valueMatrix);
            setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, content: analysis, financialData: data, status: SectionStatus.COMPLETED } : s));
        } else {
            const currentContent = isContinuation ? activeSection.content : (isRefinement ? activeSection.content : "");
            const refinementInst = isRefinement ? refinementText : "";
            const refinementCtx = isRefinement && refinementFile ? refinementFile.content : "";

            const newContent = await generateSectionContent(
                activeSection.title, 
                activeSection.description, 
                contextState.methodology, 
                fullContext,
                goalContext,
                answers,
                previousSectionsContent,
                currentContent,
                refinementInst,
                refinementCtx,
                childrenContent,
                contextState.valueMatrix
            );

            setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, content: isContinuation ? (s.content + "\n\n" + newContent) : newContent, status: SectionStatus.COMPLETED } : s));
            
            if(isRefinement) { setRefinementText(''); setRefinementFile(null); }
        }

      } catch (error) {
        alert("Erro ao gerar seção.");
        setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, status: activeSection.content ? SectionStatus.COMPLETED : SectionStatus.PENDING } : s));
      }
  };

  const handleGenerateImage = async () => {
      setIsGeneratingImage(true);
      try {
        const prompt = IMAGE_PROMPTS[imageGenType].replace('[DESCRIPTION]', imageGenPrompt);
        const base64 = await generateProjectImage(prompt, imageGenType);
        const newAsset: ProjectAsset = { id: Math.random().toString(36).substring(7), type: imageGenType, data: base64, description: imageGenPrompt };
        setContextState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
        setShowImageGen(false);
        setImageGenPrompt('');
      } catch (e) { alert("Erro ao gerar imagem."); }
      setIsGeneratingImage(false);
  };

  const handleStartEditing = () => { if (activeSection) { setEditedContent(activeSection.content); setIsEditing(true); } };
  const handleSaveEdit = () => { 
      if (activeSection) { 
          setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, content: editedContent } : s)); 
          setIsEditing(false);
      } 
  };
  
  const handleRefinementFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string || "");
          reader.readAsText(file);
      });
      setRefinementFile({ name: file.name, content: text });
  };

  const MarkdownComponents = {
    p: ({node, ...props}: any) => <p className="text-gray-800 leading-relaxed mb-4" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-4 text-gray-800" {...props} />,
    li: ({node, ...props}: any) => <li className="text-gray-800 mb-1 ml-4" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-gray-900" {...props} />,
    h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold text-orange-900 mt-8 mb-4" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold text-orange-800 mt-6 mb-3" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-xl font-bold text-orange-800 mt-6 mb-3 pb-2 border-b border-orange-100" {...props} />,
    table: ({node, ...props}: any) => <div className="overflow-x-auto my-6 rounded-lg border border-orange-200 shadow-sm"><table className="min-w-full divide-y divide-orange-200" {...props} /></div>,
    thead: ({node, ...props}: any) => <thead className="bg-orange-100" {...props} />,
    th: ({node, ...props}: any) => <th className="px-6 py-3 text-left text-xs font-bold text-orange-900 uppercase tracking-wider" {...props} />,
    td: ({node, ...props}: any) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-t border-orange-100 odd:bg-white even:bg-orange-50" {...props} />,
  };

  // --- RENDER ---

  if (currentView === 'auth') {
      return <AuthScreen onLogin={handleLogin} />;
  }

  if (currentView === 'dashboard' && currentUser) {
      return (
          <Dashboard 
            user={currentUser} 
            projects={projects} 
            onCreateProject={handleCreateProject}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onLogout={handleLogout}
          />
      );
  }

  if (currentView === 'preview' && activeProjectId) {
      return <LiveDocumentPreview projectName={projects.find(p => p.id === activeProjectId)?.name || 'Projeto'} sections={sections} onClose={() => setCurrentView('editor')} />;
  }

  // EDITOR VIEW
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-orange-900 text-white flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0 z-20">
        <div className="p-6 border-b border-orange-800 bg-orange-950">
          <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
              <ArrowLeft className="w-4 h-4 text-orange-300" />
              <span className="text-xs font-medium text-orange-200 hover:text-white transition-colors">Voltar ao Painel</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-lg truncate" title={activeProject?.name}>
            <LayoutDashboard className="text-orange-400 shrink-0" />
            <span className="truncate">{activeProject?.name || 'Projeto'}</span>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
             <button onClick={() => setCurrentView('preview')} className="w-full flex items-center justify-center gap-2 text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-2 rounded border border-green-600 transition-colors font-bold">
                <BookOpen className="w-3 h-3" /> VISUALIZAR DOCUMENTO FINAL
             </button>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveSectionId('context')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-4 ${activeSectionId === 'context' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-100 hover:bg-orange-800'}`}>
            <FileText className="w-4 h-4" /> Central de Arquivos
          </button>

          {contextState.valueMatrix && (
              <button onClick={() => setActiveSectionId('matrix')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-4 ${activeSectionId === 'matrix' ? 'bg-orange-600 text-white shadow-lg' : 'text-orange-100 hover:bg-orange-800'}`}>
                <TableProperties className="w-4 h-4" /> 0. MATRIZ DE DADOS
              </button>
          )}

          {Object.entries(sectionsByChapter).map(([chapter, val]) => {
              const chapterSections = val as PlanSection[];
              const isSummary = chapter.startsWith('1.');
              const isLockedSummary = isSummary && !isChapter1Unlockable;
              const isExpanded = expandedChapters.includes(chapter);

              return (
                  <div key={chapter} className="mb-1">
                      <button onClick={() => toggleChapter(chapter)} className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-orange-200 hover:text-white hover:bg-orange-800/50 rounded transition-colors text-left">
                          <span className="truncate pr-2">{chapter}</span>
                          <div className="flex items-center gap-1">
                             {isLockedSummary && <Lock className="w-3 h-3 text-orange-500" />}
                             {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </div>
                      </button>
                      {isExpanded && (
                          <div className="ml-2 border-l border-orange-700 pl-2 mt-1 space-y-1">
                              {chapterSections.map(section => {
                                  const isLocked = isSectionUnlockable(section) === false;
                                  const isDisabled = (isSummary && !isChapter1Unlockable) || isLocked;
                                  return (
                                      <button key={section.id} disabled={isDisabled} onClick={() => { setActiveSectionId(section.id); setIsEditing(false); }} className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all text-left group ${activeSectionId === section.id ? 'bg-orange-600/40 text-white border border-orange-500/50' : (isDisabled ? 'text-orange-500 cursor-not-allowed opacity-60' : 'text-orange-200 hover:bg-orange-800 hover:text-white')}`}>
                                          <span className={`truncate ${getIndentationClass(section.id)}`}>{section.title}</span>
                                          <div className="flex items-center gap-1">
                                            {isLocked && <Lock className="w-3 h-3 text-orange-500/80" />}
                                            {section.status === SectionStatus.COMPLETED && <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />}
                                          </div>
                                      </button>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              );
          })}
        </nav>

        <div className="p-4 border-t border-orange-800 bg-orange-950/30 flex gap-2">
             <button onClick={() => handleCreateVersion(`Versão ${activeProject?.versions.length ? activeProject.versions.length + 1 : 1} - Auto`)} className="flex-1 flex items-center justify-center gap-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 px-2 py-2 rounded text-xs transition-colors">
                <Save className="w-3 h-3" /> Salvar Versão
             </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 bg-gray-50 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 pb-20">
          {/* Same Header Logic */}
          <header className="mb-6 flex justify-between items-start border-b border-gray-200 pb-6">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">{activeSectionId === 'context' ? 'Central de Arquivos' : (activeSectionId === 'matrix' ? '0. Matriz de Dados Consolidada' : activeSection?.title)}</h1>
                <p className="text-gray-500 mt-2 text-sm max-w-3xl">{activeSectionId === 'context' ? 'Faça upload dos documentos para o diagnóstico.' : (activeSectionId === 'matrix' ? 'Valide os números extraídos antes de gerar o plano.' : activeSection?.description)}</p>
             </div>
             {activeSectionId === 'context' && (
                 <button onClick={handleRunDiagnosis} disabled={isDiagnosisLoading} className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-white shadow-md">
                    {isDiagnosisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />} Diagnóstico
                 </button>
             )}
          </header>

          {/* Content Components */}
          {activeSectionId === 'context' && (
             <div className="space-y-6">
                {diagnosis && (
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                       <h2 className="text-lg font-bold text-gray-800 mb-3">Diagnóstico Preliminar</h2>
                       <p className="text-gray-700 text-sm mb-4">{diagnosis.projectSummary}</p>
                       <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                           <strong className="text-red-800 text-xs uppercase">Gaps Críticos:</strong>
                           <ul className="list-disc list-inside mt-2 text-sm text-red-700">{diagnosis.missingCriticalInfo.map((g, i) => <li key={i}>{g}</li>)}</ul>
                       </div>
                   </div>
                )}
                <ContextManager state={contextState} onUpdate={(ns) => setContextState(p => ({ ...p, ...ns }))} />
             </div>
          )}

          {activeSectionId === 'matrix' && contextState.valueMatrix && (
              <ValueMatrixViewer matrix={contextState.valueMatrix} />
          )}

          {activeSection && activeSectionId !== 'context' && activeSectionId !== 'matrix' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">STATUS: {activeSection.status}</span>
                 <div className="flex gap-2">
                    {activeSection.status === SectionStatus.COMPLETED && !isEditing && <button onClick={handleStartEditing} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700"><Edit3 size={14} /> Editar</button>}
                    {isEditing && <button onClick={handleSaveEdit} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-xs font-medium"><Save size={14} /> Salvar</button>}
                    {!isEditing && <button onClick={() => handleGenerateSection(true, false, false)} disabled={activeSection.status === SectionStatus.GENERATING || isSectionUnlockable(activeSection) === false} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-bold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">{activeSection.status === SectionStatus.GENERATING ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}{activeSection.status === SectionStatus.COMPLETED ? 'Regerar' : (isIntroSection(activeSection) ? 'Consolidar Introdução' : (isConclusionSection(activeSection) ? 'Gerar Conclusão' : 'Gerar Conteúdo'))}</button>}
                 </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] p-8">
                  {isEditing ? (
                     <textarea className="w-full h-[600px] p-4 font-mono text-sm bg-slate-900 border border-slate-700 rounded-lg outline-none text-gray-50 resize-none" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
                  ) : (
                      activeSection.content ? (
                          <div className="prose prose-orange max-w-none text-gray-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{activeSection.content}</ReactMarkdown>
                          </div>
                      ) : (
                          <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-2">
                                {isSectionUnlockable(activeSection) === false && <Lock className="w-8 h-8 text-gray-300 mb-2" />}
                                <span>{isIntroSection(activeSection) ? 'Conclua os tópicos deste grupo para desbloquear a introdução.' : (isConclusionSection(activeSection) ? 'Conclua os tópicos de conteúdo para gerar a conclusão.' : 'Conteúdo ainda não gerado.')}</span>
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
