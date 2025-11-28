import { GoogleGenAI, Type } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, ValueMatrix } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT } from "../constants";

const getAIClient = () => {
    const apiKey = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY : undefined)
        || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || process.env.API_KEY : undefined);

    if (!apiKey) {
        console.error("API Key is missing");
        return null;
    }
    try {
        return new GoogleGenAI({ apiKey });
    } catch (err) {
        console.error("Failed to initialize GoogleGenAI", err);
        return null;
    }
};

const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let cleaned = text.replace(/```json\n?|```/g, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned.trim();
};

const isMatrixUsable = (matrix: ValueMatrix | undefined): matrix is ValueMatrix => {
    return !!matrix && Array.isArray(matrix.entries) && matrix.entries.length > 0;
};

const formatMatrixForPrompt = (matrix: ValueMatrix | undefined): string => {
    if (!isMatrixUsable(matrix)) {
        return "Matriz de valores ausente ou inválida. Gere a Etapa 0 antes de avançar.";
    }
    return matrix.entries.map(e => `- ${e.nome} (${e.categoria}${e.subcategoria ? `/${e.subcategoria}` : ''}): ${e.valor} ${e.unidade || ''} [Status: ${e.statusResolucao}]`).join('\n');
};

export const generateValueMatrix = async (context: string): Promise<ValueMatrix> => {
    try {
        const ai = getAIClient();
        if (!ai) {
            throw new Error("AI client unavailable");
        }
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

    2. REGRA DA COERÊNCIA MATEMÁTICA:
       - Se houver dúvida, verifique a soma. Se (Receita Mensal * 12) = Receita Anual no documento A, mas não no B, o documento A é mais confiável.

    3. REGRA DE CENÁRIOS:
       - Se os valores diferentes forem claramente "Cenário Otimista" vs "Cenário Realista", NÃO considere conflito. Crie duas entradas separadas na matriz.

    4. REGRA DE CONFLITO INSOLÚVEL:
       - Se não for possível decidir, marque 'statusResolucao': "conflito_nao_resolvido".

    ----------------------------------------
    FORMATO DE SAÍDA (JSON):
    ----------------------------------------
    Gere um JSON contendo apenas a matriz consolidada.
    Não invente valores. Se não existir nos documentos, não crie.
    Nunca cite nomes de arquivos no texto final do plano; use-os apenas nos campos de rastreio (fontesUsadas). Qualquer número no contexto que não esteja rastreado deve ser ignorado.
    `;

        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        entries: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    categoria: { type: Type.STRING },
                                    subcategoria: { type: Type.STRING },
                                    nome: { type: Type.STRING },
                                    valor: { type: Type.NUMBER },
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

        const cleanedJson = cleanJsonString((result as any).text || "{}");
        const json = JSON.parse(cleanedJson);

        if (!Array.isArray(json.entries) || json.entries.length === 0) {
            return { entries: [], generatedAt: Date.now(), summary: "Matriz vazia ou não gerada." };
        }

        return {
            entries: json.entries,
            summary: json.summary || "Matriz gerada.",
            generatedAt: Date.now()
        };

    } catch (e) {
        console.error("Erro na Etapa 0 (Matriz de Valores):", e);
        return { entries: [], generatedAt: Date.now(), summary: "Erro na geração." };
    }
};

export const generateMissingQuestions = async (
    sectionTitle: string,
    sectionDescription: string,
    methodology: string,
    context: string,
    goalContext: string
): Promise<string[]> => {
    try {
        const ai = getAIClient();
        if (!ai) {
            throw new Error("AI client unavailable");
        }
        const model = "gemini-2.5-flash";

        const prompt = `
    Atue como um Consultor Sênior de Projetos Audiovisuais e Especialista em Crédito do BRDE.
    PROJETO: ${SCINE_CONTEXT}
    Seção: "${sectionTitle}". Descrição: ${sectionDescription}
    DADOS: """${context}"""
    Analise se os dados cobrem todos os pontos. Se faltar info CRÍTICA, gere até 5 perguntas ou sugestões de pesquisa. Se ok, retorne [].
    Nunca cite nomes de arquivos internos, PDFs, planilhas ou da matriz. Se um número não estiver na Matriz de Valores, não invente.
    `;

        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(cleanJsonString((result as any).text || "[]"));
    } catch (e) {
        console.error(e);
        return [];
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
    valueMatrix: ValueMatrix | undefined
): Promise<string> => {
    const ai = getAIClient();
    if (!ai) {
        return "Falha ao gerar conteúdo: configure a chave GEMINI_API_KEY.";
    }
    if (!isMatrixUsable(valueMatrix)) {
        return "Matriz de valores ausente ou inválida. Gere a Etapa 0 antes de produzir esta seção.";
    }
    const model = "gemini-2.5-flash";

    const matrixContext = formatMatrixForPrompt(valueMatrix);

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

        IMPORTANTE: Use a MATRIZ DE VALORES abaixo como sua única fonte de verdade para números.
        `;
    }

    const prompt = `
    Consultor BRDE/FSA. Projeto SCine.
    OBJETIVO: ${goalContext}
    REGRAS BRDE: ${BRDE_FSA_RULES}

    === FONTE DA VERDADE (NÚMEROS OFICIAIS) ===
    ${matrixContext}
    ============================================

    CONTEXTO ANTERIOR: ${previousSections ? previousSections.slice(-3000) : "Início."}
    INPUTS GERAIS (texto qualitativo, NÃO usar números daqui como base): """${context}"""
    RESPOSTAS USUÁRIO: """${userAnswers}"""
    ${promptTask}

    REGRAS CRÍTICAS:
    - Use APENAS os números fornecidos na Matriz de Valores. Ignore quaisquer números presentes no contexto bruto ou nas respostas do usuário se não estiverem na matriz.
    - Não invente valores numéricos ausentes; se não houver número na matriz, mantenha a abordagem qualitativa.
    - Nunca mencione nomes de arquivos internos, PDFs, planilhas, JSONs ou o nome da matriz no texto final.
    - Apresente as informações como parte orgânica do plano, sem citar fontes técnicas.
    `;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                maxOutputTokens: 8192,
                tools: [{ googleSearch: {} }]
            }
        });

        return (result as any).text || "Erro ao gerar conteúdo.";
    } catch (error) {
        console.error(error);
        return "Erro ao gerar conteúdo.";
    }
};

export const generateFinancialData = async (
    context: string,
    methodology: string,
    goalContext: string,
    userAnswers: string,
    previousSections: string = "",
    valueMatrix: ValueMatrix | undefined
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    if (!isMatrixUsable(valueMatrix)) {
        return { analysis: "Para gerar o planejamento financeiro, finalize a Matriz de Valores (Etapa 0).", data: [] };
    }
    try {
        const ai = getAIClient();
        if (!ai) {
            throw new Error("AI client unavailable");
        }
        const model = "gemini-2.5-flash";
        const matrixContext = formatMatrixForPrompt(valueMatrix);

        const prompt = `
    Analista Financeiro BRDE. SCine.
    REGRAS: ${BRDE_FSA_RULES}
    MATRIZ DADOS (USE SOMENTE ESTES NÚMEROS; ignore qualquer número no contexto bruto):
    ${matrixContext}

    Contexto qualitativo (não usar como fonte numérica oficial): """${context}"""
    Gere projeção 5 anos (considerando 2 anos carência).
    Não invente números que não estejam na matriz. Se faltar valor crítico, sinalize no campo "analysis" e retorne arrays vazios.
    Output JSON: { "analysis": "Markdown text with conclusão", "data": [{ "year": "Ano 1", "revenue": 0, "expenses": 0, "profit": 0 }] }
    NUNCA mencione nomes de arquivos internos, PDFs, planilhas ou JSONs.
    `;

        const result = await ai.models.generateContent({
            model,
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
        const cleanedJson = cleanJsonString((result as any).text || "{}");
        const json = JSON.parse(cleanedJson);
        return { analysis: json.analysis || "Erro.", data: json.data || [] };
    } catch (e) { console.error(e); return { analysis: "Erro.", data: [] }; }
};

export const generateGlobalDiagnosis = async (
    context: string,
    previousHistory: DiagnosisResponse[] = [],
    valueMatrix?: ValueMatrix
): Promise<DiagnosisResponse> => {
    try {
        const ai = getAIClient();
        if (!ai) {
            throw new Error("AI client unavailable");
        }
        const model = "gemini-2.5-flash";

        const lastDiagnosis = previousHistory.length > 0 ? previousHistory[previousHistory.length - 1] : null;
        const previousGapsContext = lastDiagnosis ?
            JSON.stringify(lastDiagnosis.gaps.filter(g => g.status !== 'RESOLVED')) : "Nenhum diagnóstico anterior.";

        const matrixContext = formatMatrixForPrompt(valueMatrix);

        const prompt = `
    Você é o Gerente de Análise de Projetos do FSA (BRDE).

    TAREFA: Realizar DIAGNÓSTICO EVOLUTIVO do projeto SCine.

    MATRIZ DE VALORES (fonte primária de números):
    ${matrixContext}

    DADOS ATUAIS (Arquivos - texto qualitativo, ignore números que não estejam na matriz):
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
       - Se resolveu totalmente: Status "RESOLVED", Score 100, Feedback sem citar arquivos.
       - Se resolveu parcialmente: Status "PARTIAL", Score 50, Feedback "Informou X, mas ainda falta Y." (sem citar arquivos ou PDFs).
       - Se não resolveu: Status "OPEN", Score 0.
    3. NOVOS GAPS: Identifique *novas* informações críticas que faltam para aprovação no BRDE (Orçamentos, Cartas de Intenção, Pesquisas), sempre sem inventar números fora da matriz.
    4. ESTRATÉGIA: Sugira caminhos.

    REGRAS DE REDAÇÃO:
    - Use apenas números presentes na Matriz de Valores. Qualquer número solto no contexto deve ser ignorado.
    - NÃO mencione nomes de arquivos internos, PDFs, planilhas, JSONs ou o nome da matriz no texto final.

    RETORNO (JSON):
    {
        "projectSummary": "...",
        "overallReadiness": 0-100,
        "gaps": [
            { "id": "gap_1", "description": "Falta CAC", "status": "RESOLVED", "resolutionScore": 100, "aiFeedback": "Resolvido." },
            { "id": "gap_2", "description": "Falta Orçamento Van", "status": "OPEN", "resolutionScore": 0, "aiFeedback": "Ainda não encontrado." }
        ],
        "strategicPaths": [...],
        "suggestedSections": [...]
    }
    `;

        const result = await ai.models.generateContent({
            model,
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

        const cleanedJson = cleanJsonString((result as any).text || "{}");
        const response = JSON.parse(cleanedJson);

        return {
            projectSummary: response.projectSummary || "Diagnóstico não pôde ser gerado.",
            overallReadiness: typeof response.overallReadiness === "number" ? response.overallReadiness : 0,
            gaps: Array.isArray(response.gaps) ? response.gaps : [],
            strategicPaths: Array.isArray(response.strategicPaths) ? response.strategicPaths : [],
            suggestedSections: Array.isArray(response.suggestedSections) ? response.suggestedSections : [],
            timestamp: Date.now()
        };
    } catch (e) {
        console.error("Erro no Diagnóstico:", e);
        return {
            projectSummary: "Diagnóstico indisponível (falha na IA).",
            overallReadiness: 0,
            gaps: [],
            strategicPaths: [],
            suggestedSections: [],
            timestamp: Date.now()
        };
    }
};

export const generateProjectImage = async (promptDescription: string, type: 'logo' | 'map' | 'floorplan'): Promise<string> => {
    const ai = getAIClient();
    if (!ai) {
        throw new Error('AI client unavailable');
    }
    const aspectRatio = type === 'logo' ? '1:1' : '16:9';
    const response = await ai.models.generateContent({
        model: 'imagen-4.0-generate-001',
        contents: [
            { role: 'user', parts: [{ text: promptDescription }] }
        ],
        config: {
            responseMimeType: 'image/png',
            responseSchema: { type: Type.STRING },
            aspectRatio
        } as any
    });

    const imagePart = (response as any).response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const base64 = imagePart?.inlineData?.data;
    if (!base64) {
        throw new Error('No image generated');
    }
    return base64;
};
