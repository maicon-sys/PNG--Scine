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
        
        // FIX: Validate structure and assign defaults if properties are missing to avoid "not iterable" errors
        if (!Array.isArray(json.logs)) {
             json.logs = []; 
        }
        if (!json.matrixUpdate || typeof json.matrixUpdate !== 'object') {
             json.matrixUpdate = {};
        }

        return json as DiagnosisStepResult;

    } catch (e) {
        console.error(`Erro na Etapa ${stepIndex + 1} (${step.name}):`, e);
        // Return a structured error response that respects the interface
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
        promptTask = `
        MODO DE OPERAÇÃO: REFINAMENTO
        SEÇÃO-ALVO: "${sectionTitle}"
        CONTEÚDO ATUAL PARA BASE: """${currentContent}"""
        INSTRUÇÃO DE REFINAMENTO: Reescreva o conteúdo seguindo ESTRITAMENTE esta ordem: "${refinementInstructions}".
        `;
    } else if (childSectionsContent) {
        promptTask = `
        MODO DE OPERAÇÃO: SÍNTESE (INTRODUÇÃO)
        SEÇÃO-ALVO: "${sectionTitle}"
        TAREFA: Escreva o texto de introdução para esta seção, resumindo os seguintes conteúdos das subseções abaixo. Não crie novos pontos, apenas sintetize o que já existe.
        CONTEÚDO DAS SUBSEÇÕES PARA RESUMIR: """${childSectionsContent}"""
        `;
    } else if (currentContent) {
        promptTask = `
        MODO DE OPERAÇÃO: CONTINUAÇÃO
        SEÇÃO-ALVO: "${sectionTitle}"
        TAREFA: Continue a escrita do texto a partir do ponto em que ele parou. NÃO repita o conteúdo já escrito. Apenas conclua o raciocínio atual de forma coesa.
        ÚLTIMO TRECHO DO CONTEÚDO ATUAL: """${currentContent.slice(-2000)}"""
        `;
    } else {
        promptTask = `
        MODO DE OPERAÇÃO: GERAÇÃO INICIAL
        SEÇÃO-ALVO: "${sectionTitle}"
        TAREFA: Escrever o conteúdo completo para a seção, atendendo a todos os requisitos listados abaixo.
        
        **REQUISITOS OBRIGATÓRIOS (ENTREGA):**
        A sua resposta DEVE atender a TODOS os seguintes pontos descritos abaixo. Trate-os como um checklist rigoroso. A descrição é a sua principal diretriz.
        """
        ${sectionDescription}
        """
        `;
    }

    const prompt = `
    ATUE COMO: Consultor Especialista em Planos de Negócio, com foco nos critérios do BRDE/FSA e na metodologia SEBRAE para o projeto SCine.
    OBJETIVO GERAL DO PLANO: ${goalContext}.
    
    FONTES DE DADOS DISPONÍVEIS:
    1.  **MATRIZ ESTRATÉGICA (FONTE DA VERDADE):** ${matrixContext}
    2.  **CONTEXTO GERAL DO PROJETO (Documentos, Anotações):** """${context}"""
    
    ${promptTask}

    REGRAS GERAIS DE FORMATAÇÃO E CONDUTA:
    - O texto deve ser inteiramente narrativo, técnico e profissional.
    - Comece a escrever diretamente o conteúdo solicitado. NÃO repita o título da seção no início do texto.
    - É ESTRITAMENTE PROIBIDO criar capítulos ou subseções com novas numerações (ex: "10.8", "14.5", "2.1.1.1"). Mantenha-se fiel à estrutura do plano.
    - Use as FONTES DE DADOS para embasar todos os seus argumentos. Não invente informações.
    `;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { 
                maxOutputTokens: 8192, 
                // System instruction to prevent hallucination of document structure
                systemInstruction: "Você é um redator técnico focado e obediente. Você deve escrever APENAS o texto da seção solicitada. É ESTRITAMENTE PROIBIDO criar novos capítulos, numerações de tópicos (como 10.8, 14.5) ou fugir do tema específico da seção. Se você inventar tópicos que não existem na solicitação, o projeto será reprovado."
            }
        });
        return result.text || "Erro: A IA não retornou conteúdo.";
    } catch (e) {
        console.error(`Erro ao gerar seção ${sectionTitle}:`, e);
        return "Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.";
    }
};

export const fixSectionContentWithSearch = async (
    sectionTitle: string,
    validationFeedback: string,
    currentContent: string,
    methodology: string,
    context: string,
    goalContext: string,
    strategicMatrix: StrategicMatrix | undefined
): Promise<{ newContent: string; sources: { url: string; title: string }[] }> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash"; 

    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz estratégica não disponível.";

    const prompt = `
    ATUE COMO: Consultor Sênior de Projetos do BRDE em MODO DE CORREÇÃO.
    OBJETIVO GERAL DO PLANO: ${goalContext}.

    SEÇÃO-ALVO: "${sectionTitle}"
    CONTEÚDO ATUAL COM ERRO: """${currentContent}"""
    
    PROBLEMA IDENTIFICADO PELA AUDITORIA (FEEDBACK):
    """
    ${validationFeedback}
    """

    TAREFA OBRIGATÓRIA:
    1.  **Use a ferramenta de Pesquisa Google (googleSearch)** para encontrar informações atualizadas, dados, estatísticas ou exemplos que resolvam o problema apontado no feedback.
    2.  **Reescreva o conteúdo da seção** para corrigir COMPLETAMENTE o erro. A nova versão deve ser robusta, bem fundamentada e convincente.
    3.  **NÃO se desculpe pelo erro nem mencione o processo de correção no texto final.** Apenas entregue o texto corrigido como se fosse a versão original e correta.
    4.  Sua resposta será usada para substituir o conteúdo antigo.

    FONTES DE DADOS ADICIONAIS:
    -   MATRIZ ESTRATÉGICA: ${matrixContext}
    -   CONTEXTO GERAL DO PROJETO: """${context}"""

    REGRAS DE FORMATAÇÃO:
    - O texto deve ser inteiramente narrativo, técnico e profissional.
    - Comece a escrever diretamente o conteúdo corrigido. NÃO inclua o título da seção.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192,
                tools: [{ googleSearch: {} }],
            }
        });

        const newContent = response.text || "Erro: A IA não retornou conteúdo corrigido.";
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: { url: string; title: string }[] = [];
        if (Array.isArray(groundingChunks)) {
            groundingChunks.forEach(chunk => {
                if (chunk.web) {
                    sources.push({ url: chunk.web.uri, title: chunk.web.title });
                }
            });
        }
        
        const uniqueSources = Array.from(new Map(sources.map(item => [item.url, item])).values());

        return { newContent, sources: uniqueSources };
    } catch (e) {
        console.error(`Erro ao corrigir seção ${sectionTitle} com pesquisa:`, e);
        throw new Error("Falha na comunicação com a IA durante a correção. Tente novamente.");
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
    completedSections: { id: string; title: string; content: string }[],
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