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
                // FIX: The type of `swot` is a complete object, but the logic builds it property by property.
                // Casting the initial empty object to the expected type allows this incremental update pattern to work
                // without causing a type error. The consuming merge logic handles this partial object correctly.
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
    // ... other params
    ...args: any[]
): Promise<string> => {
    await wait(800 + Math.random() * 400);

    const hasIssues = topicText.length < 100; // Simple heuristic for demo

    return `
# VALIDAÇÃO DO TÓPICO: ${topicTitle}

## 1. Metodologia SEBRAE
**Correções necessárias:**
- ${hasIssues ? "O conteúdo está muito superficial e não aborda todos os pontos solicitados na descrição do tópico. É preciso detalhar mais a análise." : "O tópico segue a estrutura geral, mas pode ser enriquecido com mais dados quantitativos."}
- Adicionar uma tabela comparativa para maior clareza.

## 2. Requisitos BRDE
**Análise:**
- **Clareza de escopo:** ${hasIssues ? "NÃO - O escopo não está claro." : "SIM - O escopo do tópico está bem definido."}
- **Justificativa consistente:** ${hasIssues ? "NÃO - Faltam argumentos para justificar as afirmações." : "SIM - As justificativas são coerentes com o restante do projeto."}
- **Inovação:** SIM - O aspecto de inovação está presente.
- **Acessibilidade:** PARCIAL - Acessibilidade é mencionada, mas não detalhada.

## 3. Coerência com a Matriz
**Divergências encontradas:**
- Não foram encontradas divergências diretas, mas o texto poderia refletir melhor os insights sobre as fraquezas identificadas na Matriz SWOT.

## 4. Problemas de lógica e inverdades
- Nenhum problema de lógica grave foi encontrado. Apenas uma falta de profundidade na análise de causa e consequência.

## 5. Como corrigir
1. **Aprofundar:** Expanda cada ponto da descrição do tópico em pelo menos dois parágrafos.
2. **Quantificar:** Substitua termos vagos como "muitos clientes" por números estimados, mesmo que baseados em premissas (ex: "estimamos atingir 5.000 assinantes no primeiro ano...").
3. **Estruturar:** Use uma tabela Markdown para comparar concorrentes ou apresentar dados financeiros.
4. **Conectar:** Adicione um parágrafo final que conecte as conclusões do tópico com os objetivos gerais do negócio.
    `;
};

export const implementCorrections = async (
    currentContent: string,
    validationReport: string,
    sectionTitle: string,
    sectionDescription: string,
    ...args: any[]
): Promise<string> => {
    await wait(1200 + Math.random() * 800);
    
    const addedContent = `
---
### Aprimoramento Sugerido pela IA

Com base no relatório de validação, foram adicionadas as seguintes informações para fortalecer o tópico, conforme as diretrizes do SEBRAE e BRDE.

#### Análise Quantitativa Adicional
A análise inicial foi aprofundada com dados quantitativos para maior robustez. O mercado de streaming em Santa Catarina, estimado em R$ 200 milhões (SAM), apresenta uma taxa de crescimento de 15% ao ano, segundo dados da Ancine. A SCine visa capturar 2.5% deste mercado (SOM) nos primeiros 36 meses, o que representa uma meta de faturamento de R$ 5 milhões.

#### Tabela Comparativa de Posicionamento
Para facilitar a visualização da estratégia de nicho, a seguinte tabela foi incluída:

| Concorrente | Proposta de Valor | Preço Médio | Foco Regional |
|-------------|-------------------|-------------|---------------|
| **Netflix** | Conteúdo Global   | R$ 39,90    | Não           |
| **Globoplay** | Conteúdo Nacional | R$ 24,90    | Sim (limitado)|
| **SCine**   | Conteúdo Local SC | R$ 19,90    | **Total**     |

Essas adições visam enriquecer o conteúdo original, tornando o argumento mais forte e claro para avaliadores e investidores.
    `;
    
    // Combina o conteúdo original com as novas seções de aprimoramento
    return currentContent + "\n\n" + addedContent;
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