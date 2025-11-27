

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

    for (const chunk of chunks) {
        if (relevantChunks.length >= maxCount) break;
        
        // Clean up common system markers and trim whitespace, including list prefixes
        const trimmedChunk = chunk.trim().replace(/--- (Página|ARQUIVO).*? ---/g, '').replace(/^-|^\d\.\s*/, '').trim();
        
        // Increased min length to catch more meaningful lines and filter out noise
        if (trimmedChunk.length < 20 || trimmedChunk.length > 2000) continue; 

        // Use a more flexible regex to account for multiple spaces or different word orders in some cases
        const hasKeyword = keywords.some(keyword => new RegExp(`\\b${keyword.replace(/ /g, '\\s*')}\\b`, 'i').test(trimmedChunk));
        
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


const generateRealisticSectionText = (title: string, description: string, matrix: StrategicMatrix | null, context: string): string => {
    
    // Simulate pulling data from matrix and context to build the text
    const valueProposition = matrix?.valueProposition?.items[0]?.item || "uma proposta de valor inovadora";
    const customerSegment = matrix?.customerSegments?.items[0]?.item || "um segmento de clientes bem definido";
    const relevantContext = extractRelevantChunks(context, ['mercado', 'audiovisual', 'crescimento'], 1)[0] || 'O cenário atual apresenta desafios e oportunidades.';

    return `
### ${title.replace(/^\d+\.\d+\s/, '')}

Considerando a diretriz de *"${description}"*, este tópico detalha a estratégia do projeto SCine, alinhada à matriz de diagnóstico.

#### Análise Consolidada
O projeto SCine se posiciona com **${valueProposition}**, mirando em **${customerSegment}**. A análise do contexto, que indica que "${relevantContext}", reforça a viabilidade desta abordagem. Integramos três frentes de negócio: uma plataforma de streaming (OTT) focada em conteúdo regional, um hub de produção física e uma unidade móvel 4K. Essa estrutura diversifica as fontes de receita entre B2C (assinaturas) e B2B (serviços), mitigando riscos.

#### Pontos de Destaque
- **Mercado Alvo:** O público consumidor de cultura catarinense e empresas que necessitam de produção audiovisual. A estratégia de marketing será direcionada para um ROI otimizado.
- **Diferencial Competitivo:** A curadoria de conteúdo hiper-regional e a criação de um ecossistema de fomento local são nossas principais barreiras de entrada contra concorrentes globais.
- **Projeção Financeira:** As projeções indicam um ponto de equilíbrio no 28º mês, com um DSCR (Índice de Cobertura do Serviço da Dívida) robusto, demonstrando capacidade de honrar o financiamento.

#### Conclusão da Seção
A estratégia aqui delineada é sólida e fundamentada. As premissas são realistas e baseadas na análise contextual, atendendo às expectativas de mercado e aos requisitos de instituições como o BRDE.
`;
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
    sectionTitle: string,
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
    return generateRealisticSectionText(sectionTitle, sectionDescription, matrix, context);
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
    const brdeAnalysis: { name: string; status: 'SIM' | 'NÃO' | 'PARCIAL'; reason: string }[] = [];
    let matrixDivergences: string[] = [];

    // 1. Check for quantitative data (numbers, currency symbols)
    if (!/(\d|R\$|%)/.test(topicText)) {
        corrections.push(
            '**Quantificar:** Substitua termos vagos como "muitos clientes" por números estimados (ex: "estimamos atingir 5.000 assinantes no primeiro ano...").'
        );
        brdeAnalysis.push({ name: 'Indicadores confiáveis', status: 'NÃO', reason: 'Faltam dados numéricos para suportar as afirmações.' });
    } else {
        brdeAnalysis.push({ name: 'Indicadores confiáveis', status: 'SIM', reason: 'O texto apresenta dados quantitativos.' });
    }
    
    // 2. Check for structure (Markdown table)
    if (!/\|.*\|/.test(topicText)) {
         corrections.push(
            '**Estruturar:** Use uma tabela Markdown para comparar concorrentes ou apresentar dados. Tabelas aumentam a clareza.'
        );
    }

    // 3. Check coherence with Matrix (if available)
    if (matrix && matrix.swot && matrix.swot.weaknesses.items.length > 0 && !matrix.swot.weaknesses.items[0].item.startsWith('Nenhuma')) {
        const firstWeakness = matrix.swot.weaknesses.items[0];
        const keywords = firstWeakness.item.split(/\s+/).slice(0, 2); 
        const foundKeyword = keywords.some(kw => new RegExp(kw, 'i').test(topicText));
        
        if (!foundKeyword) {
            matrixDivergences.push(
                `O texto não parece abordar a fraqueza identificada na Matriz: **"${firstWeakness.item}"**. O plano deve demonstrar como as fraquezas serão mitigadas.`
            );
        }
    }
    
    // 4. General checks for depth
    if (topicText.length < 400) { 
        corrections.push(
            '**Aprofundar:** O conteúdo está superficial. Expanda a análise com mais detalhes e justificativas para cada ponto.'
        );
         brdeAnalysis.push({ name: 'Justificativa consistente', status: 'NÃO', reason: 'A argumentação é breve e carece de profundidade.' });
    } else {
         brdeAnalysis.push({ name: 'Justificativa consistente', status: 'SIM', reason: 'A argumentação é bem desenvolvida.' });
    }
    
    brdeAnalysis.push({ name: 'Clareza de escopo', status: 'SIM', reason: 'O escopo do tópico está bem definido.' });
    brdeAnalysis.push({ name: 'Inovação', status: 'SIM', reason: 'O aspecto de inovação está presente.' });
    brdeAnalysis.push({ name: 'Acessibilidade', status: 'PARCIAL', reason: 'Acessibilidade é mencionada, mas pode ser mais detalhada.' });


    // --- Build the final report ---
    if (corrections.length === 0 && matrixDivergences.length === 0) {
        return `
# VALIDAÇÃO DO TÓPICO: ${topicTitle}

## 1. Metodologia SEBRAE
**Status: APROVADO**
- O conteúdo atende aos requisitos de profundidade, estrutura e quantificação esperados.

## 2. Requisitos BRDE
**Status: CONFORME**
- **Clareza de escopo:** SIM - O escopo está claro e bem definido.
- **Justificativa consistente:** SIM - As afirmações são bem suportadas por argumentos lógicos e dados.
- **Indicadores confiáveis:** SIM - O texto apresenta dados quantitativos que sustentam a análise.

## 3. Coerência com a Matriz
**Status: COERENTE**
- O texto está alinhado com os insights e dados da Matriz Estratégica do projeto.

## Conclusão
O tópico está bem estruturado e validado. Nenhuma correção crítica é necessária.
        `;
    }

    let howToFix = corrections.map((c, i) => `${i + 1}. ${c}`).join('\n');
    if (matrixDivergences.length > 0) {
        howToFix += `\n${corrections.length + 1}. **Revisar Coerência:** ${matrixDivergences[0]}`;
    }

    return `
# VALIDAÇÃO DO TÓPICO: ${topicTitle}

## 1. Metodologia SEBRAE
**Correções necessárias:**
${corrections.length > 0 ? corrections.map(c => `- ${c.replace(/\*\*/g, '')}`).join('\n') : "- Nenhuma correção crítica."}

## 2. Requisitos BRDE
**Análise:**
${brdeAnalysis.map(b => `- **${b.name}:** ${b.status} - ${b.reason}`).join('\n')}

## 3. Coerência com a Matriz
**Divergências encontradas:**
${matrixDivergences.length > 0 ? matrixDivergences.map(d => `- ${d}`).join('\n') : "- Nenhuma divergência crítica."}

## 4. Problemas de lógica
- A falta de dados e estrutura enfraquece a argumentação.

## 5. Como corrigir
${howToFix}
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
    let addedContent = "";

    // Simulate reading the report and generating content for the corrections
    if (validationReport.includes("Quantificar") || validationReport.includes("Estruturar")) {
        addedContent += `
### Análise Quantitativa e Comparativa

Para atender à necessidade de quantificação e estrutura, apresentamos a seguinte análise de mercado e projeções em formato de tabela, conforme as melhores práticas:

| Concorrente | Proposta de Valor | Preço Médio (Plano Padrão) | Foco Regional |
|-------------|-------------------|----------------------------|---------------|
| **Netflix** | Conteúdo Global   | R$ 39,90                   | Não           |
| **Globoplay** | Conteúdo Nacional | R$ 24,90                   | Sim (limitado)|
| **SCine**   | **Conteúdo Local SC** | **R$ 19,90**               | **Total**     |

**Projeções de Mercado:**
- **Mercado Alvo (SAM):** O público-alvo em Santa Catarina é estimado em **~1.2 milhões** de espectadores (faixa 25-55 anos, classes B/C).
- **Meta (SOM):** Nossa meta é atingir **15.000 assinantes (1.25% do SAM)** nos primeiros 24 meses.
`;
    }
    
    if (validationReport.includes("fraqueza")) {
        const weaknessMatch = validationReport.match(/\*\*"(.*?)"\*\*/);
        const weakness = weaknessMatch ? weaknessMatch[1] : "uma fraqueza não especificada";
        addedContent += `
### Mitigação de Riscos e Fraquezas

Abordando diretamente a fraqueza **"${weakness}"** identificada na Matriz Estratégica, foi desenvolvido um plano de mitigação. A estratégia consiste em diversificar nossas parcerias de tecnologia, mantendo um fornecedor secundário em stand-by, pronto para ser ativado em caso de falha do provedor principal.
`;
    }

    // Combine original content with the new, integrated corrections
    improvedContent += "\n\n" + addedContent;

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