import { GoogleGenAI, Type } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, StrategicMatrix, AnalysisGap, BusinessGoal, DiagnosisStepResult, CanvasBlock, SwotBlock, MatrixItem } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT, DIAGNOSIS_STEPS } from "../constants";

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

// --- NEW 10-STEP DIAGNOSIS ENGINE ---
export const runDiagnosisStep = async (
    stepIndex: number,
    fullContext: string,
    currentMatrix: StrategicMatrix
): Promise<DiagnosisStepResult> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const step = DIAGNOSIS_STEPS[stepIndex];

    const prompt = `
    Você é um Analista de Negócios Sênior do BRDE, especialista em metodologia SEBRAE.
    Você está executando o DIAGNÓSTICO ESTRATÉGICO do projeto "SCine".

    CONTEXTO COMPLETO DO PROJETO (Arquivos, Anotações):
    """
    ${fullContext}
    """

    MATRIZ ESTRATÉGICA ATUAL (em construção):
    """
    ${JSON.stringify(currentMatrix, null, 2)}
    """

    TAREFA: Executar a **ETAPA ${stepIndex + 1}/${DIAGNOSIS_STEPS.length}: ${step.name}**.
    FOCO DA ETAPA: ${step.description}

    INSTRUÇÕES:
    1.  **Analise o CONTEXTO COMPLETO** para extrair insights relevantes APENAS para esta etapa.
    2.  **Gere Logs:** Crie uma lista de logs curtos e objetivos sobre suas descobertas. Ex: "Segmentos de clientes identificados.", "Informação adicionada à Matriz Estratégica.".
    3.  **Atualize a Matriz:** Preencha APENAS os blocos da Matriz Estratégica relacionados a esta etapa (${step.matrixTargets.join(', ')}).
        - Para Canvas: Forneça uma lista de 'items' (título e descrição) e um 'description' geral para o bloco.
        - Para SWOT: Forneça uma lista de 'items' (strings).
        - Nível de Clareza: Atribua um 'clarityLevel' (0-100) para cada bloco que você atualizar, baseado na qualidade da informação encontrada.
    4.  **ETAPA FINAL (10/10):** Se esta for a última etapa, sua missão principal é diferente. Analise a matriz final e o contexto para:
        - Calcular o 'overallReadiness' (0-100). Se o contexto inicial for vazio, o Nível de Prontidão DEVE ser 0.
        - Identificar as 'gaps' (pendências) finais do projeto.

    REGRAS GERAIS:
    - **NÃO INVENTE NÚMEROS FINANCEIROS.** Se faltarem dados, registre na descrição do bloco: "Informações insuficientes para preencher este item."
    - Seja rigoroso e técnico, como um analista do Sebrae/BRDE.
    - Otimize a profundidade da análise. Não limite o contexto.

    RESPONDA ESTRITAMENTE NO FORMATO JSON ABAIXO.
    `;

    // Dynamically build the response schema
    const blockSchema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: { 
                type: Type.OBJECT, 
                properties: { item: { type: Type.STRING }, description: { type: Type.STRING } }
            }},
            description: { type: Type.STRING },
            source: { type: Type.STRING },
            clarityLevel: { type: Type.NUMBER }
        }
    };
     const swotBlockSchema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING }},
            description: { type: Type.STRING },
            source: { type: Type.STRING },
            clarityLevel: { type: Type.NUMBER }
        }
    };

    const finalDiagnosisSchema = {
        type: Type.OBJECT,
        properties: {
            overallReadiness: { type: Type.NUMBER },
            gaps: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        description: { type: Type.STRING },
                        aiFeedback: { type: Type.STRING },
                        severityLevel: { type: Type.STRING }
                    },
                    required: ["id", "description", "aiFeedback", "severityLevel"]
                }
            }
        }
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            logs: { type: Type.ARRAY, items: { type: Type.STRING }},
            matrixUpdate: {
                type: Type.OBJECT,
                properties: {
                    customerSegments: blockSchema,
                    valueProposition: blockSchema,
                    channels: blockSchema,
                    customerRelationships: blockSchema,
                    revenueStreams: blockSchema,
                    keyResources: blockSchema,
                    keyActivities: blockSchema,
                    keyPartnerships: blockSchema,
                    costStructure: blockSchema,
                    swot: {
                        type: Type.OBJECT,
                        properties: {
                            strengths: swotBlockSchema,
                            weaknesses: swotBlockSchema,
                            opportunities: swotBlockSchema,
                            threats: swotBlockSchema
                        }
                    }
                }
            },
            ...(stepIndex === 9 && { finalDiagnosis: finalDiagnosisSchema })
        },
        required: ["logs", "matrixUpdate"]
    };


    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema }
        });
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        return json as DiagnosisStepResult;
    } catch (e) {
        console.error(`Erro na Etapa ${stepIndex + 1} (${step.name}):`, e);
        // Return a structured error response
        return {
            logs: [`Erro crítico ao processar a etapa ${stepIndex + 1}. A IA pode estar indisponível ou a resposta foi inválida.`],
            matrixUpdate: {},
        };
    }
};


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
    strategicMatrix: StrategicMatrix | undefined
): Promise<string> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz estratégica não disponível.";

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
    FONTE DA VERDADE (MATRIZ ESTRATÉGICA): ${matrixContext}
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
    strategicMatrix: StrategicMatrix | undefined
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz de dados não disponível.";
    const prompt = `
    Analista Financeiro BRDE. Projeto SCine.
    REGRAS: ${BRDE_FSA_RULES}
    MATRIZ ESTRATÉGICA: ${matrixContext}
    Gere projeção de 5 anos (DRE simplificado) considerando 2 anos de carência, com base nos blocos 'revenueStreams' e 'costStructure' da matriz.
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
    strategicMatrix: StrategicMatrix | null,
    methodology: string,
    goal: BusinessGoal
): Promise<{ sectionId: string; isValid: boolean; feedback: string }[]> => {
    const ai = getAIClient();
    const model = 'gemini-2.5-flash';

    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz de dados não disponível.";
    const sectionsContext = JSON.stringify(completedSections);

    const prompt = `
    Você é um Auditor Sênior de Projetos do BRDE, especialista na metodologia SEBRAE.
    Sua tarefa é validar se as seções CONCLUÍDAS de um plano de negócios estão alinhadas com os objetivos e dados do projeto.

    OBJETIVO PRINCIPAL DO PLANO: "${goal}"
    METODOLOGIA APLICADA: "${methodology}"
    FONTE DA VERDADE (MATRIZ ESTRATÉGICA): """${matrixContext}"""
    SEÇÕES CONCLUÍDAS PARA ANÁLISE: """${sectionsContext}"""

    INSTRUÇÕES DE AUDITORIA:
    1.  **Validação Cruzada de Dados:** Para cada seção, verifique se os valores numéricos e insights mencionados no texto são consistentes com a "MATRIZ ESTRATÉGICA". Aponte qualquer discrepância.
    2.  **Aderência à Metodologia:** Verifique se o conteúdo de cada seção atende às diretrizes da "${methodology}".
    3.  **Alinhamento ao Objetivo:** Verifique se o tom e os argumentos de cada seção estão alinhados com o "${goal}".
    4.  **Feedback Acionável:** Se uma seção falhar, forneça um feedback claro, conciso e construtivo, explicando O QUÊ está errado e COMO corrigir.

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