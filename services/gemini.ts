import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { FinancialYear, ProjectAsset, DiagnosisResponse, PlanSection, StrategicMatrix, AnalysisGap, BusinessGoal, DiagnosisStepResult, CanvasBlock, SwotBlock, MatrixItem, SectionStatus } from "../types";
import { BRDE_FSA_RULES, SCINE_CONTEXT, DIAGNOSIS_STEPS } from "../constants";

// FIX: Define modelos de IA distintos para tarefas diferentes, otimizando custo e qualidade.
// 'flash' é usado para o diagnóstico rápido e estruturado.
const AI_DIAGNOSIS_MODEL = "gemini-2.5-flash";
// 'pro' é usado para a geração de conteúdo textual, que exige maior profundidade e análise.
const AI_WRITER_MODEL = "gemini-3-pro-preview";

// --- RETRY LOGIC CONFIGURATION ---
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper function to execute AI calls with exponential backoff for 429 errors.
 */
async function withRetry<T>(fn: () => Promise<T>, operationName: string): Promise<T> {
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = 
        error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('quota') ||
        error?.message?.includes('RESOURCE_EXHAUSTED');
      
      const isServerOverload = error?.status === 503;

      if ((isRateLimit || isServerOverload) && attempt < MAX_RETRIES) {
        attempt++;
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1); // 2s, 4s, 8s...
        console.warn(`[Gemini] Rate limit hit for ${operationName}. Retrying in ${delay}ms (Attempt ${attempt}/${MAX_RETRIES})...`);
        await wait(delay);
        continue;
      }
      
      // If not retry-able or max retries reached, throw the error
      throw error;
    }
  }
}

// Helper to determine MIME type from base64 string
const getBase64MimeType = (base64Data: string): string => {
    if (base64Data.startsWith('/9j/')) return 'image/jpeg';
    if (base64Data.startsWith('iVBORw0KGgo=')) return 'image/png';
    if (base64Data.startsWith('R0lGODlh')) return 'image/gif';
    if (base64Data.startsWith('UklGR')) return 'image/webp';
    return 'image/png'; // Default
};

// Helper to clean JSON string safely (State Machine Parser with Candidate Search)
const cleanJsonString = (text: string): string => {
    if (!text) return "{}";

    // Internal function to sanitize a specific candidate string (remove comments/trailing commas)
    const sanitizeCandidate = (jsonCandidate: string): string => {
        let out = '';
        let i = 0;
        let inString = false;
        let isEscaped = false;

        while (i < jsonCandidate.length) {
            const char = jsonCandidate[i];
            const next = jsonCandidate[i + 1] || '';

            if (inString) {
                out += char;
                if (isEscaped) {
                    isEscaped = false;
                } else if (char === '\\') {
                    isEscaped = true;
                } else if (char === '"') {
                    inString = false;
                }
                i++;
                continue;
            }

            // Start string
            if (char === '"') {
                inString = true;
                out += char;
                i++;
                continue;
            }

            // Remove Single-line comments //
            if (char === '/' && next === '/') {
                i += 2;
                while (i < jsonCandidate.length && jsonCandidate[i] !== '\n') i++;
                continue; 
            }

            // Remove Block comments /* */
            if (char === '/' && next === '*') {
                i += 2;
                while (i < jsonCandidate.length && !(jsonCandidate[i] === '*' && jsonCandidate[i + 1] === '/')) i++;
                i += 2;
                continue;
            }

            // Remove Trailing Commas
            if (char === ',') {
                let j = i + 1;
                while (j < jsonCandidate.length && /\s/.test(jsonCandidate[j])) j++;
                if (j < jsonCandidate.length && (jsonCandidate[j] === '}' || jsonCandidate[j] === ']')) {
                    i++;
                    continue;
                }
            }

            out += char;
            i++;
        }
        return out;
    };

    // Main logic: Search for a valid JSON block
    // We iterate through potential start positions ('{' or '[')
    let startIndex = 0;
    while (startIndex < text.length) {
        const nextOpenBrace = text.indexOf('{', startIndex);
        const nextOpenBracket = text.indexOf('[', startIndex);
        let currentStart = -1;

        // No more potential starts
        if (nextOpenBrace === -1 && nextOpenBracket === -1) break;

        // Determine which comes first
        if (nextOpenBrace !== -1 && nextOpenBracket !== -1) {
            currentStart = Math.min(nextOpenBrace, nextOpenBracket);
        } else {
            currentStart = nextOpenBrace !== -1 ? nextOpenBrace : nextOpenBracket;
        }

        // If this attempt fails, next search starts after this position
        startIndex = currentStart + 1;

        const startChar = text[currentStart];
        const endChar = startChar === '{' ? '}' : ']';
        
        // Walk forward to find the matching closing brace, respecting strings/escapes
        let depth = 0;
        let inString = false;
        let isEscaped = false;
        let end = -1;

        for (let i = currentStart; i < text.length; i++) {
            const char = text[i];
            
            if (inString) {
                if (isEscaped) isEscaped = false;
                else if (char === '\\') isEscaped = true;
                else if (char === '"') inString = false;
            } else {
                if (char === '"') {
                    inString = true;
                } else if (char === startChar) {
                    depth++;
                } else if (char === endChar) {
                    depth--;
                    if (depth === 0) {
                        end = i;
                        break;
                    }
                }
            }
        }

        if (end !== -1) {
            // We found a balanced block
            const rawCandidate = text.substring(currentStart, end + 1);
            const sanitized = sanitizeCandidate(rawCandidate);
            
            try {
                // Check if it's valid JSON
                JSON.parse(sanitized);
                return sanitized; // Success!
            } catch (e) {
                // If it failed parsing (e.g. "{example}" is not valid JSON), continue loop to find next block
                continue;
            }
        }
    }

    return "{}";
};

// --- NEW 10-STEP DIAGNOSIS ENGINE ---
export const runDiagnosisStep = async (
    stepIndex: number,
    fullContext: string,
    currentMatrix: StrategicMatrix,
    assets: ProjectAsset[]
): Promise<DiagnosisStepResult> => {
    // Instantiate AI client before each call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_DIAGNOSIS_MODEL;
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
    BLOCOS-ALVO NESTA ETAPA: ${step.matrixTargets.join(', ')}

    INSTRUÇÕES DETALHADAS PARA ESTA ETAPA:

    1.  **EXTRAÇÃO DE DADOS PROFUNDA:**
        -   **Análise Avançada de Arquivos:** Extraia dados de tabelas, listas e informações implícitas. Limpe cabeçalhos/rodapés e normalize o texto. Identifique e consolide informações repetidas.
        -   **Busca Ativa (Metodologia SEBRAE):** Procure ativamente por: Público-alvo, necessidades/dores, concorrentes, proposta de valor, tendências, barreiras de entrada, canais, estrutura de receita, custos e riscos.
        -   **Busca Ativa (Critérios BRDE/FSA):** Procure ativamente por: Provas de inovação, aderência técnica, justificativa tecnológica, elementos de acessibilidade, riscos operacionais/financeiros, fragilidades técnicas, gargalos de execução e contradições entre arquivos.
        -   **Análise de Imagens:** Analise as imagens fornecidas (se houver) para extrair informações sobre layouts, mapas, logos, ou outros dados visuais que complementem o contexto textual.

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

    5.  **PREENCHIMENTO DA MATRIZ (REGRA CRÍTICA):**
        -   Preencha APENAS os blocos da Matriz Estratégica relacionados a esta etapa (${step.matrixTargets.join(', ')}).
        -   **Sua resposta JSON DEVE conter as chaves para os blocos alvo, mesmo que você não encontre informações para eles.** Neste caso, os 'items' devem ser um array vazio e a 'description' deve ser "Informações insuficientes no contexto para preencher este bloco.", mas a estrutura do bloco deve existir.
        -   Atualize o 'clarityLevel' (0-100) de cada bloco modificado, com base na qualidade e completude da informação encontrada.

    6.  **ETAPA FINAL (10/10):** Se esta for a última etapa, sua missão é consolidar a análise:
        -   Calcule o 'overallReadiness' (0-100). Se o contexto inicial for vazio, o Nível de Prontidão DEVE ser 0.
        -   Identifique as 'gaps' (pendências) finais do projeto, com base na Matriz completa.

    REGRAS GERAIS:
    -   **FORMATO JSON RIGOROSO (MANDATÓRIO):** Sua resposta DEVE ser um JSON VÁLIDO.
        -   **É ESTRITAMENTE PROIBIDO incluir vírgulas finais (trailing commas).**
        -   **Exemplo de ERRO:** \`[ { "item": "A" }, { "item": "B" }, ]\` (vírgula depois de "B").
        -   **Exemplo CORRETO:** \`[ { "item": "A" }, { "item": "B" } ]\` (sem vírgula depois de "B").
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
            logs: { type: Type.ARRAY, items: { type: Type.STRING } },
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

    // FIX: Inclui as imagens (assets) como `inlineData` para análise multimodal.
    const imageParts = assets.map(asset => ({
        inlineData: {
            mimeType: getBase64MimeType(asset.data),
            data: asset.data,
        }
    }));

    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
                model,
                contents: { parts: [{ text: prompt }, ...imageParts] },
                config: { maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema }
            }),
            `Diagnóstico Passo ${stepIndex + 1}`
        );
        
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        
        // Deeper validation of the returned JSON structure to prevent runtime errors.
        if (!Array.isArray(json.logs)) {
             json.logs = [`Alerta: A IA retornou 'logs' em um formato inválido.`]; 
        }
        if (!json.matrixUpdate || typeof json.matrixUpdate !== 'object') {
             json.matrixUpdate = {};
             json.logs.push("Alerta: A IA retornou 'matrixUpdate' em um formato inválido.");
        } else {
            // Deeper validation of matrix structure
            if (json.matrixUpdate.swot && typeof json.matrixUpdate.swot !== 'object') {
                json.matrixUpdate.swot = {};
                json.logs.push("Alerta: Bloco 'swot' da matriz retornado em formato inválido.");
            }
        }
        if (stepIndex === 9 && json.finalDiagnosis) {
            if(typeof json.finalDiagnosis !== 'object') {
                json.finalDiagnosis = { overallReadiness: 0, gaps: [] };
                json.logs.push("Alerta: A IA retornou 'finalDiagnosis' em um formato inválido.");
            } else if (!Array.isArray(json.finalDiagnosis.gaps)) {
                json.finalDiagnosis.gaps = [];
                json.logs.push("Alerta: A IA retornou 'gaps' do diagnóstico em um formato inválido.");
            }
        }

        return json as DiagnosisStepResult;

    } catch (e) {
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        console.error(`Erro na Etapa ${stepIndex + 1} (${step.name}):`, errorMessage);
        // Return a structured error response that respects the interface
        return {
            logs: [`Erro crítico ao processar a etapa ${stepIndex + 1}. Detalhe: ${errorMessage}`],
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
    strategicMatrix: StrategicMatrix | undefined,
    assets: ProjectAsset[]
): Promise<string> => {
    // Instantiate AI client before each call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_WRITER_MODEL;

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
    ATUE COMO: Consultor Especialista em Planos de Negócios, com foco nos critérios do BRDE/FSA e na metodologia "${methodology || 'SEBRAE'}" para o projeto SCine.
    OBJETIVO GERAL DO PLANO: ${goalContext}.
    
    FONTES DE DADOS DISPONÍVEIS:
    1.  **MATRIZ ESTRATÉGICA (FONTE DA VERDADE):** ${matrixContext}
    2.  **CONTEXTO GERAL DO PROJETO (Documentos, Anotações, Imagens):** """${context}"""
    
    ${promptTask}

    HIERARQUIA DE BUSCA DE INFORMAÇÃO:
    - **Prioridade 1 (Matriz Estratégica):** Sua primeira e principal fonte de consulta DEVE ser a Matriz Estratégica. Use os insights e dados contidos nela como a base para sua resposta.
    - **Prioridade 2 (Contexto Geral):** Se a informação necessária não estiver na Matriz, busque-a no Contexto Geral do Projeto (documentos, anotações).
    - **Prioridade 3 (Inferência Contextual):** Se a informação não for encontrada em nenhuma das fontes, você DEVE indicar que a informação está ausente e que uma pesquisa externa pode ser necessária. NÃO invente dados quantitativos (valores, datas, nomes próprios). Você pode fazer inferências lógicas para conectar ideias, mas sinalize quando uma premissa não é suportada por dados.

    REGRAS GERAIS DE FORMATAÇÃO E CONDUTA:
    - **FOCO EM CLAREZA E CONTEXTO (REGRA CRÍTICA):** O texto deve ser escrito para um ser humano (avaliador, gestor), não para uma máquina. Contextualize todas as informações. Para apresentar dados comparativos (concorrentes), listas de características, cronogramas ou qualquer informação que possa ser estruturada, **É OBRIGATÓRIO o uso de tabelas Markdown**. Use negrito para destacar termos e conceitos importantes e quebre parágrafos longos com listas para facilitar a leitura dinâmica.
    - **SIGILO DA FERRAMENTA (REGRA CRÍTICA):** A "Matriz Estratégica" é sua ferramenta interna de análise. É ESTRITAMENTE PROIBIDO mencionar a "Matriz Estratégica", "Canvas", "SWOT" ou qualquer um de seus blocos internos (como 'customerSegments', 'revenueStreams', etc.) no texto final. Use as informações da matriz para construir sua análise, mas apresente o resultado como uma conclusão sua, sem citar a fonte interna. O leitor final (o avaliador do banco) não sabe o que é a matriz.
    - **AUTOSSUFICIÊNCIA (REGRA CRÍTICA):** O texto gerado deve ser 100% autossuficiente. Extraia e apresente todos os dados, análises e conclusões relevantes diretamente no texto. Assuma que o leitor final (ex: um avaliador do BRDE) NÃO terá acesso a nenhum arquivo anexo ou fonte externa. A regra geral é **NÃO** usar referências como "ver anexo". **EXCEÇÃO IMPORTANTE PARA O CAPÍTULO 11 (DOCUMENTOS COMPLEMENTARES):** Para as seções deste capítulo, sua tarefa é especificamente resumir o conteúdo de documentos de apoio. Nesses casos, você PODE e DEVE citar a natureza do documento (ex: "Conforme o Contrato Social...", "A pesquisa de mercado indica..."), mas o resumo que você escreve deve conter todos os pontos essenciais, evitando que o leitor precise consultar o documento original.
    - Comece a escrever diretamente o conteúdo solicitado. NÃO repita o título da seção no início do texto.
    - É ESTRITAMENTE PROIBIDO criar capítulos ou subseções com novas numerações (ex: "10.8", "14.5", "2.1.1.1"). Mantenha-se fiel à estrutura do plano.
    - Use as FONTES DE DADOS para embasar todos os seus argumentos. Não invente informações.
    `;

    // FIX: Inclui as imagens (assets) como `inlineData` para análise multimodal.
    const imageParts = assets.map(asset => ({
        inlineData: {
            mimeType: getBase64MimeType(asset.data),
            data: asset.data,
        }
    }));

    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
                model,
                contents: { parts: [{ text: prompt }, ...imageParts] },
                config: { 
                    maxOutputTokens: 8192, 
                    // System instruction to produce detailed, high-quality analytical content.
                    systemInstruction: "Você é um consultor de negócios sênior e redator especialista. Sua tarefa é elaborar textos detalhados, analíticos e aprofundados para um plano de negócios profissional, seguindo rigorosamente a metodologia SEBRAE e os critérios do BRDE. É crucial que você NÃO invente novas seções ou numerações (como 10.8, 14.5). Sua resposta deve se limitar estritamente ao conteúdo da seção solicitada, mas com a máxima profundidade e qualidade analítica possível, utilizando os dados fornecidos."
                }
            }),
            `Geração da Seção ${sectionTitle}`
        );
        return result.text || "Erro: A IA não retornou conteúdo.";
    } catch (e: any) {
        console.error(`Erro ao gerar seção ${sectionTitle}:`, e);
        if (e.message?.includes('RESOURCE_EXHAUSTED')) {
            return "Erro: Cota da API excedida. Por favor, aguarde alguns minutos e tente novamente.";
        }
        return "Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.";
    }
};

export const runTopicValidation = async (
    topicText: string,
    topicTitle: string,
    topicDescription: string,
    methodology: string,
    strategicMatrix: StrategicMatrix | null
): Promise<string> => {
    // Instantiate AI client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_WRITER_MODEL; // Using Pro model for better reasoning

    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix, null, 2) : "Matriz não disponível.";

    const prompt = `
    Você deve atuar como um validador técnico oficial de Plano de Negócios, usando como referência:
    - Metodologia ${methodology} (estrutura obrigatória para cada tópico)
    - Requisitos BRDE – Linha Inovação e Acessibilidade
    - Matriz de Valores e Indicadores fornecida abaixo

    CONTEXTO DO TÓPICO:
    Título: "${topicTitle}"
    Descrição Esperada: "${topicDescription}"
    
    MATRIZ DO PROJETO:
    """
    ${matrixContext}
    """

    CONTEÚDO DO TÓPICO A SER VALIDADO:
    """
    ${topicText}
    """

    Sua tarefa:
    Avalie somente este tópico, respondendo de forma objetiva e estruturada:

    1. Coerência com a Metodologia ${methodology}
    O tópico está seguindo o que a metodologia exige para essa seção específica?
    (Caso não esteja, liste exatamente o que falta.)

    2. Conformidade com o BRDE
    Analise se o tópico cumpre os requisitos do BRDE:
    - Clareza de escopo
    - Justificativa consistente
    - Inovação
    - Acessibilidade
    - Sustentabilidade financeira
    - Indicadores confiáveis
    Liste SIM / NÃO e explique cada item.

    3. Coerência com a Matriz do Projeto
    Compare o texto com os valores da Matriz de Valores:
    - Há números contraditórios?
    - Há promessas impossíveis?
    - Alguma afirmação diverge dos indicadores?
    - Há lacunas ou omissões importantes?
    Liste cada inconsistência encontrada.

    4. Problemas de lógica
    - Falta raciocínio?
    - Existe salto lógico?
    - Falta causa → consequência?
    - Há “inverdades” ou afirmações improváveis?
    Liste claramente.

    5. Orientação de Correção
    Explique como o usuário deve corrigir o tópico, em passos simples:
    Passo 1 — Ajustar…
    Passo 2 — Incluir…
    Passo 3 — Reescrever este trecho (sem fazer o texto completo)
    Passo 4 — Validar coerência…
    NÃO reescreva o tópico inteiro. Dê apenas instruções.

    FORMATO DE SAÍDA OBRIGATÓRIO (Markdown):
    # VALIDAÇÃO DO TÓPICO: ${topicTitle}

    ## 1. Metodologia ${methodology}
    **Correções necessárias:**
    - ...
    - ...

    ## 2. Requisitos BRDE
    **Análise:**
    - ...
    - ...

    ## 3. Coerência com a Matriz
    **Divergências encontradas:**
    - ...
    - ...

    ## 4. Problemas de lógica e inverdades
    - ...

    ## 5. Como corrigir
    1.
    2.
    3.
    4.
    `;

    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    maxOutputTokens: 8192,
                }
            }),
            `Validação do Tópico ${topicTitle}`
        );
        return result.text || "Erro: Relatório de validação vazio.";
    } catch (e: any) {
        console.error("Erro na validação do tópico:", e);
        if (e.message?.includes('RESOURCE_EXHAUSTED')) {
            return "Erro: Cota da API excedida. Não foi possível validar o tópico no momento.";
        }
        return "Erro crítico ao gerar o relatório de validação. Tente novamente.";
    }
};

export const implementCorrections = async (
    currentContent: string,
    validationReport: string,
    sectionTitle: string,
    sectionDescription: string,
    fullContext: string,
    strategicMatrix: StrategicMatrix | null
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_WRITER_MODEL;
    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz não disponível.";

    const prompt = `
    ATUE COMO: Redator Técnico Sênior e Especialista em Planos de Negócios.
    
    MISSÃO: Reescrever e corrigir o texto da seção "${sectionTitle}" com base rigorosa no Relatório de Auditoria fornecido.
    
    CONTEXTO DO PROJETO:
    """${fullContext}"""
    
    DADOS ESTRATÉGICOS (MATRIZ):
    """${matrixContext}"""
    
    TEXTO ORIGINAL (COM PROBLEMAS):
    """${currentContent}"""
    
    RELATÓRIO DE AUDITORIA (ERROS A CORRIGIR):
    """${validationReport}"""
    
    DESCRIÇÃO DO TÓPICO (O QUE É ESPERADO):
    "${sectionDescription}"

    INSTRUÇÕES DE EXECUÇÃO:
    1. **ANÁLISE DE LACUNAS:** Analise o relatório de auditoria. Se ele apontar falta de dados de mercado (taxas, concorrentes, estatísticas), use sua ferramenta de busca (Google Search) para encontrar dados REAIS e ATUALIZADOS para preencher essas lacunas.
    2. **CORREÇÃO TÉCNICA:** Reescreva o texto original corrigindo todos os problemas de lógica, metodologia e tom apontados.
    3. **ENRIQUECIMENTO:** Se o texto estiver vago, torne-o específico usando os dados do contexto e da matriz.
    4. **TOM PROFISSIONAL:** Mantenha um tom formal, persuasivo e adequado para uma análise de crédito no BRDE.
    5. **MANTENHA O FORMATO:** Use tabelas Markdown para dados comparativos e listas para facilitar a leitura.
    
    IMPORTANTE:
    - Se você encontrar dados novos na pesquisa (ex: taxa SELIC atual, crescimento do setor em 2024), CITE-OS no texto de forma natural.
    - O resultado deve ser o TEXTO FINAL DA SEÇÃO, pronto para ser aprovado. Não inclua "Aqui está o texto corrigido". Apenas o texto.
    `;

    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    maxOutputTokens: 8192,
                    // Habilita Google Search para buscar dados faltantes apontados na validação
                    tools: [{ googleSearch: {} }] 
                }
            }),
            `Correção da Seção ${sectionTitle}`
        );
        return result.text || currentContent; // Retorna original se falhar
    } catch (e: any) {
        console.error("Erro na implementação das correções:", e);
        throw e;
    }
};

export const generateFinancialData = async (
    strategicMatrix: StrategicMatrix | undefined
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    // Instantiate AI client before each call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_WRITER_MODEL;
    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz de dados não disponível.";
    const prompt = `
    ATUE COMO: Analista Financeiro Sênior do BRDE, avaliando o projeto SCine.
    REGRAS DE FINANCIAMENTO APLICÁVEIS: ${BRDE_FSA_RULES}
    DADOS ESTRATÉGIOS DISPONÍVEIS: ${matrixContext}
    
    TAREFA:
    1.  Gere uma projeção financeira DRE simplificada para 5 anos, considerando 2 anos de carência. Baseie os cálculos nos dados de 'revenueStreams' e 'costStructure' disponíveis.
    2.  Escreva um texto de análise (em Markdown) sobre a viabilidade financeira do projeto, incluindo conclusões.
    
    REGRAS CRÍTICAS DE OUTPUT:
    - **SIGILO DA FERRAMENTA:** No texto da "analysis", é ESTRITAMENTE PROIBIDO mencionar a "Matriz Estratégica" ou seus blocos ('revenueStreams', 'costStructure', etc.). Apresente a análise como sua própria conclusão profissional, baseada nos dados do projeto. O leitor final não conhece suas ferramentas internas.
    - **FORMATO JSON:** Sua resposta DEVE ser um JSON válido com a estrutura: { "analysis": "...", "data": [...] }.

    Gere o JSON abaixo.
    `;
    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({ 
                model, 
                contents: prompt, 
                config: { maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { analysis: { type: Type.STRING }, data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.STRING }, revenue: { type: Type.NUMBER }, expenses: { type: Type.NUMBER }, profit: { type: Type.NUMBER } } } } } } } 
            }),
            "Geração de Dados Financeiros"
        );
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        // Ensure json.data is an array before returning.
        const data = Array.isArray(json.data) ? json.data : [];
        return { analysis: json.analysis || "Análise indisponível.", data: data };
    } catch (e) { console.error(e); return { analysis: "Erro ao gerar dados financeiros. Possível limite de cota.", data: [] }; }
};

export const generateProjectImage = async (promptDescription: string): Promise<string> => {
    // Instantiate AI client before each call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: promptDescription }],
                },
                config: {
                    imageConfig: {
                        aspectRatio: "16:9"
                    }
                }
            }),
            "Geração de Imagem"
        );

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("Nenhuma imagem foi gerada.");
    } catch (e: any) { 
        console.error("Erro na geração de imagem:", e); 
        if (e.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("Cota de geração de imagem excedida.");
        }
        throw new Error("Falha ao gerar a imagem. Certifique-se de que sua API Key suporta geração de imagens e tente novamente."); 
    }
};

export const updateMatrixFromApprovedContent = async (
    approvedContent: string,
    sectionTitle: string,
    currentMatrix: StrategicMatrix
): Promise<Partial<StrategicMatrix>> => {
    // Instantiate AI client before each call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_DIAGNOSIS_MODEL; // Use faster model for structured data extraction

    const prompt = `
    ATUE COMO: Analista de Inteligência de Negócios. Sua tarefa é retroalimentar a Matriz Estratégica.
    
    TAREFA: Analise o texto APROVADO da seção "${sectionTitle}" e extraia TODAS as informações estratégicas, quantitativas e qualitativas que podem enriquecer a Matriz Estratégica. Você deve identificar dados que não estavam na matriz original ou que a refinam.

    TEXTO APROVADO PARA ANÁLISE:
    """
    ${approvedContent}
    """

    MATRIZ ESTRATÉGICA ATUAL (PARA CONTEXTO E EVITAR DUPLICAÇÃO):
    """
    ${JSON.stringify(currentMatrix, null, 2)}
    """

    INSTRUÇÕES:
    1.  **IDENTIFIQUE DADOS-CHAVE:** Procure especificamente por:
        -   Valores financeiros (investimentos, custos, projeções de receita).
        -   Nomes de fornecedores, parceiros, concorrentes ou tecnologias.
        -   Métricas específicas (CAC, LTV, TAM, SAM, SOM).
        -   Decisões estratégicas, pontos fortes, fraquezas, oportunidades ou ameaças que foram detalhados.
        -   Segmentos de clientes e suas características.
        -   Detalhes da proposta de valor.
    2.  **FORMATE COMO UM UPDATE DE MATRIZ:** Crie um objeto JSON que represente uma atualização para a matriz.
        -   Para cada insight, crie um \`MatrixItem\` com 'item', 'description', 'severity' ('moderado' por padrão, pois é validado), e 'confidence' ('alta', pois vem de texto aprovado).
        -   Adicione esses itens aos arrays \`items\` dos blocos apropriados da matriz (ex: \`customerSegments\`, \`costStructure\`, \`swot.strengths\`).
        -   Se encontrar uma descrição geral para um bloco, atualize o campo \`description\` do bloco.
    3.  **NÃO REPITA INFORMAÇÃO:** Compare com a matriz atual. Se um item já existe de forma idêntica, não o adicione novamente. O objetivo é ENRIQUECER, não duplicar.
    4.  **SEJA CONCISO:** Os 'items' devem ser curtos e diretos. A 'description' pode ser mais detalhada.

    RESPONDA ESTRITAMENTE NO FORMATO JSON com a estrutura de uma atualização parcial da \`StrategicMatrix\`. Se nenhum dado novo for encontrado, retorne um objeto JSON vazio {}.
    `;

    const matrixItemSchema = {
        type: Type.OBJECT,
        properties: {
            item: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING },
            confidence: { type: Type.STRING }
        },
        required: ["item", "description", "severity", "confidence"]
    };
    
    const canvasBlockSchema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: matrixItemSchema },
            description: { type: Type.STRING },
        }
    };

    const swotBlockSchema = {
        type: Type.OBJECT,
        properties: {
            items: { type: Type.ARRAY, items: matrixItemSchema },
            description: { type: Type.STRING },
        }
    };

    const responseSchema = {
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
    };
    
    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json',
                    responseSchema
                }
            }),
            `Atualização da Matriz - ${sectionTitle}`
        );
        const json = JSON.parse(cleanJsonString(result.text || "{}"));
        return json as Partial<StrategicMatrix>;
    } catch (e) {
        console.error(`Erro ao atualizar matriz da seção ${sectionTitle}:`, e);
        return {}; // Return empty update on error
    }
};

export const validateCompletedSections = async (
    sections: PlanSection[],
    strategicMatrix: StrategicMatrix | null,
    methodology: string,
    goal: BusinessGoal
): Promise<{ sectionId: string; isValid: boolean; feedback: string }[]> => {
    // Instantiate AI client before each call as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = AI_WRITER_MODEL;

    // FIX: A filtragem agora inclui seções com status REVIEW_ALERT para revalidação.
    const sectionsToValidate = sections
        .filter(s => s.status === SectionStatus.COMPLETED || s.status === SectionStatus.REVIEW_ALERT)
        .map(({ id, title, content }) => ({ id, title, content }));

    if (sectionsToValidate.length === 0) {
        return [];
    }

    const matrixContext = strategicMatrix ? JSON.stringify(strategicMatrix) : "Matriz de dados não disponível.";
    const sectionsContext = JSON.stringify(sectionsToValidate);

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
    4.  **Feedback Mandatório:** Para TODAS as seções, você DEVE fornecer um feedback. Se \`isValid\` for \`true\`, o feedback deve ser uma confirmação positiva e concisa (ex: 'Conteúdo claro, completo e alinhado aos objetivos.'). Se for \`false\`, deve ser uma crítica construtiva e acionável.

    RESPONDA ESTRITAMENTE NO SEGUINTE FORMATO JSON:
    `;

    try {
        const result = await withRetry<GenerateContentResponse>(
            () => ai.models.generateContent({
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
                                        feedback: { type: Type.STRING, description: "Feedback construtivo se isValid for false, ou confirmação positiva se for true." }
                                    },
                                    required: ["sectionId", "isValid", "feedback"]
                                }
                            }
                        },
                        required: ["validationResults"]
                    }
                }
            }),
            "Validação em Lote de Seções"
        );

        const json = JSON.parse(cleanJsonString(result.text || '{}'));
        return Array.isArray(json.validationResults) ? json.validationResults : [];
    } catch (e) {
        console.error("Erro na validação das seções:", e);
        // Return a generic error for all sections
        return sectionsToValidate.map(s => ({
            sectionId: s.id,
            isValid: false,
            feedback: "Ocorreu um erro no serviço de validação ou a cota da IA foi excedida. Tente novamente."
        }));
    }
};
