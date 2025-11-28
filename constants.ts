import { PlanSection, SectionStatus, SectionType, StrategicMatrix } from './types';

// FEATURE: Nova matriz de validação detalhada que guia o diagnóstico.
// Esta estrutura substitui a antiga lista de passos genérica.
export interface Criterion {
  id: string; // Ex: '2.1.1'
  level: 0 | 1 | 2 | 3; // 0: Existência, 1: Profundidade (Sebrae), 2: Bancário (BRDE), 3: Coerência
  label: string;
  description: string;
  keywords: string[]; // Palavras-chave para a IA procurar no contexto
  // Subcritérios para avaliações de profundidade (Nível 1 e 2)
  subCriteria?: { id: string; label: string; keywords: string[] }[]; 
}

export interface ChapterValidation {
  chapterId: string; // '1', '2', etc.
  chapterName: string;
  criteria: Criterion[];
}

// ✅ MATRIZ DE EXIGÊNCIAS PARA CONSTRUIR O PLANO DE NEGÓCIO (SEBRAE + BRDE)
export const VALIDATION_MATRIX: ChapterValidation[] = [
  {
    chapterId: '1',
    chapterName: 'SUMÁRIO EXECUTIVO',
    criteria: [
      { id: '1.0.1', level: 0, label: 'Descrição do negócio', description: 'O que é o negócio', keywords: ['negócio', 'empresa', 'scine', 'plataforma', 'hub', 'ecossistema'] },
      { id: '1.0.2', level: 0, label: 'Problema/Solução', description: 'O que ele resolve', keywords: ['problema', 'solução', 'oportunidade', 'resolve', 'necessidade'] },
      { id: '1.0.3', level: 0, label: 'Público-alvo', description: 'Para quem', keywords: ['público', 'cliente', 'segmento', 'b2c', 'b2b'] },
      { id: '1.0.4', level: 0, label: 'Modelo de receita', description: 'Como ganha dinheiro', keywords: ['receita', 'monetização', 'assinatura', 'venda', 'preço'] },
      { id: '1.0.5', level: 0, label: 'Investimento necessário', description: 'Investimento necessário', keywords: ['investimento', 'valor', 'recursos', 'financiamento', 'crédito'] },
      { id: '1.0.6', level: 0, label: 'Resultado esperado', description: 'Resultado esperado', keywords: ['resultado', 'meta', 'objetivo', 'retorno', 'impacto'] },
      { id: '1.2.1', level: 2, label: 'Indicadores financeiros (payback, margem, ponto de equilíbrio, EBITDA)', description: 'Exigência de indicadores como payback, margem, ponto de equilíbrio, EBITDA.', keywords: ['indicadores', 'payback', 'margem', 'ponto de equilíbrio', 'ebitda'] },
      { id: '1.2.2', level: 2, label: 'Garantias e contrapartida', description: 'Exigência de menção a garantias e contrapartida.', keywords: ['garantias', 'contrapartida', 'aporte'] },
      { id: '1.2.3', level: 2, label: 'Origem dos recursos', description: 'Exigência de detalhamento da origem dos recursos (empréstimo + contrapartida).', keywords: ['origem dos recursos', 'fontes', 'empréstimo'] },
      { id: '1.2.4', level: 2, label: 'Impacto social', description: 'Exigência de menção ao impacto social do projeto.', keywords: ['impacto social', 'cultural', 'regional', 'comunidade'] },
      { id: '1.2.5', level: 2, label: 'Capacidade de pagamento', description: 'Exigência de demonstração da capacidade de pagamento.', keywords: ['capacidade de pagamento', 'dscr', 'serviço da dívida'] },
    ]
  },
  {
    chapterId: '2',
    chapterName: 'ANÁLISE DE MERCADO',
    criteria: [
      { id: '2.0.1', level: 0, label: 'Segmentação presente', description: 'Verifica a existência de análise de segmentação.', keywords: ['segmentação', 'público-alvo', 'persona'] },
      { id: '2.0.2', level: 0, label: 'Pesquisa primária presente', description: 'Verifica menção a uma pesquisa de mercado primária.', keywords: ['pesquisa', 'questionário', 'entrevista', 'primária'] },
      { id: '2.0.3', level: 0, label: 'Análise de concorrentes presente', description: 'Verifica a existência de análise de concorrência.', keywords: ['concorrente', 'concorrência', 'competidores'] },
      { id: '2.0.4', level: 0, label: 'TAM/SAM/SOM presente', description: 'Verifica a existência do cálculo de tamanho de mercado.', keywords: ['tam', 'sam', 'som', 'tamanho de mercado'] },
      { id: '2.0.5', level: 0, label: 'Tendências presentes', description: 'Verifica a análise de tendências de mercado.', keywords: ['tendências', 'cenário', 'crescimento'] },
      { id: '2.0.6', level: 0, label: 'Riscos de mercado presentes', description: 'Verifica a identificação de riscos de mercado.', keywords: ['riscos de mercado', 'ameaças'] },
      { id: '2.1.1', level: 1, label: 'Profundidade da Segmentação', description: 'A segmentação deve incluir características demográficas, comportamentos, hábitos de consumo e poder de compra.', keywords: ['segmentação'], subCriteria: [
        { id: '2.1.1a', label: 'Demografia', keywords: ['demográfico', 'idade', 'gênero', 'renda'] },
        { id: '2.1.1b', label: 'Comportamentos/Hábitos', keywords: ['comportamento', 'hábito', 'frequência', 'consumo'] },
        { id: '2.1.1c', label: 'Poder de compra', keywords: ['poder de compra', 'capacidade de pagamento', 'disposição a pagar'] },
      ]},
      { id: '2.1.2', level: 1, label: 'Profundidade da Concorrência', description: 'A análise de concorrência deve incluir mapa de concorrentes, tabela comparativa de preços e funcionalidades, e análise de forças/fraquezas.', keywords: ['concorrente'], subCriteria: [
        { id: '2.1.2a', label: 'Tabela Comparativa', keywords: ['tabela', 'comparativo', 'preços', 'funcionalidades'] },
        { id: '2.1.2b', label: 'Forças/Fraquezas', keywords: ['forças', 'fraquezas', 'vantagens', 'desvantagens'] },
      ]},
      { id: '2.2.1', level: 2, label: 'Cálculo TAM/SAM/SOM com fontes oficiais', description: 'Exige cálculo matemático com metodologia clara e fontes oficiais (IBGE, Kantar, etc.).', keywords: ['tam', 'sam', 'som'], subCriteria: [
        { id: '2.2.1a', label: 'Fórmula/Metodologia', keywords: ['cálculo', 'fórmula', 'metodologia'] },
        { id: '2.2.1b', label: 'Fonte Oficial', keywords: ['ibge', 'kantar', 'anacine', 'fonte:', 'dados de'] },
      ]},
      { id: '2.2.2', level: 2, label: 'Prova de Demanda (Capacidade de Pagamento)', description: 'Exige prova de demanda com dados que demonstrem a capacidade de pagamento do público.', keywords: ['demanda', 'interesse', 'intenção de compra', 'capacidade de pagamento'] },
      { id: '2.2.3', level: 2, label: 'Análise CAC Concorrentes', description: 'Exige estimativa do Custo de Aquisição de Cliente dos concorrentes.', keywords: ['cac', 'custo de aquisição', 'concorrente'] },
      { id: '2.2.4', level: 2, label: 'Projeção de Adesão (Curva e Churn)', description: 'Exige curva de adoção de assinantes, com taxa de aquisição e churn previsto.', keywords: ['adesão', 'adoção', 'assinantes por mês', 'churn', 'curva'] },
      { id: '2.3.1', level: 3, label: 'Coerência: Projeção Assinantes vs. DRE', description: 'A projeção de assinantes e a receita projetada no DRE devem ser consistentes.', keywords: ['assinantes', 'projeção', 'meta', 'receita', 'dre'] },
      { id: '2.3.2', level: 3, label: 'Coerência: CAC vs. OPEX', description: 'O CAC projetado deve ser coerente com as despesas operacionais (OPEX) no plano financeiro.', keywords: ['cac', 'opex', 'orçamento de marketing', 'despesas operacionais'] },
    ]
  },
  {
    chapterId: '3',
    chapterName: 'PRODUTO / SERVIÇO',
    criteria: [
        { id: '3.0.1', level: 0, label: 'Descrição do produto/serviço', description: 'Descrição clara do produto, benefícios, diferenciais e portfólio.', keywords: ['produto', 'serviço', 'plataforma', 'hub', 'van', 'benefícios', 'diferenciais'] },
        { id: '3.2.1', level: 2, label: 'Prova técnica de entrega', description: 'Prova de que o produto/serviço pode ser tecnicamente entregue.', keywords: ['prova técnica', 'capacidade de entrega', 'viabilidade técnica'] },
        { id: '3.2.2', level: 2, label: 'Pipeline operacional documentado', description: 'Documentação do pipeline operacional (captação, ingest, publicação).', keywords: ['pipeline', 'fluxo operacional', 'ingest', 'publicação', 'captação'] },
        { id: '3.2.3', level: 2, label: 'Acessibilidade como processo', description: 'Acessibilidade (AD, Libras, CC) deve ser um processo integrado.', keywords: ['acessibilidade', 'ad', 'libras', 'closed caption', 'inclusão'] },
        { id: '3.2.4', level: 2, label: 'Roadmap de evolução técnica', description: 'Roadmap claro da evolução técnica do produto/serviço.', keywords: ['roadmap', 'evolução técnica', 'futuro', 'fases'] },
    ]
  },
  {
    chapterId: '4',
    chapterName: 'PLANO DE MARKETING',
    criteria: [
        { id: '4.0.1', level: 0, label: 'Estratégia de aquisição', description: 'Estratégia de aquisição de clientes, 4 Ps, posicionamento e canais.', keywords: ['marketing', 'aquisição', '4 ps', 'posicionamento', 'canais'] },
        { id: '4.2.1', level: 2, label: 'CAC projetado', description: 'Custo de Aquisição de Cliente (CAC) deve ser projetado e justificado.', keywords: ['cac', 'custo de aquisição', 'projetado'] },
        { id: '4.2.2', level: 2, label: 'LTV e ARPU projetados', description: 'Lifetime Value (LTV) e Receita Média por Usuário (ARPU) devem ser projetados.', keywords: ['ltv', 'lifetime value', 'arpu', 'receita por usuário'] },
        { id: '4.2.3', level: 2, label: 'Cronograma de execução', description: 'Cronograma tático de marketing com metas trimestrais.', keywords: ['cronograma', 'marketing', 'metas', 'tático'] },
        { id: '4.3.1', level: 3, label: 'Coerência: Projeção de vendas vs. Financeiro', description: 'A projeção de vendas deve ser coerente com as projeções financeiras.', keywords: ['projeção de vendas', 'receita', 'dre', 'financeiro'] },
    ]
  },
  {
    chapterId: '5',
    chapterName: 'PLANO OPERACIONAL',
    criteria: [
        { id: '5.0.1', level: 0, label: 'Descrição da operação', description: 'Como a empresa funciona no dia a dia, processos e recursos.', keywords: ['operacional', 'processos', 'fluxo de trabalho', 'dia a dia'] },
        { id: '5.2.1', level: 2, label: 'Prova de capacidade operacional', description: 'Prova de que a equipe e a estrutura conseguem executar a operação planejada.', keywords: ['capacidade operacional', 'produtividade', 'limites', 'sla'] },
        { id: '5.3.1', level: 3, label: 'Coerência: Operação vs. Orçamento', description: 'A operação descrita deve ser compatível com o orçamento de OPEX.', keywords: ['operação', 'orçamento', 'opex', 'custos operacionais'] },
    ]
  },
  {
    chapterId: '6',
    chapterName: 'EQUIPE / GOVERNANÇA',
    criteria: [
        { id: '6.0.1', level: 0, label: 'Descrição da equipe', description: 'Quem faz parte do projeto, funções e responsabilidades.', keywords: ['equipe', 'time', 'sócios', 'funções', 'responsabilidades'] },
        { id: '6.2.1', level: 2, label: 'Organograma completo', description: 'Exigência de um organograma claro e completo.', keywords: ['organograma', 'estrutura da equipe', 'hierarquia'] },
        { id: '6.2.2', level: 2, label: 'Governança e divisão societária', description: 'Três níveis de governança e divisão clara entre as empresas (SCine/4Movie/Labd12).', keywords: ['governança', 'societária', 'divisão', '4movie', 'labd12'] },
        { id: '6.2.3', level: 2, label: 'Justificativa de custo da equipe', description: 'O custo da equipe deve ser justificado e compatível com o plano financeiro.', keywords: ['custo da equipe', 'salários', 'contratos', 'orçamento'] },
    ]
  },
  {
    chapterId: '7',
    chapterName: 'JURÍDICO',
    criteria: [
        { id: '7.2.1', level: 2, label: 'Enquadramento legal e societário', description: 'Estrutura societária e enquadramento legal do negócio.', keywords: ['jurídico', 'legal', 'societário', 'contrato social'] },
        { id: '7.2.2', level: 2, label: 'Políticas (Privacidade e Termos)', description: 'Existência de Política de Privacidade e Termos de Uso.', keywords: ['política de privacidade', 'termos de uso', 'lgpd'] },
        { id: '7.2.3', level: 2, label: 'Aderência à ANCINE', description: 'Conformidade com as regulamentações da ANCINE.', keywords: ['ancine', 'regulamentação', 'audiovisual'] },
        { id: '7.2.4', level: 2, label: 'Riscos jurídicos e contratos', description: 'Matriz de riscos jurídicos e drafts de contratos (produtores, B2B).', keywords: ['riscos jurídicos', 'contratos', 'licenciamento'] },
    ]
  },
  {
    chapterId: '8',
    chapterName: 'FINANCEIRO',
    criteria: [
        { id: '8.0.1', level: 0, label: 'DRE presente', description: 'Existência de uma Demonstração do Resultado do Exercício.', keywords: ['dre', 'demonstração de resultado'] },
        { id: '8.0.2', level: 0, label: 'Fluxo de caixa presente', description: 'Existência de um Fluxo de Caixa projetado.', keywords: ['fluxo de caixa', 'fc', 'cash flow'] },
        { id: '8.0.3', level: 0, label: 'Ponto de equilíbrio presente', description: 'Existência do cálculo do Ponto de Equilíbrio.', keywords: ['ponto de equilíbrio', 'break-even'] },
        { id: '8.2.1', level: 2, label: 'DRE 5 anos', description: 'Exige que a DRE tenha uma projeção de 5 anos.', keywords: ['dre', '5 anos', 'cinco anos'] },
        { id: '8.2.2', level: 2, label: 'Fluxo de caixa mensal', description: 'Exige que o fluxo de caixa seja detalhado mensalmente, pelo menos no primeiro ano.', keywords: ['fluxo de caixa', 'mensal'] },
        { id: '8.2.3', level: 2, label: 'Matriz CAPEX/OPEX detalhada', description: 'Exige detalhamento dos investimentos (CAPEX) e custos operacionais (OPEX).', keywords: ['capex', 'opex', 'investimentos', 'custos operacionais'] },
        { id: '8.2.4', level: 2, label: 'Cálculo do DSCR', description: 'Exige o cálculo do Índice de Cobertura do Serviço da Dívida.', keywords: ['dscr', 'índice de cobertura', 'serviço da dívida'] },
        { id: '8.2.5', level: 2, label: 'Análise de Sensibilidade', description: 'Exige uma análise de sensibilidade com múltiplos cenários (otimista, pessimista, realista).', keywords: ['sensibilidade', 'cenário otimista', 'cenário pessimista'] },
        { id: '8.2.6', level: 2, label: 'Cronograma físico-financeiro', description: 'Cronograma que conecta os desembolsos (financeiro) com as entregas (físico).', keywords: ['cronograma físico-financeiro', 'desembolso', 'entregas'] },
    ]
  },
  {
    chapterId: '9',
    chapterName: 'GATILHOS E COVENANTS',
    criteria: [
        { id: '9.2.1', level: 2, label: 'Lista de gatilhos por fase', description: 'Lista de gatilhos (eventos) que liberam as parcelas do financiamento.', keywords: ['gatilhos', 'triggers', 'fase', 'parcela'] },
        { id: '9.2.2', level: 2, label: 'Modelo de relatório para o banco', description: 'Modelo do relatório de acompanhamento a ser enviado ao banco.', keywords: ['relatório', 'banco', 'acompanhamento'] },
        { id: '9.2.3', level: 2, label: 'Exemplo de covenant financeiro', description: 'Exemplo de um covenant (compromisso financeiro) a ser cumprido, como manter DSCR > 1.3.', keywords: ['covenant', 'compromisso', 'financeiro', 'dscr'] },
    ]
  }
];

// FIX: Adds the missing DIAGNOSIS_STEPS constant required by the diagnosis service and the main app component.
// This constant defines the 10 steps of the AI diagnosis process.
export const DIAGNOSIS_STEPS = [
  { name: 'Entendimento do Negócio', matrixTargets: ['valueProposition', 'keyActivities'] },
  { name: 'Análise de Clientes e Segmentos', matrixTargets: ['customerSegments'] },
  { name: 'Canais de Distribuição e Venda', matrixTargets: ['channels'] },
  { name: 'Relacionamento com Clientes', matrixTargets: ['customerRelationships'] },
  { name: 'Estrutura de Receitas', matrixTargets: ['revenueStreams'] },
  { name: 'Recursos e Ativos Chave', matrixTargets: ['keyResources'] },
  { name: 'Parcerias Estratégicas', matrixTargets: ['keyPartnerships'] },
  { name: 'Estrutura de Custos', matrixTargets: ['costStructure'] },
  { name: 'Análise SWOT (Forças e Fraquezas)', matrixTargets: ['swot.strengths', 'swot.weaknesses'] },
  { name: 'Análise SWOT (Oportunidades e Ameaças)', matrixTargets: ['swot.opportunities', 'swot.threats'] }
];


export const BRDE_FSA_RULES = `
REGRAS DE FINANCIAMENTO BRDE / FSA (Linha Inovação e Acessibilidade - Economia Criativa):
- Objetivo: Projetos de inovação, infraestrutura e acessibilidade no setor audiovisual.
- Taxa de Juros: 0,5% ao ano + TR (Taxa Referencial).
- Prazo Total: 10 anos (120 meses).
- Carência: Até 2 anos (24 meses) - paga-se apenas juros (trimestrais ou semestrais).
- Amortização: 8 anos (96 meses) pós-carência. Sistema Price ou SAC.
- Garantias (Fundo Garantidor):
  - Solicitações até R$ 3 milhões: Possibilidade de isenção de garantia real (imóvel), dependendo do rating.
  - Acima de R$ 3 milhões: Exige garantias reais (hipoteca, cartas de fiança).
- Itens Financiáveis (CAPEX): Obras civis (estúdios), Equipamentos (câmeras, ilhas), Softwares, Treinamento.
- Capital de Giro (OPEX): Limitado a um percentual do projeto (geralmente até 30% ou associado).
- Contrapartidas: Acessibilidade obrigatória (Libras, Audiodescrição, Legendas) e impacto regional.
`;

export const SCINE_CONTEXT = `
CONTEXTO DO NEGÓCIO: "SCine"
- Modelo de Negócio: Ecossistema Híbrido.
  1. Plataforma OTT (Streaming): Foco em conteúdo regional de Santa Catarina (VOD e Live).
  2. HUB Audiovisual (Físico): Espaço de 600m² com estúdios, ilhas de edição e coworking para produtores locais.
  3. Unidade Móvel (Van 4K): Veículo de transmissão broadcast para cobertura de eventos e festivais.
- Localização: Santa Catarina (Foco inicial), expansão Sul.
- Público B2C: Assinantes (Planos Free, Star, Premium).
- Público B2B: Prefeituras (transmissão de eventos), Empresas (brand channel), Festivais.
- Tecnologia: Baseada em Vodlix (White label), Gateways (Asaas/Pagar.me).
- Objetivo do Crédito: Financiar a construção do HUB, compra da Van 4K e tracionar a base de usuários.
`;

export const GLOSSARY_TERMS: Record<string, string> = {
  "CAC": "Custo de Aquisição de Cliente (quanto custa atrair um novo pagante)",
  "LTV": "Lifetime Value (Valor total que um cliente deixa na empresa durante sua vida útil)",
  "Churn": "Taxa de cancelamento de assinaturas",
  "Break-even": "Ponto de equilíbrio financeiro (quando receitas igualam despesas)",
  "Payback": "Tempo necessário para recuperar o investimento inicial",
  "ROI": "Retorno Sobre o Investimento",
  "EBITDA": "Lucros antes de juros, impostos, depreciação e amortização",
  "CAPEX": "Capital Expenditure (Despesas de Capital/Investimento em bens)",
  "OPEX": "Operational Expenditure (Despesas Operacionais do dia a dia)",
  "DSCR": "Índice de Cobertura do Serviço da Dívida (Capacidade de pagar parcelas)",
  "TAM": "Total Addressable Market (Mercado Total Endereçável)",
  "SAM": "Serviceable Available Market (Mercado Disponível para Atendimento)",
  "SOM": "Serviceable Obtainable Market (Mercado Atingível a Curto Prazo)",
  "OTT": "Over-The-Top (Transmissão de conteúdo via internet, sem operadora tradicional)",
  "VOD": "Video On Demand (Vídeo sob demanda)",
  "AVOD": "Advertising VOD (Vídeo sob demanda gratuito com anúncios)",
  "SVOD": "Subscription VOD (Vídeo sob demanda por assinatura)",
  "TR": "Taxa Referencial (Indexador financeiro usado pelo BRDE)",
  "CDI": "Certificado de Depósito Interbancário (Taxa referência de juros no Brasil)",
  "FSA": "Fundo Setorial do Audiovisual",
  "ANCINE": "Agência Nacional do Cinema",
  "LGPD": "Lei Geral de Proteção de Dados",
  "B2B": "Business to Business (Venda para empresas)",
  "B2C": "Business to Consumer (Venda para consumidor final)",
  "Pitch": "Apresentação rápida e persuasiva do negócio",
  "Stakeholders": "Partes interessadas no projeto (sócios, banco, clientes)",
  "Valuation": "Avaliação do valor de mercado da empresa",
  "Equity": "Participação societária/Capital próprio",
  "Covenants": "Compromissos contratuais financeiros exigidos pelo banco",
  "Spread": "Diferença entre a taxa de captação e a taxa de empréstimo",
  "Landing Page": "Página de destino focada em conversão",
  "Leads": "Potenciais clientes que demonstraram interesse",
  "Roadshow": "Série de apresentações itinerantes para divulgar o projeto",
  "KPI": "Key Performance Indicator (Indicador Chave de Desempenho)",
  "SaaS": "Software as a Service (Software como Serviço)",
  "API": "Interface de Programação de Aplicações",
  "White label": "Produto/serviço produzido por uma empresa e remarcado por outra",
  "Revenue Share": "Modelo de partilha de receitas",
  "Crowdfunding": "Financiamento coletivo",
  "Compliance": "Conformidade com leis e regulamentos",
};

// FIX: A estrutura de seções foi completamente refeita para alinhar-se
// com o modelo mental do usuário e as diretrizes de geração de conteúdo.
// A numeração agora é lógica (2.1, 2.2, ...) e os títulos correspondem
// exatamente ao que o usuário espera.
export const INITIAL_SECTIONS: PlanSection[] = [
  // --- CAPÍTULO 1: SUMÁRIO EXECUTIVO ---
  { id: '1.0', chapter: '1. SUMÁRIO EXECUTIVO', title: '1.0 Resumo Executivo Geral', description: 'Escreva um resumo executivo de uma página que sintetize os pontos mais importantes de TODO o plano de negócios. Este texto deve ser gerado por último.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 2: ANÁLISE DE MERCADO ---
  { id: '2.0', chapter: '2. ANÁLISE DE MERCADO', title: '2.0 Introdução à Análise de Mercado', description: 'Escreva um parágrafo de abertura para a Análise de Mercado, fornecendo uma visão panorâmica do cenário atual do streaming e da economia criativa no Brasil e em Santa Catarina.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1', chapter: '2. ANÁLISE DE MERCADO', title: '2.1 Segmentação de Mercado', description: 'Identifique os grupos de clientes, dados demográficos, hábitos de consumo e prove que o segmento é grande o suficiente.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2', chapter: '2. ANÁLISE DE MERCADO', title: '2.2 Perfil do Cliente / Persona', description: 'Descreva o comportamento do cliente, seus motivadores, barreiras e a coerência com o produto ofertado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3', chapter: '2. ANÁLISE DE MERCADO', title: '2.3 Necessidades, Problemas e Oportunidades', description: 'Detalhe as dores que a SCine resolve e as oportunidades ignoradas pela concorrência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4', chapter: '2. ANÁLISE DE MERCADO', title: '2.4 Pesquisa de Mercado Primária', description: 'Apresente os dados coletados diretamente com o público-alvo, validando as hipóteses de preço, interesse e barreiras.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5', chapter: '2. ANÁLISE DE MERCADO', title: '2.5 Mercado Potencial – Quantificação (TAM/SAM/SOM)', description: 'Calcule o tamanho total, disponível e atendível do mercado, com fontes e metodologia claras.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.6', chapter: '2. ANÁLISE DE MERCADO', title: '2.6 Análise da Concorrência', description: 'Mapeie os concorrentes diretos e indiretos, com um comparativo de ofertas, preços e posicionamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.7', chapter: '2. ANÁLISE DE MERCADO', title: '2.7 Análise de Tendências de Mercado', description: 'Analise as tendências do setor (crescimento do streaming, VOD, lives, regionalização) com fontes confiáveis.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.8', chapter: '2. ANÁLISE DE MERCADO', title: '2.8 Análise do Ambiente Externo – Fatores PESTEL', description: 'Analise os fatores Políticos, Econômicos, Sociais, Tecnológicos, Ambientais e Legais que impactam o negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.9', chapter: '2. ANÁLISE DE MERCADO', title: '2.9 Análise Setorial', description: 'Descreva o funcionamento do setor audiovisual e de streaming no Brasil, incluindo custos, monetização e produção.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.10', chapter: '2. ANÁLISE DE MERCADO', title: '2.10 Barreiras de Entrada e Riscos de Mercado', description: 'Identifique as barreiras (tecnológicas, catálogo, regulatórias, financeiras) e os riscos, com planos de mitigação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.11', chapter: '2. ANÁLISE DE MERCADO', title: '2.11 Oportunidades Competitivas', description: 'Argumente por que a SCine possui uma vantagem competitiva sustentável no mercado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.12', chapter: '2. ANÁLISE DE MERCADO', title: '2.12 Síntese da Análise de Mercado', description: 'Conecte todos os pontos da análise para provar a viabilidade do negócio no mercado identificado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  
  // --- CAPÍTULO 3: PRODUTO/SERVIÇO ---
  { id: '3.0', chapter: '3. PRODUTO/SERVIÇO', title: '3.0 Introdução ao Produto/Serviço', description: 'Escreva um parágrafo de abertura para o capítulo de Produto/Serviço.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1', chapter: '3. PRODUTO/SERVIÇO', title: '3.1 Descrição, Benefícios e Diferenciais', description: 'Descreva o produto/serviço, seus benefícios e diferenciais, e apresente o pipeline operacional e roadmap técnico.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 4: PLANO DE MARKETING ---
  { id: '4.0', chapter: '4. PLANO DE MARKETING', title: '4.0 Introdução ao Plano de Marketing', description: 'Escreva um parágrafo de abertura para o capítulo de Marketing.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.1', chapter: '4. PLANO DE MARKETING', title: '4.1 Estratégia de Posicionamento e Canais', description: 'Defina os 4Ps (Produto, Preço, Praça, Promoção), o posicionamento da marca e os canais de comunicação a serem utilizados.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2', chapter: '4. PLANO DE MARKETING', title: '4.2 Estratégia de Aquisição e Métricas Financeiras', description: 'Detalhe a estratégia de aquisição de clientes e apresente as projeções de CAC, LTV e ARPU, provando a viabilidade no OPEX.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3', chapter: '4. PLANO DE MARKETING', title: '4.3 Metas e Cronograma de Marketing', description: 'Apresente as metas de marketing trimestrais e o cronograma de execução, garantindo coerência com o plano financeiro.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 5: PLANO OPERACIONAL ---
  { id: '5.0', chapter: '5. PLANO OPERACIONAL', title: '5.0 Introdução ao Plano Operacional', description: 'Escreva um parágrafo de abertura para o capítulo de Operações.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.1', chapter: '5. PLANO OPERACIONAL', title: '5.1 Processos e Capacidade', description: 'Descreva como a empresa funciona, seus processos, recursos e prove a capacidade operacional.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  
  // --- CAPÍTULO 6: EQUIPE / GOVERNANÇA ---
  { id: '6.0', chapter: '6. EQUIPE / GOVERNANÇA', title: '6.0 Introdução à Equipe e Governança', description: 'Escreva um parágrafo de abertura para o capítulo de Equipe e Governança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1', chapter: '6. EQUIPE / GOVERNANÇA', title: '6.1 Estrutura e Funções', description: 'Apresente a equipe, o organograma, a governança e a justificativa de custos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 7: JURÍDICO ---
  { id: '7.0', chapter: '7. JURÍDICO', title: '7.0 Introdução Jurídica', description: 'Escreva um parágrafo de abertura para o capítulo Jurídico.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.1', chapter: '7. JURÍDICO', title: '7.1 Enquadramento, Riscos e Políticas', description: 'Detalhe o enquadramento legal, políticas de privacidade, aderência à ANCINE e riscos jurídicos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  
  // --- CAPÍTULO 8: FINANCEIRO ---
  { id: '8.0', chapter: '8. FINANCEIRO', title: '8.0 Introdução Financeira', description: 'Escreva um parágrafo de abertura para o capítulo Financeiro.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.1', chapter: '8. FINANCEIRO', title: '8.1 Projeções e Indicadores', description: 'Apresente DRE, Fluxo de Caixa, CAPEX/OPEX, DSCR e Análise de Sensibilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, financialData: [] },

  // --- CAPÍTULO 9: GATILHOS E COVENANTS ---
  { id: '9.0', chapter: '9. GATILHOS E COVENANTS', title: '9.0 Introdução aos Gatilhos e Covenants', description: 'Escreva um parágrafo de abertura para o capítulo de Gatilhos e Covenants.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1', chapter: '9. GATILHOS E COVENANTS', title: '9.1 Gatilhos, Relatórios e Covenants', description: 'Liste os gatilhos por fase, o modelo de relatório para o banco e exemplos de covenants financeiros.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  
  // --- CAPÍTULO 11: DOCUMENTOS COMPLEMENTARES ---
  { id: '11.0', chapter: '11. DOCUMENTOS COMPLEMENTARES', title: '11.0 Introdução aos Anexos', description: 'Introdução à seção de documentos que suportam o plano.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
];

export const DEFAULT_METHODOLOGY = 'SEBRAE / BRDE';

const emptyCanvasBlock = { items: [], description: '', source: '', clarityLevel: 0 };
const emptySwotBlock = { items: [], description: '', source: '', clarityLevel: 0 };

// FIX: Removed invalid text from the end of the file that was causing multiple syntax errors.
// The text 'corrija os problemas que voce encontrar no codigo --- END OF FILE ---' was appended after this constant.
export const DEFAULT_STRATEGIC_MATRIX: StrategicMatrix = {
    customerSegments: { ...emptyCanvasBlock },
    valueProposition: { ...emptyCanvasBlock },
    channels: { ...emptyCanvasBlock },
    customerRelationships: { ...emptyCanvasBlock },
    revenueStreams: { ...emptyCanvasBlock },
    keyResources: { ...emptyCanvasBlock },
    keyActivities: { ...emptyCanvasBlock },
    keyPartnerships: { ...emptyCanvasBlock },
    costStructure: { ...emptyCanvasBlock },
    swot: {
        strengths: { ...emptySwotBlock },
        weaknesses: { ...emptySwotBlock },
        opportunities: { ...emptySwotBlock },
        threats: { ...emptySwotBlock },
    },
    generatedAt: 0
};