import { generationGuidelines } from '../generationGuidelines';
import { SCINE_CONTEXT } from '../constants';

export type SectionDoc = {
    id: string;
    tag?: string;      // ex: 'ANALISE_MERCADO_SCINE', 'MATRIZ_FINANCEIRA_SCINE'
    content: string;   // texto bruto já extraído do PDF/TXT
};

export type ValueMatrix = Record<string, string | number>;

export interface BuildSectionContextParams {
    sectionId: string;
    fullContext: string;
    docs: SectionDoc[];
    valueMatrix: ValueMatrix;
}

export function buildSectionContext({
    sectionId,
    fullContext,
    docs,
    valueMatrix,
}: BuildSectionContextParams): string {
    const guideline = generationGuidelines[sectionId];

    // 1) Selecionar docs relevantes pelas tags definidas no guideline
    let docSnippet = '';
    if (guideline?.requiredDocTags && guideline.requiredDocTags.length > 0) {
        const selectedDocs = docs.filter(doc =>
            doc.tag && guideline.requiredDocTags!.includes(doc.tag)
        );

        const pieces = selectedDocs.map(doc => {
            return `--- DOCUMENTO (${doc.tag}) ---\n${doc.content}`;
        });

        docSnippet = pieces.join('\n\n');
    } else {
        // Fallback: se não há requiredDocTags, usa o fullContext (comportamento antigo)
        docSnippet = fullContext;
    }

    // 2) Selecionar métricas relevantes da matriz de valores
    let metricsSnippet = '';
    if (guideline?.metricKeys && guideline.metricKeys.length > 0) {
        const lines = guideline.metricKeys.map(key => {
            const value = valueMatrix[key];
            if (value === undefined) {
                return `- ${key}: [NÃO DEFINIDO NA MATRIZ DE VALORES]`;
            }
            return `- ${key}: ${value}`;
        });

        metricsSnippet = `MATRIZ DE VALORES PARA ESTA SEÇÃO:\n${lines.join('\n')}`;
    }

    // 3) Contexto fixo da SCine (negócio)
    const scineContext = SCINE_CONTEXT;

    // 4) Montar o contexto final da seção
    const sectionContext = [
        'CONTEXTO GERAL DO NEGÓCIO (SCine):',
        scineContext,
        '',
        metricsSnippet ? metricsSnippet : '',
        '',
        'TRECHOS DE DOCUMENTOS RELEVANTES PARA ESTA SEÇÃO:',
        docSnippet,
    ]
        .filter(Boolean)
        .join('\n\n');
import { generationGuidelines } from '../generationGuidelines';
import { SCINE_CONTEXT } from '../constants';

export type SectionDoc = {
    id: string;
    tag?: string;      // ex: 'ANALISE_MERCADO_SCINE', 'MATRIZ_FINANCEIRA_SCINE'
    content: string;   // texto bruto já extraído do PDF/TXT
};

export type ValueMatrix = Record<string, string | number>;

export interface BuildSectionContextParams {
    sectionId: string;
    fullContext: string;
    docs: SectionDoc[];
    valueMatrix: ValueMatrix;
}

export function buildSectionContext({
    sectionId,
    fullContext,
    docs,
    valueMatrix,
}: BuildSectionContextParams): string {
    const guideline = generationGuidelines[sectionId];

    // 1) Selecionar docs relevantes pelas tags definidas no guideline
    let docSnippet = '';
    if (guideline?.requiredDocTags && guideline.requiredDocTags.length > 0) {
        const selectedDocs = docs.filter(doc =>
            doc.tag && guideline.requiredDocTags!.includes(doc.tag)
        );

        const pieces = selectedDocs.map(doc => {
            return `--- DOCUMENTO (${doc.tag}) ---\n${doc.content}`;
        });

        docSnippet = pieces.join('\n\n');
    } else {
        // Fallback: se não há requiredDocTags, usa o fullContext (comportamento antigo)
        docSnippet = fullContext;
    }

    // 2) Selecionar métricas relevantes da matriz de valores
    let metricsSnippet = '';
    if (guideline?.metricKeys && guideline.metricKeys.length > 0) {
        const lines = guideline.metricKeys.map(key => {
            const value = valueMatrix[key];
            if (value === undefined) {
                return `- ${key}: [NÃO DEFINIDO NA MATRIZ DE VALORES]`;
            }
            return `- ${key}: ${value}`;
        });

        metricsSnippet = `MATRIZ DE VALORES PARA ESTA SEÇÃO:\n${lines.join('\n')}`;
    }

    // 3) Contexto fixo da SCine (negócio)
    const scineContext = SCINE_CONTEXT;

    // 4) Montar o contexto final da seção
    const sectionContext = [
        'CONTEXTO GERAL DO NEGÓCIO (SCine):',
        scineContext,
        '',
        metricsSnippet ? metricsSnippet : '',
        '',
        'TRECHOS DE DOCUMENTOS RELEVANTES PARA ESTA SEÇÃO:',
        docSnippet,
    ]
        .filter(Boolean)
        .join('\n\n');

    return sectionContext;
}

    return sectionContext;
}
