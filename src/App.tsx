import React, { useState, useEffect, useRef } from 'react';
import { 
  Project, User, PlanSection, SectionStatus, AppContextState, 
  StrategicMatrix, BusinessGoal, SectionType, AnalysisGap, DiagnosisResponse 
} from './types';
import { 
  INITIAL_SECTIONS, DEFAULT_STRATEGIC_MATRIX, DEFAULT_METHODOLOGY, 
  DIAGNOSIS_STEPS 
} from './constants';
import { 
  runDiagnosisStep, generateSectionContent, validateCompletedSections 
} from './services/gemini';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { ContextManager } from './components/ContextManager';
import { StrategicMatrixViewer } from './components/StrategicMatrixViewer';
import { LiveDocumentPreview } from './components/LiveDocumentPreview';
import { FinancialChart } from './components/FinancialChart';
import { SelectApiKeyModal } from './components/SelectApiKeyModal';
import { 
  LayoutDashboard, FileText, Settings, PlayCircle, 
  CheckCircle, AlertCircle, ChevronRight, Save, ArrowLeft, Loader2, Sparkles, BookOpen 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// FIX: Adiciona chaves de armazenamento para persistência de dados.
const STORAGE_KEY_USER = 'strategia-ai-user';
const STORAGE_KEY_PROJECTS = 'strategia-ai-projects';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Diagnosis State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState(0);
  const [diagnosisLogs, setDiagnosisLogs] = useState<string[]>([]);

  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isApiKeySelectionOpen, setIsApiKeySelectionOpen] = useState(false);

  // Editor State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Computed Active Project
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeSection = activeProject?.currentData.sections.find(s => s.id === selectedSectionId);

  // --- DATA PERSISTENCE ---
  useEffect(() => {
    checkApiKey();
    // Carrega a sessão do usuário e seus projetos ao iniciar.
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // FIX: Carrega apenas projetos pertencentes ao usuário logado.
        const allProjects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS) || '[]');
        setProjects(allProjects.filter(p => p.userId === parsedUser.id));
    }
  }, []);

  useEffect(() => {
    // Salva o usuário no localStorage sempre que ele mudar.
    if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    // Salva os projetos, garantindo segurança para múltiplos usuários no mesmo navegador.
    if (!user) return;
    
    const allProjects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS) || '[]');
    const otherUserProjects = allProjects.filter(p => p.userId !== user.id);
    const updatedAllProjects = [...otherUserProjects, ...projects];
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedAllProjects));

  }, [projects, user]);
  // --- END OF DATA PERSISTENCE ---

  useEffect(() => {
    if (activeSection) {
      setEditedContent(activeSection.content);
    }
  }, [activeSection]);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    } else {
      setHasApiKey(true); 
    }
  };

  const handleLogin = (email: string, name: string) => {
    const newUser = { id: email, email, name, avatar: '' }; // Usando email como ID único
    setUser(newUser);

    // FIX: Garante que, ao logar, apenas os projetos do novo usuário sejam carregados.
    const allProjects: Project[] = JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS) || '[]');
    setProjects(allProjects.filter(p => p.userId === newUser.id));
    setActiveProjectId(null); // Limpa projeto ativo ao trocar de usuário
  };

  const handleLogout = () => {
    setUser(null);
    setActiveProjectId(null);
    setProjects([]); // Limpa os projetos do estado da aplicação

    // FIX: Remove os dados do usuário E os projetos do localStorage,
    // garantindo que o próximo usuário comece com um ambiente limpo.
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
  };

  const handleCreateProject = (name: string) => {
    if (!user) return; // Proteção para garantir que há um usuário logado

    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      userId: user.id, // FIX: Associa o projeto ao usuário atual
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentData: {
        sections: JSON.parse(JSON.stringify(INITIAL_SECTIONS)),
        contextState: {
          methodology: DEFAULT_METHODOLOGY,
          businessGoal: BusinessGoal.GENERAL,
          rawContext: '',
          uploadedFiles: [],
          assets: [],
          strategicMatrix: { ...DEFAULT_STRATEGIC_MATRIX }
        },
        diagnosisHistory: []
      },
      versions: []
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleDeleteProject = (id: string) => {
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
    setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
  };

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    const proj = projects.find(p => p.id === id);
    if (proj && proj.currentData.sections.length > 0) {
      setSelectedSectionId(proj.currentData.sections[0].id);
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
  };

  const handleUpdateContext = (updates: Partial<AppContextState>) => {
    if (!activeProject) return;
    updateProject(activeProject.id, {
      currentData: {
        ...activeProject.currentData,
        contextState: { ...activeProject.currentData.contextState, ...updates }
      }
    });
  };

  const updateSection = (sectionId: string, updates: Partial<PlanSection>) => {
    if (!activeProject) return;
    const newSections = activeProject.currentData.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    );
    updateProject(activeProject.id, {
      currentData: { ...activeProject.currentData, sections: newSections }
    });
  };

  const getFullContext = ({ maxLength = 50000 }: { maxLength?: number } = {}) => {
    if (!activeProject) return '';
    const { contextState } = activeProject.currentData;
    let context = `CONTEXTO DO USUÁRIO:\n${contextState.rawContext}\n\n`;
    
    contextState.uploadedFiles.forEach(file => {
      context += `--- ARQUIVO: ${file.name} ---\n${file.content}\n\n`;
    });

    if (context.length <= maxLength) {
      return context;
    }
    
    let cutIndex = maxLength;
    
    while (cutIndex > 0) {
        const lastSpace = context.lastIndexOf(' ', cutIndex - 1);
        const lastNewline = context.lastIndexOf('\n', cutIndex - 1);
        const potentialCutIndex = Math.max(lastSpace, lastNewline);

        if (potentialCutIndex === -1) {
            break; 
        }
        
        cutIndex = potentialCutIndex;

        const sub = context.substring(0, cutIndex);
        let braceDepth = 0;
        let bracketDepth = 0;
        let inString = false;

        for (const char of sub) {
            if (char === '"') {
                inString = !inString;
            } else if (!inString) {
                if (char === '{') braceDepth++;
                else if (char === '}') braceDepth--;
                else if (char === '[') bracketDepth++;
                else if (char === ']') bracketDepth--;
            }
        }

        if (braceDepth <= 0 && bracketDepth <= 0) {
            return context.substring(0, cutIndex) + `\n\n... (AVISO: O contexto era muito longo e foi truncado de forma segura para ${cutIndex} caracteres para caber no limite de ${maxLength}. A análise se baseará nestes dados.)`;
        }
    }

    return context.substring(0, maxLength) + `\n\n... (AVISO: O contexto excedeu ${maxLength} caracteres e foi cortado abruptamente. AVISO: A estrutura de dados no final (ex: JSON) pode estar corrompida, o que pode afetar a análise da IA.)`;
  };

  const handleRunDiagnosis = async () => {
    if (!activeProject) return;

    if (!hasApiKey) {
      if (window.aistudio) {
        setIsApiKeySelectionOpen(true);
        return;
      }
      alert("API Key necessária para diagnóstico.");
      return;
    }
    
    setIsDiagnosing(true);
    setDiagnosisLogs([]);
    setDiagnosisStep(0);

    const context = getFullContext();
    const assets = activeProject.currentData.contextState.assets;
    let currentMatrix = { ...activeProject.currentData.contextState.strategicMatrix } || { ...DEFAULT_STRATEGIC_MATRIX };

    try {
        for (let i = 0; i < DIAGNOSIS_STEPS.length; i++) {
            setDiagnosisStep(i);
            const stepName = DIAGNOSIS_STEPS[i].name;
            setDiagnosisLogs(prev => [...prev, `Iniciando etapa ${i + 1}: ${stepName}...`]);

            const result = await runDiagnosisStep(i, context, currentMatrix, assets);
            
            if (result.logs && result.logs.length > 0) {
                setDiagnosisLogs(prev => [...prev, ...result.logs]);
            }

            if (result.matrixUpdate) {
                currentMatrix = {
                    ...currentMatrix,
                    ...result.matrixUpdate,
                    swot: {
                        ...currentMatrix.swot,
                        ...result.matrixUpdate.swot
                    },
                    generatedAt: Date.now()
                };
            }
            
            handleUpdateContext({ strategicMatrix: currentMatrix });

            if (i === 9 && result.finalDiagnosis) {
                 const diagnosisResult: DiagnosisResponse = {
                     timestamp: Date.now(),
                     projectSummary: "Diagnóstico Completo via IA",
                     strategicPaths: [], 
                     gaps: result.finalDiagnosis.gaps.map(g => ({ ...g, status: 'OPEN', resolutionScore: 0, createdAt: Date.now(), updatedAt: Date.now() })) as AnalysisGap[], 
                     overallReadiness: result.finalDiagnosis.overallReadiness,
                     suggestedSections: []
                 };
                 
                 updateProject(activeProject.id, {
                     currentData: {
                         ...activeProject.currentData,
                         diagnosisHistory: [...activeProject.currentData.diagnosisHistory, diagnosisResult]
                     }
                 });
                 setDiagnosisLogs(prev => [...prev, `Diagnóstico concluído! Nível de Prontidão: ${result.finalDiagnosis?.overallReadiness}%`]);
            }
        }
    } catch (error) {
        console.error("Erro no diagnóstico:", error);
        setDiagnosisLogs(prev => [...prev, `Erro crítico: ${error}`]);
    } finally {
        setIsDiagnosing(false);
    }
  };

  const handleGenerateSection = async (section: PlanSection) => {
      if (!activeProject) return;

      if (!hasApiKey) {
        if (window.aistudio) {
          setIsApiKeySelectionOpen(true);
          return;
        }
        alert("API Key necessária.");
        return;
      }

      const matrix = activeProject.currentData.contextState.strategicMatrix;
      if (!matrix || matrix.generatedAt === 0) {
        alert("Por favor, execute o Diagnóstico Global primeiro para gerar a Matriz Estratégica, que é necessária para embasar o conteúdo das seções.");
        return;
      }

      setIsGenerating(true);
      updateSection(section.id, { status: SectionStatus.GENERATING, validationFeedback: '' });
      try {
        const context = getFullContext({ maxLength: 100000 });
        const goal = activeProject.currentData.contextState.businessGoal;
        const methodology = activeProject.currentData.contextState.methodology;
        const assets = activeProject.currentData.contextState.assets;

        const allSections = activeProject.currentData.sections;
        const currentIndex = allSections.findIndex(s => s.id === section.id);
        const previousSections = allSections
            .slice(0, currentIndex)
            .filter(s => s.content && s.content.trim().length > 0)
            .map(s => `[SEÇÃO ANTERIOR JÁ ESCRITA: ${s.title}]\n${s.content}`)
            .join('\n\n----------------\n\n');

        const newContent = await generateSectionContent(
            section.title, 
            section.description, 
            methodology, 
            context, 
            goal, 
            '', 
            previousSections, 
            section.content, 
            '', '', '', 
            matrix,
            assets
        );
        updateSection(section.id, { content: newContent, status: SectionStatus.DRAFT });
        if (selectedSectionId === section.id) {
          setEditedContent(newContent);
        }
      } catch(e) {
        console.error(e);
        updateSection(section.id, { status: SectionStatus.PENDING });
        alert(`Erro ao gerar conteúdo para ${section.title}`);
      } finally {
        setIsGenerating(false);
      }
  };

  const handleSaveContent = () => {
    if (selectedSectionId && editedContent !== activeSection?.content) {
      updateSection(selectedSectionId, { content: editedContent });
    }
  };

  // --- RENDERING ---

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (!activeProject) {
    return (
      <Dashboard 
        user={user} 
        projects={projects} 
        onCreateProject={handleCreateProject}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
        onLogout={handleLogout}
      />
    );
  }

  if (showPreview) {
    return (
      <LiveDocumentPreview 
        projectName={activeProject.name}
        sections={activeProject.currentData.sections}
        assets={activeProject.currentData.contextState.assets}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Left: Sections */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-800 truncate max-w-[150px]">{activeProject.name}</h2>
            <button onClick={() => setActiveProjectId(null)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Voltar
            </button>
          </div>
          <button 
            onClick={() => setShowPreview(true)} 
            className="text-gray-500 hover:text-blue-600 p-2"
            title="Visualizar Documento Final"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeProject.currentData.sections.map(section => (
            <div 
              key={section.id}
              onClick={() => setSelectedSectionId(section.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSectionId === section.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-500">{section.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium 
                  ${section.status === SectionStatus.COMPLETED || section.status === SectionStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                    section.status === SectionStatus.DRAFT ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                  {section.status}
                </span>
              </div>
              <h4 className={`text-sm font-medium leading-tight ${selectedSectionId === section.id ? 'text-blue-800' : 'text-gray-700'}`}>
                {section.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Editor */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Editor Toolbar */}
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm z-10">
           <div className="flex items-center gap-3">
             {isGenerating ? (
               <span className="flex items-center gap-2 text-blue-600 text-sm font-medium animate-pulse">
                 <Loader2 className="w-4 h-4 animate-spin" /> Gerando Conteúdo...
               </span>
             ) : (
               <button 
                onClick={() => activeSection && handleGenerateSection(activeSection)}
                disabled={!activeSection || isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm transition-all"
               >
                 <Sparkles className="w-4 h-4" /> Gerar com IA
               </button>
             )}
             <span className="text-gray-300">|</span>
             <button 
                onClick={handleSaveContent}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
             >
               <Save className="w-4 h-4" /> Salvar
             </button>
           </div>
           
           <div className="flex items-center gap-2">
             <button 
               onClick={() => activeSection && updateSection(activeSection.id, { status: SectionStatus.APPROVED })}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                 ${activeSection?.status === SectionStatus.APPROVED 
                   ? 'bg-green-100 text-green-700' 
                   : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
             >
               <CheckCircle className="w-4 h-4" /> Aprovar
             </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
               <div className="p-6 border-b border-gray-100">
                 <h1 className="text-2xl font-bold text-gray-800 mb-2">{activeSection.title}</h1>
                 <p className="text-sm text-gray-500">{activeSection.description}</p>
                 {activeSection.validationFeedback && (
                   <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     <p>{activeSection.validationFeedback}</p>
                   </div>
                 )}
               </div>
               <div className="flex-1 p-0 relative">
                 <textarea
                   value={editedContent}
                   onChange={(e) => setEditedContent(e.target.value)}
                   onBlur={handleSaveContent}
                   className="w-full h-full p-6 resize-none focus:outline-none text-gray-800 leading-relaxed"
                   placeholder="O conteúdo desta seção aparecerá aqui..."
                 />
                 {/* Optional: Add a preview toggle or split view if needed */}
               </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <FileText className="w-16 h-16 mb-4 opacity-20" />
               <p>Selecione uma seção para editar</p>
             </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Context & AI Tools */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden shadow-xl z-20">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Ferramentas do Projeto
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Diagnosis Module */}
          <div className="bg-white rounded-lg border border-blue-100 shadow-sm overflow-hidden">
             <div className="bg-blue-50 p-3 border-b border-blue-100 flex justify-between items-center">
               <h4 className="font-bold text-blue-900 text-sm">Diagnóstico Global</h4>
               <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                 {activeProject.currentData.diagnosisHistory.length > 0 
                    ? `${activeProject.currentData.diagnosisHistory[activeProject.currentData.diagnosisHistory.length -1].overallReadiness}%` 
                    : 'Não iniciado'}
               </span>
             </div>
             <div className="p-3">
               <p className="text-xs text-gray-600 mb-3">
                 A IA analisará todos os arquivos e construirá a Matriz Estratégica (Canvas + SWOT).
               </p>
               
               {isDiagnosing ? (
                 <div className="space-y-2">
                   <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${(diagnosisStep / 10) * 100}%` }}
                     />
                   </div>
                   <div className="text-xs text-gray-500 h-20 overflow-y-auto font-mono bg-gray-50 p-2 rounded border">
                     {diagnosisLogs.map((log, i) => <div key={i}>{log}</div>)}
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={handleRunDiagnosis}
                   className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex justify-center items-center gap-2"
                 >
                   <PlayCircle className="w-4 h-4" /> Executar Diagnóstico
                 </button>
               )}
             </div>
          </div>

          {/* Strategic Matrix Viewer */}
          <StrategicMatrixViewer 
            matrix={activeProject.currentData.contextState.strategicMatrix || DEFAULT_STRATEGIC_MATRIX}
          />

          {/* Context Manager */}
          <ContextManager 
            state={activeProject.currentData.contextState}
            onUpdate={handleUpdateContext}
          />
          
          {/* Financials Placeholder */}
          {activeProject.currentData.sections.some(s => s.financialData) && (
             <FinancialChart data={activeProject.currentData.sections.find(s => s.financialData)?.financialData || []} />
          )}

        </div>
      </div>

      {/* API Key Modal */}
      {isApiKeySelectionOpen && (
        <SelectApiKeyModal 
          onClose={() => setIsApiKeySelectionOpen(false)} 
          onApiKeySelected={() => {
            setIsApiKeySelectionOpen(false);
            setHasApiKey(true);
          }} 
        />
      )}
    </div>
  );
};

export default App;