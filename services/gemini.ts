
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, ValueMatrix } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT } from "../constants";

// Initialize the client
const getAIClient = () => {
    if (!process.env.API_KEY) {
        console.error("API Key is missing");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
                                    valor: { type: Type.STRING }, // String to handle mixed types or formatted numbers initially
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
        
        const json = JSON.parse(result.text || "{\"entries\": []}");
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
    
    Objetivo: Estamos construindo a seção "${sectionTitle}" do Plano de Negócios da SCine.
    Descrição da Seção e Subitens Obrigatórios: ${sectionDescription}
    
    DADOS ATUAIS DO USUÁRIO (Arquivos e Anotações):
    """
    ${context}
    """

    TAREFA:
    Analise se os dados fornecidos cobrem todos os pontos exigidos na descrição da seção.
    Se faltarem informações CRÍTICAS para a aprovação do crédito (ex: valores, datas, nomes de parceiros), gere uma lista de até 5 perguntas diretas para o empreendedor ou sugestões de pesquisa externa.
    
    Se houver informações suficientes para um primeiro esboço, retorne uma lista vazia [].
    
    Output esperado: Apenas um JSON Array de strings. Ex: ["Qual o valor do aluguel?", "Pesquisar dados do IBGE sobre renda em SC"]
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(result.text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
};

// Generate the actual content for a section
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
    childSectionsContent: string = "", // Content from sub-sections for Intro synthesis
    valueMatrix: ValueMatrix | undefined // STEP 0 MATRIX INJECTION
): Promise<string> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    // Format Value Matrix for Prompt
    const matrixContext = valueMatrix?.entries.map(e => 
        `- ${e.nome}: ${e.valor} ${e.unidade || ''} (${e.status_resolucao === 'consolidado' ? '✅' : '⚠️'})`
    ).join('\n') || "Matriz de valores não gerada ainda.";

    let promptTask = "";

    if (refinementInstructions) {
        // REFINEMENT MODE
        promptTask = `
        ATENÇÃO: MODO DE REVISÃO / REFINAMENTO.
        
        O usuário solicitou alterações na seção já escrita: "${sectionTitle}".
        
        CONTEÚDO ATUAL:
        """
        ${currentContent}
        """
        
        INSTRUÇÕES DO USUÁRIO PARA AJUSTE:
        "${refinementInstructions}"
        
        ${refinementContext ? `DADOS EXTRAS PARA ESTA REVISÃO (Arquivo Anexado): \n"""${refinementContext}"""` : ''}

        TAREFA:
        1. Reescreva a seção incorporando as solicitações do usuário.
        2. Mantenha o rigor técnico e as diretrizes originais da seção: "${sectionDescription}".
        3. Se o usuário pedir algo absurdo ou fora das regras do BRDE, faça o ajuste mas adicione uma "NOTA DO CONSULTOR" em itálico alertando sobre o risco.
        4. Mantenha a formatação Markdown.
        5. OBRIGATÓRIO: Mantenha ou refine a CONCLUSÃO no final do texto.
        `;

    } else if (childSectionsContent) {
        // INTRO SYNTHESIS MODE
        promptTask = `
        ATENÇÃO: MODO DE SÍNTESE (INTRODUÇÃO).
        Você está escrevendo a Introdução/Resumo Executivo da Seção: "${sectionTitle}".
        
        ABAIXO ESTÁ O CONTEÚDO JÁ APROVADO DAS SUB-SEÇÕES DESTE CAPÍTULO:
        """
        ${childSectionsContent}
        """

        TAREFA:
        1. Escreva uma INTRODUÇÃO EXECUTIVA que sintetize os pontos principais acima.
        2. Não invente dados novos. Use os dados das sub-seções para criar uma narrativa coesa.
        3. Prepare o leitor para os detalhes que virão a seguir.
        4. Mantenha o tom profissional para um banco de fomento (BRDE).
        5. OBRIGATÓRIO: Finalize com um parágrafo de "Visão Geral" que resume o impacto deste capítulo.
        `;

    } else if (currentContent) {
        // CONTINUATION MODE
        promptTask = `
        ATENÇÃO: O usuário solicitou a CONTINUAÇÃO da escrita desta seção, pois ela foi cortada ou precisa de mais detalhes.
        
        CONTEÚDO JÁ ESCRITO (NÃO REPITA ISSO, APENAS CONTINUE):
        """
        ${currentContent.slice(-2000)} 
        """
        (O texto acima é apenas o final do que já existe).

        TAREFA DE CONTINUAÇÃO:
        1. Identifique onde o texto parou (pode ser no meio de uma frase).
        2. Complete a ideia interrompida.
        3. Continue desenvolvendo os pontos restantes da descrição da seção: "${sectionDescription}".
        4. Mantenha a formatação Markdown e o tom técnico.
        5. OBRIGATÓRIO: Ao terminar o conteúdo, adicione o bloco de CONCLUSÃO.
        `;
    } else {
        // NEW GENERATION MODE
        promptTask = `
        TAREFA:
        Escreva o conteúdo completo para a seção: "${sectionTitle}".
        
        DIRETRIZES DE ENTREGA (OBRIGATÓRIO SEGUIR CADA PONTO):
        ${sectionDescription}
        
        ESTILO:
        1. Use tom profissional, técnico e persuasivo para um comitê de crédito bancário.
        2. Baseie-se EXCLUSIVAMENTE na "MATRIZ DE VALORES CONSOLIDADA" abaixo para números. Não invente.
        3. Use Markdown rico (Tabelas para dados comparativos, Listas, Negritos).
        4. Foque estritamente no tema desta sub-seção (não divague).
        
        ESTRUTURA DE SAÍDA OBRIGATÓRIA:
        - Desenvolvimento Técnico (tabelas, análises, dados)
        - ...
        - **### Conclusão e Impacto (SÍNTESE DA SEÇÃO)**
          (Escreva um parágrafo final obrigatório resumindo o ponto principal desta seção específica e sua conexão com a viabilidade do negócio ou aprovação do crédito).
        `;
    }

    const prompt = `
    Você é um Consultor Especialista em Planos de Negócios para o Setor Audiovisual (OTT/Streaming) e Perito em Financiamento Público (BRDE/FSA).
    
    CONTEXTO DO PROJETO:
    ${SCINE_CONTEXT}

    OBJETIVO: ${goalContext}
    METODOLOGIA: ${methodology}

    REGRAS DE CRÉDITO (BRDE):
    ${BRDE_FSA_RULES}

    ---------------------------------------------------
    MATRIZ DE VALORES CONSOLIDADA (ETAPA 0 - FONTE DA VERDADE):
    Use estes números como base oficial. Se houver conflito com o texto bruto, a Matriz vence.
    ${matrixContext}
    ---------------------------------------------------

    CONTEXTO DE CONTINUIDADE (Seções anteriores):
    ${previousSections ? previousSections.slice(-3000) : "Início do plano."}

    INPUTS GERAIS (Arquivos de Texto Bruto para Contexto Qualitativo):
    """
    ${context}
    """

    RESPOSTAS DO USUÁRIO (Entrevista):
    """
    ${userAnswers}
    """

    ${promptTask}
    
    FERRAMENTA: Use Google Search se precisar validar dados de mercado macro (PIB, assinantes streaming Brasil, etc) que não estejam na matriz.
    `;

    const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    return result.text || "Erro ao gerar conteúdo.";
};

// Generate structured financial data
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

    // Format Value Matrix for Prompt
    const matrixContext = valueMatrix?.entries.map(e => 
        `- ${e.nome}: ${e.valor} ${e.unidade || ''}`
    ).join('\n') || "Matriz não disponível.";

    const prompt = `
    Atue como um Analista Financeiro do BRDE.
    
    CONTEXTO DO PROJETO: ${SCINE_CONTEXT}
    REGRAS DE FINANCIAMENTO: ${BRDE_FSA_RULES}
    
    FONTE DE DADOS OFICIAL (MATRIZ DE VALORES):
    ${matrixContext}
    
    CONTEXTO ANTERIOR:
    ${previousSections}

    TAREFA:
    1. Gere uma projeção financeira de 5 anos (Ano 1 ao Ano 5) baseada estritamente na Matriz de Valores acima.
    2. Considere a carência de 2 anos do BRDE (pagamento apenas de juros).
    3. Calcule Receita (Assinaturas + B2B), Despesas (OPEX + Financeiras) e Lucro Líquido.
    4. Escreva uma análise textual justificando os números e calculando indicadores: VPL, TIR, Payback e Ponto de Equilíbrio.
    5. OBRIGATÓRIO: Finalize com uma Conclusão sobre a Solvência do Projeto.

    RETORNO (JSON):
    {
        "analysis": "Texto completo da análise financeira em Markdown... (Incluindo a conclusão)",
        "data": [
            { "year": "Ano 1", "revenue": 100000, "expenses": 80000, "profit": 20000 },
            ...
        ]
    }
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING },
                        data: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.STRING },
                                    revenue: { type: Type.NUMBER },
                                    expenses: { type: Type.NUMBER },
                                    profit: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });
        const json = JSON.parse(result.text || "{}");
        return {
            analysis: json.analysis || "Erro na análise.",
            data: json.data || []
        };
    } catch (e) {
        console.error(e);
        return { analysis: "Erro ao gerar dados financeiros.", data: [] };
    }
};


export const generateGlobalDiagnosis = async (context: string): Promise<DiagnosisResponse> => {
    const ai = getAIClient();
    const model = "gemini-2.5-flash";

    const prompt = `
    Você é o Gerente de Análise de Projetos do FSA (Fundo Setorial do Audiovisual).
    Recebemos um novo projeto (SCine) para análise de viabilidade.
    
    DADOS DO PROJETO (Arquivos brutos):
    """
    ${context}
    """
    
    TAREFA:
    Faça um diagnóstico rigoroso dos documentos enviados.
    1. Entenda o projeto: O que é? Qual o diferencial?
    2. Identifique caminhos estratégicos possíveis.
    3. Identifique GAPS CRÍTICOS: O que falta para aprovar o crédito no BRDE? (Faltam orçamentos? Faltam cartas de intenção? Falta pesquisa de mercado?)
    4. Sugira NOVAS SEÇÕES para o plano se necessário.

    RETORNO (JSON):
    {
        "projectSummary": "Texto explicativo...",
        "strategicPaths": [
            { "title": "...", "description": "...", "pros": ["..."], "cons": ["..."] }
        ],
        "missingCriticalInfo": ["..."],
        "suggestedSections": [
             { "chapter": "...", "title": "...", "description": "..." }
        ]
    }
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        projectSummary: { type: Type.STRING },
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
                        missingCriticalInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedSections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    chapter: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(result.text || "{}");
    } catch (e) {
        console.error(e);
        throw new Error("Falha no diagnóstico");
    }
};


export const generateProjectImage = async (promptDescription: string, type: 'logo' | 'map' | 'floorplan'): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: promptDescription,
            config: {
                numberOfImages: 1,
                aspectRatio: type === 'logo' ? '1:1' : '16:9',
                outputMimeType: 'image/jpeg'
            }
        });
        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64) throw new Error("No image generated");
        return base64;
    } catch (e) {
        console.error("Image Gen Error", e);
        throw e;
    }
};
