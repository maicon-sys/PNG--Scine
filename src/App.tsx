import React, { useState, useEffect, useRef } from 'react';
import { 
  Project, User, PlanSection, SectionStatus, AppContextState, 
  StrategicMatrix, BusinessGoal, SectionType, AnalysisGap, DiagnosisResponse 
} from '../types';
import { 
  INITIAL_SECTIONS, DEFAULT_STRATEGIC_MATRIX, DEFAULT_METHODOLOGY, 
  DIAGNOSIS_STEPS 
} from '../constants';
import { 
  runDiagnosisStep, generateSectionContent, validateCompletedSections, updateMatrixFromApprovedContent, runTopicValidation, implementCorrections 
} from '../services/gemini';
import { Dashboard } from '../components/Dashboard';
import { AuthScreen } from '../components/AuthScreen';
import { ContextManager } from '../components/ContextManager';
import { StrategicMatrixViewer } from '../components/StrategicMatrixViewer';
import { LiveDocumentPreview } from '../components/LiveDocumentPreview';
import { FinancialChart } from '../components/FinancialChart';
import { SelectApiKeyModal } from '../components/SelectApiKeyModal';
import { ValidationModal } from '../components/ValidationModal';
import { 
  LayoutDashboard, FileText, Settings, PlayCircle, 
  CheckCircle, AlertCircle, ChevronRight, Save, ArrowLeft, Loader2, Sparkles, BookOpen, X, Edit, XCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// FIX: Adiciona chaves de armazenamento para persistência de dados.
const STORAGE_KEY_USER = 'strategia-ai-user';
const STORAGE_KEY_PROJECTS = 'strategia-ai-projects';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
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
  const [refinementInput, setRefinementInput] = useState('');
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isUpdatingMatrix, setIsUpdatingMatrix] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Deep Validation Modal State
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationReport, setValidationReport] = useState<string | null>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);

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
        // Quando o usuário seleciona uma nova seção, carrega o conteúdo e entra no modo de visualização.
        if (activeSection) {
            setEditedContent(activeSection.content);
            setIsEditing(false);
        }
    }, [selectedSectionId]);

  useEffect(() => {
    // Auto-resizing textarea logic
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [editedContent, isEditing]); // Rerun on content or section change

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
    // Não remove todos os projetos para não apagar dados de outros usuários
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
  
  const updateSection = (sectionId: string, updates: Partial<PlanSection>) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id !== activeProjectId) return p;

        const newSections = p.currentData.sections.map(s =>
          s.id === sectionId ? { ...s, ...updates } : s
        );

        return {
          ...p,
          updatedAt: Date.now(),
          currentData: { ...p.currentData, sections: newSections }
        };
      })
    );
  };

  const handleUpdateContext = (updates: Partial<AppContextState>) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id !== activeProjectId) return p;

        const newContextState = { ...p.currentData.contextState, ...updates };

        return {
          ...p,
          updatedAt: Date.now(),
          currentData: {
            ...p.currentData,
            contextState: newContextState
          }
        };
      })
    );
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
                 
                 setProjects(prev => prev.map(p => p.id === activeProjectId ? {
                     ...p,
                     currentData: {
                         ...p.currentData,
                         diagnosisHistory: [...p.currentData.diagnosisHistory, diagnosisResult]
                     }
                 } : p));

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
        setEditedContent(newContent);
        setIsEditing(true); // Entra no modo de edição após gerar o conteúdo
      } catch(e) {
        console.error(e);
        updateSection(section.id, { status: SectionStatus.PENDING });
        alert(`Erro ao gerar conteúdo para ${section.title}`);
      } finally {
        setIsGenerating(false);
      }
  };

  const handleRefineSection = async () => {
    if (!activeProject || !activeSection || !refinementInput.trim()) return;

    setIsGenerating(true);
    updateSection(activeSection.id, { status: SectionStatus.GENERATING });

    try {
      const context = getFullContext({ maxLength: 100000 });
      const goal = activeProject.currentData.contextState.businessGoal;
      const methodology = activeProject.currentData.contextState.methodology;
      const assets = activeProject.currentData.contextState.assets;
      const matrix = activeProject.currentData.contextState.strategicMatrix;

      const newContent = await generateSectionContent(
        activeSection.title,
        activeSection.description,
        methodology,
        context,
        goal,
        '', 
        '', 
        activeSection.content,
        refinementInput,
        '',
        '',
        matrix,
        assets
      );

      updateSection(activeSection.id, {
        content: newContent,
        status: SectionStatus.DRAFT,
        lastRefinement: refinementInput,
      });
      setEditedContent(newContent);
      setIsEditing(true); // Continua no modo de edição após refinar
      setRefinementInput('');
    } catch (e) {
      console.error("Erro ao refinar seção:", e);
      alert(`Ocorreu um erro ao refinar o conteúdo. Por favor, tente novamente.`);
      updateSection(activeSection.id, { status: SectionStatus.DRAFT });
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSaveContent = (exitEditMode: boolean = false) => {
    if (selectedSectionId && activeSection && editedContent !== activeSection.content) {
      setSaveStatus('saving');
      updateSection(selectedSectionId, { content: editedContent, status: SectionStatus.DRAFT });
      
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    }
    if(exitEditMode) {
      setIsEditing(false);
    }
  };

    const handleCancelEdit = () => {
        if(activeSection) {
            setEditedContent(activeSection.content);
        }
        setIsEditing(false);
    };

  const handleValidateCurrentSection = async () => {
    if (!activeProject || !activeSection) return;
    
    // 1. Salva o conteúdo atual antes de validar
    handleSaveContent(false);
    
    // 2. Prepara estado para Modal
    setValidationReport(null);
    setValidationModalOpen(true);
    setIsValidating(true);
    updateSection(activeSection.id, { status: SectionStatus.ANALYZING });

    try {
        const { contextState } = activeProject.currentData;
        const { strategicMatrix } = contextState;

        // 3. Executa a validação profunda usando o novo serviço
        const report = await runTopicValidation(
            editedContent, // Usa o conteúdo editado
            activeSection.title,
            activeSection.description,
            contextState.methodology,
            strategicMatrix || null
        );

        setValidationReport(report);
        
        // 4. Atualiza status da seção (Mantém feedback inline simples, mas o detalhe está no modal)
        updateSection(activeSection.id, {
            status: SectionStatus.REVIEW_ALERT,
            validationFeedback: "Auditoria técnica concluída. Veja o relatório detalhado.",
        });

    } catch (e) {
        console.error("Erro na validação:", e);
        setValidationReport("Ocorreu um erro crítico ao gerar o relatório. Tente novamente.");
        updateSection(activeSection.id, { status: SectionStatus.DRAFT });
    } finally {
        setIsValidating(false);
    }
  };

  const handleImplementCorrections = async () => {
      if (!activeProject || !activeSection || !validationReport) return;
      
      setIsCorrecting(true);

      try {
          const context = getFullContext({ maxLength: 100000 });
          const { strategicMatrix } = activeProject.currentData.contextState;

          // Chama a IA para reescrever o texto baseada no relatório de validação
          const correctedContent = await implementCorrections(
              activeSection.content,
              validationReport,
              activeSection.title,
              activeSection.description,
              context,
              strategicMatrix || null
          );

          // Atualiza o conteúdo da seção
          updateSection(activeSection.id, {
              content: correctedContent,
              status: SectionStatus.DRAFT, // Volta para draft para revisão humana
              validationFeedback: "Correções implementadas pela IA. Por favor, revise."
          });
          
          setEditedContent(correctedContent);
          
          // Fecha o modal e mostra sucesso
          setValidationModalOpen(false);
          // Opcional: Mostrar um toast de sucesso
          
      } catch (error) {
          console.error("Erro ao implementar correções:", error);
          alert("Erro ao aplicar correções automáticas.");
      } finally {
          setIsCorrecting(false);
      }
  };

    const handleApproveSection = async (section: PlanSection) => {
        if (!activeProject || isUpdatingMatrix) return;
        
        setIsUpdatingMatrix(true);
        
        try {
            const matrixUpdate = await updateMatrixFromApprovedContent(
                section.content,
                section.title,
                activeProject.currentData.contextState.strategicMatrix || DEFAULT_STRATEGIC_MATRIX
            );
            
            setProjects(prevProjects => 
                prevProjects.map(p => {
                    if (p.id !== activeProjectId) return p;

                    // 1. Calculate new matrix based on the latest project state
                    const currentMatrix = p.currentData.contextState.strategicMatrix || DEFAULT_STRATEGIC_MATRIX;
                    let newMatrix = currentMatrix;

                    if (Object.keys(matrixUpdate).length > 0) {
                        newMatrix = JSON.parse(JSON.stringify(currentMatrix));
                        
                        const mergeBlock = (targetBlock: any, sourceBlock: any) => {
                            if (!sourceBlock || !targetBlock) return;
                            if (sourceBlock?.items) targetBlock.items.push(...sourceBlock.items);
                            if (sourceBlock?.description) targetBlock.description = sourceBlock.description;
                        };

                        Object.keys(matrixUpdate).forEach(key => {
                            if (key === 'swot' && matrixUpdate.swot) {
                                Object.keys(matrixUpdate.swot).forEach(swotKey => {
                                    const target = newMatrix.swot[swotKey as keyof typeof newMatrix.swot];
                                    const source = matrixUpdate.swot![swotKey as keyof typeof matrixUpdate.swot];
                                    if (target && source) mergeBlock(target, source);
                                });
                            } else if (newMatrix[key as keyof StrategicMatrix]) {
                                const target = newMatrix[key as keyof StrategicMatrix];
                                const source = matrixUpdate[key as keyof StrategicMatrix];
                                if (target && source) mergeBlock(target, source);
                            }
                        });
                    }

                    // 2. Update section status
                    const newSections = p.currentData.sections.map(s =>
                      s.id === section.id ? { ...s, status: SectionStatus.APPROVED } : s
                    );

                    // 3. Return the fully updated project
                    return {
                        ...p,
                        updatedAt: Date.now(),
                        currentData: {
                            ...p.currentData,
                            sections: newSections,
                            contextState: {
                                ...p.currentData.contextState,
                                strategicMatrix: newMatrix
                            }
                        }
                    };
                })
            );

        } catch (e) {
            console.error("Erro ao retroalimentar a matriz:", e);
            // Revert status on failure
            updateSection(section.id, { status: SectionStatus.DRAFT });
        } finally {
            setIsUpdatingMatrix(false);
        }
    };


  const handleShowPreview = () => {
    handleSaveContent();
    setShowPreview(true);
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
            onClick={handleShowPreview} 
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
                  ${section.status === SectionStatus.APPROVED ? 'bg-green-100 text-green-700' :
                    section.status === SectionStatus.COMPLETED ? 'bg-blue-100 text-blue-700' : 
                    section.status === SectionStatus.REVIEW_ALERT ? 'bg-red-100 text-red-700' :
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
                disabled={!activeSection || isGenerating || isValidating}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
               >
                 <Sparkles className="w-4 h-4" /> 
                 {activeSection?.content ? 'Regerar do Zero' : 'Gerar com IA'}
               </button>
             )}
             <span className="text-gray-300">|</span>
             {isEditing ? (
                <>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleSaveContent(true)}
                            disabled={isValidating || isGenerating || saveStatus === 'saving'}
                            className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                        >
                            {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar Alterações
                        </button>
                        {saveStatus === 'saved' && (
                            <span className="text-sm text-green-600 flex items-center gap-1 animate-in fade-in duration-300">
                            <CheckCircle className="w-4 h-4" />
                            Salvo!
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        <XCircle className="w-4 h-4" />
                        Cancelar
                    </button>
                </>
             ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    disabled={!activeSection}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-50"
                >
                    <Edit className="w-4 h-4" />
                    Editar Texto
                </button>
             )}
             <button 
                onClick={handleValidateCurrentSection}
                disabled={!activeSection || !activeSection.content || isValidating || isGenerating || isEditing}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title={isEditing ? "Salve ou cancele a edição para validar" : "A IA irá auditar este texto, verificando a coerência com a metodologia (SEBRAE/BRDE), os dados do diagnóstico e os objetivos do projeto. O resultado será exibido como um feedback."}
             >
               {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
               Validar
             </button>
           </div>
           
           <div className="flex items-center gap-2">
             <button 
               onClick={() => activeSection && handleApproveSection(activeSection)}
               disabled={isUpdatingMatrix || isEditing}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed
                 ${activeSection?.status === SectionStatus.APPROVED 
                   ? 'bg-green-100 text-green-700' 
                   : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                title={isEditing ? "Salve ou cancele a edição para aprovar" : ""}
             >
               {isUpdatingMatrix ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
               {isUpdatingMatrix ? 'Aprendendo...' : 'Aprovar'}
             </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
               <div className="p-6 border-b border-gray-100">
                 <h1 className="text-2xl font-bold text-gray-800 mb-2">{activeSection.title}</h1>
                 <p className="text-sm text-gray-500">{activeSection.description}</p>
                 {activeSection.validationFeedback && (activeSection.status === SectionStatus.REVIEW_ALERT || activeSection.status === SectionStatus.COMPLETED) && (
                    <div className={`mt-4 p-3 border rounded-lg text-sm flex items-start gap-2 cursor-pointer transition-colors
                        ${activeSection.status === SectionStatus.REVIEW_ALERT 
                            ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100' 
                            : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'}`
                    }
                    onClick={() => {
                        // Reabre o modal se houver um relatório (simulado)
                        // Em uma implementação real completa, persistiríamos o relatório no estado da seção
                        if (validationReport) setValidationModalOpen(true);
                        else handleValidateCurrentSection(); // Ou revalida
                    }}
                    >
                        {activeSection.status === SectionStatus.REVIEW_ALERT ? (
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                            <strong className="font-bold">
                                {activeSection.status === SectionStatus.REVIEW_ALERT ? 'Feedback da IA (Ajustes Necessários):' : 'Feedback da IA (Validação Aprovada):'}
                            </strong>
                            <p>{activeSection.validationFeedback}</p>
                            <span className="text-xs underline mt-1 block">Clique para ver o relatório completo</span>
                        </div>
                    </div>
                  )}
               </div>

                {activeSection.content && (
                 <div className="p-4 border-b border-gray-200 bg-gray-50">
                   <div className="flex items-center gap-3">
                     <input
                       type="text"
                       value={refinementInput}
                       onChange={(e) => setRefinementInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleRefineSection()}
                       disabled={isGenerating || isValidating}
                       className="flex-grow w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                       placeholder="Peça para a IA refinar este texto..."
                     />
                     <button
                       onClick={handleRefineSection}
                       disabled={isGenerating || isValidating || !refinementInput.trim()}
                       className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:bg-purple-300 disabled:cursor-not-allowed"
                       title="Refinar com base na instrução"
                     >
                       <Sparkles className="w-4 h-4" />
                       <span>Refinar</span>
                     </button>
                   </div>
                   {activeSection.lastRefinement && (
                      <p className="text-xs text-gray-500 mt-2">Último refinamento: "<em>{activeSection.lastRefinement}</em>"</p>
                   )}
                 </div>
               )}

               <div className="p-6 min-h-[300px]">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        onBlur={() => handleSaveContent(false)}
                        className="w-full p-0 resize-none focus:outline-none text-gray-800 leading-relaxed overflow-y-hidden"
                        placeholder="O conteúdo desta seção aparecerá aqui..."
                        rows={10}
                        autoFocus
                    />
                ) : (
                    <div className="prose prose-slate max-w-none text-justify">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {editedContent || "Esta seção ainda não possui conteúdo. Clique em 'Gerar com IA' ou 'Editar Texto' para começar."}
                        </ReactMarkdown>
                    </div>
                )}
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
            onExpand={() => setIsMatrixModalOpen(true)}
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

      {/* Validation Modal */}
      <ValidationModal 
        isOpen={validationModalOpen} 
        onClose={() => setValidationModalOpen(false)}
        report={validationReport}
        isLoading={isValidating}
        sectionTitle={activeSection?.title || ''}
        onImplementCorrections={handleImplementCorrections}
        isCorrecting={isCorrecting}
      />

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

      {/* Matrix Fullscreen Modal */}
      {isMatrixModalOpen && (
        <div 
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMatrixModalOpen(false)}
        >
          <div 
            className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0 bg-white rounded-t-xl">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                    Matriz Estratégica - Visão Completa
                </h2>
                <button 
                    onClick={() => setIsMatrixModalOpen(false)}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100"
                    title="Fechar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <StrategicMatrixViewer
                matrix={activeProject.currentData.contextState.strategicMatrix || DEFAULT_STRATEGIC_MATRIX}
                isModalView={true}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;