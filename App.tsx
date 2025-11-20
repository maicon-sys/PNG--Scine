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

const STORAGE_KEY_PROJECTS = 'scine_saas_projects';
const STORAGE_KEY_USER = 'scine_saas_user';

type ViewState = 'auth' | 'dashboard' | 'editor' | 'preview';

const App: React.FC = () => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isDiagnosisLoading, setIsDiagnosisLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

  const setProjectData = useCallback((projectId: string, data: Partial<Project['currentData']>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, currentData: { ...p.currentData, ...data }, updatedAt: Date.now() } : p));
  }, []);
  
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
    setCurrentView('auth');
  }, []);

  const handleCreateProject = useCallback((name: string) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentData: {
        sections: INITIAL_SECTIONS,
        contextState: { methodology: DEFAULT_METHODOLOGY, businessGoal: BusinessGoal.FINANCING_BRDE, rawContext: '', uploadedFiles: [], assets: [] },
        diagnosisHistory: [],
      },
      versions: [],
    };
    setProjects(prev => [...prev, newProject]);
  }, []);

  const handleOpenProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setCurrentView('editor');
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const getFullContext = useCallback(() => {
    if (!activeProject) return "";
    const { contextState } = activeProject.currentData;
    return `OBJETIVO: ${contextState.businessGoal}\nMETODOLOGIA: ${contextState.methodology}\nANOTAÇÕES: ${contextState.rawContext}\nARQUIVOS: ${contextState.uploadedFiles.filter(f => f.type === 'text' && f.content && !f.isRestored).map(f => `FILE: ${f.name}\n${f.content}`).join('\n\n')}`;
  }, [activeProject]);
  
  const handleRunDiagnosis = useCallback(async () => {
    if (!activeProject) return;
    setIsDiagnosisLoading(true);
    try {
        const fullContext = getFullContext();
        
        // CRITICAL FIX: Run Step 0 (Value Matrix) BEFORE Step 2 (Diagnosis)
        const matrixResult = await generateValueMatrix(fullContext);
        setProjectData(activeProject.id, { contextState: { ...activeProject.currentData.contextState, valueMatrix: matrixResult }});

        // Now run diagnosis passing the new matrix and the history
        const diagResult = await generateGlobalDiagnosis(
            fullContext, 
            matrixResult, 
            activeProject.currentData.diagnosisHistory
        );

        setProjectData(activeProject.id, { diagnosisHistory: [...activeProject.currentData.diagnosisHistory, diagResult] });

    } catch (e) {
        alert("Erro no diagnóstico. A resposta da IA pode ser inválida. Verifique o console.");
        console.error(e);
    } finally {
      setIsDiagnosisLoading(false);
    }
  }, [activeProject, getFullContext, setProjectData]);

  // --- RENDER ---
  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;
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

  // Fallback rendering while main component is being built
  return (
    <div>
      <h1>Editor for {activeProject.name}</h1>
      <button onClick={() => setCurrentView('dashboard')}>Back</button>
      <button onClick={() => handleRunDiagnosis()} disabled={isDiagnosisLoading}>
        {isDiagnosisLoading ? "Analisando..." : "Rodar Diagnóstico"}
      </button>
      <div>
        <h2>Histórico de Diagnóstico</h2>
        {(activeProject.currentData.diagnosisHistory[activeProject.currentData.diagnosisHistory.length - 1]?.gaps ?? []).map(gap => (
            <div key={gap.id}>{gap.description} - {gap.status}</div>
        ))}
      </div>
    </div>
  );
};
export default App;
