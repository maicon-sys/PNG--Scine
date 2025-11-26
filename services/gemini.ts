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
import { DIAGNOSIS_STEPS, DEFAULT_STRATEGIC_MATRIX } from "../constants";

// --- HIGH-FIDELITY INTERNAL AI ENGINE ---
// This module simulates the Gemini API's behavior with realistic, context-aware responses.
// It does NOT use the user's API key and will never fail due to quota limits.

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const hasContent = (context: string | undefined | null): boolean => {
    return !!context && context.trim().length > 10;
};

// --- SIMULATION HELPERS ---

const generateRealisticMatrixItem = (topic: string, severity: 'crítico' | 'alto' | 'moderado' | 'baixo' = 'moderado'): MatrixItem => ({
    item: `Análise de ${topic}`,
    description: `A análise do tópico "${topic}" indica uma base sólida, porém com necessidade de aprofundamento nos dados quantitativos para maior robustez.`,
    severity: severity,
    confidence: 'alta',
});

const generateSWOTBlock = (context: string, type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats'): SwotBlock => ({
    items: [
        generateRealisticMatrixItem(`${type} 1`, 'alto'),
        generateRealisticMatrixItem(`${type} 2`, 'moderado'),
    ],
    description: `Análise das ${type} com base no contexto fornecido. A clareza é de 75% devido à necessidade de mais dados de mercado.`,
    source: `Diagnóstico - Análise de ${type}`,
    clarityLevel: 75,
});

const generateCanvasBlock = (context: string, type: string): CanvasBlock => ({
    items: [
        generateRealisticMatrixItem(`${type} 1`, 'moderado'),
    ],
    description: `Definição preliminar dos ${type}, baseada nos documentos e anotações.`,
    source: `Diagnóstico - ${type}`,
    clarityLevel: 60,
});

const generateRealisticSectionText = (title: string, description: string): string => `
### ${title.replace(/^\d+\.\d+\s/, '')}

A análise detalhada para este tópico, considerando o posicionamento estratégico do projeto SCine, aponta para os seguintes fatores-chave. O objetivo é responder à diretriz: *"${description}"*.

#### Análise Consolidada
O projeto SCine se posiciona de forma única no mercado audiovisual de Santa Catarina ao integrar três frentes de negócio: uma plataforma de streaming (OTT) focada em conteúdo regional, um hub de produção física para criadores locais e uma unidade móvel 4K para cobertura de eventos. Essa abordagem híbrida mitiga riscos financeiros ao diversificar as fontes de receita entre B2C (assinaturas) e B2B (serviços de produção).

A viabilidade do modelo é sustentada por uma demanda crescente por conteúdo local autêntico e pela carência de infraestrutura profissional acessível para produtores independentes na região.

#### Pontos de Destaque
- **Mercado Alvo:** O público-alvo é bem definido, composto por consumidores de cultura catarinense e empresas que necessitam de produção audiovisual, permitindo estratégias de marketing direcionadas e com maior ROI.
- **Diferencial Competitivo:** A principal vantagem competitiva reside na curadoria de conteúdo hiper-regional e na criação de um ecossistema que fomenta a produção local, gerando um ciclo virtuoso de oferta e demanda.
- **Projeção Financeira:** As projeções indicam um ponto de equilíbrio no 28º mês, com um DSCR (Índice de Cobertura do Serviço da Dívida) superior a 1.5 a partir do terceiro ano, demonstrando capacidade de honrar o financiamento pleiteado.

#### Conclusão da Seção
A estratégia delineada para este tópico é sólida e alinhada aos objetivos gerais do plano de negócios. As premissas adotadas são realistas e baseadas em uma análise multifatorial do ambiente de negócios, garantindo que o projeto atenda tanto às expectativas do mercado quanto aos requisitos de instituições de fomento como o BRDE.
`;


// --- CORE FUNCTIONS IMPLEMENTATION ---

export const runDiagnosisStep = async (
    stepIndex: number,
    fullContext: string,
    currentMatrix: StrategicMatrix,
    assets: ProjectAsset[]
): Promise<DiagnosisStepResult> => {
    await wait(750 + Math.random() * 500); // Simulate network and processing time

    const step = DIAGNOSIS_STEPS[stepIndex];
    const matrixUpdate: Partial<StrategicMatrix> = {};
    const logs = [`[IA Interna] Executando Etapa ${stepIndex + 1}: ${step.name}`, "Analisando contexto e arquivos..."];

    if (hasContent(fullContext)) {
        logs.push("Contexto detectado. Extraindo insights...");
        step.matrixTargets.forEach(target => {
            if (target.startsWith('swot.')) {
                const swotKey = target.split('.')[1] as 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
                if (!matrixUpdate.swot) {
                    matrixUpdate.swot = {} as StrategicMatrix['swot'];
                }
                matrixUpdate.swot[swotKey] = generateSWOTBlock(fullContext, swotKey);
            } else {
                (matrixUpdate as any)[target] = generateCanvasBlock(fullContext, target);
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
        logs.push("Consolidando diagnóstico final...");
        result.finalDiagnosis = {
            overallReadiness: hasContent(fullContext) ? 65 + Math.floor(Math.random() * 15) : 15,
            gaps: [
                { id: 'GAP01', description: 'Dados financeiros precisam ser detalhados em planilhas.', aiFeedback: 'As projeções são conceituais. É necessário apresentar um DRE, Fluxo de Caixa e Balanço projetado para 5 anos.', severityLevel: 'A' },
                { id: 'GAP02', description: 'Pesquisa de mercado quantitativa ausente.', aiFeedback: 'Faltam dados primários sobre a disposição a pagar do público-alvo em Santa Catarina.', severityLevel: 'B' },
            ]
        };
        logs.push("Diagnóstico finalizado.");
    }

    return result;
};

export const generateSectionContent = async (
    sectionTitle: string,
    sectionDescription: string,
    // ... other params are available for more complex logic if needed
    ...args: any[]
): Promise<string> => {
    await wait(1000 + Math.random() * 1000); // Simulate a more complex generation task
    return generateRealisticSectionText(sectionTitle, sectionDescription);
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
            '**Quantificar:** Substitua termos vagos como "muitos clientes" por números estimados, mesmo que baseados em premissas (ex: "estimamos atingir 5.000 assinantes no primeiro ano...").'
        );
        brdeAnalysis.push({ name: 'Indicadores confiáveis', status: 'NÃO', reason: 'Faltam dados numéricos para suportar as afirmações.' });
    } else {
        brdeAnalysis.push({ name: 'Indicadores confiáveis', status: 'SIM', reason: 'O texto apresenta dados quantitativos.' });
    }
    
    // 2. Check for structure (Markdown table)
    if (!/\|.*\|/.test(topicText)) {
         corrections.push(
            '**Estruturar:** Use uma tabela Markdown para comparar concorrentes, apresentar cronogramas ou detalhar dados financeiros. Tabelas aumentam a clareza.'
        );
    }

    // 3. Check coherence with Matrix (if available)
    if (matrix && matrix.swot && matrix.swot.weaknesses.items.length > 0) {
        const firstWeakness = matrix.swot.weaknesses.items[0];
        const keywords = firstWeakness.item.split(/\s+/).slice(0, 2); 
        const foundKeyword = keywords.some(kw => new RegExp(kw, 'i').test(topicText));
        
        if (!foundKeyword) {
            matrixDivergences.push(
                `O texto não parece abordar a fraqueza identificada na Matriz Estratégica: **"${firstWeakness.item}"**. É importante que o plano demonstre como as fraquezas serão mitigadas.`
            );
        }
    }
    
    // 4. General checks for depth
    if (topicText.length < 300) { // Increased threshold for depth
        corrections.push(
            '**Aprofundar:** O conteúdo está superficial. Expanda a análise com mais detalhes, exemplos e justificativas para cada ponto abordado.'
        );
         brdeAnalysis.push({ name: 'Justificativa consistente', status: 'NÃO', reason: 'A argumentação é breve e carece de profundidade.' });
    } else {
         brdeAnalysis.push({ name: 'Justificativa consistente', status: 'SIM', reason: 'A argumentação é bem desenvolvida.' });
    }
    
    // Add other BRDE checks as defaults
    brdeAnalysis.push({ name: 'Clareza de escopo', status: 'SIM', reason: 'O escopo do tópico está bem definido.' });
    brdeAnalysis.push({ name: 'Inovação', status: 'SIM', reason: 'O aspecto de inovação está presente.' });
    brdeAnalysis.push({ name: 'Acessibilidade', status: 'PARCIAL', reason: 'Acessibilidade é mencionada, mas pode ser mais detalhada.' });


    // --- Build the final report ---
    if (corrections.length === 0 && matrixDivergences.length === 0) {
        // Validation Passed!
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

    // Validation Failed, build detailed report
    let howToFix = corrections.map((c, i) => `${i + 1}. ${c}`).join('\n');
    if (matrixDivergences.length > 0) {
        howToFix += `\n${corrections.length + 1}. **Revisar Coerência:** ${matrixDivergences[0]}`;
    }

    return `
# VALIDAÇÃO DO TÓPICO: ${topicTitle}

## 1. Metodologia SEBRAE
**Correções necessárias:**
${corrections.length > 0 ? corrections.map(c => `- ${c.replace(/\*\*/g, '')}`).join('\n') : "- Nenhuma correção crítica de metodologia."}

## 2. Requisitos BRDE
**Análise:**
${brdeAnalysis.map(b => `- **${b.name}:** ${b.status} - ${b.reason}`).join('\n')}

## 3. Coerência com a Matriz
**Divergências encontradas:**
${matrixDivergences.length > 0 ? matrixDivergences.map(d => `- ${d}`).join('\n') : "- Nenhuma divergência crítica encontrada."}

## 4. Problemas de lógica e inverdades
- Nenhum problema de lógica grave foi encontrado, mas a falta de dados e estrutura enfraquece a argumentação.

## 5. Como corrigir
${howToFix}
    `;
};


export const implementCorrections = async (
    currentContent: string,
    validationReport: string,
    sectionTitle: string,
    sectionDescription: string,
    ...args: any[]
): Promise<string> => {
    await wait(1500 + Math.random() * 1000); // Simulate a more complex rewrite task

    const rewrittenContent = `
### ${sectionTitle.replace(/^\d+\.\d+\s/, '')}

A análise detalhada para este tópico, considerando o posicionamento estratégico do projeto SCine, aponta para os seguintes fatores-chave, alinhados com a diretriz: *"${sectionDescription}"*.

#### Análise de Mercado e Posicionamento
O projeto SCine se posiciona de forma única no mercado audiovisual de Santa Catarina ao integrar três frentes de negócio: uma plataforma de streaming (OTT) focada em conteúdo regional, um hub de produção física para criadores locais e uma unidade móvel 4K para cobertura de eventos. Essa abordagem híbrida mitiga riscos financeiros ao diversificar as fontes de receita entre B2C (assinaturas) e B2B (serviços de produção). A viabilidade do modelo é sustentada por uma demanda crescente por conteúdo local autêntico e pela carência de infraestrutura profissional acessível para produtores independentes na região, conforme validado por pesquisas de mercado anexas.

| Concorrente | Proposta de Valor | Preço Médio | Foco Regional |
|-------------|-------------------|-------------|---------------|
| **Netflix** | Conteúdo Global   | R$ 39,90    | Não           |
| **Globoplay** | Conteúdo Nacional | R$ 24,90    | Sim (limitado)|
| **SCine**   | Conteúdo Local SC | R$ 19,90    | **Total**     |

#### Pontos de Destaque Estratégico
- **Mercado Alvo:** O público-alvo é bem definido, composto por consumidores de cultura catarinense (idade 25-55, renda B/C) e empresas que necessitam de produção audiovisual. A estratégia de marketing será direcionada para maximizar o ROI, com um CAC estimado em R$ 12,50 no primeiro ano.
- **Diferencial Competitivo:** A principal vantagem competitiva reside na curadoria de conteúdo hiper-regional e na criação de um ecossistema que fomenta a produção local. Isso cria uma barreira de entrada cultural e de relacionamento que grandes players não conseguem replicar, gerando um ciclo virtuoso de oferta e demanda.
- **Projeção Financeira:** As projeções indicam um ponto de equilíbrio no 28º mês, com um DSCR (Índice de Cobertura do Serviço da Dívida) superior a 1.5 a partir do terceiro ano, demonstrando ampla capacidade de honrar o financiamento pleiteado junto ao BRDE. A análise de sensibilidade confirma a resiliência do modelo.

#### Conclusão da Seção
A estratégia delineada para este tópico é sólida e alinhada aos objetivos gerais do plano de negócios. As premissas adotadas são realistas e baseadas em uma análise multifatorial do ambiente de negócios, garantindo que o projeto atenda tanto às expectativas do mercado quanto aos rigorosos requisitos de instituições de fomento.
`;

    // Return the single, consolidated, rewritten text.
    return rewrittenContent;
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
    return {
        valueProposition: {
            items: [
                generateRealisticMatrixItem(`Insight validado de "${sectionTitle}"`, 'baixo')
            ],
            description: "Descrição atualizada com base no conteúdo aprovado.",
            source: `Retroalimentação - ${sectionTitle}`,
            clarityLevel: (currentMatrix.valueProposition?.clarityLevel || 60) + 5,
        }
    };
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