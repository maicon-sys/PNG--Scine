


export enum SectionStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING', // AI is checking if info is missing
  WAITING_USER = 'WAITING_USER', // User needs to answer questions
  GENERATING = 'GENERATING',
  DRAFT = 'DRAFT', // Content generated, user review needed
  COMPLETED = 'COMPLETED',
  REVIEW_ALERT = 'REVIEW_ALERT', // Validation failed, user needs to review
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
  validationFeedback?: string; // Feedback from the validation audit
}

export interface FinancialYear {
  year: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// --- VALUE MATRIX TYPES (STEP 0) - REFACTORED ---

export interface ValueSource {
  arquivo: string;
  localizacao: string; // "p. 37, quadro 6.3"
  valorOriginal: number | string; // Valor cru encontrado no arquivo
}

export interface ValueEntry {
  id: string;
  categoria: string; // "receita", "custo_operacional", "investimento_capex", "assinantes", etc.
  subcategoria?: string; // "OTT", "HUB", "B2C"
  nome: string; // "Investimento total do projeto em 24 meses"
  valor: number; // Valor numérico oficial para cálculos
  moeda?: string; // "BRL", "USD", "%", "unidades"
  unidade?: string; // "24_meses", "mensal", "total"
  periodoReferencia?: string; // "M1-M24", "Ano 1"
  
  // Auditoria e Rastreabilidade
  fontesUsadas: ValueSource[];
  criterioEscolha: string; // "prioridade_documento_revisao", "coerencia_interna", etc.
  statusResolucao: 'consolidado' | 'conflito_nao_resolvido';
  
  valorOficial?: boolean; // Se true, este é o número final a ser usado no plano
}

export interface ValueMatrix {
  entries: ValueEntry[];
  generatedAt: number;
  summary?: string; // Resumo da consolidação
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
  sourceSectionId?: string; // ID of the PlanSection that generated this file
  isGenerated?: boolean; // True if generated from a completed section
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

// --- DIAGNOSIS HISTORY TYPES (REFACTORED) ---
export type GapSeverity = 'A' | 'B' | 'C'; 
/**
 * A = Lacuna Grave (Informação inexistente)
 * B = Lacuna Moderada (Parcial ou dispersa)
 * C = Lacuna Leve (Ajuste de forma)
 */

export interface AnalysisGap {
  id: string;
  description: string; 
  status: 'OPEN' | 'RESOLVED' | 'PARTIAL';
  resolutionScore: number; // 0 to 100
  aiFeedback: string; 
  severityLevel: GapSeverity; // A, B or C
  createdAt: number; // Timestamp when first detected
  updatedAt: number; // Timestamp of last update
  resolvedAt?: number; // Timestamp when resolved
}


export interface DiagnosisResponse {
  timestamp: number;
  projectSummary: string; 
  strategicPaths: StrategicPath[]; 
  gaps: AnalysisGap[]; // GUARANTEED to be an array
  overallReadiness: number; // 0 to 100 score
  suggestedSections: {
    chapter: string;
    title: string;
    description: string;
  }[];
}
// -------------------------------

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
    diagnosisHistory: DiagnosisResponse[]; // Store history of diagnoses
    consolidatedMarkdown?: string; 
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
    diagnosisHistory: DiagnosisResponse[]; // History is now part of project data
  };
  versions: ProjectVersion[];
}

// Add global definition for window.pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any;
    jspdf: any;
    html2canvas: any;
  }
}