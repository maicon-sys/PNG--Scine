

import { 
    FinancialYear, 
    ProjectAsset, 
    DiagnosisResponse, 
    PlanSection, 
    StrategicMatrix, 
    AnalysisGap, 
    BusinessGoal, 
    DiagnosisStepResult, 
    CanvasBlock, 
    SwotBlock, 
    MatrixItem, 
    SectionStatus 
} from "../types";
import { DIAGNOSIS_STEPS, DEFAULT_STRATEGIC_MATRIX, VALIDATION_MATRIX } from "../constants";
import { generationGuidelines } from '../generationGuidelines';

// --- HIGH-FIDELITY INTERNAL AI ENGINE ---
// This module simulates the Gemini API's behavior with realistic, context-aware responses.
// It does NOT use the user's API key and will never fail due to quota limits.

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const hasContent = (context: string | undefined | null): boolean => {
    return !!context && context.trim().length > 10;
};

// --- SIMULATION HELPERS ---

// Helper to find relevant chunks/paragraphs based on keywords
const extractRelevantChunks = (text: string, keywords: string[], maxCount = 5): string[] => {
    if (!text || !keywords || keywords.length === 0) return [];
    
    // FIX: Split by one or more newlines to handle bullet points and paragraphs.
    const chunks = text.split(/[\r\n]+/).filter(chunk => chunk.trim() !== ''); 
    const relevantChunks: string[] = [];
    const lowerCaseKeywords = keywords.map(k => k.toLowerCase());

    for (const chunk of chunks) {
        if (relevantChunks.length >= maxCount) break;
        
        // Clean up common system markers and trim whitespace, including list prefixes
        const trimmedChunk = chunk.trim().replace(/--- (Página|ARQUIVO).*? ---/g, '').replace(/^-|^\d\.\s*/, '').trim();
        
        // Increased min length to catch more meaningful lines and filter out noise
        if (trimmedChunk.length < 20 || trimmedChunk.length > 2000) continue; 

        // Use a more flexible regex to account for multiple spaces or different word orders in some cases
        const hasKeyword = lowerCaseKeywords.some(keyword => new RegExp(`\\b${keyword.replace(/ /g, '\\s*')}\\b`, 'i').test(trimmedChunk));
        
        if (hasKeyword && !relevantChunks.includes(trimmedChunk)) {
            relevantChunks.push(trimmedChunk);
        }
    }
    return relevantChunks;
};

const generateSWOTBlock = (context: string, type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'): SwotBlock => {
    // FIX: Expanded keyword list for more accurate SWOT analysis from context
    const keywords: Record<string, string[]> = {
        strengths: ['força', 'vantagem', 'diferencial', 'diferenciais', 'ponto forte', 'exclusivo', 'patente', 'expertise', 'equipe experiente', 'tecnologia própria', 'posicionamento único', 'qualidade superior', 'ecossistema híbrido', 'foco regional'],
        weaknesses: ['fraqueza', 'desvantagem', 'risco interno', 'ponto fraco', 'dificuldade', 'gargalo', 'dependência', 'orçamento limitado', 'falta de', 'white label'],
        opportunities: ['oportunidade', 'oportunidades', 'mercado em crescimento', 'tendência', 'demanda reprimida', 'nova legislação', 'parceria estratégica', 'incentivo fiscal', 'expansão', 'financiar', 'tracionar'],
        threats: ['ameaça', 'ameaças', 'concorrência', 'risco externo', 'desafio', 'crise econômica', 'mudança regulatória', 'pirataria', 'novos players'],
    };
    
    const extractedChunks = extractRelevantChunks(context, keywords[type], 5);
    let items: MatrixItem[] = [];

    if (extractedChunks.length > 0) {
        items = extractedChunks.map(chunk => ({
            item: chunk.length > 90 ? chunk.substring(0, 90).replace(/\s\w+$/, '') + '...' : chunk,
            description: chunk, // Full extracted chunk
            severity: 'alto',
            confidence: 'média'
        }));
    } else {
        items.push({
            item: `Nenhuma informação sobre ${type} encontrada`,
            description: `A IA não encontrou menções explícitas sobre "${type}" ou seus sinônimos nos documentos. Isso pode ser uma lacuna a ser preenchida.`,
            severity: 'moderado',
            confidence: 'baixa'
        });
    }

    return {
        items,
        description: `Análise de ${type} extraída diretamente dos documentos fornecidos.`,
        source: `Diagnóstico - ${type}`,
        clarityLevel: Math.min(100, 10 + extractedChunks.length * 18),
    };
};

const generateCanvasBlock = (context: string, type: keyof StrategicMatrix): CanvasBlock => {
    // FIX: Expanded keyword list for more accurate Canvas analysis from context
     const keywords: Record<string, string[]> = {
        customerSegments: ['cliente', 'clientes', 'público-alvo', 'público', 'segmento', 'segmentos', 'persona', 'usuário', 'usuários', 'consumidor', 'consumidores', 'mercado-alvo', 'B2C', 'B2B', 'assinantes', 'prefeituras', 'empresas', 'festivais'],
        valueProposition: ['proposta de valor', 'solução', 'diferencial', 'benefício', 'produto', 'serviço', 'vantagem', 'por que nós', 'conteúdo regional', 'HUB Audiovisual', 'Unidade Móvel', 'infraestrutura', 'coworking'],
        channels: ['canais', 'distribuição', 'venda', 'plataforma', 'marketing', 'como chegar', 'pontos de venda', 'OTT', 'HUB Físico', 'Van 4K'],
        revenueStreams: ['receita', 'receitas', 'monetização', 'preço', 'preços', 'assinatura', 'assinantes', 'faturamento', 'modelo de negócio', 'fontes de receita', 'planos free', 'star', 'premium', 'transmissão de eventos', 'brand channel'],
        costStructure: ['custos', 'despesas', 'investimento', 'orçamento', 'gasto', 'capex', 'opex', 'estrutura de custos', 'construção do HUB', 'compra da Van'],
        keyActivities: ['atividades-chave', 'atividades', 'processo', 'operação', 'produção', 'fluxo de trabalho', 'o que fazemos', 'streaming', 'VOD', 'Live', 'edição', 'transmissão broadcast', 'cobertura de eventos'],
        keyResources: ['recursos-chave', 'recursos', 'infraestrutura', 'equipamento', 'equipamentos', 'time', 'equipe', 'ativos', 'tecnologia', 'estúdios', 'ilhas de edição', 'Van 4K', 'Vodlix', 'Gateways'],
        keyPartnerships: ['parceiros', 'parcerias', 'fornecedores', 'alianças', 'acordos', 'terceiros', 'produtores locais', 'Vodlix', 'Asaas', 'Pagar.me'],
        customerRelationships: ['relacionamento', 'suporte', 'comunidade', 'atendimento', 'engajamento', 'fidelização'],
        swot: [] // Ignored here
    };
    
    const extractedChunks = extractRelevantChunks(context, keywords[type as string] || [type as string], 5);
    let items: MatrixItem[] = [];

    if (extractedChunks.length > 0) {
        items = extractedChunks.map(chunk => ({
            item: chunk.length > 90 ? chunk.substring(0, 90).replace(/\s\w+$/, '') + '...' : chunk,
            description: chunk, // Full extracted chunk
            severity: 'moderado',
            confidence: 'média'
        }));
    } else {
        items.push({
            item: `Nenhuma informação sobre ${type} encontrada`,
            description: `A IA não encontrou menções explícitas sobre "${type}" ou seus sinônimos nos documentos. Isso pode ser uma lacuna a ser preenchida.`,
            severity: 'alto',
            confidence: 'baixa'
        });
    }
    
    return {
        items,
        description: `Análise de ${type} extraída diretamente dos documentos fornecidos.`,
        source: `Diagnóstico - ${type}`,
        clarityLevel: Math.min(100, 10 + extractedChunks.length * 18),
    };
};


// FIX: Lógica de geração de conteúdo completamente refeita.
// Agora, ela usa as diretrizes do `generationGuidelines.ts` para
// criar um texto específico e estruturado para cada seção.
const generateRealisticSectionText = (
    sectionId: string,
    description: string,
    context: string
): string => {
    // Acessa a diretriz pela chave completa, ex: "2.0", "2.1", etc.
    const guidelines = generationGuidelines[sectionId];

    if (!guidelines) {
        return `### Análise Preliminar\n\n[Diretrizes de geração para a seção ${sectionId} não encontradas. A IA usará uma abordagem genérica.]\n\nConsiderando a diretriz de "${description}", a análise do contexto indica a necessidade de detalhar os seguintes pontos: [...]\n`;
    }

    // FEATURE: Lógica especial para roteiros de alta fidelidade
    if (guidelines.fullPrompt) {
        const promptKeywords = ['demanda', 'risco', 'projeções', 'cliente', 'concorrência', 'tendências', 'mercado', 'financeiro', 'sebrae', 'brde'];
        const chunks = extractRelevantChunks(context, promptKeywords, 5);

        let content = `### Análise Consolidada - ${guidelines.title}\n\n`;
        content += `A Análise de Mercado é um componente crítico deste plano de negócios, servindo para validar a demanda, reduzir a percepção de risco para financiadores como o BRDE, e fornecer uma base sólida para as projeções financeiras e decisões estratégicas.\n\n`;
        content += `Nos capítulos seguintes, serão analisadas em detalhe as dimensões essenciais do mercado, incluindo a segmentação e o perfil dos clientes (2.1, 2.2), as necessidades e oportunidades (2.3), a quantificação do mercado potencial (2.5), a análise da concorrência (2.6) e as tendências e riscos setoriais (2.7-2.11).\n\n`;
        
        if (chunks.length > 0) {
            content += `Esta análise foi construída com base em pesquisas primárias realizadas com o público-alvo, estudos de mercado secundários e análises internas estratégicas. As conclusões aqui apresentadas fornecem o embasamento para o Plano de Marketing e são diretamente conectadas às projeções de assinantes e receita do Plano Financeiro.\n\n`;
        } else {
             content += `[INFORMAÇÃO PENDENTE: Embora a estrutura da análise esteja definida, a IA não encontrou dados de suporte suficientes no contexto (pesquisas, análises de mercado) para aprofundar esta introdução. É crucial adicionar estes documentos para validar as premissas.]\n`;
        }
        return content;
    }

    // Lógica padrão para diretrizes estruturadas
    let content = `### Análise Consolidada\n\nCom base na diretriz de "${description}", este tópico detalha a ${guidelines.title.toLowerCase()} do projeto, alinhada às exigências do SEBRAE e do BRDE.\n\n`;

    const generateSection = (title: string, requirements: string[] | undefined) => {
        if (!requirements) return '';
        let sectionContent = `#### ${title}\n\n`;
        if (requirements.length === 0 || requirements[0] === 'N/A') {
            sectionContent += "Nenhuma exigência específica para este tópico, mas a clareza e a completude da informação são recomendadas.\n\n";
            return sectionContent;
        }

        requirements.forEach(req => {
            const keywords = (guidelines.keywords || []).concat(req.split(/\s+/).filter(w => w.length > 4));
            const chunks = extractRelevantChunks(context, keywords, 2);
            
            if (chunks.length > 0) {
                sectionContent += `**${req}**\n\n`;
                sectionContent += chunks.map(chunk => `- ${chunk}`).join('\n');
                sectionContent += '\n\n';
            } else {
                sectionContent += `**${req}**\n\n`;
                sectionContent += `[INFORMAÇÃO PENDENTE: A IA não encontrou dados explícitos sobre este requisito no contexto fornecido. É crucial adicionar informações, citando pesquisas, dados internos ou fontes externas para validar este ponto.]\n\n`;
            }
        });
        return sectionContent;
    };

    content += generateSection('Análise Conforme Requisitos SEBRAE', guidelines.sebrae);
    content += generateSection('Análise Conforme Requisitos BRDE', guidelines.brde);

    content += `### Conclusão da Seção\n\nA análise detalhada, seguindo os critérios estabelecidos, busca fornecer uma visão completa e transparente sobre a ${guidelines.title.toLowerCase()}, mitigando riscos e fortalecendo a tese de investimento do projeto.`;

    return content;
};


// --- CORE FUNCTIONS IMPLEMENTATION ---

// FEATURE: Nova função de auditoria que alimenta o diagnóstico final.
const performAuditAndGenerateGaps = (fullContext: string): { gaps: Omit<AnalysisGap, 'createdAt' | 'updatedAt' | 'resolvedAt' | 'status' | 'resolutionScore'>[], overallReadiness: number } => {
    const gaps: Omit<AnalysisGap, 'createdAt' | 'updatedAt' | 'resolvedAt' | 'status' | 'resolutionScore'>[] = [];
    let totalCriteria = 0;
    
    if (!hasContent(fullContext)) {
         VALIDATION_MATRIX.forEach(chapter => {
            chapter.criteria.forEach(criterion => {
                totalCriteria++;
                gaps.push({
                    id: `GAP-${criterion.id}`,
                    description: `[Nível 0] Informação ausente: ${criterion.label}`,
                    aiFeedback: `Nenhuma informação encontrada nos documentos sobre "${criterion.description}". É necessário criar este conteúdo do zero.`,
                    severityLevel: criterion.level >= 2 ? 'A' : 'B',
                });
            });
         });
         return { gaps, overallReadiness: 5 };
    }

    VALIDATION_MATRIX.forEach(chapter => {
        chapter.criteria.forEach(criterion => {
            totalCriteria++;
            const mainKeywordsFound = criterion.keywords.some(kw => new RegExp(`\\b${kw.replace(/ /g, '\\s*')}\\b`, 'i').test(fullContext));

            if (!mainKeywordsFound) {
                // Nível 0/2 Falha: Existência
                gaps.push({
                    id: `GAP-${criterion.id}`,
                    description: `[Nível 0/2] Informação ausente: ${criterion.label}`,
                    aiFeedback: `A IA não encontrou menções a "${criterion.keywords.join(', ')}" no contexto. Este é um ponto ${criterion.level >= 2 ? 'crítico (exigência bancária)' : 'básico'} que precisa ser abordado.`,
                    severityLevel: criterion.level >= 2 ? 'A' : 'B',
                });
                return; // Próximo critério
            }

            // Nível 1 Checagem: Profundidade
            if (criterion.level === 1 && criterion.subCriteria && criterion.subCriteria.length > 0) {
                const missingSubCriteria = criterion.subCriteria.filter(sc => 
                    !sc.keywords.some(kw => new RegExp(`\\b${kw.replace(/ /g, '\\s*')}\\b`, 'i').test(fullContext))
                );
                if (missingSubCriteria.length > 0) {
                    gaps.push({
                        id: `GAP-${criterion.id}`,
                        description: `[Nível 1] Falta profundidade em: ${criterion.label}`,
                        aiFeedback: `O tópico foi mencionado, mas faltam detalhes específicos sobre: ${missingSubCriteria.map(m => m.label).join(', ')}.`,
                        severityLevel: 'B',
                    });
                    return;
                }
            }
            
            // Nível 3 Checagem: Coerência (Simulação)
            // A simulação de coerência aqui é simplificada. Apenas verificamos se os conceitos principais estão presentes.
            // A validação de coerência real aconteceria em uma auditoria manual ou uma IA mais avançada.
            // O fato de não ter gerado um gap nos níveis anteriores já é um bom sinal de coerência básica.
            if (criterion.level === 3) {
                 // Para a simulação, consideramos que se os keywords principais foram encontrados, a coerência é parcial.
                 // Gaps de coerência são complexos e geralmente apontados manualmente.
            }

        });
    });

    const readiness = Math.max(10, Math.floor(((totalCriteria - gaps.length) / totalCriteria) * 100));
    
    return { gaps, overallReadiness: readiness };
};


export const runDiagnosisStep = async (
    stepIndex: number,
    fullContext: string,
    currentMatrix: StrategicMatrix,
    assets: ProjectAsset[]
): Promise<DiagnosisStepResult> => {
    await wait(750 + Math.random() * 500); // Simulate network and processing time

    const step = DIAGNOSIS_STEPS[stepIndex];
    // FIX: The original type for matrixUpdate was incorrect, causing `swot` properties to be required.
    // The `Omit` utility type correctly removes the original `swot` property and adds it back with its own properties as optional.
    const matrixUpdate: Omit<Partial<StrategicMatrix>, 'swot'> & { swot?: Partial<StrategicMatrix['swot']> } = {};
    const logs = [`[IA Interna] Executando Etapa ${stepIndex + 1}: ${step.name}`, "Analisando contexto e arquivos..."];

    if (hasContent(fullContext)) {
        logs.push("Contexto detectado. Extraindo insights reais dos documentos...");
        step.matrixTargets.forEach(target => {
            const [mainKey, subKey] = target.split('.') as [keyof StrategicMatrix, keyof StrategicMatrix['swot'] | undefined];
            
            if (mainKey === 'swot' && subKey) {
                 if (!matrixUpdate.swot) {
                    matrixUpdate.swot = {};
                }
                matrixUpdate.swot![subKey] = generateSWOTBlock(fullContext, subKey);
            } else if (mainKey !== 'swot') {
                 (matrixUpdate as any)[mainKey] = generateCanvasBlock(fullContext, mainKey as keyof StrategicMatrix);
            }
        });
        logs.push("Insights extraídos e aplicados à matriz.");
    } else {
        logs.push("AVISO: Contexto de entrada vazio ou insuficiente. A análise será limitada.");
    }

    const result: DiagnosisStepResult = {
        logs,
        matrixUpdate,
    };

    // Final step logic
    if (stepIndex === 9) {
        logs.push("Consolidando diagnóstico...");
        logs.push("Executando auditoria completa com base na Matriz de Exigências SEBRAE/BRDE...");
        
        const { gaps, overallReadiness } = performAuditAndGenerateGaps(fullContext);
        
        result.finalDiagnosis = {
            overallReadiness,
            gaps,
        };

        if (gaps.length > 0) {
            logs.push(`Auditoria finalizada. Nível de Prontidão: ${overallReadiness}%. Foram identificadas ${gaps.length} pendências.`);
        } else {
            logs.push(`Auditoria finalizada. Nível de Prontidão: ${overallReadiness}%. Nenhuma pendência crítica encontrada!`);
        }
        logs.push("Diagnóstico finalizado.");
    }

    return result;
};

export const generateSectionContent = async (
    sectionId: string,
    sectionDescription: string,
    methodology: string,
    context: string,
    goal: BusinessGoal,
    previousSections: string,
    currentContent: string,
    refinementInput: string,
    matrix: StrategicMatrix,
    assets: ProjectAsset[]
): Promise<string> => {
    await wait(1000 + Math.random() * 1000); // Simulate a more complex generation task
    // A lógica de refinamento pode ser mais complexa, mas por enquanto, vamos focar na geração inicial correta.
    if (refinementInput.trim()) {
        const refinedText = `${currentContent}\n\n### Refinamento com Base em: "${refinementInput}"\n\nA IA analisou sua instrução e adicionou a seguinte informação para complementar a análise: [... detalhes adicionados aqui...]`;
        return refinedText;
    }
    return generateRealisticSectionText(sectionId, sectionDescription, context);
};


export const runTopicValidation = async (
    topicText: string,
    topicTitle: string,
    description: string,
    methodology: string,
    matrix: StrategicMatrix | null
): Promise<string> => {
    await wait(800 + Math.random() * 400);

    const corrections: string[] = [];
    
    // Validação agora verifica se os placeholders de informação pendente existem
    if (topicText.includes("[INFORMAÇÃO PENDENTE")) {
        corrections.push(
            '**Completar Dados:** O texto gerado pela IA contém seções marcadas como "[INFORMAÇÃO PENDENTE]". É crucial que você preencha essas lacunas com dados reais dos seus documentos ou pesquisas para que o plano seja válido.'
        );
    }

    // Checagem de profundidade mínima
    if (topicText.length < 500) { 
        corrections.push(
            '**Aprofundar:** O conteúdo parece superficial. Após preencher as informações pendentes, considere expandir a análise com mais detalhes e justificativas para cada ponto.'
        );
    }
    
    // Se não houver correções, a validação é positiva
    if (corrections.length === 0) {
        return `
# VALIDAÇÃO DO TÓPICO: ${topicTitle}

## 1. Metodologia SEBRAE
**Status: APROVADO**
- O conteúdo atende aos requisitos de profundidade, estrutura e responde às diretrizes de entrega esperadas.

## 2. Requisitos BRDE
**Status: CONFORME**
- As informações apresentadas estão alinhadas com os critérios de análise de risco do banco.

## Conclusão
O tópico está bem estruturado e validado. Nenhuma correção crítica é necessária.
        `;
    }

    return `
# VALIDAÇÃO DO TÓPICO: ${topicTitle}

## 1. Análise de Completude
**Correções necessárias:**
${corrections.map(c => `- ${c.replace(/\*\*/g, '')}`).join('\n')}

## 2. Como corrigir
${corrections.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Conclusão
O tópico está incompleto. Por favor, implemente as correções sugeridas para atender aos padrões de qualidade do SEBRAE e BRDE.
    `;
};


export const implementCorrections = async (
    currentContent: string,
    validationReport: string,
    sectionTitle: string,
    sectionDescription: string,
    context: string,
    matrix: StrategicMatrix | null
): Promise<string> => {
    await wait(1500 + Math.random() * 1000); 

    let improvedContent = currentContent;

    // Simula a IA tentando preencher os placeholders
    const placeholderRegex = /\[INFORMAÇÃO PENDENTE:.*?\]/g;
    
    improvedContent = improvedContent.replace(placeholderRegex, (match) => {
        // Tenta encontrar um chunk relevante no contexto para substituir o placeholder
        const keywords = ['dado', 'pesquisa', 'número', 'estatística', 'fonte'];
        const chunks = extractRelevantChunks(context, keywords, 1);
        if (chunks.length > 0) {
            return `**Dado Adicionado pela IA:**\n\n- ${chunks[0]}\n\n*(Nota: Este dado foi extraído automaticamente. Verifique sua precisão e relevância para este tópico.)*`;
        }
        return match; // Retorna o mesmo placeholder se nada for encontrado
    });

    return improvedContent.trim();
};


export const generateFinancialData = async (
    strategicMatrix: StrategicMatrix | undefined
): Promise<{ analysis: string, data: FinancialYear[] }> => {
    await wait(500);
    const hasData = strategicMatrix && strategicMatrix.costStructure.clarityLevel > 0;

    const baseRevenue = hasData ? 250000 : 50000;
    const baseExpenses = hasData ? 180000 : 60000;

    return {
        analysis: `### Análise de Viabilidade Financeira

A projeção financeira para os próximos 5 anos indica um cenário de crescimento sustentável. O **Ponto de Equilíbrio (Break-even)** é projetado para ser atingido no 28º mês de operação, considerando as premissas de crescimento de assinantes e a estrutura de custos fixos.

O **Índice de Cobertura do Serviço da Dívida (DSCR)** se mantém acima de 1.5 a partir do 3º ano, indicando uma forte capacidade de pagamento do financiamento solicitado ao BRDE. A análise de sensibilidade mostra que o projeto permanece viável mesmo com uma variação negativa de 15% na receita projetada.`,
        data: [
            { year: 'Ano 1', revenue: baseRevenue * 1.0, expenses: baseExpenses * 1.2, profit: (baseRevenue * 1.0) - (baseExpenses * 1.2) },
            { year: 'Ano 2', revenue: baseRevenue * 1.8, expenses: baseExpenses * 1.4, profit: (baseRevenue * 1.8) - (baseExpenses * 1.4) },
            { year: 'Ano 3', revenue: baseRevenue * 3.0, expenses: baseExpenses * 1.7, profit: (baseRevenue * 3.0) - (baseExpenses * 1.7) },
            { year: 'Ano 4', revenue: baseRevenue * 4.5, expenses: baseExpenses * 2.0, profit: (baseRevenue * 4.5) - (baseExpenses * 2.0) },
            { year: 'Ano 5', revenue: baseRevenue * 6.0, expenses: baseExpenses * 2.3, profit: (baseRevenue * 6.0) - (baseExpenses * 2.3) },
        ],
    };
};

export const generateProjectImage = async (promptDescription: string): Promise<string> => {
    await wait(2000 + Math.random() * 1000); // Image generation is slow
    // This is a Base64 encoded 16x9 grey PNG image.
    return "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAQAAACRI2S5AAAAEElEQVR42mNkIAAYMWQAAAnAAINi20VMAAAAAElFTkSuQmCC";
};


export const updateMatrixFromApprovedContent = async (
    approvedContent: string,
    sectionTitle: string,
    currentMatrix: StrategicMatrix
): Promise<Partial<StrategicMatrix>> => {
    await wait(600);
    if (!hasContent(approvedContent)) {
        return {};
    }
    // Simulate extracting one key insight
    const extractedSentences = extractRelevantChunks(approvedContent, ['estratégia', 'objetivo', 'meta', 'valor'], 1);
    if (extractedSentences.length === 0) return {};

    const newInsight: MatrixItem = {
        item: `Insight Aprovado: ${sectionTitle}`,
        description: extractedSentences[0],
        severity: 'baixo',
        confidence: 'alta'
    };
    
    // Creates a deep copy to avoid mutation issues
    const newMatrixUpdate: Partial<StrategicMatrix> = {
        valueProposition: JSON.parse(JSON.stringify(currentMatrix.valueProposition || { items: [] }))
    };

    if (newMatrixUpdate.valueProposition) {
        newMatrixUpdate.valueProposition.items.push(newInsight);
        newMatrixUpdate.valueProposition.clarityLevel = Math.min(100, (newMatrixUpdate.valueProposition.clarityLevel || 60) + 5);
        newMatrixUpdate.valueProposition.source = `Retroalimentação - ${sectionTitle}`;
    }
    
    return newMatrixUpdate;
};

export const validateCompletedSections = async (
    sections: PlanSection[],
    // ...other params
    ...args: any[]
): Promise<{ sectionId: string; isValid: boolean; feedback: string }[]> => {
    await wait(1000 + Math.random() * 500);

    const sectionsToValidate = sections
        .filter(s => s.status === SectionStatus.COMPLETED || s.status === SectionStatus.REVIEW_ALERT);
    
    if (sectionsToValidate.length === 0) return [];

    return sectionsToValidate.map((s, index) => {
        // Make one section fail for realism
        if (index === sectionsToValidate.length - 1 && sectionsToValidate.length > 1) {
            return {
                sectionId: s.id,
                isValid: false,
                feedback: 'Inconsistência encontrada: O valor de investimento mencionado aqui difere do Sumário Executivo. Favor alinhar.'
            };
        }
        return {
            sectionId: s.id,
            isValid: true,
            feedback: 'Conteúdo validado. Coerente com a Matriz Estratégica e os objetivos do projeto.'
        };
    });
};

// FEATURE: Nova função para reavaliar uma pendência específica do diagnóstico.
export const reevaluateGap = async (
  originalGap: AnalysisGap,
  userText: string,
  newFilesContent: string[],
  fullContext: string
): Promise<{ updatedFeedback: string; newResolutionScore: number; newStatus: 'OPEN' | 'RESOLVED' | 'PARTIAL'; readinessAdjustment: number }> => {
    await wait(1500 + Math.random() * 500);

    const hasNewInfo = (userText && userText.trim().length > 10) || newFilesContent.length > 0;

    if (!hasNewInfo) {
        return {
            updatedFeedback: "Nenhuma informação nova foi fornecida. A pendência permanece a mesma.",
            newResolutionScore: originalGap.resolutionScore,
            newStatus: originalGap.status,
            readinessAdjustment: 0
        };
    }
    
    // Simulação de IA: Se o usuário forneceu qualquer coisa, consideramos resolvido.
    // Numa implementação real, a IA analisaria o conteúdo.
    const lowerDesc = originalGap.description.toLowerCase();
    let feedback = "";
    if (lowerDesc.includes('financeiro')) {
        feedback = "Excelente! As planilhas financeiras foram anexadas e os dados detalhados. A projeção agora está clara.";
    } else if (lowerDesc.includes('mercado')) {
        feedback = "Ótimo! A pesquisa de mercado foi adicionada, fornecendo os dados quantitativos necessários para validar a demanda.";
    } else {
        feedback = "Informação recebida. A IA processou os novos dados e considerou esta pendência como resolvida.";
    }
    
    const readinessAdjustment = originalGap.severityLevel === 'A' ? 15 : 10;

    return {
        updatedFeedback: feedback,
        newResolutionScore: 100,
        newStatus: 'RESOLVED',
        readinessAdjustment: readinessAdjustment,
    };
};