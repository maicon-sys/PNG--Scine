
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, FileText, Download, CheckCircle2, Loader2,
  ChevronRight, ChevronDown, Edit3, Save, Wand2,
  Lock, RotateCcw, ArrowRightCircle, RefreshCw, Paperclip, TableProperties,
  LogOut, ArrowLeft, Cloud, CloudLightning, Stethoscope,
  History, AlertTriangle, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { PlanSection, AppContextState, SectionStatus, SectionType, FinancialYear, BusinessGoal, ProjectAsset, DiagnosisResponse, UploadedFile, User, Project, ProjectVersion, AnalysisGap } from './types';
import { INITIAL_SECTIONS, DEFAULT_METHODOLOGY, IMAGE_PROMPTS } from './constants';
import { generateSectionContent, generateFinancialData, generateGlobalDiagnosis, generateProjectImage, generateValueMatrix } from './services/gemini';
import { ContextManager } from './components/ContextManager';
import { FinancialChart } from './components/FinancialChart';
import { ValueMatrixViewer } from './components/ValueMatrixViewer';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { LiveDocumentPreview } from './components/LiveDocumentPreview';
import { GoogleDriveIntegration } from './components/GoogleDriveIntegration';


const STORAGE_KEY_PROJECTS = 'scine_saas_projects';
const STORAGE_KEY_USER = 'scine_saas_user';

type ViewState = 'auth' | 'dashboard' | 'editor' | 'preview';

const StatusIcon = ({ status }: { status: SectionStatus }) => {
  switch (status) {
    case SectionStatus.COMPLETED:
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case SectionStatus.DRAFT:
      return <FileText className="w-4 h-4 text-blue-500" />;
    case SectionStatus.GENERATING:
    case SectionStatus.ANALYZING:
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case SectionStatus.WAITING_USER:
      return <Edit3 className="w-4 h-4 text-yellow-500" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-300"></div>;
  }
};


const App: React.FC = () => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Editor-specific state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [refinementInput, setRefinementInput] = useState('');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveSyncInfo, setDriveSyncInfo] = useState<{ folder: string, fileId: string } | null>(null);

  const [isDiagnosisLoading, setIsDiagnosisLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);
  const activeSection = useMemo(() => activeProject?.currentData.sections.find(s => s.id === activeSectionId), [activeProject, activeSectionId]);
  
  const groupedSections = useMemo(() => {
    if (!activeProject) return {};
    return activeProject.currentData.sections.reduce((acc, section) => {
      const chapter = section.chapter;
      if (!acc[chapter]) {
        acc[chapter] = [];
      }
      acc[chapter].push(section);
      return acc;
    }, {} as Record<string, PlanSection[]>);
  }, [activeProject]);

  const setProjectData = useCallback((projectId: string, data: Partial<Project['currentData']>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, currentData: { ...p.currentData, ...data }, updatedAt: Date.now() } : p));
  }, []);

  const updateSection = useCallback((sectionId: string, updates: Partial<PlanSection>) => {
    if (!activeProject) return;
    const newSections = activeProject.currentData.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    );
    setProjectData(activeProject.id, { sections: newSections });
  }, [activeProject, setProjectData]);
  
  // --- LIFECYCLE & PERSISTENCE ---
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setCurrentView('dashboard');
      }
      const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (savedProjects) setProjects(JSON.parse(savedProjects));
    } catch (e) {
      console.error("Failed to load from storage", e);
      localStorage.clear(); // Clear corrupted storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    if (activeProject && !activeSectionId) {
      const firstUnlocked = activeProject.currentData.sections.find(s => !s.isLocked);
      if (firstUnlocked) {
        setActiveSectionId(firstUnlocked.id);
        const chapter = activeProject.currentData.sections.find(s => s.id === firstUnlocked.id)?.chapter;
        if(chapter) {
            setExpandedChapters(new Set([chapter]));
        }
      }
    }
  }, [activeProject, activeSectionId]);

  useEffect(() => {
    if (activeSection) {
        setEditedContent(activeSection.content);
        setIsEditing(false); // Default to view mode when section changes
    }
  }, [activeSectionId]);


  // --- HANDLERS ---
  const handleLogin = useCallback((email: string, name: string) => {
    const user: User = { id: `user_${Date.now()}`, email, name };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    setCurrentView('dashboard');
  }, []);
  
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    setActiveProjectId(null);
    setCurrentView('auth');
  }, []);

  const handleCreateProject = useCallback((name: string) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentData: {
        sections: INITIAL_SECTIONS.map(s => ({...s})), // Deep copy
        contextState: { methodology: DEFAULT_METHODOLOGY, businessGoal: BusinessGoal.FINANCING_BRDE, rawContext: '', uploadedFiles: [], assets: [] },
        diagnosisHistory: [],
      },
      versions: [],
    };
    setProjects(prev => [...prev, newProject]);
  }, []);

  const handleOpenProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setActiveSectionId(null); // Reset section on project open
    setCurrentView('editor');
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const getFullContext = useCallback(() => {
    if (!activeProject) return "";
    const { contextState } = activeProject.currentData;
    const restoredFileWarning = contextState.uploadedFiles.some(f => f.isRestored) ? "\nAVISO: Alguns arquivos foram restaurados da memória sem seu conteúdo completo. Baseie-se apenas em arquivos recém-adicionados para novas seções." : "";
    
    return `OBJETIVO: ${contextState.businessGoal}\nMETODOLOGIA: ${contextState.methodology}\nANOTAÇÕES: ${contextState.rawContext}\nARQUIVOS: ${contextState.uploadedFiles.filter(f => f.type === 'text' && f.content && !f.isRestored).map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n')}${restoredFileWarning}`;
  }, [activeProject]);
  
  const handleRunDiagnosis = useCallback(async () => {
    if (!activeProject) return;
    setIsDiagnosisLoading(true);
    try {
        const fullContext = getFullContext();
        
        updateSection('1.0', { status: SectionStatus.ANALYZING });
        const matrixResult = await generateValueMatrix(fullContext);
        setProjectData(activeProject.id, { contextState: { ...activeProject.currentData.contextState, valueMatrix: matrixResult }});

        const diagResult = await generateGlobalDiagnosis(fullContext, matrixResult, activeProject.currentData.diagnosisHistory);

        setProjectData(activeProject.id, { diagnosisHistory: [...activeProject.currentData.diagnosisHistory, diagResult] });
        updateSection('1.0', { status: SectionStatus.PENDING });
    } catch (e) {
        alert("Erro no diagnóstico. A resposta da IA pode ser inválida. Verifique o console.");
        console.error(e);
        updateSection('1.0', { status: SectionStatus.PENDING });
    } finally {
      setIsDiagnosisLoading(false);
    }
  }, [activeProject, getFullContext, setProjectData, updateSection]);

  const handleGenerateSection = async (section: PlanSection) => {
      if (!activeProject) return;
      setIsGenerating(true);
      updateSection(section.id, { status: SectionStatus.GENERATING });
      try {
        const context = getFullContext();
        const goal = activeProject.currentData.contextState.businessGoal;
        const matrix = activeProject.currentData.contextState.valueMatrix;
        const newContent = await generateSectionContent(section.title, section.description, '', context, goal, '', '', section.content, '', '', '', matrix);
        updateSection(section.id, { content: newContent, status: SectionStatus.DRAFT });
        setEditedContent(newContent);
      } catch(e) {
        console.error(e);
        updateSection(section.id, { status: SectionStatus.PENDING });
        alert(`Erro ao gerar conteúdo para ${section.title}`);
      } finally {
        setIsGenerating(false);
      }
  };

  const handleRefineSection = async (section: PlanSection) => {
    if (!activeProject || !refinementInput.trim()) return;
    setIsGenerating(true);
    updateSection(section.id, { status: SectionStatus.GENERATING });
    try {
      const context = getFullContext();
      const goal = activeProject.currentData.contextState.businessGoal;
      const matrix = activeProject.currentData.contextState.valueMatrix;
      const newContent = await generateSectionContent(section.title, section.description, '', context, goal, '', '', section.content, refinementInput, '', '', matrix);
      updateSection(section.id, { content: newContent, status: SectionStatus.DRAFT, lastRefinement: refinementInput });
      setEditedContent(newContent);
      setRefinementInput('');
    } catch (e) {
      console.error(e);
      updateSection(section.id, { status: SectionStatus.DRAFT }); // revert to draft on error
      alert(`Erro ao refinar conteúdo para ${section.title}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateFinancials = async (section: PlanSection) => {
    if (!activeProject) return;
    setIsGenerating(true);
    updateSection(section.id, { status: SectionStatus.GENERATING });
    try {
      const matrix = activeProject.currentData.contextState.valueMatrix;
      const { analysis, data } = await generateFinancialData(matrix);
      updateSection(section.id, { content: analysis, financialData: data, status: SectionStatus.DRAFT });
    } catch (e) {
      console.error(e);
      updateSection(section.id, { status: SectionStatus.PENDING });
      alert(`Erro ao gerar dados financeiros.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = () => {
    if (!activeSection) return;
    updateSection(activeSection.id, { content: editedContent, status: SectionStatus.DRAFT });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (!activeSection) return;
    setEditedContent(activeSection.content);
    setIsEditing(false);
  };

  // --- RENDER ---
  if (currentView === 'auth' || !currentUser) return <AuthScreen onLogin={handleLogin} />;
  if (currentView === 'dashboard') return <Dashboard user={currentUser} projects={projects} onCreateProject={handleCreateProject} onOpenProject={handleOpenProject} onDeleteProject={handleDeleteProject} onLogout={handleLogout} />;
  
  if (!activeProject) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500">Erro: Projeto não encontrado.</p>
          <button onClick={() => setCurrentView('dashboard')} className="mt-4 text-blue-600">Voltar ao Dashboard</button>
        </div>
      </div>
    );
  }
  
  if (currentView === 'preview') return <LiveDocumentPreview projectName={activeProject.name} sections={activeProject.currentData.sections} onClose={() => setCurrentView('editor')} />;

  const lastDiagnosis = activeProject.currentData.diagnosisHistory.slice(-1)[0];

  const MarkdownComponents = {
    table: ({node, ...props}: any) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    thead: ({node, ...props}: any) => <thead className="bg-slate-50 text-slate-600" {...props} />,
    th: ({node, ...props}: any) => (
      <th className="px-6 py-3 text-left font-semibold" {...props} />
    ),
    tbody: ({node, ...props}: any) => <tbody className="divide-y divide-slate-200 bg-white" {...props} />,
    tr: ({node, ...props}: any) => <tr className="hover:bg-slate-50" {...props} />,
    td: ({node, ...props}: any) => <td className="px-6 py-4" {...props} />,
    h1: ({...props}) => <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2" {...props} />,
    h2: ({...props}) => <h2 className="text-xl font-bold text-slate-800 mt-4 mb-2" {...props} />,
    h3: ({...props}) => <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2" {...props} />,
    p: ({...props}) => <p className="text-slate-700 leading-relaxed mb-4" {...props} />,
    ul: ({...props}) => <ul className="list-disc list-inside mb-4 pl-4 text-slate-700" {...props} />,
    ol: ({...props}) => <ol className="list-decimal list-inside mb-4 pl-4 text-slate-700" {...props} />,
    li: ({...props}) => <li className="mb-2" {...props} />,
    strong: ({...props}) => <strong className="font-semibold text-slate-900" {...props} />,
    a: ({...props}) => <a className="text-blue-600 hover:underline" {...props} />,
  };
  
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        {isDriveModalOpen && (
            <GoogleDriveIntegration 
                projectName={activeProject.name} 
                currentVersion={activeProject.versions.length + 1}
                onConnect={(folder, fileId) => {
                    setDriveSyncInfo({folder, fileId});
                    setIsDriveModalOpen(false);
                }}
                onCancel={() => setIsDriveModalOpen(false)}
            />
        )}
      {/* Header */}
      <header className="flex-shrink-0 bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{activeProject.name}</h1>
            <p className="text-xs text-slate-500">
                Última atualização: {new Date(activeProject.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setCurrentView('preview')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
                <FileText className="w-4 h-4" /> Visualizar Documento
            </button>
            <button 
                onClick={() => setIsDriveModalOpen(true)}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 ${driveSyncInfo ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {driveSyncInfo ? <Cloud className="w-4 h-4" /> : <CloudLightning className="w-4 h-4" />}
                {driveSyncInfo ? 'Sincronizado' : 'Sincronizar no Drive'}
            </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <aside className="w-1/4 max-w-sm flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
           <div className="p-4 sticky top-0 bg-white z-10 border-b border-slate-200">
                <h2 className="font-bold text-slate-800">Estrutura do Plano</h2>
                <p className="text-xs text-slate-500 mt-1">Navegue pelos capítulos e seções do seu plano.</p>
           </div>
           <nav className="p-2">
                {Object.entries(groupedSections).map(([chapter, sections]) => (
                    <details key={chapter} open={expandedChapters.has(chapter)} className="mb-1">
                        <summary 
                            className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 cursor-pointer font-semibold text-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                setExpandedChapters(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(chapter)) newSet.delete(chapter);
                                    else newSet.add(chapter);
                                    return newSet;
                                });
                            }}
                        >
                            <span className="truncate pr-2">{chapter}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedChapters.has(chapter) ? 'rotate-0' : '-rotate-90'}`} />
                        </summary>
                        <ul className="pl-4 pt-1 border-l-2 border-slate-200 ml-2">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <button 
                                        onClick={() => setActiveSectionId(section.id)}
                                        disabled={section.isLocked}
                                        className={`w-full text-left flex items-center gap-3 p-2 my-1 rounded-md text-sm transition-colors ${
                                            activeSectionId === section.id ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-slate-100 text-slate-600'
                                        } ${section.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                       <StatusIcon status={section.status} />
                                       <span className="flex-1 truncate">{section.title}</span>
                                       {section.isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </details>
                ))}
           </nav>
        </aside>

        {/* Center - Editor */}
        <section className="flex-1 overflow-y-auto p-8">
            {activeSection ? (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-blue-600">{activeSection.chapter}</p>
                        <h1 className="text-3xl font-bold text-slate-900 mt-1">{activeSection.title}</h1>
                        <p className="text-slate-600 mt-2 text-md leading-relaxed border-l-4 border-blue-200 pl-4">{activeSection.description}</p>
                    </div>

                    {activeSection.type === SectionType.FINANCIAL ? (
                        <div>
                             <button onClick={() => handleGenerateFinancials(activeSection)} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300">
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                {activeSection.content ? 'Regerar Análise Financeira' : 'Gerar Análise Financeira'}
                            </button>
                            {activeSection.content && (
                                <div className="mt-6 bg-white p-6 rounded-lg border border-slate-200 prose max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeSection.content}</ReactMarkdown>
                                </div>
                            )}
                            <FinancialChart data={activeSection.financialData || []} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {isEditing ? (
                                <>
                                    <textarea 
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base leading-relaxed"
                                        placeholder="Escreva aqui..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleCancelEdit} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancelar</button>
                                        <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                                            <Save className="w-4 h-4" /> Salvar Alterações
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-white p-6 rounded-lg border border-slate-200 min-h-[24rem] prose prose-slate max-w-none">
                                        {activeSection.content ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                                {activeSection.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                <p>Conteúdo vazio. Gere com a IA ou clique em editar.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">
                                            <Edit3 className="w-4 h-4" /> Editar Manualmente
                                        </button>
                                    </div>
                                </>
                            )}
                            
                            <div className="flex items-stretch gap-2">
                                <input 
                                    type="text"
                                    value={refinementInput}
                                    onChange={(e) => setRefinementInput(e.target.value)}
                                    placeholder="Instruções para refinar (Ex: 'deixe mais formal', 'adicione um parágrafo sobre...') "
                                    className="flex-grow p-3 border border-slate-300 rounded-lg text-sm"
                                    disabled={!activeSection.content || isGenerating || isEditing}
                                />
                                <button onClick={() => handleRefineSection(activeSection)} disabled={!activeSection.content || !refinementInput.trim() || isGenerating || isEditing} className="px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:bg-slate-300 flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" />
                                    Refinar
                                </button>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                               <button onClick={() => handleGenerateSection(activeSection)} disabled={isGenerating || isEditing} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 shadow-sm hover:shadow-md">
                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                    {activeSection.content ? 'Regerar com IA' : 'Gerar com IA'}
                                </button>
                                <button 
                                  onClick={() => updateSection(activeSection.id, {status: SectionStatus.COMPLETED})} 
                                  disabled={activeSection.status === SectionStatus.COMPLETED}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-green-100 text-green-800 hover:bg-green-200 disabled:bg-green-50 disabled:text-green-500 disabled:cursor-not-allowed"
                                >
                                    <Check className="w-4 h-4" /> 
                                    {activeSection.status === SectionStatus.COMPLETED ? 'Concluído' : 'Marcar como Concluído'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <ArrowLeft className="w-12 h-12 mb-4" />
                    <h2 className="text-xl font-medium">Selecione uma seção para começar</h2>
                </div>
            )}
        </section>

        {/* Right Sidebar - Context & Diagnosis */}
        <aside className="w-1/3 max-w-md flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto p-6 space-y-6">
            <div>
                 <button onClick={handleRunDiagnosis} disabled={isDiagnosisLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:bg-slate-300">
                    {isDiagnosisLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Stethoscope className="w-5 h-5" />}
                    {lastDiagnosis ? 'Atualizar Diagnóstico' : 'Rodar Diagnóstico Global'}
                </button>
            </div>
            
            {lastDiagnosis && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                 <h3 className="text-md font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-blue-600"/> Último Diagnóstico</h3>
                 <div className="mt-4 p-3 bg-blue-100/50 rounded-lg text-center">
                    <p className="text-sm text-blue-800 font-semibold">Nível de Prontidão</p>
                    <p className="text-3xl font-bold text-blue-700">{lastDiagnosis.overallReadiness || 0}%</p>
                 </div>
                 {/* @FIX: Refactored to use a ternary and a variable to ensure type safety and prevent crashes if `gaps` is not an array. */}
                 {(() => {
                   if (!Array.isArray(lastDiagnosis.gaps) || lastDiagnosis.gaps.length === 0) {
                     return null;
                   }
                   // FIX: Explicitly cast `lastDiagnosis.gaps` to `AnalysisGap[]` to resolve a type inference issue where `openGaps` was becoming `unknown`.
                   const openGaps = (lastDiagnosis.gaps as AnalysisGap[]).filter(g => g.status === 'OPEN');
                   return (
                     <div className="mt-4 space-y-2">
                       <h4 className="font-semibold text-sm">Pendências Críticas ({openGaps.length})</h4>
                       {openGaps.length > 0 && (
                         <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                           {openGaps.map(gap => (
                             <div key={gap.id} className="text-xs bg-white p-2 border-l-4 border-orange-400 rounded">
                               <span className={`font-bold mr-1 ${gap.severityLevel === 'A' ? 'text-red-600' : 'text-yellow-600'}`}>[{gap.severityLevel}]</span>
                               {gap.description}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   );
                 })()}
              </div>
            )}
            
            <ValueMatrixViewer matrix={activeProject.currentData.contextState.valueMatrix!} />

            <ContextManager 
                state={activeProject.currentData.contextState} 
                onUpdate={(updates) => {
                    setProjectData(activeProject.id, { contextState: { ...activeProject.currentData.contextState, ...updates } });
                }}
            />
        </aside>
      </main>
    </div>
  );
};
export default App;