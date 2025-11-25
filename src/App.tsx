import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, FileText, Download, CheckCircle2, Loader2,
  ChevronRight, ChevronDown, Edit3, Save, Wand2,
  Lock, RotateCcw, ArrowRightCircle, RefreshCw, Paperclip, TableProperties,
  LogOut, ArrowLeft, Cloud, CloudLightning, Stethoscope,
  History, AlertTriangle, Check, ShieldCheck, FileCode,
  ChevronsLeft, ChevronsRight, X, ImageIcon, Award, Info, Key
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { produce } from 'immer';

import { PlanSection, AppContextState, SectionStatus, SectionType, FinancialYear, BusinessGoal, ProjectAsset, DiagnosisResponse, UploadedFile, User, Project, ProjectVersion, AnalysisGap, StrategicMatrix, DiagnosisStepResult, WebSource } from '../types';
import { INITIAL_SECTIONS, DEFAULT_METHODOLOGY, DIAGNOSIS_STEPS, DEFAULT_STRATEGIC_MATRIX } from '../constants';
import { generateSectionContent, generateFinancialData, runDiagnosisStep, generateProjectImage, validateCompletedSections, fixSectionContentWithSearch } from '../services/gemini';
import { ContextManager } from '../components/ContextManager';
import { FinancialChart } from '../components/FinancialChart';
import { StrategicMatrixViewer } from '../components/StrategicMatrixViewer';
import { AuthScreen } from '../components/AuthScreen';
import { Dashboard } from '../components/Dashboard';
import { LiveDocumentPreview } from '../components/LiveDocumentPreview';
import { GoogleDriveIntegration } from '../components/GoogleDriveIntegration';
import { SelectApiKeyModal } from '../components/SelectApiKeyModal';


const STORAGE_KEY_PROJECTS = 'scine_saas_projects';
const STORAGE_KEY_USER = 'scine_saas_user';

type ViewState = 'auth' | 'dashboard' | 'editor' | 'preview';

const StatusIcon = ({ status }: { status: SectionStatus }) => {
  switch (status) {
    case SectionStatus.APPROVED:
      return <Award className="w-4 h-4 text-indigo-500" />;
    case SectionStatus.COMPLETED:
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case SectionStatus.DRAFT:
      return <FileText className="w-4 h-4 text-blue-500" />;
    case SectionStatus.GENERATING:
    case SectionStatus.ANALYZING:
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case SectionStatus.WAITING_USER:
      return <Edit3 className="w-4 h-4 text-yellow-500" />;
    case SectionStatus.REVIEW_ALERT:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
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
  
  // Ref to track latest projects state for async operations (fixing stale closures)
  const projectsRef = useRef(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Editor-specific state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [refinementInput, setRefinementInput] = useState('');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveSyncInfo, setDriveSyncInfo] = useState<{ folder: string, fileId: string } | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);


  // New Diagnosis State
  const [isDiagnosisRunning, setIsDiagnosisRunning] = useState(false);
  const [diagnosisProgress, setDiagnosisProgress] = useState(0);
  const [currentDiagnosisStep, setCurrentDiagnosisStep] = useState(0);
  const [diagnosisLogs, setDiagnosisLogs] = useState<string[]>([]);
  
  const [isValidationLoading, setIsValidationLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // API Key Management State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isApiKeySelectionOpen, setIsApiKeySelectionOpen] = useState<boolean>(false);


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

    const currentSection = activeProject.currentData.sections.find(s => s.id === sectionId);
    let updatedFiles = activeProject.currentData.contextState.uploadedFiles;

    // If a completed/approved section is being modified, remove its generated context file.
    if (currentSection && (currentSection.status === SectionStatus.COMPLETED || currentSection.status === SectionStatus.APPROVED) && updates.status && (updates.status !== SectionStatus.COMPLETED && updates.status !== SectionStatus.APPROVED)) {
        updatedFiles = updatedFiles.filter(f => f.sourceSectionId !== sectionId);
    }

    const newSections = activeProject.currentData.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    );

    const newContextState = { ...activeProject.currentData.contextState, uploadedFiles: updatedFiles };
    setProjectData(activeProject.id, { sections: newSections, contextState: newContextState });
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

  // API Key Management Effect
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
      } else {
        // If not in AI Studio environment, assume API key is handled via other means (e.g. build process env)
        // or that the environment variable VITE_API_KEY is available.
        // For local development, VITE_API_KEY might be used.
        setHasApiKey(!!import.meta.env.VITE_API_KEY); 
      }
    };
    checkApiKey();
  }, [isApiKeySelectionOpen]); // Re-check if modal was opened/closed


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
        contextState: { 
            methodology: DEFAULT_METHODOLOGY, 
            businessGoal: BusinessGoal.FINANCING_BRDE, 
            rawContext: '', 
            uploadedFiles: [], 
            assets: [],
            strategicMatrix: DEFAULT_STRATEGIC_MATRIX,
            webSources: [],
        },
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

  const getFullContext = useCallback((options: { includeCompleted?: boolean, maxLength?: number, project?: Project } = {}) => {
    const { includeCompleted = true, maxLength = 100000, project } = options; 
    const targetProject = project || activeProject; // Use passed project or fallback to activeProject state

    if (!targetProject) return "";
    const { contextState } = targetProject.currentData;
    
    const userUploadedFiles = contextState.uploadedFiles.filter(f => !f.isGenerated && f.type === 'text' && f.content && !f.isRestored);
    const completedSectionsContent = includeCompleted 
        ? contextState.uploadedFiles.filter(f => f.isGenerated && f.type === 'text' && f.content)
        : [];

    const webSourcesContent = Array.isArray(contextState.webSources) && contextState.webSources.length > 0
        ? `\n\n--- FONTES DA WEB ENCONTRADAS PELA IA ---\n${contextState.webSources.map(s => `FONTE: ${s.title}\nURL: ${s.url}`).join('\n')}`
        : "";

    const truthSourceContext = completedSectionsContent.length > 0
        ? `\n\n--- FONTES DA VERDADE (SEÇÕES CONCLUÍDAS E APROVADAS PELO USUÁRIO) ---\n${completedSectionsContent.map(f => `CONTEÚDO DE: ${f.name.replace('[CONCLUÍDO] ', '').replace('[APROVADO] ', '')}\n${f.content}`).join('\n\n')}`
        : "";

    let fullContextString = `OBJETIVO: ${contextState.businessGoal}\nMETODOLOGIA: ${contextState.methodology}\nANOTAÇÕES: ${contextState.rawContext}\nARQUIVOS DO USUÁRIO: ${userUploadedFiles.map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n')}${webSourcesContent}${truthSourceContext}`;
  
    // Truncate context if it exceeds maxLength
    if (maxLength && fullContextString.length > maxLength) {
        const truncationMessage = "\n\n... (contexto truncado por tamanho excessivo)";
        return fullContextString.substring(0, maxLength - truncationMessage.length) + truncationMessage;
    }

    return fullContextString;
  }, [activeProject]);
  
 const handleRunDiagnosis = useCallback(async () => {
    if (!activeProject) return;

    if (!hasApiKey && window.aistudio) {
      setIsApiKeySelectionOpen(true);
      return;
    }

    setIsDiagnosisRunning(true);
    setCurrentDiagnosisStep(0);
    setDiagnosisProgress(0);
    setDiagnosisLogs([]);

    const initialContext = getFullContext({ includeCompleted: false, maxLength: 100000 });
    const isContextEmpty = !initialContext.replace(/OBJETIVO:.*/, '').replace(/METODOLOGIA:.*/, '').trim();

    if (isContextEmpty) {
        setDiagnosisLogs(["Contexto inicial vazio. O diagnóstico será baseado apenas na estrutura padrão."]);
        const emptyDiagnosis: DiagnosisResponse = {
            timestamp: Date.now(),
            projectSummary: "Nenhum conteúdo fornecido para análise.",
            overallReadiness: 0,
            gaps: DIAGNOSIS_STEPS.map((step, i) => ({
                id: `gap_empty_${i}`,
                description: `Nenhuma informação encontrada para a Etapa ${i+1}: ${step.name}.`,
                status: 'OPEN',
                resolutionScore: 0,
                aiFeedback: "Envie arquivos ou adicione anotações para permitir a análise.",
                severityLevel: 'A',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })),
            strategicPaths: [],
            suggestedSections: [],
        };
        setProjectData(activeProject.id, {
            contextState: { ...activeProject.currentData.contextState, strategicMatrix: DEFAULT_STRATEGIC_MATRIX },
            diagnosisHistory: [...activeProject.currentData.diagnosisHistory, emptyDiagnosis],
        });
        setIsDiagnosisRunning(false);
        return;
    }

    let currentMatrix = produce(DEFAULT_STRATEGIC_MATRIX, draft => {
        draft.generatedAt = Date.now();
    });

    for (let i = 0; i < DIAGNOSIS_STEPS.length; i++) {
        setCurrentDiagnosisStep(i);
        setDiagnosisProgress((i / DIAGNOSIS_STEPS.length) * 100);

        // Retrieve fresh state from ref to avoid stale closure issues during long async loop
        const freshActiveProject = projectsRef.current.find(p => p.id === activeProjectId);
        if (!freshActiveProject) {
            console.error("Project state lost during diagnosis");
            break;
        }
        
        try {
            // Pass fresh project to getFullContext to ensure AI sees latest updates
            const stepResult = await runDiagnosisStep(i, getFullContext({ maxLength: 100000, project: freshActiveProject }), currentMatrix);
            
            if (Array.isArray(stepResult.logs)) {
                const sanitizedLogs = stepResult.logs.map(log => 
                    typeof log === 'string' ? log : `[LOG INVÁLIDO]: ${JSON.stringify(log)}`
                );
                setDiagnosisLogs(prev => [...prev, ...sanitizedLogs]);
            }
            
            if (stepResult.matrixUpdate) {
                currentMatrix = produce(currentMatrix, draft => {
                    for (const key in stepResult.matrixUpdate) {
                        const typedKey = key as keyof StrategicMatrix;
                        const updateValue = (stepResult.matrixUpdate as any)[typedKey];

                        if (!updateValue) continue;

                        if (typedKey === 'swot' && typeof updateValue === 'object') {
                            draft.swot = { ...draft.swot, ...updateValue };
                        } else if (typedKey !== 'generatedAt') {
                            const draftBlock = (draft as any)[typedKey];
                            if (draftBlock && typeof draftBlock === 'object' && typeof updateValue === 'object') {
                                (draft as any)[typedKey] = { ...draftBlock, ...updateValue };
                            } else {
                                (draft as any)[typedKey] = updateValue;
                            }
                        }
                    }
                });
                // Save using fresh project state
                setProjectData(freshActiveProject.id, { 
                    contextState: { ...freshActiveProject.currentData.contextState, strategicMatrix: currentMatrix }
                });
            }
            
            
            if (i === DIAGNOSIS_STEPS.length - 1 && stepResult.finalDiagnosis && typeof stepResult.finalDiagnosis === 'object') {
                const timestamp = Date.now();
                const gapsFromApi = stepResult.finalDiagnosis?.gaps;
                let finalGaps: AnalysisGap[] = [];
                
                if (Array.isArray(gapsFromApi)) {
                    finalGaps = gapsFromApi
                    .filter((g): g is Omit<AnalysisGap, 'createdAt' | 'updatedAt' | 'resolvedAt' | 'status' | 'resolutionScore'> => !!g && typeof g === 'object')
                    .map((g) => ({
                        ...g,
                        id: g.id || `gap_${timestamp}_${Math.random()}`,
                        status: 'OPEN',
                        resolutionScore: 0,
                        aiFeedback: "Nenhum feedback inicial.", // Default value
                        severityLevel: g.severityLevel || 'C', // Default to 'C'
                        createdAt: timestamp,
                        updatedAt: timestamp,
                    }));
                }

                const finalDiagnosis: DiagnosisResponse = {
                    timestamp,
                    projectSummary: "Diagnóstico completo de 10 etapas concluído.",
                    overallReadiness: stepResult.finalDiagnosis.overallReadiness || 0,
                    gaps: finalGaps,
                    strategicPaths: [],
                    suggestedSections: []
                };
                // Save history to fresh project state
                setProjectData(freshActiveProject.id, { 
                    diagnosisHistory: [...freshActiveProject.currentData.diagnosisHistory, finalDiagnosis] 
                });
            }
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : String(error);
            setDiagnosisLogs(prev => [...prev, `[ERRO NA ETAPA ${i + 1}]: ${errorMessage}`]);
            alert(`Erro crítico na etapa de diagnóstico ${i + 1}. Verifique o console para detalhes.`);
            setIsDiagnosisRunning(false);
            return; // Stop diagnosis on critical error
        }

        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    setDiagnosisProgress(100);
    setIsDiagnosisRunning(false);

  }, [activeProject, activeProjectId, getFullContext, setProjectData, hasApiKey, setIsApiKeySelectionOpen]);

    const handleValidateProject = async () => {
        if (!activeProject) return;

        if (!hasApiKey && window.aistudio) {
            setIsApiKeySelectionOpen(true);
            return;
        }

        const sectionsToValidate = activeProject.currentData.sections
            .filter(s => s.status === SectionStatus.COMPLETED)
            .map(s => ({ id: s.id, title: s.title, content: s.content }));

        if (sectionsToValidate.length === 0) {
            alert("Nenhuma seção marcada como 'Concluída' para ser validada. Seções já aprovadas não são revalidadas.");
            return;
        }

        setIsValidationLoading(true);
        try {
            const { contextState } = activeProject.currentData;
            const validationResults = await validateCompletedSections(
                sectionsToValidate,
                contextState.strategicMatrix!,
                contextState.methodology,
                contextState.businessGoal
            );
            
            let allValid = true;
            validationResults.forEach(result => {
                if (!result.isValid) {
                    allValid = false;
                    updateSection(result.sectionId, {
                        status: SectionStatus.REVIEW_ALERT,
                        validationFeedback: result.feedback
                    });
                } else {
                    updateSection(result.sectionId, {
                        validationFeedback: "Auditoria da IA concluída. O conteúdo está alinhado com as métricas e a Matriz Estratégica."
                    });
                }
            });

            if (allValid) {
                alert("Validação concluída! Todas as seções estão alinhadas. Agora você pode 'Aprovar' cada uma para finalizá-las.");
            } else {
                alert("Validação encontrou problemas. Verifique as seções marcadas com um alerta de revisão.");
            }

        } catch (e) {
            console.error("Validation failed:", e);
            alert("Ocorreu um erro durante a validação. Verifique o console.");
        } finally {
            setIsValidationLoading(false);
        }
    };

  const handleGenerateSection = async (section: PlanSection) => {
      if (!activeProject) return;

      if (!hasApiKey && window.aistudio) {
        setIsApiKeySelectionOpen(true);
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

  const handleFixSection = async (section: PlanSection) => {
    if (!activeProject || !section.validationFeedback) return;

    if (!hasApiKey && window.aistudio) {
        setIsApiKeySelectionOpen(true);
        return;
    }

    setIsGenerating(true);
    updateSection(section.id, { status: SectionStatus.GENERATING });
    try {
      const context = getFullContext({ maxLength: 100000 });
      const { businessGoal, methodology, strategicMatrix } = activeProject.currentData.contextState;
      
      const { newContent, sources } = await fixSectionContentWithSearch(
        section.title,
        section.validationFeedback,
        section.content,
        methodology,
        context,
        businessGoal,
        strategicMatrix
      );

      updateSection(section.id, { 
        content: newContent, 
        status: SectionStatus.DRAFT, 
        validationFeedback: ''
      });
      setEditedContent(newContent);
      
      const newWebSources: WebSource[] = sources.map(source => ({
        ...source,
        fetchedAt: Date.now(),
        sourceSectionId: section.id,
      }));

      const currentSources = activeProject.currentData.contextState.webSources || [];
      const filteredOldSources = currentSources.filter(s => s.sourceSectionId !== section.id);

      setProjectData(activeProject.id, {
          contextState: {
              ...activeProject.currentData.contextState,
              webSources: [...filteredOldSources, ...newWebSources],
          }
      });

    } catch (e) {
      console.error(e);
      updateSection(section.id, { status: SectionStatus.REVIEW_ALERT });
      alert(`Erro ao tentar corrigir a seção "${section.title}" com a IA.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineSection = async (section: PlanSection) => {
    if (!activeProject || !refinementInput.trim()) return;

    if (!hasApiKey && window.aistudio) {
        setIsApiKeySelectionOpen(true);
        return;
    }

    setIsGenerating(true);
    updateSection(section.id, { status: SectionStatus.GENERATING, validationFeedback: '' });
    try {
      const context = getFullContext({ maxLength: 100000 });
      const goal = activeProject.currentData.contextState.businessGoal;
      const matrix = activeProject.currentData.contextState.strategicMatrix;
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

    if (!hasApiKey && window.aistudio) {
        setIsApiKeySelectionOpen(true);
        return;
    }

    const matrix = activeProject.currentData.contextState.strategicMatrix;
    if (!matrix || matrix.generatedAt === 0) {
      alert("Por favor, execute o Diagnóstico Global primeiro para gerar a Matriz Estratégica, que é necessária para as projeções financeiras.");
      return;
    }

    setIsGenerating(true);
    updateSection(section.id, { status: SectionStatus.GENERATING, validationFeedback: '' });
    try {
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

  const handleGenerateImageForSection = async (section: PlanSection) => {
    if (!activeProject) return;

    if (!hasApiKey && window.aistudio) {
        setIsApiKeySelectionOpen(true);
        return;
    }

    const confirmation = confirm(`Deseja gerar uma imagem ilustrativa para a seção "${section.title}"? Isso consumirá recursos da IA.`);
    if (!confirmation) return;
    
    setIsGeneratingImage(true);
    try {
        const imagePrompt = `Crie uma imagem profissional e conceitual para uma seção de um plano de negócios sobre "${section.title}". O conceito é: ${section.description}. O estilo deve ser fotorealista, corporativo, com iluminação cinematográfica e tons de azul e laranja, representando inovação e seriedade.`;
        
        const base64Data = await generateProjectImage(imagePrompt);
        
        const newAsset: ProjectAsset = {
            id: `asset_${Date.now()}`,
            type: 'photo',
            data: base64Data,
            description: `Imagem para: ${section.title}`
        };

        const newContextState = produce(activeProject.currentData.contextState, draft => {
            if (!draft.assets) draft.assets = [];
            draft.assets.push(newAsset);
        });

        setProjectData(activeProject.id, { contextState: newContextState });
        
        alert(`Imagem para "${section.title}" gerada com sucesso e adicionada aos Ativos do Projeto na barra lateral direita! Para inseri-la no texto, use o ID do asset: ![Descrição](asset://${newAsset.id})`);

    } catch (error) {
        console.error("Image generation failed:", error);
        alert("Falha ao gerar a imagem. Verifique o console para mais detalhes. Certifique-se de que sua API Key está configurada e suporta geração de imagens.");
    } finally {
        setIsGeneratingImage(false);
    }
  };


  const handleSaveEdit = () => {
    if (!activeSection) return;
    updateSection(activeSection.id, { content: editedContent, status: SectionStatus.DRAFT, validationFeedback: '' });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (!activeSection) return;
    setEditedContent(activeSection.content);
    setIsEditing(false);
  };

    const handleMarkAsCompleted = (sectionId: string) => {
        if (!activeProject) return;
        updateSection(sectionId, { status: SectionStatus.COMPLETED, validationFeedback: '' });
    };

    const handleApproveSection = useCallback(async (sectionId: string) => {
        if (!activeProject) return;

        if (!hasApiKey && window.aistudio) {
            setIsApiKeySelectionOpen(true);
            return;
        }

        const sections = activeProject.currentData.sections;
        const currentIndex = sections.findIndex(s => s.id === sectionId);
        if (currentIndex === -1) return;

        const approvedSection = sections[currentIndex];
        const nextSectionToGenerate = sections.find((s, index) => 
            index > currentIndex && !s.isLocked && s.status === SectionStatus.PENDING
        );

        const approvedFile: UploadedFile = {
            name: `[APROVADO] ${approvedSection.title}.txt`,
            content: approvedSection.content,
            type: 'text',
            isGenerated: true,
            sourceSectionId: sectionId,
        };
        const newUploadedFiles = [
            ...activeProject.currentData.contextState.uploadedFiles.filter(f => f.sourceSectionId !== sectionId),
            approvedFile
        ];

        const newSections = sections.map(s => {
            if (s.id === sectionId) return { ...s, status: SectionStatus.APPROVED };
            if (nextSectionToGenerate && s.id === nextSectionToGenerate.id) {
                return { ...s, status: SectionStatus.GENERATING, validationFeedback: '' };
            }
            return s;
        });

        const newContextState = {
          ...activeProject.currentData.contextState,
          uploadedFiles: newUploadedFiles
        };

        setProjectData(activeProject.id, { sections: newSections, contextState: newContextState });
        
        if (nextSectionToGenerate) {
            setActiveSectionId(nextSectionToGenerate.id);
            setIsGenerating(true);
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                // This context generation must reflect the *new* state, including the freshly approved section.
                const tempContextState = {
                    ...activeProject.currentData.contextState,
                    uploadedFiles: newUploadedFiles,
                };
                const userUploadedFiles = tempContextState.uploadedFiles.filter(f => !f.isGenerated && f.type === 'text' && f.content && !f.isRestored);
                const truthSourceContent = tempContextState.uploadedFiles.filter(f => f.isGenerated && f.type === 'text' && f.content);
                const webSourcesContent = Array.isArray(tempContextState.webSources) && tempContextState.webSources.length > 0
                    ? `\n\n--- FONTES DA VERDADE (FONTES DA WEB ENCONTRADAS PELA IA) ---\n${tempContextState.webSources.map(s => `FONTE: ${s.title}\nURL: ${s.url}`).join('\n')}`
                    : "";
                const truthSourceContext = truthSourceContent.length > 0
                    ? `\n\n--- FONTES DA VERDADE (SEÇÕES CONCLUÍDAS E APROVADAS PELO USUÁRIO) ---\n${truthSourceContent.map(f => `CONTEÚDO DE: ${f.name.replace('[CONCLUÍDO] ', '').replace('[APROVADO] ', '')}\n${f.content}`).join('\n\n')}`
                    : "";
                const freshContext = `OBJETIVO: ${tempContextState.businessGoal}\nMETODOLOGIA: ${tempContextState.methodology}\nANOTAÇÕES: ${tempContextState.rawContext}\nARQUIVOS DO USUÁRIO: ${userUploadedFiles.map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n')}${webSourcesContent}${truthSourceContext}`;

                const newContent = await generateSectionContent(
                    nextSectionToGenerate.title, 
                    nextSectionToGenerate.description, 
                    tempContextState.methodology, 
                    freshContext, 
                    tempContextState.businessGoal, 
                    '', '', '', '', '', '',
                    tempContextState.strategicMatrix
                );
                
                updateSection(nextSectionToGenerate.id, { content: newContent, status: SectionStatus.DRAFT });
                setEditedContent(newContent);

            } catch (e) {
                console.error("Auto-generation failed:", e);
                updateSection(nextSectionToGenerate.id, { status: SectionStatus.PENDING });
                alert(`Erro ao gerar automaticamente o conteúdo para ${nextSectionToGenerate.title}`);
            } finally {
                setIsGenerating(false);
            }
        }
    }, [activeProject, setProjectData, updateSection, hasApiKey, setIsApiKeySelectionOpen]);

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
  
  if (currentView === 'preview') return <LiveDocumentPreview projectName={activeProject.name} sections={activeProject.currentData.sections} assets={activeProject.currentData.contextState.assets} onClose={() => setCurrentView('editor')} />;

  const lastDiagnosis = Array.isArray(activeProject.currentData.diagnosisHistory)
    ? activeProject.currentData.diagnosisHistory.slice(-1)[0]
    : undefined;
  
  const gaps = useMemo<AnalysisGap[]>(() => {
    if (lastDiagnosis && typeof lastDiagnosis === 'object' && lastDiagnosis !== null) {
      const potentialGaps = (lastDiagnosis as DiagnosisResponse).gaps;
      if (Array.isArray(potentialGaps)) {
        return potentialGaps.filter((g): g is AnalysisGap => !!g && typeof g === 'object');
      }
    }
    return [];
  }, [lastDiagnosis]);
  
  const openGaps: AnalysisGap[] = gaps.filter(g => g.status === 'OPEN');
  

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
    img: ({node, ...props}: any) => {
        // Resolve asset:// syntax in editor as well
        let src = props.src || '';
        if (src.startsWith('asset://')) {
            const assetId = src.replace('asset://', '');
            const asset = activeProject.currentData.contextState.assets.find(a => a.id === assetId);
            if (asset) {
                // Determine mime type (fallback to jpeg if unknown, usually safe for photos)
                const mimeType = asset.type === 'photo' ? 'image/jpeg' : 'image/png';
                src = `data:${mimeType};base64,${asset.data}`;
            }
        }
        return <img {...props} src={src} className="max-w-full h-auto my-4 rounded-lg shadow-sm mx-auto" />;
    }
  };

    let mainActionButton;
    if (activeSection) {
        const isActionDisabled = isGenerating || isEditing || activeSection.status === SectionStatus.APPROVED;
        if (activeSection.type === SectionType.FINANCIAL) {
             mainActionButton = (
                <button onClick={() => handleGenerateFinancials(activeSection)} disabled={isActionDisabled || isGenerating} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 shadow-sm hover:shadow-md">
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    {activeSection.content ? 'Regerar Análise Financeira' : 'Gerar Análise Financeira'}
                </button>
            );
        } else if (activeSection.status === SectionStatus.REVIEW_ALERT) {
            mainActionButton = (
                <button onClick={() => handleFixSection(activeSection)} disabled={isActionDisabled} className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:bg-slate-300 shadow-sm hover:shadow-md">
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Corrigir com IA + Web
                </button>
            );
        } else {
            mainActionButton = (
                <button onClick={() => handleGenerateSection(activeSection)} disabled={isActionDisabled} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 shadow-sm hover:shadow-md">
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    {activeSection.content ? 'Regerar com IA' : 'Gerar com IA'}
                </button>
            );
        }
    }
  
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        {isMatrixModalOpen && (
            <div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" 
              onClick={() => setIsMatrixModalOpen(false)}
            >
                <div 
                  className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] p-6 flex flex-col" 
                  onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TableProperties className="w-6 h-6 text-blue-600" />
                            Matriz Estratégica Detalhada
                        </h2>
                        <button onClick={() => setIsMatrixModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-800">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <StrategicMatrixViewer matrix={activeProject.currentData.contextState.strategicMatrix!} isModalView={true} />
                    </div>
                </div>
            </div>
        )}

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

        {isApiKeySelectionOpen && (
            <SelectApiKeyModal 
                onClose={() => setIsApiKeySelectionOpen(false)} 
                onApiKeySelected={() => { 
                    setHasApiKey(true); 
                    setIsApiKeySelectionOpen(false); 
                }}
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
            {!hasApiKey && window.aistudio && (
                <button 
                    onClick={() => setIsApiKeySelectionOpen(true)}
                    className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                    title="API Key ausente. Clique para selecionar."
                >
                    <Key className="w-4 h-4" /> Configurar API Key
                </button>
            )}
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
        {/* Left Sidebar */}
        <aside className={`relative flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${isLeftSidebarOpen ? 'w-1/4 max-w-sm' : 'w-0'}`}>
            <div className={`w-[25vw] max-w-sm h-full overflow-y-auto transition-opacity duration-100 ${isLeftSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
            </div>
            <button
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                className="absolute top-1/2 -right-3 -translate-y-1/2 z-30 bg-white p-1 rounded-full shadow-md border border-slate-300 hover:bg-slate-100"
                title={isLeftSidebarOpen ? "Recolher" : "Expandir"}
            >
                {isLeftSidebarOpen ? <ChevronsLeft className="w-4 h-4 text-slate-600" /> : <ChevronsRight className="w-4 h-4 text-slate-600" />}
            </button>
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

                    {activeSection.status === SectionStatus.COMPLETED && !activeSection.validationFeedback && (
                        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                            <div className="flex items-start">
                                <Info className="w-5 h-5 mr-3 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Próximo Passo</h4>
                                    <p className="text-sm mt-1">Esta seção está pronta para auditoria. Use o botão <strong>Validar Seções Concluídas</strong> na barra lateral direita para que a IA verifique a consistência e o alinhamento com as métricas do projeto.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection.validationFeedback && activeSection.status === SectionStatus.REVIEW_ALERT && (
                        <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-800 rounded-r-lg">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 mr-3 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Alerta de Revisão da IA</h4>
                                    <p className="text-sm mt-1">
                                        {typeof activeSection.validationFeedback === 'string'
                                            ? activeSection.validationFeedback
                                            : JSON.stringify(activeSection.validationFeedback)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection.validationFeedback && (activeSection.status === SectionStatus.COMPLETED || activeSection.status === SectionStatus.APPROVED) && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-r-lg">
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 mr-3 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Validado pela IA</h4>
                                    <p className="text-sm mt-1">
                                        {typeof activeSection.validationFeedback === 'string'
                                            ? activeSection.validationFeedback
                                            : JSON.stringify(activeSection.validationFeedback)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection.type === SectionType.FINANCIAL ? (
                        <div>
                             {mainActionButton}
                            {activeSection.content && (
                                <div className="mt-6 bg-white p-6 rounded-lg border border-slate-200 prose max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{typeof activeSection.content === 'string' ? activeSection.content : JSON.stringify(activeSection.content)}</ReactMarkdown>
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
                                                {typeof activeSection.content === 'string' ? activeSection.content : JSON.stringify(activeSection.content)}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                <p>Conteúdo vazio. Gere com a IA ou clique em editar.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleGenerateImageForSection(activeSection)} 
                                            disabled={isGenerating || isGeneratingImage || isEditing || activeSection.status === SectionStatus.APPROVED}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
                                            title="Gerar uma imagem de capa conceitual para esta seção"
                                        >
                                            {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                            Gerar Imagem
                                        </button>
                                        <button onClick={() => setIsEditing(true)} disabled={activeSection.status === SectionStatus.APPROVED} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50">
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
                                    disabled={!activeSection.content || isGenerating || isEditing || activeSection.status === SectionStatus.APPROVED}
                                />
                                <button onClick={() => handleRefineSection(activeSection)} disabled={!activeSection.content || !refinementInput.trim() || isGenerating || isEditing || activeSection.status === SectionStatus.APPROVED} className="px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:bg-slate-300 flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" />
                                    Refinar
                                </button>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                               {mainActionButton}
                               {activeSection.status === SectionStatus.DRAFT && (
                                <button 
                                  onClick={() => handleMarkAsCompleted(activeSection.id)} 
                                  disabled={!activeSection.content}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-green-100 text-green-800 hover:bg-green-200 disabled:bg-green-50 disabled:text-green-500 disabled:cursor-not-allowed"
                                >
                                    <Check className="w-4 h-4" /> 
                                    Finalizar para Validação
                                </button>
                               )}
                               {activeSection.status === SectionStatus.COMPLETED && activeSection.validationFeedback && !activeSection.validationFeedback.includes("erro") && (
                                <button
                                  onClick={() => handleApproveSection(activeSection.id)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                  <Award className="w-4 h-4" />
                                  Aprovar Seção
                                </button>
                               )}
                               {activeSection.status === SectionStatus.APPROVED && (
                                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-indigo-50 text-indigo-700">
                                      <Award className="w-4 h-4" />
                                      Aprovado e Finalizado
                                  </div>
                               )}
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

        {/* Right Sidebar */}
        <aside className={`relative flex-shrink-0 bg-white border-l border-slate-200 transition-all duration-300 ease-in-out ${isRightSidebarOpen ? 'w-1/3 max-w-md' : 'w-0'}`}>
            <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="absolute top-1/2 -left-3 -translate-y-1/2 z-30 bg-white p-1 rounded-full shadow-md border border-slate-300 hover:bg-slate-100"
                title={isRightSidebarOpen ? "Recolher" : "Expandir"}
            >
                {isRightSidebarOpen ? <ChevronsRight className="w-4 h-4 text-slate-600" /> : <ChevronsLeft className="w-4 h-4 text-slate-600" />}
            </button>
            <div className={`w-[33.33vw] max-w-md h-full overflow-y-auto p-6 space-y-6 transition-opacity duration-100 ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <button onClick={handleRunDiagnosis} disabled={isDiagnosisRunning} className="w-full relative flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:bg-slate-400 overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-green-500/50 transition-all duration-500" style={{ width: `${diagnosisProgress}%` }}></div>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isDiagnosisRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Stethoscope className="w-5 h-5" />}
                            {isDiagnosisRunning 
                                ? `Etapa ${currentDiagnosisStep + 1}/${DIAGNOSIS_STEPS.length}: ${DIAGNOSIS_STEPS[currentDiagnosisStep].name}`
                                : (lastDiagnosis ? 'Atualizar Diagnóstico' : 'Rodar Diagnóstico Global')}
                        </span>
                    </button>
                    {isDiagnosisRunning && Array.isArray(diagnosisLogs) && diagnosisLogs.length > 0 && (
                        <div className="mt-3 p-3 bg-slate-900 rounded-md max-h-32 overflow-y-auto">
                            <div className="flex items-center gap-2 text-xs font-semibold text-green-400 mb-2">
                                <FileCode className="w-4 h-4" />
                                Console de Análise
                            </div>
                            {diagnosisLogs.map((log, index) => (
                                <p key={index} className="text-xs text-slate-300 font-mono animate-in fade-in duration-500">
                                    <span className="text-green-500 mr-2">&gt;</span>{typeof log === 'string' ? log : JSON.stringify(log)}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <button onClick={handleValidateProject} disabled={isValidationLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-400">
                        {isValidationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        Validar Seções Concluídas
                    </button>
                </div>
                
                {lastDiagnosis && !isDiagnosisRunning && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-blue-600"/> Último Diagnóstico</h3>
                    <div className="mt-4 p-3 bg-blue-100/50 rounded-lg text-center">
                        <p className="text-sm text-blue-800 font-semibold">Nível de Prontidão</p>
                        <p className="text-3xl font-bold text-blue-700">{lastDiagnosis.overallReadiness || 0}%</p>
                    </div>
                    {openGaps.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Pendências Críticas ({openGaps.length})</h4>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                            {openGaps.map(gap => (
                            <div key={gap.id} className="text-xs bg-white p-2 border-l-4 border-orange-400 rounded">
                                <span className={`font-bold mr-1 ${gap.severityLevel === 'A' ? 'text-red-600' : 'text-yellow-600'}`}>[{gap.severityLevel}]</span>
                                {typeof gap.description === 'string' ? gap.description : JSON.stringify(gap.description)}
                            </div>
                            ))}
                        </div>
                    </div>
                    )}
                </div>
                )}
                
                <StrategicMatrixViewer 
                    matrix={activeProject.currentData.contextState.strategicMatrix!} 
                    onExpand={() => setIsMatrixModalOpen(true)}
                />

                <ContextManager 
                    state={activeProject.currentData.contextState} 
                    onUpdate={(updates) => {
                        setProjectData(activeProject.id, { contextState: { ...activeProject.currentData.contextState, ...updates } });
                    }}
                />
            </div>
        </aside>
      </main>
    </div>
  );
};
export default App;