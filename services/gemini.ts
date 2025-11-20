
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, ValueMatrix, AnalysisGap } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT } from "../constants";

// Initialize the client
const getAIClient = () => {
    if (!process.env.API_KEY) {
        console.error("API Key is missing");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to clean JSON string from Markdown fences
const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?|```/g, '');
    // Remove any text before the first '{' and after the last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned.trim();
};

// --- ETAPA 0: MATRIZ DE VALORES ---
export const generateValueMatrix = async (context: string): Promise<ValueMatrix> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
    ATENÇÃO: EXECUÇÃO DA "ETAPA 0" - CONSOLIDAÇÃO DE DADOS DO PROJETO SCINE.
    
    Você deve agir como um Auditor Contábil e de Planejamento Sênior.
    Sua tarefa é ler todos os documentos brutos e criar uma "MATRIZ_DE_VALORES_SCINE" única e confiável.

    INPUT DE DADOS (Arquivos do Usuário):
    """
    ${context}
    """

    ----------------------------------------
    ETAPA 0.A – EXTRAÇÃO BRUTA
    ----------------------------------------
    1. Identifique TODOS os valores numéricos relevantes: Receitas, Custos (OPEX/CAPEX), Assinantes, Prazos, Metas, Indicadores.
    2. Rastreie a origem (arquivo, página aproximada).

    ----------------------------------------
    ETAPA 0.B – CONSOLIDAÇÃO E REGRAS DE ESCOLHA
    ----------------------------------------
    Ao encontrar valores para a mesma grandeza, aplique estas regras para escolher o "valor oficial":
    1. PRIORIDADE: Documentos com nomes como "Revisão", "Novo", "Consolidado", "Atualizado" vencem documentos "Antigos".
    2. COERÊNCIA INTERNA: Se a soma das partes bater com o total em um documento e no outro não, use o coerente.
    3. CENÁRIOS: Se forem cenários (Pessimista/Otimista), mantenha ambos como entradas separadas.
    4. CONFLITO: Se não for possível decidir, marque status "conflito_nao_resolvido".

    NOTA IMPORTANTE: Você tem permissão para adicionar na matriz quaisquer informações relevantes (métricas, datas, taxas) que encontrar nos arquivos e que sejam úteis para o plano de negócios.

    FORMATO DE RESPOSTA (JSON RIGOROSO):
    Retorne apenas um objeto JSON com a lista de entradas consolidadas.
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192, // Increased limit
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        entries: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    categoria: { type: Type.STRING },
                                    subcategoria: { type: Type.STRING },
                                    nome: { type: Type.STRING },
                                    valor: { type: Type.STRING },
                                    moeda: { type: Type.STRING },
                                    unidade: { type: Type.STRING },
                                    periodo_referencia: { type: Type.STRING },
                                    fontes_usadas: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                arquivo: { type: Type.STRING },
                                                localizacao: { type: Type.STRING },
                                                valor_original: { type: Type.STRING }
                                            }
                                        }
                                    },
                                    criterio_escolha: { type: Type.STRING },
                                    status_resolucao: { type: Type.STRING, enum: ["consolidado", "conflito_nao_resolvido"] }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const cleanedJson = cleanJsonString(result.text || "{}");
        const json = JSON.parse(cleanedJson);
        return {
            entries: json.entries || [],
            generatedAt: Date.now()
        };

    } catch (e) {
        console.error("Erro na Etapa 0:", e);
        return { entries: [], generatedAt: Date.now() };
    }
};

// Analyze context and ask questions if needed
export const generateMissingQuestions = async (
    sectionTitle: string,
    sectionDescription: string,
    methodology: string,
    context: string,
    goalContext: string
): Promise<string[]> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
    Atue como um Consultor Sênior de Projetos Audiovisuais e Especialista em Crédito do BRDE.
    PROJETO: ${SCINE_CONTEXT}
    Seção: "${sectionTitle}". Descrição: ${sectionDescription}
    DADOS: """${context}"""
    Analise se os dados cobrem todos os pontos. Se faltar info CRÍTICA, gere até 5 perguntas ou sugestões de pesquisa. Se ok, retorne [].
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(cleanJsonString(result.text || "[]"));
    } catch (e) {
        console.error(e);
        return [];
    }
};

// Generate section content
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

    const matrixContext = valueMatrix?.entries.map(e => 
        `- ${e.nome}: ${e.valor} ${e.unidade || ''} (${e.status_resolucao === 'consolidado' ? '✅' : '⚠️'})`
    ).join('\n') || "Matriz de valores não gerada ainda.";

    let promptTask = "";

    if (refinementInstructions) {
        promptTask = `
        ATENÇÃO: MODO REVISÃO. Reescreva "${sectionTitle}" com base em: "${refinementInstructions}".
        DADOS EXTRAS: """${refinementContext}"""
        CONTEÚDO ATUAL: """${currentContent}"""
        Mantenha o rigor técnico e a CONCLUSÃO.
        `;
    } else if (childSectionsContent) {
        promptTask = `
        ATENÇÃO: MODO SÍNTESE (INTRO). Escreva a introdução de "${sectionTitle}" baseada APENAS nestes filhos já aprovados:
        """${childSectionsContent}"""
        Finalize com visão geral.
        `;
    } else if (currentContent) {
        promptTask = `
        ATENÇÃO: MODO CONTINUAÇÃO. Continue o texto a partir daqui:
        """${currentContent.slice(-2000)}"""
        Termine os pontos de "${sectionDescription}" e adicione a CONCLUSÃO.
        `;
    } else {
        promptTask = `
        TAREFA: Escreva "${sectionTitle}".
        DIRETRIZES: ${sectionDescription}
        ESTRUTURA OBRIGATÓRIA:
        - Desenvolvimento Técnico (Markdown rico)
        - **### Conclusão e Impacto** (Parágrafo final obrigatório).
        Baseie-se na MATRIZ DE VALORES abaixo.
        `;
    }

    const prompt = `
    Consultor BRDE/FSA. Projeto SCine.
    OBJETIVO: ${goalContext}
    REGRAS BRDE: ${BRDE_FSA_RULES}
    MATRIZ VALORES (FONTE DA VERDADE):
    ${matrixContext}
    CONTEXTO ANTERIOR: ${previousSections ? previousSections.slice(-3000) : "Início."}
    INPUTS GERAIS: """${context}"""
    RESPOSTAS USUÁRIO: """${userAnswers}"""
    ${promptTask}
    `;

    const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { 
            maxOutputTokens: 8192,
            tools: [{ googleSearch: {} }] 
        }
    });

    return result.text || "Erro ao gerar conteúdo.";
};

export const generateFinancialData = async (
    context: string, 
    methodology: string, 
    goalContext: string, 
    userAnswers: string,
    previousSections: string = "",
    valueMatrix: ValueMatrix | undefined
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";
    const matrixContext = valueMatrix?.entries.map(e => `- ${e.nome}: ${e.valor}`).join('\n') || "N/A";

    const prompt = `
    Analista Financeiro BRDE. SCine.
    REGRAS: ${BRDE_FSA_RULES}
    MATRIZ DADOS: ${matrixContext}
    Gere projeção 5 anos (considerando 2 anos carência).
    Output JSON: { "analysis": "Markdown text with conclusion", "data": [{ "year": "Ano 1", "revenue": 0, "expenses": 0, "profit": 0 }] }
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
                        analysis: { type: Type.STRING },
                        data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, revenue: { type: Type.NUMBER }, expenses: { type: Type.NUMBER }, profit: { type: Type.NUMBER } } } }
                    }
                }
            }
        });
        const cleanedJson = cleanJsonString(result.text || "{}");
        const json = JSON.parse(cleanedJson);
        return { analysis: json.analysis || "Erro.", data: json.data || [] };
    } catch (e) { console.error(e); return { analysis: "Erro.", data: [] }; }
};

// --- DIAGNOSIS WITH HISTORY TRACKING ---
export const generateGlobalDiagnosis = async (
    context: string, 
    previousHistory: DiagnosisResponse[] = []
): Promise<DiagnosisResponse> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    // Extract previous gaps to see if they are resolved
    const lastDiagnosis = previousHistory.length > 0 ? previousHistory[previousHistory.length - 1] : null;
    const previousGapsContext = lastDiagnosis ? 
        JSON.stringify(lastDiagnosis.gaps.filter(g => g.status !== 'RESOLVED')) : "Nenhum diagnóstico anterior.";

    const prompt = `
    Você é o Gerente de Análise de Projetos do FSA (BRDE).
    
    TAREFA: Realizar DIAGNÓSTICO EVOLUTIVO do projeto SCine.
    
    DADOS ATUAIS (Arquivos):
    """
    ${context}
    """

    HISTÓRICO DE PENDÊNCIAS (Do diagnóstico anterior):
    """
    ${previousGapsContext}
    """

    INSTRUÇÕES DE ANÁLISE:
    1. Entenda o projeto atual.
    2. VERIFICAÇÃO DE PENDÊNCIAS: Para cada gap listado no histórico, verifique se os *novos dados* resolveram o problema.
       - Se resolveu totalmente: Status "RESOLVED", Score 100, Feedback "O usuário anexou o arquivo X com a informação correta."
       - Se resolveu parcialmente: Status "PARTIAL", Score 50, Feedback "Informou X, mas ainda falta Y."
       - Se não resolveu: Status "OPEN", Score 0.
    3. NOVOS GAPS: Identifique *novas* informações críticas que faltam para aprovação no BRDE (Orçamentos, Cartas de Intenção, Pesquisas).
    4. ESTRATÉGIA: Sugira caminhos.

    RETORNO (JSON):
    {
        "projectSummary": "...",
        "overallReadiness": 0-100,
        "gaps": [
            { "id": "gap_1", "description": "Falta CAC", "status": "RESOLVED", "resolutionScore": 100, "aiFeedback": "Resolvido: O arquivo 'Metrics.pdf' contém o CAC." },
            { "id": "gap_2", "description": "Falta Orçamento Van", "status": "OPEN", "resolutionScore": 0, "aiFeedback": "Ainda não encontrado." }
        ],
        "strategicPaths": [...],
        "suggestedSections": [...]
    }
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192, // Increase token limit to avoid JSON truncation
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
                                    aiFeedback: { type: Type.STRING }
                                }
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
                    }
                }
            }
        });
        
        // Clean the string before parsing to handle potential issues
        const cleanedJson = cleanJsonString(result.text || "{}");
        const response = JSON.parse(cleanedJson);
        
        return {
            ...response,
            timestamp: Date.now()
        };
    } catch (e) {
        console.error("Erro no Diagnóstico:", e);
        throw new Error("Falha no diagnóstico. A resposta da IA foi interrompida ou inválida. Tente enviar menos arquivos de uma vez.");
    }
};

export const generateProjectImage = async (promptDescription: string, type: 'logo' | 'map' | 'floorplan'): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: promptDescription,
            config: { numberOfImages: 1, aspectRatio: type === 'logo' ? '1:1' : '16:9', outputMimeType: 'image/jpeg' }
        });
        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64) throw new Error("No image generated");
        return base64;
    } catch (e) { console.error("Image Gen Error", e); throw e; }
};
