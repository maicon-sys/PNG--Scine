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

export const INITIAL_SECTIONS: PlanSection[] = [
  // --- CAPÍTULO 1: SUMÁRIO EXECUTIVO ---
  { id: '1.0', chapter: '1. SUMÁRIO EXECUTIVO', title: '1.0 Introdução Geral', description: 'Escreva um resumo executivo de uma página que sintetize os pontos mais importantes de TODO o plano de negócios (Capítulos 2 a 10). Este texto deve ser gerado por último e funcionar como a \'porta de entrada\' para o avaliador, destacando a oportunidade, a equipe, os diferenciais e os números-chave do projeto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.0', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.0 Intro Apresentação', description: 'Escreva um parágrafo introdutório que resuma os pontos-chave a serem detalhados nesta subseção: a descrição do negócio, seus componentes, o problema que resolve e a proposta de valor.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.1', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.1 Descrição SCine', description: 'Descreva a SCine de forma clara e concisa: o que é o negócio, para quem se destina (público B2C e B2B), e onde atua (foco em Santa Catarina com visão de expansão para o Sul). Detalhe o conceito do ecossistema integrado: Plataforma OTT, HUB Físico e Van 4K.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.2', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.2 Componentes', description: 'Explique o papel estratégico de cada um dos três componentes do ecossistema: 1) A Plataforma OTT como janela de distribuição de conteúdo; 2) O HUB Audiovisual como base física para produção e fomento do mercado local; 3) A Van 4K como unidade móvel para geração de receita com eventos externos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.3', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.3 Problema/Oportunidade', description: 'Defina o problema de mercado que a SCine resolve: a falta de uma janela de exibição e fomento dedicada à produção cultural e audiovisual de Santa Catarina, e a carência de infraestrutura profissional para produtores locais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.4', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.4 Proposta de Valor', description: 'Descreva a Proposta de Valor para cada público. Para o B2C (assinantes): acesso a conteúdo local relevante e de qualidade. Para o B2B (empresas, prefeituras): infraestrutura de produção e transmissão para seus próprios conteúdos e eventos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.5', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.5 Conclusão Apresentação', description: 'Escreva um parágrafo de conclusão que reforce a clareza e a força do conceito da SCine, sintetizando os pontos de 1.1.1 a 1.1.4 e respondendo objetivamente: a apresentação do negócio é sólida e compreensível para um avaliador?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.0', chapter: '1.2 EMPREENDEDORES', title: '1.2.0 Intro Equipe', description: 'Escreva um parágrafo introdutório apresentando a equipe por trás do projeto, destacando a combinação de expertises como um diferencial competitivo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.1', chapter: '1.2 EMPREENDEDORES', title: '1.2.1 Perfil Sócios', description: 'Apresente um mini-perfil de cada sócio, detalhando sua experiência, histórico profissional relevante e competências que agregam ao negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.2', chapter: '1.2 EMPREENDEDORES', title: '1.2.2 Empresas', description: 'Explique o papel e a sinergia entre as empresas envolvidas na estrutura societária: SCine (o projeto principal), 4Movie (produtora/conteúdo) e Labd12 (tecnologia/gestão).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.3', chapter: '1.2 EMPREENDEDORES', title: '1.2.3 Equipe Núcleo', description: 'Descreva as funções críticas já existentes ou planejadas para o núcleo da equipe, como gestão, curadoria de conteúdo, tecnologia e operações.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.4', chapter: '1.2 EMPREENDEDORES', title: '1.2.4 Diferenciais', description: 'Argumente por que esta equipe tem a capacidade de executar o projeto com sucesso, focando em experiências passadas, rede de contatos e conhecimento do mercado local.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.5', chapter: '1.2 EMPREENDEDORES', title: '1.2.5 Conclusão Equipe', description: 'Escreva um parágrafo de conclusão que sintetize a força da equipe, conectando as competências individuais à capacidade de execução do plano e mitigação de riscos operacionais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.0', chapter: '1.3 ESTRATÉGIA', title: '1.3.0 Intro Estratégia', description: 'Escreva um parágrafo introdutório que defina a importância da missão, visão e valores como a base estratégica que guia todas as decisões do negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.1', chapter: '1.3 ESTRATÉGIA', title: '1.3.1 Missão', description: 'Defina a Missão da SCine: o propósito central e a razão de existir da empresa (Ex: "Difundir e fortalecer a cultura e a produção audiovisual de Santa Catarina, conectando criadores e público.").', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.2', chapter: '1.3 ESTRATÉGIA', title: '1.3.2 Visão', description: 'Defina a Visão da SCine: onde a empresa aspira chegar em um horizonte de 5 a 10 anos (Ex: "Ser a principal referência em conteúdo e infraestrutura audiovisual da região Sul do Brasil.").', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.3', chapter: '1.3 ESTRATÉGIA', title: '1.3.3 Valores', description: 'Liste e descreva os valores fundamentais que guiam a cultura da empresa, como valorização da cultura local, acessibilidade, inovação e sustentabilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.4', chapter: '1.3 ESTRATÉGIA', title: '1.3.4 Objetivos', description: 'Estabeleça de 3 a 5 objetivos estratégicos mensuráveis para os primeiros 24 meses (Ex: "Atingir X mil assinantes", "Viabilizar Y projetos no HUB", "Gerar R$ Z em receita com a Van 4K").', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.5', chapter: '1.3 ESTRATÉGIA', title: '1.3.5 Conclusão Estratégia', description: 'Escreva um parágrafo de conclusão que conecte a missão, visão e valores aos objetivos estratégicos, mostrando como o "porquê" da empresa se traduz em metas concretas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.0', chapter: '1.4 INDICADORES', title: '1.4.0 Intro Indicadores', description: 'Apresente este tópico como um painel financeiro resumido (dashboard), oferecendo ao avaliador uma visão rápida e clara da viabilidade econômica do projeto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.1', chapter: '1.4 INDICADORES', title: '1.4.1 Receita/Lucro', description: 'Apresente os números projetados de receita e lucro líquido para os primeiros 24 meses, destacando as margens operacionais esperadas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.2', chapter: '1.4 INDICADORES', title: '1.4.2 Payback', description: 'Informe o tempo estimado para o retorno do investimento inicial (Payback), tanto na forma simples quanto descontada (considerando o valor do dinheiro no tempo).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.3', chapter: '1.4 INDICADORES', title: '1.4.3 Ponto Equilíbrio', description: 'Calcule e apresente o Ponto de Equilíbrio do negócio, tanto em termos de faturamento mensal necessário quanto em número de assinantes B2C equivalentes para cobrir os custos fixos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.4', chapter: '1.4 INDICADORES', title: '1.4.4 Indicadores BRDE', description: 'Destaque os indicadores-chave para a análise de crédito do BRDE, como o Índice de Cobertura do Serviço da Dívida (DSCR), para demonstrar a capacidade de pagamento do financiamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.5', chapter: '1.4 INDICADORES', title: '1.4.5 Conclusão Indicadores', description: 'Escreva um parágrafo de conclusão que consolide os indicadores, oferecendo um veredito claro sobre a saúde financeira e a viabilidade do projeto: "O projeto se paga e tem capacidade de honrar o financiamento?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.0', chapter: '1.5 INVESTIMENTO', title: '1.5.0 Intro Investimento', description: 'Apresente este tópico como a estrutura de capital do projeto (fontes e usos), mostrando como os recursos serão alocados para viabilizar o plano.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.1', chapter: '1.5 INVESTIMENTO', title: '1.5.1 Total Projeto', description: 'Detalhe o valor de investimento total do projeto, dividindo-o nos principais blocos de despesa (CAPEX): Plataforma, construção do HUB, e aquisição da Van 4K.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.2', chapter: '1.5 INVESTIMENTO', title: '1.5.2 Valor BRDE', description: 'Especifique o valor exato solicitado ao BRDE, a linha de crédito pretendida (Inovação e Acessibilidade) e as condições gerais (prazo, carência).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.3', chapter: '1.5 INVESTIMENTO', title: '1.5.3 Contrapartida', description: 'Descreva a contrapartida dos empreendedores no projeto, que pode incluir capital próprio, investimentos já realizados, uso de incentivos fiscais ou parcerias estratégicas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.4', chapter: '1.5 INVESTIMENTO', title: '1.5.4 Relação Impacto', description: 'Crie uma relação clara entre o investimento solicitado e os resultados esperados, mostrando como o capital do BRDE alavancará o crescimento da receita e o impacto socio-cultural.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.5', chapter: '1.5 INVESTIMENTO', title: '1.5.5 Conclusão Investimento', description: 'Escreva um parágrafo de conclusão que resuma a estrutura de capital, reforçando a coerência entre os investimentos planejados e os objetivos do negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.0', chapter: '1.6 DIFERENCIAIS', title: '1.6.0 Intro Diferenciais', description: 'Apresente este tópico como o "pitch final" do Sumário Executivo, consolidando os principais argumentos que tornam o projeto SCine único e atrativo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.1', chapter: '1.6 DIFERENCIAIS', title: '1.6.1 Produto', description: 'Destaque os diferenciais do produto: foco na regionalidade do conteúdo, catálogo exclusivo e compromisso com a acessibilidade (Libras, AD).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.2', chapter: '1.6 DIFERENCIAIS', title: '1.6.2 Modelo Negócio', description: 'Reforce a força do modelo de negócio híbrido: a combinação de receitas recorrentes (B2C) com receitas de serviços (B2B), criando um ecossistema financeiramente resiliente.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.3', chapter: '1.6 DIFERENCIAIS', title: '1.6.3 Equipe/Rede', description: 'Saliente a capacidade de execução da equipe, baseada no histórico comprovado dos sócios e na rede de parceiros já estabelecida no mercado audiovisual.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.4', chapter: '1.6 DIFERENCIAIS', title: '1.6.4 Impacto SC', description: 'Enfatize o impacto positivo para Santa Catarina: geração de empregos na economia criativa, fomento à cultura local e desenvolvimento regional, alinhado ao mandato do BRDE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.5', chapter: '1.6 DIFERENCIAIS', title: '1.6.5 Conclusão Diferenciais', description: 'Escreva um parágrafo de conclusão poderoso que sintetize todos os diferenciais, respondendo à pergunta final do avaliador: "Por que este projeto é especial e merece o investimento?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 2: ANÁLISE DE MERCADO ---
  { id: '2.0', chapter: '2. ANÁLISE DE MERCADO', title: '2.0 Introdução Geral', description: 'Escreva um parágrafo de abertura para la Análise de Mercado, fornecendo uma visão panorâmica do cenário atual do streaming e da economia criativa no Brasil e em Santa Catarina, e como a SCine se insere neste contexto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.1.0', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.0 Introdução aos Clientes', description: 'Apresente um resumo executivo sobre quem é o cliente da SCine, tanto B2C quanto B2B, preparando o leitor para la análise detalhada que se segue.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.1.1', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.1 Perfil Demográfico', description: 'Analise o perfil demográfico (gênero, idade, renda, localização) do público-alvo, baseando-se em dados de pesquisas e fontes externas (IBGE, etc.). Demonstre a aderência do público ao produto e a compatibilidade da renda com os preços propostos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.2', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.2 Hábitos de Consumo', description: 'Analise os hábitos de consumo de mídia do público-alvo. Inclua a frequência com que consomem streaming, quais outras plataformas assinam e que tipo de conteúdo buscam. Use dados da pesquisa para responder à questão do BRDE: o hábito de pagar por streaming já existe neste público?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.3', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.3 Disposição a Pagar', description: 'Investigue a disposição do público a pagar pelo serviço. Apresente as faixas de preço consideradas aceitáveis segundo a pesquisa e analise a sensibilidade a diferentes valores. O objetivo é validar se o preço proposto nos planos da SCine está alinhado com a percepção de valor do mercado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.4', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.4 Motivações e Barreiras', description: 'Identifique os principais motivos que levariam o público a assinar a SCine (ex: conteúdo local, apoio à cultura) e as principais barreiras (ex: concorrência, custo). Para o BRDE, é crucial mostrar que existe um plano para contornar os obstáculos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.5', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.5 Segmentos e Personas', description: 'Com base nos dados coletados, defina de 2 a 3 segmentos de clientes principais (ex: "Amantes da Cultura Local", "Produtores Audiovisuais"). Crie uma persona detalhada para o segmento mais importante, tornando o público-alvo mais tangível.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.6', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.6 Implicações Produto/Preço', description: 'Conecte as descobertas sobre o perfil do cliente com as decisões de produto e preço. Mostre como as características do público influenciaram a formatação dos planos, a curadoria de conteúdo e a estratégia de monetização, provando a coerência da projeção de receita.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.7', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.7 Conclusão Clientes', description: 'Escreva uma síntese conclusiva da análise de clientes, respondendo de forma clara e baseada em dados à pergunta fundamental: "Existe um público definido, acessível e disposto a pagar pelo projeto SCine?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.2.0', chapter: '2.2 CONCORRENTES', title: '2.2.0 Introdução Concorrência', description: 'Apresente um parágrafo introdutório sobre o cenário competitivo, reconhecendo os players existentes e posicionando a SCine dentro deste ecossistema.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.2.1', chapter: '2.2 CONCORRENTES', title: '2.2.1 Mapa de Concorrentes', description: 'Crie um mapa da concorrência, classificando os concorrentes em três níveis: Globais (Netflix, etc.), Nacionais (Globoplay, etc.) e Regionais (outras iniciativas locais, se houver).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.2', chapter: '2.2 CONCORRENTES', title: '2.2.2 Comparativo de Oferta', description: 'Faça uma análise comparativa da oferta de valor, avaliando catálogo de conteúdo, recursos de acessibilidade, cobertura de eventos e outros diferenciais relevantes em relação aos principais concorrentes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.3', chapter: '2.2 CONCORRENTES', title: '2.2.3 Preços e Modelos', description: 'Construa uma tabela ou análise comparativa dos modelos de negócio e preços dos concorrentes, para contextualizar e justificar a estratégia de precificação da SCine.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.4', chapter: '2.2 CONCORRENTES', title: '2.2.4 Branding Concorrente', description: 'Analise o posicionamento de marca e a comunicação dos principais rivais. Como eles se apresentam ao mercado? Qual imagem eles projetam?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.5', chapter: '2.2 CONCORRENTES', title: '2.2.5 Vantagens SCine (SWOT)', description: 'Com base na análise, liste os pontos fortes (vantagens competitivas) e fracos (desvantagens) da SCine em relação à concorrência. Foque no nicho de mercado que a SCine pode dominar.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.6', chapter: '2.2 CONCORRENTES', title: '2.2.6 Conclusão Concorrência', description: 'Escreva um parágrafo de síntese que responda à pergunta-chave: "Onde está a brecha de mercado que a SCine pode explorar para coexistir e prosperar, mesmo com a presença de grandes players?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.3.0', chapter: '2.3 FORNECEDORES', title: '2.3.0 Introdução Parceiros', description: 'Apresente este tópico como uma análise da cadeia de valor da SCine, mapeando os fornecedores e parceiros essenciais para a operação do negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.3.1', chapter: '2.3 FORNECEDORES', title: '2.3.1 Fornecedores Críticos', description: 'Identifique os fornecedores críticos para la operação, como a plataforma de tecnologia (Vodlix) e os gateways de pagamento. Analise o nível de dependência e o risco operacional associado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.2', chapter: '2.3 FORNECEDORES', title: '2.3.2 Parceiros Conteúdo', description: 'Liste os principais parceiros de conteúdo, como produtoras locais, artistas independentes e detentores de acervo. Para o BRDE, é importante mostrar que o pipeline de conteúdo é real e sustentável.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.3', chapter: '2.3 FORNECEDORES', title: '2.3.3 Parceiros B2B', description: 'Mapeie os parceiros estratégicos do lado B2B, como prefeituras, associações empresariais e organizadores de festivais, que podem gerar receita e visibilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.4', chapter: '2.3 FORNECEDORES', title: '2.3.4 Dependência e Risco', description: 'Avalie o risco de dependência de cada fornecedor crítico e descreva as alternativas ou planos de contingência para mitigar esses riscos (ex: ter um segundo gateway de pagamento mapeado).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.5', chapter: '2.3 FORNECEDORES', title: '2.3.5 Implicações Custos', description: 'Analise como os custos com esses fornecedores e parceiros impactam a estrutura de custos e a margem de lucro do negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.6', chapter: '2.3 FORNECEDORES', title: '2.3.6 Conclusão Parceiros', description: 'Escreva um parágrafo de síntese que responda à pergunta: "A cadeia produtiva e de fornecedores da SCine está bem estruturada e segura para garantir a operação contínua?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.4.0', chapter: '2.4 TENDÊNCIAS', title: '2.4.0 Introdução Tendências', description: 'Introduza este tópico como uma análise do contexto macroeconômico e comportamental em que a SCine está inserida, avaliando as "ondas" que podem impulsionar ou frear o negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.4.1', chapter: '2.4 TENDÊNCIAS', title: '2.4.1 Globais', description: 'Descreva as principais tendências globais no mercado de streaming, como o crescimento contínuo do VOD, a ascensão dos nichos e a busca por conteúdo autêntico.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.2', chapter: '2.4 TENDÊNCIAS', title: '2.4.2 Brasil e SC', description: 'Analise as tendências específicas do mercado brasileiro e catarinense, como a crescente adoção de serviços digitais, as políticas públicas de fomento ao audiovisual e a valorização da cultura regional.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.3', chapter: '2.4 TENDÊNCIAS', title: '2.4.3 Oportunidades SCine', description: 'Com base nas tendências mapeadas, identifique e descreva as oportunidades concretas que a SCine pode aproveitar (ex: "a tendência de valorização do local abre espaço para um player focado em conteúdo regional").', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.4', chapter: '2.4 TENDÊNCIAS', title: '2.4.4 Ameaças', description: 'Identifique e descreva as ameaças que as tendências podem representar, como a saturação do mercado de streaming ou mudanças regulatórias que possam impactar o negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.5', chapter: '2.4 TENDÊNCIAS', title: '2.4.5 Conclusão Tendências', description: 'Escreva uma conclusão que sintetize a análise, respondendo à pergunta: "O projeto SCine está posicionado para surfar na onda correta, aproveitando as tendências favoráveis e se protegendo das ameaças?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.5.0', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.0 Síntese do Mercado', description: 'Apresente este tópico como a conclusão final da Análise de Mercado, onde o tamanho do mercado será quantificado para validar o potencial de crescimento do projeto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.5.1', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.1 TAM (Total)', description: 'Calcule e apresente o Mercado Total Endereçável (TAM), ou seja, o mercado total de streaming e produção audiovisual no Brasil.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.2', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.2 SAM (Serviceable)', description: 'Calcule e apresente o Mercado Disponível para Atendimento (SAM), fazendo o recorte do TAM para o público com perfil e localização adequados à SCine em Santa Catarina.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.3', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.3 SOM (Meta)', description: 'Defina o Mercado Atingível (SOM), que é a meta realista de captura de mercado da SCine para os primeiros 2-3 anos, tanto em número de assinantes quanto em faturamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.4', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.4 Implicações', description: 'Analise as implicações dos números de TAM, SAM e SOM para as estratégias de marketing e para as projeções financeiras, mostrando a coerência entre o tamanho do mercado e as metas do negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.5', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.5 Contingência', description: 'Descreva o plano de contingência caso a demanda inicial não atinja as metas do SOM. Quais ações seriam tomadas para ajustar a estratégia?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.6', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.6 Veredito de Mercado', description: 'Forneça um veredito final e conclusivo sobre a análise de mercado. Responda, com base em todos os dados do Capítulo 2: "O mercado efetivamente comporta o projeto SCine?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 3: MARKETING ---
  { id: '3.0', chapter: '3. PLANO DE MARKETING', title: '3.0 Introdução ao Marketing', description: 'Escreva um parágrafo introdutório que resuma a estratégia geral de marketing, explicando como a SCine planeja atrair, converter e reter seus clientes B2C e B2B.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.1.0', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.0 Intro Segmentação', description: 'Introduza a estratégia de segmentação, explicando a importância de definir um público-alvo claro para otimizar os esforços e recursos de marketing.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.1.1', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.1 B2C e B2B', description: 'Descreva os dois grandes segmentos de clientes da SCine: o consumidor final (B2C) e as empresas/instituições (B2B), destacando as diferenças de abordagem para cada um.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.2', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.2 Foco Inicial', description: 'Defina qual será o foco de mercado prioritário para os primeiros 24 meses de operação, justificando a escolha (ex: focar na base B2C para validar o modelo antes de escalar o B2B).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.3', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.3 Posicionamento', description: 'Defina o posicionamento da SCine, justificando como ele cria uma vantagem competitiva sustentável frente aos concorrentes. Analise como essa identidade de marca se traduzirá em menor Custo de Aquisição de Cliente (CAC) e maior Lifetime Value (LTV), provando seu impacto na viabilidade financeira.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.4', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.4 Proposta de Valor', description: 'Refine a Proposta de Valor sob la ótica de marketing. Qual é o diferencial concreto e comunicável que fará o cliente escolher a SCine em vez de outras opções?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.5', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.5 Conclusão Segmentação', description: 'Faça uma conclusão sobre a estratégia de segmentação, respondendo: "O foco de mercado está correto e o posicionamento da marca é claro e defensável?"', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.2.0', chapter: '3.2 PORTFÓLIO', title: '3.2.0 Intro Portfólia', description: 'Introduza o portfólio de produtos e serviços, explicando como ele materializa a Proposta de Valor da SCine.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.2.1', chapter: '3.2 PORTFÓLIO', title: '3.2.1 Planos B2C', description: 'Detalhe a estrutura dos planos de assinatura para o consumidor final (B2C), como os níveis Free (AVOD), Star e Premium (SVOD). Especifique o que cada plano oferece (resolução, número de telas, acesso a conteúdo exclusivo, etc.)', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.2', chapter: '3.2 PORTFÓLIO', title: '3.2.2 Serviços B2B', description: 'Descreva o portfólio de serviços para o mercado B2B, incluindo: aluguel de estúdios e ilhas de edição no HUB, serviços de transmissão de eventos com a Van 4K, e criação de canais corporativos (brand channels) na plataforma OTT.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.3', chapter: '3.2 PORTFÓLIO', title: '3.2.3 Mix Conteúdo', description: 'Analise a estratégia de mix de conteúdo sob la ótica financeira e de risco. Justifique a proporção entre conteúdo próprio (maior custo, maior diferencial), licenciado (menor custo, menor exclusividade) e de parceiros. Demonstre como esse mix otimiza o orçamento e maximiza a retenção de assinantes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.4', chapter: '3.2 PORTFÓLIO', title: '3.2.4 Diferenciais', description: 'Liste os diferenciais competitivos do portfólio, como a exclusividade do conteúdo regional, a integração entre os serviços (OTT + HUB + Van) e o compromisso com la acessibilidade em todas as produções.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.5', chapter: '3.2 PORTFÓLIO', title: '3.2.5 Conclusão Portfólio', description: 'Faça uma síntese do portfólio, respondendo se a oferta de produtos e serviços é coerente, atrativa para os segmentos-alvo e financeiramente sustentável.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 11: DOCUMENTOS COMPLEMENTARES ---
  { id: '11.0', chapter: '11. DOCUMENTOS COMPLEMENTARES', title: '11.0 Introdução aos Documentos Complementares', description: 'Este capítulo serve para apresentar as evidências documentais que suportam as afirmações feitas ao longo do plano. Cada subseção deve extrair e apresentar os dados mais relevantes do documento correspondente, tornando o texto autossuficiente.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.1.1', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.1 Contratos/Estatutos', description: 'Com base nos Contratos Sociais ou Estatutos anexados, apresente um resumo da estrutura societária, capital social, objeto social e quadro de sócios e administradores das empresas envolvidas (SCine, 4Movie, Labd12).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.2.1', chapter: '11.2 PESQUISAS E ESTUDOS', title: '11.2.1 Pesquisa de Público', description: 'Com base na pesquisa de público anexada, escreva um resumo executivo apresentando os dados demográficos, hábitos de consumo e disposição a pagar. Incorpore tabelas e estatísticas-chave que validem as premissas de demanda usadas no Plano Financeiro.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.3.1', chapter: '11.3 ORÇAMENTOS', title: '11.3.1 Equipamentos e Obras', description: 'Com base nos orçamentos de fornecedores anexados, crie uma tabela consolidada detalhando os custos de CAPEX para la aquisição de equipamentos (HUB, Van 4K) e para as obras civis do HUB. O total deve ser consistente com o valor de investimento solicitado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.4.1', chapter: '11.4 DOCUMENTOS TÉCNICOS', title: '11.4.1 Plantas e Layouts', description: 'Com base nas plantas e projetos técnicos anexados, descreva a distribuição do espaço do HUB Audiovisual, incluindo la área dos estúdios, ilhas de edição e espaços de apoio. A descrição deve validar a capacidade operacional planejada.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.5.1', chapter: '11.5 CURRÍCULOS E PORTFÓLIOS', title: '11.5.1 CVs e Portfólios Chave', description: 'Com base nos currículos e portfólios anexados, escreva um parágrafo para cada sócio ou membro-chave da equipe, destacando os projetos e experiências anteriores que comprovam a capacidade de execução do time.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.6.1', chapter: '11.6 CARTAS E CONTRATOS', title: '11.6.1 Cartas de Intenção', description: 'Com base nas cartas de intenção de parceiros (B2B, conteúdo) anexadas, resuma os compromissos ou interesses formalizados, demonstrando que já existe uma tração inicial de mercado e um pipeline de conteúdo/receita.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.7.1', chapter: '11.7 DADOS HISTÓRICOS', title: '11.7.1 Balanços e Faturamento', description: 'Com base nos balanços e históricos de faturamento das empresas existentes (4Movie, Labd12), apresente um resumo da saúde financeira e da capacidade de geração de receita pré-projeto, o que serve como um indicador de capacidade de gestão para o BRDE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.8.1', chapter: '11.8 FORMULÁRIOS BRDE', title: '11.8.1 Checklist e Declarações', description: 'Esta seção confirma que todos os formulários padrão, checklists e declarações exigidos pelo BRDE/FSA foram preenchidos e estão anexados, demonstrando a diligência e a organização do proponente no processo de financiamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true }
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