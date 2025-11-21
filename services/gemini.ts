
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
    // FIX: Corrected model name from "gem-2.5-flash" to "gemini-2.5-flash"
    const model = "gemini-2.5-flash";
    const step = DIAGNOSIS_STEPS[stepIndex];

    const prompt = `
    Você é um Analista de Negócios Sênior e Auditor de Projetos, com especialização cruzada na Metodologia SEBRAE, nos critérios de análise de viabilidade do BRDE/BNDES e nos requisitos do FSA para inovação e acessibilidade.
    Sua missão é realizar uma análise técnica, profunda e crítica do projeto "SCine", tratando a Matriz Estratégica como um checklist vivo e um mecanismo de validação de coerência.

    CONTEXTO COMPLETO DO PROJETO (Arquivos, Anotações, Dados Existentes):
    """
    ${fullContext}
    """

    MATRIZ ESTRATÉGICA ATUAL (em construção):
    """
    ${JSON.stringify(currentMatrix, null, 2)}
    """

    TAREFA: Executar a **ETAPA ${stepIndex + 1}/${DIAGNOSIS_STEPS.length}: ${step.name}**.
    FOCO DA ETAPA: ${step.description}

    INSTRUÇÕES DETALHADAS PARA ESTA ETAPA:

    1.  **EXTRAÇÃO DE DADOS PROFUNDA:**
        -   **Análise Avançada de Arquivos:** Extraia dados de tabelas, listas e informações implícitas. Limpe cabeçalhos/rodapés e normalize o texto. Identifique e consolide informações repetidas.
        -   **Busca Ativa (Metodologia SEBRAE):** Procure ativamente por: Público-alvo, necessidades/dores, concorrentes, proposta de valor, tendências, barreiras de entrada, canais, estrutura de receita, custos e riscos.
        -   **Busca Ativa (Critérios BRDE/FSA):** Procure ativamente por: Provas de inovação, aderência técnica, justificativa tecnológica, elementos de acessibilidade, riscos operacionais/financeiros, fragilidades técnicas, gargalos de execução e contradições entre arquivos.

    2.  **AUDITORIA CRUZADA INTERNA:**
        -   Compare a coerência entre os blocos. Por exemplo: O público-alvo é compatível com os canais de marketing? Os custos são realistas frente às receitas projetadas? A equipe possui a expertise necessária para o escopo? A inovação alegada é comprovada nos documentos?
        -   Se encontrar uma incoerência, gere um insight técnico para a Matriz com severidade 'alto' ou 'crítico'.

    3.  **GERAÇÃO DE INSIGHTS PARA A MATRIZ:**
        -   Para cada insight, preencha um item na Matriz. Os insights devem ser claros, técnicos, objetivos e consolidados.
        -   **Para cada item, você DEVE fornecer:**
            -   'item': O título do insight (ex: "Dependência de um único fornecedor de tecnologia").
            -   'description': A descrição técnica e a justificativa (ex: "A plataforma depende 100% da Vodlix, criando um risco operacional. A mitigação não foi citada.").
            -   'severity': Classifique a severidade ('crítico', 'alto', 'moderado', 'baixo', 'cosmético').
            -   'confidence': Classifique sua confiança na informação ('alta', 'média', 'baixa').

    4.  **LOGS EM TEMPO REAL:**
        -   Gere logs curtos e objetivos sobre suas descobertas (ex: "Segmentos de clientes identificados.", "Incoerência detectada entre custos e receitas.").

    5.  **PREENCHIMENTO DA MATRIZ:**
        -   Preencha APENAS os blocos da Matriz Estratégica relacionados a esta etapa (${step.matrixTargets.join(', ')}).
        -   Atualize o 'clarityLevel' (0-100) de cada bloco modificado, com base na qualidade e completude da informação encontrada.

    6.  **ETAPA FINAL (10/10):** Se esta for a última etapa, sua missão é consolidar a análise:
        -   Calcule o 'overallReadiness' (0-100). Se o contexto inicial for vazio, o Nível de Prontidão DEVE ser 0.
        -   Identifique as 'gaps' (pendências) finais do projeto, com base na Matriz completa.

    REGRAS GERAIS:
    -   **NÃO INVENTE DADOS.** Se faltarem informações, registre "Informações insuficientes..." na descrição, atribua 'confidence: "baixa"' e 'severity: "alto"'.
    -   Seja rigoroso. O objetivo é preparar o projeto para um comitê de crédito real.

    RESPONDA ESTRITAMENTE NO FORMATO JSON ABAIXO.
    `;
    
    const matrixItemSchema = {
        type: Type.OBJECT,
        properties: {
            item: { type: Type.STRING, description: "O título do insight ou item." },
            description: { type: Type.STRING, description: "A descrição detalhada e técnica do insight." },
            severity: { type: Type.STRING, description: "Nível de severidade: 'crítico', 'alto', 'moderado', 'baixo', 'cosmético'." },
            confidence: { type: Type.STRING, description: "Nível de confiança na informação: 'alta', 'média', 'baixa'." }
        },
        required: ["item", "description", "severity", "confidence"]
    };
    
    const canvasBlockSchema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: matrixItemSchema },
            description: { type: Type.STRING },
            source: { type: Type.STRING },
            clarityLevel: { type: Type.NUMBER }
        }
    };

    const swotBlockSchema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: matrixItemSchema },
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
                    customerSegments: canvasBlockSchema,
                    valueProposition: canvasBlockSchema,
                    channels: canvasBlockSchema,
                    customerRelationships: canvasBlockSchema,
                    revenueStreams: canvasBlockSchema,
                    keyResources: canvasBlockSchema,
                    keyActivities: canvasBlockSchema,
                    keyPartnerships: canvasBlockSchema,
                    costStructure: canvasBlockSchema,
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
