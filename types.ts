
export enum SectionStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING', // AI is checking if info is missing
  WAITING_USER = 'WAITING_USER', // User needs to answer questions
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
}

export enum SectionType {
  TEXT = 'TEXT',
  FINANCIAL = 'FINANCIAL',
}

export enum BusinessGoal {
  GENERAL = 'GENERAL',
  INVESTORS = 'INVESTORS',
  FINANCING_BRDE = 'FINANCING_BRDE', // Specific mode for BRDE FSA
}

export interface PlanSection {
  id: string;
  chapter: string; // E.g., "1. SUMÁRIO EXECUTIVO"
  title: string;   // E.g., "1.1 Apresentação da SCine"
  description: string; // Detailed instructions (the sub-sub-items)
  content: string;
  status: SectionStatus;
  type: SectionType;
  financialData?: FinancialYear[];
  questions?: string[]; 
  userAnswers?: string;
  isLocked?: boolean; // If true, user cannot access until dependencies met
  isAiGenerated?: boolean; // Flag to indicate if this section was dynamically created by AI
  lastRefinement?: string; // Store the last user instruction for refinement
}

export interface FinancialYear {
  year: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// --- VALUE MATRIX TYPES (STEP 0) ---
export interface ValueSource {
  arquivo: string;
  localizacao: string;
  valor_original: number | string;
}

export interface ValueEntry {
  id: string;
  categoria: string;
  subcategoria?: string;
  nome: string;
  valor: number | string;
  moeda?: string;
  unidade?: string;
  periodo_referencia?: string;
  fontes_usadas: ValueSource[];
  criterio_escolha: string;
  status_resolucao: 'consolidado' | 'conflito_nao_resolvido';
}

export interface ValueMatrix {
  entries: ValueEntry[];
  generatedAt: number;
}
// -----------------------------------

export interface AppContextState {
  methodology: string;
  businessGoal: BusinessGoal;
  rawContext: string;
  uploadedFiles: UploadedFile[];
  assets: ProjectAsset[];
  lastModified?: number;
  valueMatrix?: ValueMatrix; // Store the Step 0 Matrix
}

export interface UploadedFile {
  name: string;
  content: string;
  type: 'text' | 'image';
  isRestored?: boolean; // Flag to indicate file needs re-upload after refresh
}

export interface ProjectAsset {
  id: string;
  type: 'logo' | 'map' | 'floorplan' | 'photo' | 'other';
  data: string; // Base64
  description: string;
}

export interface Question {
  id: string;
  text: string;
  answered: boolean;
}

export interface StrategicPath {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface DiagnosisResponse {
  projectSummary: string; // What AI understood
  strategicPaths: StrategicPath[]; // Options for the user
  missingCriticalInfo: string[]; // What is missing for the bank
  suggestedSections: {
    chapter: string;
    title: string;
    description: string;
  }[];
}

// --- NEW SAAS TYPES ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ProjectVersion {
  id: string;
  versionNumber: number; // 1, 2, 3...
  createdAt: number;
  summary: string; // "Adjusted financial projections"
  data: {
    sections: PlanSection[];
    contextState: AppContextState;
    diagnosis: DiagnosisResponse | null;
    consolidatedMarkdown?: string; // Snapshot of the full doc
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  currentData: {
    sections: PlanSection[];
    contextState: AppContextState;
    diagnosis: DiagnosisResponse | null;
  };
  versions: ProjectVersion[];
}

// Add global definition for window.pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any;
  }
}
