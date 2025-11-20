import { GoogleGenAI, Type } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, ValueMatrix, AnalysisGap, BusinessGoal } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT } from "../constants";

// Initialize the client
const getAIClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing. Please configure your environment.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to clean JSON string from Markdown fences and other garbage
const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    // This regex handles JSON that starts with { or [
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
        return match[0];
    }
    return "{}";
};

// --- ETAPA 0: MATRIZ DE VALORES ---
export const generateValueMatrix = async (context: string): Promise<ValueMatrix> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const prompt = `
    ATENÇÃO: EXECUÇÃO DA "ETAPA 0" - MATRIZ DE VALORES ESTRATÉGICA.
    Você é um Analista de Negócios Sênior, especialista em modelagem financeira SEBRAE e auditoria de crédito BRDE/FSA.
    Sua missão é criar a "FONTE DA VERDADE" numérica para o projeto SCine usando uma metodologia híbrida.
    DOCUMENTOS DISPONÍVEIS: """${context}"""

    **METODOLOGIA HÍBRIDA (2 FASES):**

    **FASE 1: BUSCA ATIVA E CONSOLIDAÇÃO (CHECKLIST ESTRATÉGICO)**
    Primeiro, busque ativamente por estes conceitos-chave. Entenda o contexto e consolide valores (ex: some salários para obter "Custo de Pessoal"). Não se prenda a palavras-chave exatas.
    - **Checklist Prioritário:** Investimento Total (CAPEX), Empréstimo Solicitado (BRDE), Contrapartida, Custos de Pessoal, Custos de Infraestrutura, Tributação (Regime/Alíquota), Faturamento Previsto (Anos 1 e 2), Custos Variáveis principais.
    - **REGRA CRÍTICA:** Se um item do checklist não for encontrado, **NÃO O INCLUA NA MATRIZ**. Não invente valores. A ausência de dados será analisada no diagnóstico.

    **FASE 2: AUDITORIA REATIVA E ARBITRAGEM**
    Após a Fase 1, faça uma varredura completa e adicione outros dados numéricos relevantes, aplicando estas regras:
    1.  **Prioridade de Arquivos:** "Final", "Consolidado" > "Rascunho", "Antigo".
    2.  **Coerência:** Verifique se os totais informados batem com as somas que você consolidou.
    3.  **Conflitos:** Se valores forem inconsistentes e a prioridade for a mesma, marque o status como "conflito_nao_resolvido".
    4.  **Rastreabilidade:** Para cada valor, cite a fonte (arquivo e localização).

    **RETORNO:**
    Produza um JSON com a matriz de valores. A qualidade de todo o plano depende da precisão desta etapa.
    `;
    try {
        const result = await ai.models.generateContent({ model, contents: prompt, config: { maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, entries: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, categoria: { type: Type.STRING }, subcategoria: { type: Type.STRING }, nome: { type: Type.STRING }, valor: { type: Type.NUMBER }, moeda: { type: Type.STRING }, unidade: { type: Type.STRING }, periodoReferencia: { type: Type.STRING }, fontesUsadas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { arquivo: { type: Type.STRING }, localizacao: { type: Type.STRING }, valorOriginal: { type: Type.NUMBER } } } }, criterioEscolha: { type: Type.STRING }, statusResolucao: { type: Type.STRING }, valorOficial: { type: Type.BOOLEAN } }, required: ["id", "categoria", "nome", "valor", "fontesUsadas", "statusResolucao"] } } }, required: ["entries"] } } });
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        // FIX: Ensure json.entries is an array before returning to prevent runtime errors.
        const entries = Array.isArray(json.entries) ? json.entries : [];
        return { entries: entries, summary: json.summary || "Matriz gerada.", generatedAt: Date.now() };
    } catch (e) {
        console.error("Erro na Etapa 0 (Matriz de Valores):", e);
        return { entries: [], generatedAt: Date.now(), summary: "Erro na geração da matriz." };
    }
};

// --- ETAPA 2: DIAGNÓSTICO GLOBAL ---
export const generateGlobalDiagnosis = async (context: string, valueMatrix: ValueMatrix | null, previousHistory: DiagnosisResponse[] = []): Promise<DiagnosisResponse> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const lastDiagnosis = previousHistory.length > 0 ? previousHistory[previousHistory.length - 1] : null;
    const previousGapsContext = lastDiagnosis ? JSON.stringify(lastDiagnosis.gaps.map(g => ({ id: g.id, description: g.description, status: g.status }))) : "Nenhum diagnóstico anterior.";
    const matrixContext = valueMatrix ? JSON.stringify(valueMatrix.entries.map(e => ({ nome: e.nome, valor: e.valor, status: e.statusResolucao }))) : "Matriz de Valores vazia.";
    const prompt = `
    Você é um Gerente de Análise de Projetos do FSA (BRDE).
    TAREFA: Realizar DIAGNÓSTICO EVOLUTIVO do projeto SCine.
    MATRIZ DE VALORES: """${matrixContext}"""
    DADOS TEXTUAIS: """${context}"""
    HISTÓRICO PENDÊNCIAS: """${previousGapsContext}"""
    INSTRUÇÕES:
    1. USE A MATRIZ como fonte da verdade. Não crie gaps para dados já consolidados.
    2. ATUALIZE PENDÊNCIAS ANTIGAS: Mantenha o ID, atualize status (RESOLVED/PARTIAL/OPEN) e feedback.
    3. CRIE NOVOS GAPS para informações críticas ausentes.
    4. SEVERIDADE: 'A' (Grave), 'B' (Moderada), 'C' (Leve).
    5. Seja CONCISO.
    RETORNO: JSON válido.
    `;
    try {
        const result = await ai.models.generateContent({ model, contents: prompt, config: { maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { projectSummary: { type: Type.STRING }, overallReadiness: { type: Type.NUMBER }, gaps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, description: { type: Type.STRING }, status: { type: Type.STRING }, resolutionScore: { type: Type.NUMBER }, severityLevel: { type: Type.STRING }, aiFeedback: { type: Type.STRING } }, required: ["id", "description", "status", "resolutionScore", "severityLevel", "aiFeedback"] } }, strategicPaths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } } } } }, suggestedSections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { chapter: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } } } } }, required: ["projectSummary", "gaps", "strategicPaths"] } } });
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        const timestamp = Date.now();
        // FIX: Safely handle 'gaps' from model output, ensuring it's an array to prevent runtime .map() errors.
        const gapsList = Array.isArray(json.gaps) ? json.gaps : [];
        const processedGaps: AnalysisGap[] = gapsList.map((g: any) => {
            const oldGap = lastDiagnosis?.gaps.find(old => old.id === g.id);
            return { ...g, createdAt: oldGap?.createdAt ?? timestamp, updatedAt: timestamp, resolvedAt: g.status === 'RESOLVED' && oldGap?.status !== 'RESOLVED' ? timestamp : oldGap?.resolvedAt };
        });
        // FIX: Construct the response object safely to guarantee type correctness and prevent crashes.
        return {
            timestamp,
            projectSummary: json.projectSummary || '',
            overallReadiness: json.overallReadiness || 0,
            gaps: processedGaps,
            strategicPaths: Array.isArray(json.strategicPaths) ? json.strategicPaths : [],
            suggestedSections: Array.isArray(json.suggestedSections) ? json.suggestedSections : [],
        };
    } catch (e) {
        console.error("Erro no Diagnóstico:", e);
        return { timestamp: Date.now(), projectSummary: "Falha na análise. A resposta da IA foi inválida. Tente novamente.", overallReadiness: 0, gaps: [], strategicPaths: [], suggestedSections: [] };
    }
};

// ... other service functions (generateSectionContent, etc.) remain largely the same but would benefit from similar try/catch hardening ...
// The user prompt focuses on the critical path, so I'm focusing the fix there.

export const generateSectionContent = async (
    sectionTitle: string,
    sectionDescription: string,
    methodology: string,
    context: string,
    goalContext: string,
    userAnswers: string,
    previousSections: string = "",
    currentContent: string = "",
    refinementInstructions: string = "",
    refinementContext: string = "",
    childSectionsContent: string = "",
    valueMatrix: ValueMatrix | undefined
): Promise<string> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const matrixContext = valueMatrix?.entries.map(e => `- ${e.nome} (${e.categoria}): ${e.valor} ${e.unidade || ''} [Status: ${e.statusResolucao}]`).join('\n') || "Matriz de valores não disponível.";

    let promptTask = "";
    if (refinementInstructions) {
        promptTask = `MODO REVISÃO: Reescreva "${sectionTitle}" com base em: "${refinementInstructions}". CONTEÚDO ATUAL: """${currentContent}"""`;
    } else if (childSectionsContent) {
        promptTask = `MODO SÍNTESE: Escreva a introdução de "${sectionTitle}" baseada nestes filhos: """${childSectionsContent}"""`;
    } else if (currentContent) {
        promptTask = `MODO CONTINUAÇÃO: Continue o texto a partir de: """${currentContent.slice(-2000)}"""`;
    } else {
        promptTask = `TAREFA: Escreva "${sectionTitle}". DIRETRIZES: ${sectionDescription}. ESTRUTURA: Desenvolvimento + '### Conclusão e Impacto'.`;
    }

    const prompt = `
    Consultor BRDE/FSA para o projeto SCine. Objetivo: ${goalContext}.
    FONTE DA VERDADE (NÚMEROS OFICIAIS): ${matrixContext}
    INPUTS GERAIS: """${context}"""
    ${promptTask}
    `;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { maxOutputTokens: 8192, tools: [{ googleSearch: {} }] }
        });
        return result.text || "Erro: A IA não retornou conteúdo.";
    } catch (e) {
        console.error(`Erro ao gerar seção ${sectionTitle}:`, e);
        return "Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.";
    }
};

export const generateFinancialData = async (
    valueMatrix: ValueMatrix | undefined
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const matrixContext = valueMatrix?.entries.map(e => `- ${e.nome}: ${e.valor}`).join('\n') || "Matriz de dados não disponível.";
    const prompt = `
    Analista Financeiro BRDE. Projeto SCine.
    REGRAS: ${BRDE_FSA_RULES}
    MATRIZ DE DADOS: ${matrixContext}
    Gere projeção de 5 anos (DRE simplificado) considerando 2 anos de carência.
    Output JSON: { "analysis": "Texto em Markdown com análise e conclusão", "data": [{ "year": "Ano 1", "revenue": 0, "expenses": 0, "profit": 0 }] }
    `;
    try {
        const result = await ai.models.generateContent({ model, contents: prompt, config: { maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { analysis: { type: Type.STRING }, data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, revenue: { type: Type.NUMBER }, expenses: { type: Type.NUMBER }, profit: { type: Type.NUMBER } } } } } } } });
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        // FIX: Ensure json.data is an array before returning.
        const data = Array.isArray(json.data) ? json.data : [];
        return { analysis: json.analysis || "Análise indisponível.", data: data };
    } catch (e) { console.error(e); return { analysis: "Erro ao gerar dados financeiros.", data: [] }; }
};

export const generateProjectImage = async (promptDescription: string): Promise<string> => {
    const ai = getAIClient();
    try {
        // FIX: Switched from deprecated generateImages to generateContent with an image model as per guidelines.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: promptDescription }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });

        // FIX: Iterate through response parts to find the generated image data, as per guidelines.
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("Nenhuma imagem foi gerada.");
    } catch (e) { console.error("Erro na geração de imagem:", e); throw e; }
};

export const validateCompletedSections = async (
    completedSections: { id: string, title: string, content: string }[],
    valueMatrix: ValueMatrix | null,
    methodology: string,
    goal: BusinessGoal
): Promise<{ sectionId: string; isValid: boolean; feedback: string }[]> => {
    const ai = getAIClient();
    const model = 'gemini-2.5-flash';

    const matrixContext = valueMatrix ? JSON.stringify(valueMatrix.entries.filter(e => e.valorOficial).map(e => ({ nome: e.nome, valor: e.valor }))) : "Matriz de dados não disponível.";
    const sectionsContext = JSON.stringify(completedSections);

    const prompt = `
    Você é um Auditor Sênior de Projetos do BRDE, especialista na metodologia SEBRAE.
    Sua tarefa é validar se as seções CONCLUÍDAS de um plano de negócios estão alinhadas com os objetivos e dados do projeto.

    OBJETIVO PRINCIPAL DO PLANO: "${goal}"
    METODOLOGIA APLICADA: "${methodology}"
    FONTE DA VERDADE NUMÉRICA (MATRIZ DE DADOS): """${matrixContext}"""
    SEÇÕES CONCLUÍDAS PARA ANÁLISE: """${sectionsContext}"""

    INSTRUÇÕES DE AUDITORIA:
    1.  **Validação Cruzada de Dados:** Para cada seção, verifique se os valores numéricos mencionados no texto são consistentes com a "FONTE DA VERDADE NUMÉRICA". Aponte qualquer discrepância.
    2.  **Aderência à Metodologia:** Verifique se o conteúdo de cada seção atende às diretrizes da "${methodology}". Por exemplo, uma análise de mercado deve conter TAM/SAM/SOM se a metodologia exigir.
    3.  **Alinhamento ao Objetivo:** Verifique se o tom, os argumentos e as conclusões de cada seção estão alinhados com o "${goal}". Um plano para financiamento BRDE deve focar em capacidade de pagamento, garantias e impacto regional.
    4.  **Feedback Acionável:** Se uma seção falhar em qualquer critério, forneça um feedback claro, conciso e construtivo, explicando O QUÊ está errado e COMO corrigir. Seja direto.

    RESPONDA ESTRITAMENTE NO SEGUINTE FORMATO JSON:
    `;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        validationResults: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sectionId: { type: Type.STRING },
                                    isValid: { type: Type.BOOLEAN },
                                    feedback: { type: Type.STRING, description: "Feedback construtivo se isValid for false." }
                                },
                                required: ["sectionId", "isValid", "feedback"]
                            }
                        }
                    },
                    required: ["validationResults"]
                }
            }
        });

        const json = JSON.parse(cleanJsonString(result.text || '{}'));
        return Array.isArray(json.validationResults) ? json.validationResults : [];
    } catch (e) {
        console.error("Erro na validação das seções:", e);
        // Return a generic error for all sections
        return completedSections.map(s => ({
            sectionId: s.id,
            isValid: false,
            feedback: "Ocorreu um erro no serviço de validação. A IA pode estar indisponível. Tente novamente."
        }));
    }
};