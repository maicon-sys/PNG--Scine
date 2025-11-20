


import { GoogleGenAI, Type } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, ValueMatrix, AnalysisGap } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT } from "../constants";

// Initialize the client
const getAIClient = () => {
    if (!process.env.API_KEY) {
        // This is a critical error. The app cannot function without an API key.
        throw new Error("API Key is missing. Please configure your environment.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to clean JSON string from Markdown fences and other garbage
const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    // Aggressively find the main JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
        return match[0];
    }
    return "{}"; // Return empty object if no JSON object is found
};

// --- ETAPA 0: MATRIZ DE VALORES (REFATORADA) ---
export const generateValueMatrix = async (context: string): Promise<ValueMatrix> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
    ATENÇÃO: EXECUÇÃO DA "ETAPA 0" - MATRIZ DE VALORES E CONSOLIDAÇÃO DE DADOS.
    
    Você é um Auditor Financeiro Sênior especializado em Projetos BRDE/FSA.
    Sua missão é criar a "FONTE DA VERDADE" numérica para o plano de negócios da SCine.

    DOCUMENTOS DISPONÍVEIS (INPUT BRUTO):
    """
    ${context}
    """

    ----------------------------------------
    INSTRUÇÕES DE EXECUÇÃO (MENTAIS):
    ----------------------------------------
    
    PASSO 1: EXTRAÇÃO BRUTA
    - Identifique TODOS os valores numéricos: Receitas (B2C/B2B), Custos (OPEX/Variável), CAPEX (HUB, Van, TI), Assinantes, Prazos, Indicadores (Payback, TIR).
    - Mapeie a origem de cada número (Arquivo + Página/Tabela).

    PASSO 2: CONSOLIDAÇÃO E ARBITRAGEM DE CONFLITOS
    Aplique estas regras RIGOROSAS para definir o valor final ("valorOficial"):

    1. REGRA DE OURO (PRIORIDADE DE DOCUMENTO): 
       - Documentos com nomes "Revisão", "Novo", "Atualizado", "Consolidado", "Final" TÊM PRECEDÊNCIA TOTAL sobre documentos com nomes "Antigo", "V1", "Rascunho".
       - Se o arquivo "Orçamento Consolidado 9w" diz X e o "Plano Antigo" diz Y, escolha X.

    2. REGRAS ESPECIAIS PARA VALORES CRÍTICOS (NÃO ALTERAR):
       Além disso, em hipótese alguma você deve ajustar, corrigir ou substituir os seguintes valores, se eles já estiverem presentes em documentos consolidados do projeto:
       - o valor total de investimento do projeto;
       - o valor do empréstimo a ser solicitado ao BRDE;
       - o valor da contrapartida própria.

       Quando encontrar esses valores em documentos identificados como revisão/atualização/consolidação (por exemplo: arquivos com “revisão”, “revizão”, “novas ideias”, “atualizado”, “consolidado”, “final” no nome), você deve:
       - apenas copiar esses valores exatamente como estão;
       - registrá-los na matriz com valorOficial = true;
       - e NÃO tentar conciliar, recalcular ou substituir esses números com base em outras fontes.

       Se houver conflito entre documentos consolidados e documentos antigos ou rascunhos, você deve:
       - dar prioridade ao documento consolidado/atualizado;
       - registrar as demais fontes em fontesUsadas;
       - explicar o critério em criterioEscolha;
       mas sempre preservando o número oficial vindo do documento consolidado como valorOficial = true.

    3. REGRA DA COERÊNCIA MATEMÁTICA:
       - Se houver dúvida, verifique a soma. Se (Receita Mensal * 12) = Receita Anual no documento A, mas não no B, o documento A é mais confiável.

    4. REGRA DE CENÁRIOS:
       - Se os valores diferentes forem claramente "Cenário Otimista" vs "Cenário Realista", NÃO considere conflito. Crie duas entradas separadas na matriz.

    5. REGRA DE CONFLITO INSOLÚVEL:
       - Se não for possível decidir, marque 'statusResolucao': "conflito_nao_resolvido".

    ----------------------------------------
    FORMATO DE SAÍDA (JSON):
    ----------------------------------------
    Gere um JSON contendo apenas a matriz consolidada.
    Não invente valores. Se não existir nos documentos, não crie.
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Resumo executivo da consolidação (ex: 'Foram encontrados 30 valores, 2 conflitos resolvidos pela prioridade do arquivo X')." },
                        entries: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    categoria: { type: Type.STRING },
                                    subcategoria: { type: Type.STRING },
                                    nome: { type: Type.STRING },
                                    valor: { type: Type.NUMBER, description: "Valor numérico puro, sem formatação de moeda." },
                                    moeda: { type: Type.STRING },
                                    unidade: { type: Type.STRING },
                                    periodoReferencia: { type: Type.STRING },
                                    fontesUsadas: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                arquivo: { type: Type.STRING },
                                                localizacao: { type: Type.STRING },
                                                valorOriginal: { type: Type.NUMBER }
                                            }
                                        }
                                    },
                                    criterioEscolha: { type: Type.STRING },
                                    statusResolucao: { type: Type.STRING, enum: ["consolidado", "conflito_nao_resolvido"] },
                                    valorOficial: { type: Type.BOOLEAN }
                                },
                                required: ["id", "categoria", "nome", "valor", "fontesUsadas", "statusResolucao"]
                            }
                        }
                    },
                    required: ["entries"]
                }
            }
        });
        
        const cleanedJson = cleanJsonString(result.text || "{}");
        const json = JSON.parse(cleanedJson);
        
        return {
            entries: json.entries || [],
            summary: json.summary || "Matriz gerada.",
            generatedAt: Date.now()
        };

    } catch (e) {
        console.error("Erro na Etapa 0 (Matriz de Valores):", e);
        return { entries: [], generatedAt: Date.now(), summary: "Erro na geração da matriz. A resposta da IA pode ter sido inválida." };
    }
};

// Generate section content
export const generateSectionContent = async (
    // ... (assinatura)
): Promise<string> => {
    // ... (código existente)
    return "Conteúdo da seção aqui..."; // Simplificado para foco no diagnóstico
};

export const generateFinancialData = async (
    // ... (assinatura)
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    // ... (código existente)
    return { analysis: "Análise financeira", data: [] }; // Simplificado
};

// --- DIAGNOSIS WITH HISTORY AND VALUE MATRIX ---
export const generateGlobalDiagnosis = async (
    context: string,
    valueMatrix: ValueMatrix | undefined | null,
    previousHistory: DiagnosisResponse[] = []
): Promise<DiagnosisResponse> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const lastDiagnosis = previousHistory.length > 0 ? previousHistory[previousHistory.length - 1] : null;
    
    const previousGapsContext = lastDiagnosis 
        ? JSON.stringify(lastDiagnosis.gaps.map(g => ({
            id: g.id,
            description: g.description,
            status: g.status,
            severityLevel: g.severityLevel
        }))) 
        : "Nenhum diagnóstico anterior.";

    const matrixContext = valueMatrix 
        ? JSON.stringify(valueMatrix.entries.map(e => ({
            nome: e.nome,
            valor: e.valor,
            status: e.statusResolucao
        }))) 
        : "Matriz de Valores ainda não gerada ou vazia.";

    const prompt = `
    Você é o Gerente de Análise de Projetos do FSA (BRDE).
    
    TAREFA: Realizar DIAGNÓSTICO EVOLUTIVO do projeto SCine.
    
    MATRIZ DE VALORES CONSOLIDADA (ETAPA 0):
    """
    ${matrixContext}
    """
    
    DADOS TEXTUAIS ATUAIS (Arquivos):
    """
    ${context}
    """

    HISTÓRICO DE PENDÊNCIAS (Do diagnóstico anterior):
    """
    ${previousGapsContext}
    """

    INSTRUÇÕES DE ANÁLISE:
    1. Entenda o projeto com base nos textos e, PRINCIPALMENTE, na Matriz de Valores. Se um dado está na Matriz como "consolidado", ele EXISTE. Não crie um gap dizendo que falta.
    2. VERIFICAÇÃO DE PENDÊNCIAS ANTIGAS: Para cada gap do histórico, verifique se os *novos dados* (texto ou Matriz) resolveram o problema. Mantenha o MESMO ID do gap antigo e atualize o status (RESOLVED, PARTIAL, OPEN) e o feedback.
    3. IDENTIFICAÇÃO DE NOVOS GAPS: Identifique informações CRÍTICAS faltantes para o BRDE.
    4. SEVERIDADE: Classifique cada gap: 'A' (Grave - ausência total), 'B' (Moderada - parcial/disperso), 'C' (Leve - ajuste de forma).
    5. ESTRATÉGIA: Sugira 2-3 caminhos estratégicos.
    
    IMPORTANTE: Seja CONCISO para evitar respostas cortadas.

    RETORNO (JSON):
    Sempre retorne um JSON válido com todos os campos.
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        projectSummary: { type: Type.STRING },
                        overallReadiness: { type: Type.NUMBER },
                        gaps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    status: { type: Type.STRING, enum: ["OPEN", "RESOLVED", "PARTIAL"] },
                                    resolutionScore: { type: Type.NUMBER },
                                    severityLevel: { type: Type.STRING, enum: ["A", "B", "C"] },
                                    aiFeedback: { type: Type.STRING }
                                },
                                required: ["id", "description", "status", "resolutionScore", "severityLevel", "aiFeedback"]
                            }
                        },
                        strategicPaths: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        },
                        suggestedSections: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT, properties: { chapter: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } } }
                        }
                    },
                    required: ["projectSummary", "gaps", "strategicPaths"]
                }
            }
        });
        
        const cleanedJson = cleanJsonString(result.text || "{}");
        const response = JSON.parse(cleanedJson);
        
        const timestamp = Date.now();
        const processedGaps: AnalysisGap[] = (response.gaps || []).map((g: any) => {
            const oldGap = lastDiagnosis?.gaps.find(old => old.id === g.id);
            return {
                ...g,
                createdAt: oldGap ? oldGap.createdAt : timestamp,
                updatedAt: timestamp,
                resolvedAt: g.status === 'RESOLVED' && (!oldGap || oldGap.status !== 'RESOLVED') ? timestamp : (oldGap?.resolvedAt)
            };
        });

        return {
            ...response,
            gaps: processedGaps,
            timestamp: timestamp
        };

    } catch (e) {
        console.error("Erro no Diagnóstico:", e);
        return {
            timestamp: Date.now(),
            projectSummary: "Falha na análise. A resposta da IA foi inválida ou interrompida. Por favor, tente novamente com menos arquivos ou verifique sua conexão.",
            overallReadiness: 0,
            gaps: [],
            strategicPaths: [],
            suggestedSections: []
        };
    }
};

export const generateProjectImage = async (
    // ... (assinatura)
): Promise<string> => {
    // ... (código existente)
    return "base64string"; // Simplificado
};