import { PlanSection, SectionStatus, SectionType, StrategicMatrix } from './types';
import { generationGuidelines } from './generationGuidelines';

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
// IDs seguem a estrutura de capítulos e seções listados em INITIAL_SECTIONS.
export const VALIDATION_MATRIX: ChapterValidation[] = [
  {
    chapterId: '1',
    chapterName: 'SUMÁRIO EXECUTIVO',
    criteria: [
      { id: '1.0.1', level: 0, label: 'Descrição do negócio e proposta de valor', description: 'Resumo claro do negócio, proposta de valor e o que é entregue ao cliente.', keywords: ['negócio', 'proposta de valor', 'empresa', 'plataforma', 'hub', 'ecossistema'] },
      { id: '1.0.2', level: 0, label: 'Problema e solução', description: 'Sintetiza o problema de mercado e a solução oferecida.', keywords: ['problema', 'solução', 'necessidade', 'oportunidade'] },
      { id: '1.0.3', level: 0, label: 'Público-alvo e mercado resumido', description: 'Perfil do público e resumo do mercado-alvo.', keywords: ['público', 'cliente', 'segmento', 'b2c', 'b2b', 'mercado'] },
      { id: '1.0.4', level: 0, label: 'Modelo de receita', description: 'Como o negócio monetiza e quais são as fontes de receita.', keywords: ['receita', 'monetização', 'assinatura', 'venda', 'preço'] },
      { id: '1.0.5', level: 0, label: 'Investimento necessário', description: 'Montante e finalidade do investimento/financiamento solicitado.', keywords: ['investimento', 'valor', 'recursos', 'financiamento', 'crédito'] },
      { id: '1.0.6', level: 0, label: 'Resultados esperados e impacto', description: 'Metas de resultado, impacto social/cultural e indicadores principais.', keywords: ['resultado', 'meta', 'objetivo', 'retorno', 'impacto'] },
      { id: '1.1.1', level: 1, label: 'Coerência do resumo com capítulos', description: 'O sumário conecta os principais pontos dos demais capítulos (mercado, marketing, operações, financeiro).', keywords: ['resumo', 'coerência', 'conexão', 'mercado', 'financeiro', 'marketing'] },
      { id: '1.2.1', level: 2, label: 'Indicadores financeiros (payback, margem, ponto de equilíbrio, EBITDA)', description: 'Exigência de indicadores-chave que sustentam o pedido de crédito.', keywords: ['indicadores', 'payback', 'margem', 'ponto de equilíbrio', 'ebitda'] },
      { id: '1.2.2', level: 2, label: 'Garantias e contrapartida', description: 'Menção clara às garantias oferecidas e à contrapartida do proponente.', keywords: ['garantias', 'contrapartida', 'aporte'] },
      { id: '1.2.3', level: 2, label: 'Origem dos recursos', description: 'Detalhamento da composição do projeto: financiamento + contrapartida.', keywords: ['origem dos recursos', 'fontes', 'empréstimo'] },
      { id: '1.2.4', level: 2, label: 'Impacto social', description: 'Destaca o impacto social/cultural e o efeito regional do projeto.', keywords: ['impacto social', 'cultural', 'regional', 'comunidade'] },
      { id: '1.2.5', level: 2, label: 'Capacidade de pagamento', description: 'Demonstra a capacidade de pagamento do crédito solicitado.', keywords: ['capacidade de pagamento', 'dscr', 'serviço da dívida'] },
      { id: '1.3.1', level: 3, label: 'Consistência global do sumário', description: 'Verifica se o sumário executivo reflete fielmente números e mensagens dos demais capítulos.', keywords: ['consistência', 'sumário', 'síntese', 'coerência'] },
    ]
  },
  {
    chapterId: '2',
    chapterName: 'ANÁLISE DE MERCADO',
    criteria: [
      { id: '2.0.1', level: 0, label: 'Segmentação presente', description: 'Existência de análise de segmentação e público-alvo.', keywords: ['segmentação', 'público-alvo', 'persona'] },
      { id: '2.0.2', level: 0, label: 'Pesquisa primária presente', description: 'Menção a pesquisa de mercado primária ou coleta direta.', keywords: ['pesquisa', 'questionário', 'entrevista', 'primária'] },
      { id: '2.0.3', level: 0, label: 'Análise de concorrentes presente', description: 'Mapeamento básico de concorrência direta e indireta.', keywords: ['concorrente', 'concorrência', 'competidores'] },
      { id: '2.0.4', level: 0, label: 'TAM/SAM/SOM presente', description: 'Existência do cálculo de tamanho de mercado.', keywords: ['tam', 'sam', 'som', 'tamanho de mercado'] },
      { id: '2.0.5', level: 0, label: 'Tendências presentes', description: 'Análise de tendências e evolução do setor.', keywords: ['tendências', 'cenário', 'crescimento'] },
      { id: '2.0.6', level: 0, label: 'Riscos de mercado presentes', description: 'Identificação de riscos e barreiras de mercado.', keywords: ['riscos de mercado', 'ameaças'] },
      { id: '2.1.1', level: 1, label: 'Profundidade da segmentação', description: 'Segmentação detalha demografia, comportamento e poder de compra.', keywords: ['segmentação'], subCriteria: [
        { id: '2.1.1a', label: 'Demografia', keywords: ['demográfico', 'idade', 'gênero', 'renda'] },
        { id: '2.1.1b', label: 'Comportamentos/Hábitos', keywords: ['comportamento', 'hábito', 'frequência', 'consumo'] },
        { id: '2.1.1c', label: 'Poder de compra', keywords: ['poder de compra', 'capacidade de pagamento', 'disposição a pagar'] },
      ]},
      { id: '2.1.2', level: 1, label: 'Profundidade da concorrência', description: 'Benchmarking com mapa de concorrentes, tabela comparativa e análise de forças/fraquezas.', keywords: ['concorrente'], subCriteria: [
        { id: '2.1.2a', label: 'Tabela comparativa', keywords: ['tabela', 'comparativo', 'preços', 'funcionalidades'] },
        { id: '2.1.2b', label: 'Forças/Fraquezas', keywords: ['forças', 'fraquezas', 'vantagens', 'desvantagens'] },
      ]},
      { id: '2.2.1', level: 2, label: 'Cálculo TAM/SAM/SOM com fontes oficiais', description: 'Cálculo matemático com metodologia clara e fontes oficiais.', keywords: ['tam', 'sam', 'som'], subCriteria: [
        { id: '2.2.1a', label: 'Fórmula/Metodologia', keywords: ['cálculo', 'fórmula', 'metodologia'] },
        { id: '2.2.1b', label: 'Fonte oficial', keywords: ['ibge', 'kantar', 'anacine', 'fonte:', 'dados de'] },
      ]},
      { id: '2.2.2', level: 2, label: 'Prova de demanda e capacidade de pagamento', description: 'Dados que demonstrem interesse real e capacidade de pagamento.', keywords: ['demanda', 'interesse', 'intenção de compra', 'capacidade de pagamento'] },
      { id: '2.2.3', level: 2, label: 'Análise CAC concorrentes', description: 'Estimativa do CAC dos concorrentes e comparativo.', keywords: ['cac', 'custo de aquisição', 'concorrente'] },
      { id: '2.2.4', level: 2, label: 'Projeção de adesão (curva e churn)', description: 'Curva de adoção de assinantes com taxa de aquisição e churn.', keywords: ['adesão', 'adoção', 'assinantes por mês', 'churn', 'curva'] },
      { id: '2.3.1', level: 3, label: 'Coerência: projeção de assinantes vs. DRE', description: 'Projeções de assinantes e receitas em linha com o DRE.', keywords: ['assinantes', 'projeção', 'meta', 'receita', 'dre'] },
      { id: '2.3.2', level: 3, label: 'Coerência: CAC vs. OPEX', description: 'CAC projetado compatível com o orçamento de marketing e OPEX.', keywords: ['cac', 'opex', 'orçamento de marketing', 'despesas operacionais'] },
    ]
  },
  {
    chapterId: '3',
    chapterName: 'PRODUTO / SERVIÇO E CONTEÚDO',
    criteria: [
      { id: '3.0.1', level: 0, label: 'Descrição do produto/serviço', description: 'Descrição clara do produto, portfólio, benefícios e diferenciais.', keywords: ['produto', 'serviço', 'plataforma', 'hub', 'van', 'benefícios', 'diferenciais'] },
      { id: '3.0.2', level: 0, label: 'Conteúdo e curadoria', description: 'Tipos de conteúdo ofertados, curadoria e adequação ao público.', keywords: ['conteúdo', 'catálogo', 'curadoria', 'regional'] },
      { id: '3.1.1', level: 1, label: 'Aderência às necessidades do cliente', description: 'Como o produto responde às dores e expectativas mapeadas no mercado.', keywords: ['ajuste produto-mercado', 'necessidades', 'benefícios'] },
      { id: '3.2.1', level: 2, label: 'Prova técnica de entrega', description: 'Provas e evidências de que o produto/serviço pode ser entregue.', keywords: ['prova técnica', 'capacidade de entrega', 'viabilidade técnica'] },
      { id: '3.2.2', level: 2, label: 'Pipeline operacional documentado', description: 'Documentação do pipeline operacional (captação, ingest, publicação).', keywords: ['pipeline', 'fluxo operacional', 'ingest', 'publicação', 'captação'] },
      { id: '3.2.3', level: 2, label: 'Acessibilidade como processo', description: 'Acessibilidade (AD, Libras, CC) integrada ao processo e catálogo.', keywords: ['acessibilidade', 'ad', 'libras', 'closed caption', 'inclusão'] },
      { id: '3.2.4', level: 2, label: 'Roadmap de evolução técnica', description: 'Roadmap claro de evolução técnica e novas entregas.', keywords: ['roadmap', 'evolução técnica', 'futuro', 'fases'] },
      { id: '3.3.1', level: 3, label: 'Coerência produto–mercado–financeiro', description: 'Oferta de produto e cronograma operacional compatíveis com metas financeiras.', keywords: ['produto', 'cronograma', 'receita', 'opex'] },
    ]
  },
  {
    chapterId: '4',
    chapterName: 'PLANO DE MARKETING E VENDAS',
    criteria: [
      { id: '4.0.1', level: 0, label: 'Estratégia de aquisição e posicionamento', description: 'Posicionamento, 4 Ps, canais e estratégia de aquisição.', keywords: ['marketing', 'aquisição', '4 ps', 'posicionamento', 'canais'] },
      { id: '4.0.2', level: 0, label: 'Relacionamento e retenção', description: 'Abordagem para relacionamento, retenção e nutrição da base.', keywords: ['relacionamento', 'retenção', 'crm', 'nutrição'] },
      { id: '4.1.1', level: 1, label: 'Plano de comunicação integrado', description: 'Plano detalhado de comunicação e calendário editorial.', keywords: ['comunicação', 'editorial', 'campanha', 'mídia'] },
      { id: '4.2.1', level: 2, label: 'CAC projetado', description: 'Custo de Aquisição de Cliente projetado e justificado.', keywords: ['cac', 'custo de aquisição', 'projetado'] },
      { id: '4.2.2', level: 2, label: 'LTV e ARPU projetados', description: 'Projetos de LTV e ARPU e suas premissas.', keywords: ['ltv', 'lifetime value', 'arpu', 'receita por usuário'] },
      { id: '4.2.3', level: 2, label: 'Cronograma de execução', description: 'Cronograma tático de marketing com metas trimestrais.', keywords: ['cronograma', 'marketing', 'metas', 'tático'] },
      { id: '4.3.1', level: 3, label: 'Coerência: vendas vs. financeiro', description: 'Projeção de vendas e receita compatíveis com o plano financeiro.', keywords: ['projeção de vendas', 'receita', 'dre', 'financeiro'] },
    ]
  },
  {
    chapterId: '5',
    chapterName: 'ESTRUTURA OPERACIONAL E TECNOLÓGICA',
    criteria: [
        { id: '5.0.1', level: 0, label: 'Descrição da operação', description: 'Processos, rotinas, fornecedores e recursos operacionais.', keywords: ['operacional', 'processos', 'fluxo de trabalho', 'dia a dia'] },
        { id: '5.0.2', level: 0, label: 'Infraestrutura e tecnologia', description: 'Recursos físicos e tecnológicos que suportam a operação (HUB, OTT, Van).', keywords: ['infraestrutura', 'tecnologia', 'hub', 'ott', 'van'] },
        { id: '5.1.1', level: 1, label: 'Escalabilidade e SLAs', description: 'Capacidade de escalar operação, SLAs e planos de contingência.', keywords: ['escalabilidade', 'sla', 'contingência', 'capacidade'] },
        { id: '5.2.1', level: 2, label: 'Prova de capacidade operacional', description: 'Evidências de capacidade operacional compatível com o plano.', keywords: ['capacidade operacional', 'produtividade', 'limites', 'sla'] },
        { id: '5.3.1', level: 3, label: 'Coerência: operação vs. orçamento', description: 'Operação descrita compatível com OPEX e cronograma físico-financeiro.', keywords: ['operação', 'orçamento', 'opex', 'custos operacionais'] },
    ]
  },
  {
    chapterId: '6',
    chapterName: 'EQUIPE E GOVERNANÇA',
    criteria: [
        { id: '6.0.1', level: 0, label: 'Descrição da equipe', description: 'Composição da equipe, papéis e responsabilidades.', keywords: ['equipe', 'time', 'sócios', 'funções', 'responsabilidades'] },
        { id: '6.0.2', level: 0, label: 'Políticas de gestão de pessoas', description: 'Práticas de contratação, retenção e desenvolvimento.', keywords: ['gestão de pessoas', 'contratação', 'treinamento', 'retenção'] },
        { id: '6.1.1', level: 1, label: 'Capacidade técnica e experiência', description: 'Competências, histórico e aderência da equipe às entregas.', keywords: ['experiência', 'competência', 'histórico', 'currículo'] },
        { id: '6.2.1', level: 2, label: 'Organograma completo', description: 'Organograma claro e completo, incluindo governança.', keywords: ['organograma', 'estrutura da equipe', 'hierarquia'] },
        { id: '6.2.2', level: 2, label: 'Governança e divisão societária', description: 'Regras de governança e divisão societária entre empresas e sócios.', keywords: ['governança', 'societária', 'divisão', '4movie', 'labd12'] },
        { id: '6.2.3', level: 2, label: 'Justificativa de custo da equipe', description: 'Custos de equipe justificados e coerentes com o financeiro.', keywords: ['custo da equipe', 'salários', 'contratos', 'orçamento'] },
        { id: '6.3.1', level: 3, label: 'Coerência: equipe vs. escopo', description: 'Equipe dimensionada para o escopo operacional e cronograma.', keywords: ['dimensionamento', 'escopo', 'cronograma', 'capacidade'] },
    ]
  },
  {
    chapterId: '7',
    chapterName: 'JURÍDICO E COMPLIANCE',
    criteria: [
        { id: '7.0.1', level: 0, label: 'Políticas obrigatórias', description: 'Existência de Política de Privacidade, Termos de Uso e políticas de compliance.', keywords: ['política de privacidade', 'termos de uso', 'lgpd', 'compliance'] },
        { id: '7.1.1', level: 1, label: 'Gestão de riscos jurídicos', description: 'Mapeamento de riscos, contratos críticos e plano de mitigação.', keywords: ['riscos jurídicos', 'contratos', 'licenciamento', 'mitigação'] },
        { id: '7.2.1', level: 2, label: 'Enquadramento legal e societário', description: 'Estrutura societária, contratos sociais e enquadramento tributário.', keywords: ['jurídico', 'legal', 'societário', 'contrato social'] },
        { id: '7.2.2', level: 2, label: 'Políticas (Privacidade e Termos)', description: 'Política de Privacidade, Termos de Uso e aderência à LGPD.', keywords: ['política de privacidade', 'termos de uso', 'lgpd'] },
        { id: '7.2.3', level: 2, label: 'Aderência à ANCINE', description: 'Conformidade com regulamentações da ANCINE e setoriais.', keywords: ['ancine', 'regulamentação', 'audiovisual'] },
        { id: '7.2.4', level: 2, label: 'Riscos jurídicos e contratos', description: 'Matriz de riscos jurídicos e drafts de contratos (produtores, B2B).', keywords: ['riscos jurídicos', 'contratos', 'licenciamento'] },
        { id: '7.3.1', level: 3, label: 'Coerência jurídica', description: 'Enquadramento, contratos e políticas alinhados ao modelo de negócios e às exigências bancárias.', keywords: ['coerência', 'jurídico', 'contratos', 'compliance'] },
    ]
  },
  {
    chapterId: '8',
    chapterName: 'PLANO FINANCEIRO',
    criteria: [
        { id: '8.0.1', level: 0, label: 'DRE presente', description: 'Existência de Demonstração do Resultado do Exercício.', keywords: ['dre', 'demonstração de resultado'] },
        { id: '8.0.2', level: 0, label: 'Fluxo de caixa presente', description: 'Existência de Fluxo de Caixa projetado.', keywords: ['fluxo de caixa', 'fc', 'cash flow'] },
        { id: '8.0.3', level: 0, label: 'Ponto de equilíbrio presente', description: 'Cálculo do ponto de equilíbrio do negócio.', keywords: ['ponto de equilíbrio', 'break-even'] },
        { id: '8.1.1', level: 1, label: 'Premissas financeiras descritas', description: 'Premissas de receita, custos, CAPEX e OPEX explicitadas.', keywords: ['premissas', 'receita', 'custos', 'capex', 'opex'] },
        { id: '8.2.1', level: 2, label: 'DRE 5 anos', description: 'Projeção de DRE por pelo menos 5 anos.', keywords: ['dre', '5 anos', 'cinco anos'] },
        { id: '8.2.2', level: 2, label: 'Fluxo de caixa mensal', description: 'Fluxo de caixa detalhado mensalmente no primeiro ano.', keywords: ['fluxo de caixa', 'mensal'] },
        { id: '8.2.3', level: 2, label: 'Matriz CAPEX/OPEX detalhada', description: 'Detalhamento dos investimentos (CAPEX) e custos operacionais (OPEX).', keywords: ['capex', 'opex', 'investimentos', 'custos operacionais'] },
        { id: '8.2.4', level: 2, label: 'Cálculo do DSCR', description: 'Cálculo do Índice de Cobertura do Serviço da Dívida.', keywords: ['dscr', 'índice de cobertura', 'serviço da dívida'] },
        { id: '8.2.5', level: 2, label: 'Análise de sensibilidade', description: 'Análise de cenários (otimista, realista, pessimista).', keywords: ['sensibilidade', 'cenário otimista', 'cenário pessimista'] },
        { id: '8.2.6', level: 2, label: 'Cronograma físico-financeiro', description: 'Cronograma que conecta desembolsos e entregas.', keywords: ['cronograma físico-financeiro', 'desembolso', 'entregas'] },
        { id: '8.3.1', level: 3, label: 'Coerência: projeções vs. estratégia', description: 'Premissas financeiras coerentes com mercado, marketing e operação.', keywords: ['coerência', 'projeções', 'premissas', 'mercado'] },
    ]
  },
  {
    chapterId: '9',
    chapterName: 'RISCOS, CONTRAPARTIDAS, GATILHOS E COVENANTS',
    criteria: [
        { id: '9.0.1', level: 0, label: 'Mapa de riscos e mitigação', description: 'Identificação de riscos estratégicos, de operação, mercado e financeiros com planos de mitigação.', keywords: ['riscos', 'mitigação', 'ameaças', 'contingência'] },
        { id: '9.1.1', level: 1, label: 'Contrapartidas de impacto e acessibilidade', description: 'Contrapartidas propostas (acessibilidade, impacto regional, inovação) alinhadas ao crédito.', keywords: ['contrapartida', 'impacto', 'acessibilidade', 'regional'] },
        { id: '9.2.1', level: 2, label: 'Lista de gatilhos por fase', description: 'Gatilhos (eventos) que liberam parcelas do financiamento.', keywords: ['gatilhos', 'triggers', 'fase', 'parcela'] },
        { id: '9.2.2', level: 2, label: 'Modelo de relatório para o banco', description: 'Modelo de relatório de acompanhamento a ser enviado ao banco.', keywords: ['relatório', 'banco', 'acompanhamento'] },
        { id: '9.2.3', level: 2, label: 'Exemplo de covenant financeiro', description: 'Exemplo de covenant financeiro (ex.: manter DSCR > 1,3).', keywords: ['covenant', 'compromisso', 'financeiro', 'dscr'] },
        { id: '9.3.1', level: 3, label: 'Coerência das garantias e gatilhos', description: 'Garantias, contrapartidas e gatilhos compatíveis com o plano financeiro e operacional.', keywords: ['garantias', 'gatilhos', 'coerência', 'financeiro'] },
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

// FIX: A estrutura de seções foi reorganizada para refletir o plano SEBRAE + BRDE,
// contemplando sumário executivo, mercado, marketing, operação, finanças, riscos,
// governança, jurídico e impacto/ESG. IDs seguem o mapeamento do generationGuidelines
// para não quebrar integrações, mantendo a hierarquia lógica (1.x, 2.x, ...).
export const INITIAL_SECTIONS: PlanSection[] = [
  // --- CAPÍTULO 1: SUMÁRIO EXECUTIVO ---
  { id: '1.0', chapter: '1. SUMÁRIO EXECUTIVO', title: 'Resumo do Negócio e Proposta de Valor', description: 'Visão geral do negócio, proposta de valor, público-alvo e pedido de crédito.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '1.1', chapter: '1. SUMÁRIO EXECUTIVO', title: 'Destaques do Plano e Principais Indicadores', description: 'Principais métricas, resultados esperados, impacto e síntese financeira.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '1.2', chapter: '1. SUMÁRIO EXECUTIVO', title: 'Necessidade de Investimento e Contrapartidas', description: 'Montante solicitado, fontes de recursos, garantias e contrapartidas ao financiador.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 2: ANÁLISE DE MERCADO ---
  { id: '2.0', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.0'].title, description: 'Contextualiza a análise de mercado e sua função no plano.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.1'].title, description: 'Mapa de segmentos com dados demográficos, comportamentais e potencial.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.2'].title, description: 'Perfil detalhado do cliente/persona e alinhamento com o produto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.3'].title, description: 'Principais dores do mercado, oportunidades e evidências de necessidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.4'].title, description: 'Resumo da pesquisa primária com público-alvo e achados validados.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.5'].title, description: 'Quantificação do mercado (TAM/SAM/SOM) e metodologia utilizada.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.6', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.6'].title, description: 'Benchmarking de concorrentes diretos e indiretos, forças e brechas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.7', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.7'].title, description: 'Tendências do setor e fundamentação para projeções de crescimento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.8', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.8'].title, description: 'Leitura PESTEL com impactos políticos, econômicos, sociais, tecnológicos e legais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.9', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.9'].title, description: 'Panorama do setor audiovisual/streaming no Brasil e implicações de custos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.10', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.10'].title, description: 'Barreiras de entrada, riscos de mercado e estratégias de mitigação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.11', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.11'].title, description: 'Vantagens competitivas sustentáveis e espaço estratégico identificado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.12', chapter: '2. ANÁLISE DE MERCADO', title: generationGuidelines['2.12'].title, description: 'Síntese lógica conectando dados de mercado à viabilidade do plano.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 3: PRODUTO / SERVIÇO E PROPOSTA DE VALOR ---
  { id: '3.0', chapter: '3. PRODUTO / SERVIÇO E PROPOSTA DE VALOR', title: 'Introdução ao Portfólio e Modelo de Entrega', description: 'Contextualiza o portfólio, modelo de entrega e conexão com as dores de mercado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1', chapter: '3. PRODUTO / SERVIÇO E PROPOSTA DE VALOR', title: generationGuidelines['3.1'].title, description: 'Descrição do portfólio, benefícios, diferenciais e aderência ao mercado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 4: PLANO DE MARKETING E VENDAS ---
  { id: '4.0', chapter: '4. PLANO DE MARKETING E VENDAS', title: 'Introdução ao Plano de Marketing', description: 'Objetivos de marketing, posicionamento desejado e conexão com o mercado analisado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.1', chapter: '4. PLANO DE MARKETING E VENDAS', title: generationGuidelines['4.1'].title, description: 'Posicionamento, 4 Ps e canais de comunicação e distribuição.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2', chapter: '4. PLANO DE MARKETING E VENDAS', title: generationGuidelines['4.2'].title, description: 'Estratégia de aquisição, funil e métricas CAC/LTV/ARPU.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3', chapter: '4. PLANO DE MARKETING E VENDAS', title: generationGuidelines['4.3'].title, description: 'Metas trimestrais e cronograma tático de marketing.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 5: PLANO OPERACIONAL ---
  { id: '5.0', chapter: '5. PLANO OPERACIONAL', title: 'Introdução Operacional e Infraestrutura', description: 'Visão geral do fluxo operacional, recursos e SLAs necessários.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.1', chapter: '5. PLANO OPERACIONAL', title: generationGuidelines['5.1'].title, description: 'Processos do dia a dia, recursos necessários e capacidade operacional.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 6: EQUIPE E GOVERNANÇA ---
  { id: '6.0', chapter: '6. EQUIPE E GOVERNANÇA', title: 'Introdução à Estrutura de Pessoas e Gestão', description: 'Contexto de papéis, responsabilidades e diretrizes de governança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1', chapter: '6. EQUIPE E GOVERNANÇA', title: generationGuidelines['6.1'].title, description: 'Composição da equipe, funções, responsabilidades e governança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 7: ASPECTOS JURÍDICOS E MODELO SOCIETÁRIO ---
  { id: '7.0', chapter: '7. ASPECTOS JURÍDICOS E MODELO SOCIETÁRIO', title: 'Introdução Jurídica e Compliance', description: 'Enquadramento legal geral, política de privacidade e obrigações setoriais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.1', chapter: '7. ASPECTOS JURÍDICOS E MODELO SOCIETÁRIO', title: generationGuidelines['7.1'].title, description: 'Enquadramento legal, políticas, riscos jurídicos e modelos contratuais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  // --- CAPÍTULO 8: PLANO FINANCEIRO ---
  { id: '8.0', chapter: '8. PLANO FINANCEIRO', title: 'Resumo das Premissas Financeiras', description: 'Premissas-chave de receita, custos, investimentos e capacidade de pagamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.1', chapter: '8. PLANO FINANCEIRO', title: generationGuidelines['8.1'].title, description: 'DRE, fluxo de caixa, CAPEX/OPEX, DSCR, sensibilidade e garantias.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, financialData: [] },

  // --- CAPÍTULO 9: RISCOS, MITIGAÇÕES, IMPACTOS E ESG ---
  { id: '9.0', chapter: '9. RISCOS, MITIGAÇÕES, IMPACTOS E ESG', title: 'Mapa de Riscos Estratégicos e Operacionais', description: 'Principais riscos, barreiras e planos de mitigação alinhados ao crédito.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1', chapter: '9. RISCOS, MITIGAÇÕES, IMPACTOS E ESG', title: generationGuidelines['9.1'].title, description: 'Gatilhos por fase, covenants e relatórios exigidos pelo financiador.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.2', chapter: '9. RISCOS, MITIGAÇÕES, IMPACTOS E ESG', title: 'Impacto Socioambiental, Cultura e ESG', description: 'Contrapartidas de impacto, cultura e acessibilidade, indicadores ESG e monitoramento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
];

export const DEFAULT_METHODOLOGY = 'SEBRAE+BRDE (Metodologia Padrão)';

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