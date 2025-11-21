// FIX: Import StrategicMatrix to resolve typing error on line 734.
import { PlanSection, SectionStatus, SectionType, StrategicMatrix } from './types';

export const DIAGNOSIS_STEPS = [
  { 
    name: 'Análise de Mercado', 
    description: 'Avaliar o público-alvo, segmentos de clientes e tamanho de mercado (TAM/SAM/SOM).',
    matrixTargets: ['customerSegments', 'swot.opportunities']
  },
  { 
    name: 'Análise de Concorrência', 
    description: 'Mapear concorrentes diretos e indiretos, analisando seus pontos fortes e fracos.',
    matrixTargets: ['swot.threats', 'swot.weaknesses']
  },
  { 
    name: 'Proposta de Valor', 
    description: 'Definir claramente a Proposta de Valor, conectando o problema do cliente à solução oferecida.',
    matrixTargets: ['valueProposition', 'swot.strengths']
  },
  { 
    name: 'Solução/Produto/Serviço', 
    description: 'Detalhar os produtos, serviços e o ecossistema (OTT, HUB, Van).',
    matrixTargets: ['keyActivities', 'keyResources']
  },
  { 
    name: 'Marketing – 4Ps', 
    description: 'Analisar Estratégias de Preço, Praça (Canais) e Promoção (Relacionamento).',
    matrixTargets: ['channels', 'customerRelationships']
  },
  { 
    name: 'Modelo de Negócio', 
    description: 'Estruturar as Fontes de Receita e as Parcerias-Chave para a operação.',
    matrixTargets: ['revenueStreams', 'keyPartnerships']
  },
  { 
    name: 'Operação/Processos/Recursos', 
    description: 'Mapear os processos internos, recursos-chave e atividades essenciais.',
    matrixTargets: ['keyActivities', 'keyResources'] // Can refine these
  },
  { 
    name: 'Finanças – Custos/Viabilidade', 
    description: 'Analisar a Estrutura de Custos e os principais números de viabilidade financeira.',
    matrixTargets: ['costStructure']
  },
  { 
    name: 'Riscos – Internos/Externos', 
    description: 'Identificar os principais riscos do negócio e inseri-los na matriz SWOT.',
    matrixTargets: ['swot.weaknesses', 'swot.threats']
  },
  { 
    name: 'Conclusão — Nível de Prontidão Final', 
    description: 'Consolidar a análise, calcular o nível de prontidão e identificar as pendências finais.',
    matrixTargets: [] // This step generates the final score and gaps
  }
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
  { id: '1.0', chapter: '1. SUMÁRIO EXECUTIVO', title: '1.0 Introdução Geral', description: 'Resumo sintético de TODO o plano para o avaliador.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 1.1 APRESENTAÇÃO GERAL
  { id: '1.1.0', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.0 Intro Apresentação', description: 'Visão geral do negócio em uma página.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.1', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.1 Descrição SCine', description: 'Entrega: O que é, para quem, onde atua (SC/Sul). Ecossistema OTT+HUB+Van.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.2', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.2 Componentes', description: 'Entrega: Papel de cada parte: OTT (Streaming), HUB (Base física), Van 4K (Unidade móvel).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.3', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.3 Problema/Oportunidade', description: 'Entrega: Vazio de mercado (falta de janela para cultura SC).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.4', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.4 Proposta de Valor', description: 'Entrega: Valor para B2C (assinantes) e B2B (empresas/prefeituras).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1.5', chapter: '1.1 APRESENTAÇÃO GERAL', title: '1.1.5 Conclusão Apresentação', description: 'SÍNTESE 1.1: O conceito está claro?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 1.2 EMPREENDEDORES
  { id: '1.2.0', chapter: '1.2 EMPREENDEDORES', title: '1.2.0 Intro Equipe', description: 'Quem está por trás.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.1', chapter: '1.2 EMPREENDEDORES', title: '1.2.1 Perfil Sócios', description: 'Entrega: Miniperfis, experiência e histórico.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.2', chapter: '1.2 EMPREENDEDORES', title: '1.2.2 Empresas', description: 'Entrega: Papel da SCine, 4Movie e Labd12.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.3', chapter: '1.2 EMPREENDEDORES', title: '1.2.3 Equipe Núcleo', description: 'Entrega: Funções críticas (gestão, conteúdo, tech).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.4', chapter: '1.2 EMPREENDEDORES', title: '1.2.4 Diferenciais', description: 'Entrega: Por que esse time entrega?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.2.5', chapter: '1.2 EMPREENDEDORES', title: '1.2.5 Conclusão Equipe', description: 'SÍNTESE 1.2: Capacidade de execução.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 1.3 MISSÃO E VISÃO
  { id: '1.3.0', chapter: '1.3 ESTRATÉGIA', title: '1.3.0 Intro Estratégia', description: 'Propósito e rumo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.1', chapter: '1.3 ESTRATÉGIA', title: '1.3.1 Missão', description: 'Entrega: Propósito central (difundir cultura SC).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.2', chapter: '1.3 ESTRATÉGIA', title: '1.3.2 Visão', description: 'Entrega: Onde chegar em 5-10 anos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.3', chapter: '1.3 ESTRATÉGIA', title: '1.3.3 Valores', description: 'Entrega: Cultura, acessibilidade, sustentabilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.4', chapter: '1.3 ESTRATÉGIA', title: '1.3.4 Objetivos', description: 'Entrega: 3-5 objetivos estratégicos concretos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.3.5', chapter: '1.3 ESTRATÉGIA', title: '1.3.5 Conclusão Estratégia', description: 'SÍNTESE 1.3: O norte está definido?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 1.4 INDICADORES
  { id: '1.4.0', chapter: '1.4 INDICADORES', title: '1.4.0 Intro Indicadores', description: 'Painel financeiro resumido.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.1', chapter: '1.4 INDICADORES', title: '1.4.1 Receita/Lucro', description: 'Entrega: Receita 24m, Margens.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.2', chapter: '1.4 INDICADORES', title: '1.4.2 Payback', description: 'Entrega: Tempo de retorno simples/descontado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.3', chapter: '1.4 INDICADORES', title: '1.4.3 Ponto Equilíbrio', description: 'Entrega: Faturamento/Assinantes para breakeven.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.4', chapter: '1.4 INDICADORES', title: '1.4.4 Indicadores BRDE', description: 'Entrega: DSCR, Capacidade de pagamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.4.5', chapter: '1.4 INDICADORES', title: '1.4.5 Conclusão Indicadores', description: 'SÍNTESE 1.4: O projeto se paga?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 1.5 INVESTIMENTO
  { id: '1.5.0', chapter: '1.5 INVESTIMENTO', title: '1.5.0 Intro Investimento', description: 'Estrutura de capital.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.1', chapter: '1.5 INVESTIMENTO', title: '1.5.1 Total Projeto', description: 'Entrega: Valor global e blocos (Plataforma, HUB, Van).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.2', chapter: '1.5 INVESTIMENTO', title: '1.5.2 Valor BRDE', description: 'Entrega: Valor solicitado, linha, condições.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.3', chapter: '1.5 INVESTIMENTO', title: '1.5.3 Contrapartida', description: 'Entrega: Capital próprio, incentivos, parcerias.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.4', chapter: '1.5 INVESTIMENTO', title: '1.5.4 Relação Impacto', description: 'Entrega: Investimento x Crescimento x Impacto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.5.5', chapter: '1.5 INVESTIMENTO', title: '1.5.5 Conclusão Investimento', description: 'SÍNTESE 1.5: A conta fecha?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 1.6 DIFERENCIAIS
  { id: '1.6.0', chapter: '1.6 DIFERENCIAIS', title: '1.6.0 Intro Diferenciais', description: 'Pitch final.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.1', chapter: '1.6 DIFERENCIAIS', title: '1.6.1 Produto', description: 'Entrega: Regionalidade, catálogo, acessibilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.2', chapter: '1.6 DIFERENCIAIS', title: '1.6.2 Modelo Negócio', description: 'Entrega: B2C + B2B + Ecossistema.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.3', chapter: '1.6 DIFERENCIAIS', title: '1.6.3 Equipe/Rede', description: 'Entrega: Histórico e parceiros.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.4', chapter: '1.6 DIFERENCIAIS', title: '1.6.4 Impacto SC', description: 'Entrega: Cultura, emprego, desenvolvimento regional.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.6.5', chapter: '1.6 DIFERENCIAIS', title: '1.6.5 Conclusão Diferenciais', description: 'SÍNTESE 1.6: Por que é especial?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 2: ANÁLISE DE MERCADO ---
  { id: '2.0', chapter: '2. ANÁLISE DE MERCADO', title: '2.0 Introdução Geral', description: 'Visão panorâmica do mercado de streaming e economia criativa.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 2.1 CLIENTES
  { id: '2.1.0', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.0 Introdução aos Clientes', description: 'Resumo executivo sobre quem é o cliente da SCine.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.1.1', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.1 Perfil Demográfico', description: 'Entrega: Tabelas/gráficos com idade, gênero, escolaridade, renda.\nBRDE: Avalia se esse público tem renda suficiente.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.2', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.2 Hábitos de Consumo', description: 'Entrega: Frequência de consumo, outras assinaturas.\nBRDE: Hábito de pagar streaming existe?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.3', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.3 Disposição a Pagar', description: 'Entrega: Faixas de preço aceitáveis. Sensibilidade.\nBRDE: Validação do preço proposto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.4', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.4 Motivações e Barreiras', description: 'Entrega: Motivos para assinar vs Barreiras.\nBRDE: Plano para contornar obstáculos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.5', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.5 Segmentos e Personas', description: 'Entrega: 2-3 segmentos principais e 1 persona.\nBRDE: Nichos alcançáveis.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.6', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.6 Implicações Produto/Preço', description: 'Entrega: Conexão perfil -> produto.\nBRDE: Coerência receita.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.1.7', chapter: '2.1 ESTUDO DOS CLIENTES', title: '2.1.7 Conclusão Clientes', description: 'SÍNTESE 2.1: Existe cliente pagante para o projeto?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 2.2 CONCORRENTES
  { id: '2.2.0', chapter: '2.2 CONCORRENTES', title: '2.2.0 Introdução Concorrência', description: 'Introdução ao cenário competitivo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.2.1', chapter: '2.2 CONCORRENTES', title: '2.2.1 Mapa de Concorrentes', description: 'Entrega: Globais, nacionais, regionais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.2', chapter: '2.2 CONCORRENTES', title: '2.2.2 Comparativo de Oferta', description: 'Entrega: Catálogo, acessibilidade, eventos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.3', chapter: '2.2 CONCORRENTES', title: '2.2.3 Preços e Modelos', description: 'Entrega: Tabela comparativa de preços.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.4', chapter: '2.2 CONCORRENTES', title: '2.2.4 Branding Concorrente', description: 'Entrega: Posicionamento dos rivais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.5', chapter: '2.2 CONCORRENTES', title: '2.2.5 Vantagens SCine (SWOT)', description: 'Entrega: Pontos fortes e fracos da SCine.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2.6', chapter: '2.2 CONCORRENTES', title: '2.2.6 Conclusão Concorrência', description: 'SÍNTESE 2.2: Onde está a brecha de mercado?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 2.3 PARCEIROS
  { id: '2.3.0', chapter: '2.3 FORNECEDORES', title: '2.3.0 Introdução Parceiros', description: 'Cadeia de valor.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.3.1', chapter: '2.3 FORNECEDORES', title: '2.3.1 Fornecedores Críticos', description: 'Entrega: Tecnologia, gateways.\nBRDE: Risco operacional.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.2', chapter: '2.3 FORNECEDORES', title: '2.3.2 Parceiros Conteúdo', description: 'Entrega: Produtoras, artistas.\nBRDE: Pipeline real.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.3', chapter: '2.3 FORNECEDORES', title: '2.3.3 Parceiros B2B', description: 'Entrega: Prefeituras, empresas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.4', chapter: '2.3 FORNECEDORES', title: '2.3.4 Dependência e Risco', description: 'Entrega: Alternativas para fornecedores críticos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.5', chapter: '2.3 FORNECEDORES', title: '2.3.5 Implicações Custos', description: 'Entrega: Impacto na margem.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3.6', chapter: '2.3 FORNECEDORES', title: '2.3.6 Conclusão Parceiros', description: 'SÍNTESE 2.3: A cadeia produtiva está segura?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 2.4 TENDÊNCIAS
  { id: '2.4.0', chapter: '2.4 TENDÊNCIAS', title: '2.4.0 Introdução Tendências', description: 'Contexto macro.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.4.1', chapter: '2.4 TENDÊNCIAS', title: '2.4.1 Globais', description: 'Entrega: Crescimento streaming mundial.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.2', chapter: '2.4 TENDÊNCIAS', title: '2.4.2 Brasil e SC', description: 'Entrega: Adoção local, políticas públicas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.3', chapter: '2.4 TENDÊNCIAS', title: '2.4.3 Oportunidades SCine', description: 'Entrega: Lacunas que a SCine aproveita.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.4', chapter: '2.4 TENDÊNCIAS', title: '2.4.4 Ameaças', description: 'Entrega: Saturação, riscos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.4.5', chapter: '2.4 TENDÊNCIAS', title: '2.4.5 Conclusão Tendências', description: 'SÍNTESE 2.4: O projeto surfa na onda correta?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 2.5 CONCLUSÕES MERCADO
  { id: '2.5.0', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.0 Síntese do Mercado', description: 'Resumo das metas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.5.1', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.1 TAM (Total)', description: 'Entrega: Mercado total.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.2', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.2 SAM (Serviceable)', description: 'Entrega: Recorte SC factível.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.3', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.3 SOM (Meta)', description: 'Entrega: Meta de captura (assinantes).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.4', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.4 Implicações', description: 'Entrega: Impacto em marketing e finanças.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.5', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.5 Contingência', description: 'Entrega: O que fazer se a demanda falhar?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.5.6', chapter: '2.5 CONCLUSÕES (TAM/SAM/SOM)', title: '2.5.6 Veredito de Mercado', description: 'SÍNTESE 2.5: O mercado comporta o projeto?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 3: MARKETING ---
  { id: '3.0', chapter: '3. PLANO DE MARKETING', title: '3.0 Introdução ao Marketing', description: 'Estratégia geral.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  
  // 3.1 SEGMENTAÇÃO
  { id: '3.1.0', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.0 Intro Segmentação', description: 'Definição do alvo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.1.1', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.1 B2C e B2B', description: 'Entrega: Tipos de clientes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.2', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.2 Foco Inicial', description: 'Entrega: Prioridades 24 meses.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.3', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.3 Posicionamento', description: 'Entrega: Identidade da marca.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.4', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.4 Proposta de Valor', description: 'Entrega: Diferencial concreto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.1.5', chapter: '3.1 SEGMENTAÇÃO', title: '3.1.5 Conclusão Segmentação', description: 'SÍNTESE 3.1: O foco está correto?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 3.2 PORTFÓLIO
  { id: '3.2.0', chapter: '3.2 PORTFÓLIO', title: '3.2.0 Intro Portfólio', description: 'Produtos e serviços.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.2.1', chapter: '3.2 PORTFÓLIO', title: '3.2.1 Planos B2C', description: 'Entrega: Free, Star, Premium.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.2', chapter: '3.2 PORTFÓLIO', title: '3.2.2 Serviços B2B', description: 'Entrega: Transmissão, Patrocínio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.3', chapter: '3.2 PORTFÓLIO', title: '3.2.3 Mix Conteúdo', description: 'Entrega: Próprio vs Licenciado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.4', chapter: '3.2 PORTFÓLIO', title: '3.2.4 Diferenciais', description: 'Entrega: Acessibilidade, regionalidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2.5', chapter: '3.2 PORTFÓLIO', title: '3.2.5 Conclusão Portfólio', description: 'SÍNTESE 3.2: Os produtos são vendáveis?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 3.3 PREÇO
  { id: '3.3.0', chapter: '3.3 PREÇOS', title: '3.3.0 Intro Preços', description: 'Estratégia de monetização.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.3.1', chapter: '3.3 PREÇOS', title: '3.3.1 Tabela B2C', description: 'Entrega: Preços assinatura.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.3.2', chapter: '3.3 PREÇOS', title: '3.3.2 Política B2B', description: 'Entrega: Precificação serviços.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.3.3', chapter: '3.3 PREÇOS', title: '3.3.3 Promoções', description: 'Entrega: Descontos iniciais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.3.4', chapter: '3.3 PREÇOS', title: '3.3.4 Reajustes', description: 'Entrega: Manutenção da margem.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.3.5', chapter: '3.3 PREÇOS', title: '3.3.5 Conclusão Preços', description: 'SÍNTESE 3.3: O preço paga a conta?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 3.4 CANAIS
  { id: '3.4.0', chapter: '3.4 CANAIS', title: '3.4.0 Intro Canais', description: 'Distribuição.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.4.1', chapter: '3.4 CANAIS', title: '3.4.1 Digitais', description: 'Entrega: Web, App, TV.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.4.2', chapter: '3.4 CANAIS', title: '3.4.2 Físicos/Eventos', description: 'Entrega: Ativação presencial.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.4.3', chapter: '3.4 CANAIS', title: '3.4.3 Parcerias', description: 'Entrega: Operadoras, lojas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.4.4', chapter: '3.4 CANAIS', title: '3.4.4 Logística B2B', description: 'Entrega: Entrega de serviços.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.4.5', chapter: '3.4 CANAIS', title: '3.4.5 Conclusão Canais', description: 'SÍNTESE 3.4: O produto chega ao cliente?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 3.5 COMUNICAÇÃO
  { id: '3.5.0', chapter: '3.5 COMUNICAÇÃO', title: '3.5.0 Intro Comunicação', description: 'Divulgação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.5.1', chapter: '3.5 COMUNICAÇÃO', title: '3.5.1 Identidade', description: 'Entrega: Tom de voz.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.5.2', chapter: '3.5 COMUNICAÇÃO', title: '3.5.2 Canais Foco', description: 'Entrega: Onde divulgar.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.5.3', chapter: '3.5 COMUNICAÇÃO', title: '3.5.3 Conteúdo', description: 'Entrega: Linha editorial.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.5.4', chapter: '3.5 COMUNICAÇÃO', title: '3.5.4 Influenciadores', description: 'Entrega: Parceiros de mídia.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.5.5', chapter: '3.5 COMUNICAÇÃO', title: '3.5.5 Campanhas', description: 'Entrega: Ações estruturantes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.5.6', chapter: '3.5 COMUNICAÇÃO', title: '3.5.6 Conclusão Comunicação', description: 'SÍNTESE 3.5: A mensagem será ouvida?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 3.6 MÉTRICAS
  { id: '3.6.0', chapter: '3.6 MÉTRICAS', title: '3.6.0 Intro Métricas', description: 'KPIs.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.6.1', chapter: '3.6 MÉTRICAS', title: '3.6.1 Funil', description: 'Entrega: Aquisição.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.6.2', chapter: '3.6 MÉTRICAS', title: '3.6.2 Retenção', description: 'Entrega: Churn.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.6.3', chapter: '3.6 MÉTRICAS', title: '3.6.3 CAC/LTV', description: 'Entrega: Saúde financeira.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.6.4', chapter: '3.6 MÉTRICAS', title: '3.6.4 Metas', description: 'Entrega: Números alvo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.6.5', chapter: '3.6 MÉTRICAS', title: '3.6.5 Monitoramento', description: 'Entrega: Ajustes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.6.6', chapter: '3.6 MÉTRICAS', title: '3.6.6 Conclusão Métricas', description: 'SÍNTESE 3.6: Crescimento seguro?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 4: OPERACIONAL ---
  { id: '4.0', chapter: '4. PLANO OPERACIONAL', title: '4.0 Introdução Operacional', description: 'Visão geral.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 4.1 MODELO OPERACIONAL
  { id: '4.1.0', chapter: '4.1 MODELO OPERACIONAL', title: '4.1.0 Intro Modelo', description: 'Visão macro.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '4.1.1', chapter: '4.1 MODELO OPERACIONAL', title: '4.1.1 Integração', description: 'OTT+HUB+Van.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.1.2', chapter: '4.1 MODELO OPERACIONAL', title: '4.1.2 Fluxo Macro', description: 'Conteúdo -> Receita.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.1.3', chapter: '4.1 MODELO OPERACIONAL', title: '4.1.3 Interfaces', description: 'Áreas internas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.1.4', chapter: '4.1 MODELO OPERACIONAL', title: '4.1.4 Capacidade', description: 'Operação aguenta?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.1.5', chapter: '4.1 MODELO OPERACIONAL', title: '4.1.5 Conclusão Modelo', description: 'SÍNTESE 4.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 4.2 PROCESSOS
  { id: '4.2.0', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.0 Intro Processos', description: 'Rotinas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '4.2.1', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.1 Curadoria', description: 'Escolha conteúdo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2.2', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.2 Produção', description: 'Fluxo original.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2.3', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.3 Ingest', description: 'Upload/Publicação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2.4', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.4 Ao Vivo', description: 'Operação Van.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2.5', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.5 Atendimento', description: 'Suporte B2C/B2B.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2.6', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.6 Qualidade', description: 'Monitoramento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.2.7', chapter: '4.2 PROCESSOS-CHAVE', title: '4.2.7 Conclusão Processos', description: 'SÍNTESE 4.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 4.3 INFRA FÍSICA
  { id: '4.3.0', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.0 Intro Infra', description: 'Espaços.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '4.3.1', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.1 HUB', description: 'Layout/Funções.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3.2', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.2 Estúdios', description: 'Capacidade técnica.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3.3', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.3 Ilhas Pós', description: 'Edição.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3.4', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.4 Apoio', description: 'Depósito/Camarim.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3.5', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.5 Van 4K', description: 'Unidade móvel.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3.6', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.6 Expansão', description: 'Escalabilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.3.7', chapter: '4.3 INFRAESTRUTURA FÍSICA', title: '4.3.7 Conclusão Infra', description: 'SÍNTESE 4.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 4.4 INFRA DIGITAL
  { id: '4.4.0', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.0 Intro Digital', description: 'Sistemas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '4.4.1', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.1 Plataforma', description: 'Vodlix/Tech.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.4.2', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.2 Pagamentos', description: 'Gateways.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.4.3', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.3 Gestão', description: 'ERP/CRM.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.4.4', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.4 Dados', description: 'BI/Relatórios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.4.5', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.5 Segurança', description: 'Backup/SLA.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.4.6', chapter: '4.4 INFRAESTRUTURA DIGITAL', title: '4.4.6 Conclusão Digital', description: 'SÍNTESE 4.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 4.5 CRONOGRAMA
  { id: '4.5.0', chapter: '4.5 CRONOGRAMA', title: '4.5.0 Intro Cronograma', description: 'Fases.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '4.5.1', chapter: '4.5 CRONOGRAMA', title: '4.5.1 Fase 1', description: 'Implantação (0-12m).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.5.2', chapter: '4.5 CRONOGRAMA', title: '4.5.2 Fase 2', description: 'Tração (12-24m).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.5.3', chapter: '4.5 CRONOGRAMA', title: '4.5.3 Fase 3', description: 'Consolidação (24-48m).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.5.4', chapter: '4.5 CRONOGRAMA', title: '4.5.4 Marcos', description: 'Go-live/Eventos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.5.5', chapter: '4.5 CRONOGRAMA', title: '4.5.5 Riscos Operacionais', description: 'Contingência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '4.5.6', chapter: '4.5 CRONOGRAMA', title: '4.5.6 Conclusão Cronograma', description: 'SÍNTESE 4.5.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 5: EQUIPE ---
  { id: '5.0', chapter: '5. ESTRUTURA E EQUIPE', title: '5.0 Introdução Equipe', description: 'Pessoas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 5.1 PRINCÍPIOS
  { id: '5.1.0', chapter: '5.1 PRINCÍPIOS', title: '5.1.0 Intro Princípios', description: 'Filosofia.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '5.1.1', chapter: '5.1 PRINCÍPIOS', title: '5.1.1 Dimensionamento', description: 'Enxuta vs Escalável.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.1.2', chapter: '5.1 PRINCÍPIOS', title: '5.1.2 Terceirização', description: 'O que é interno?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.1.3', chapter: '5.1 PRINCÍPIOS', title: '5.1.3 Políticas', description: 'Contratação/Treino.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.1.4', chapter: '5.1 PRINCÍPIOS', title: '5.1.4 Capacidade', description: 'Equipe x Metas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.1.5', chapter: '5.1 PRINCÍPIOS', title: '5.1.5 Conclusão Princípios', description: 'SÍNTESE 5.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 5.2 ORGANOGRAMA
  { id: '5.2.0', chapter: '5.2 ORGANOGRAMA', title: '5.2.0 Intro Organograma', description: 'Estrutura.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '5.2.1', chapter: '5.2 ORGANOGRAMA', title: '5.2.1 Fase 1', description: 'Equipe Núcleo (Cargos chave).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.2.2', chapter: '5.2 ORGANOGRAMA', title: '5.2.2 Fase 2', description: 'Expansão (Novos cargos).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.2.3', chapter: '5.2 ORGANOGRAMA', title: '5.2.3 Fase 3', description: 'Completa (HUB/Van).', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.2.4', chapter: '5.2 ORGANOGRAMA', title: '5.2.4 Conclusão Organograma', description: 'SÍNTESE 5.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 5.3 CUSTOS
  { id: '5.3.0', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.0 Intro Custos', description: 'Folha.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '5.3.1', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.1 Faixas Salariais', description: 'Médias mercado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.3.2', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.2 Headcount', description: 'Qtde pessoas/fase.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.3.3', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.3 Custo Mensal', description: 'Total folha.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.3.4', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.4 Impacto Caixa', description: '% Receita.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.3.5', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.5 Otimização', description: 'Estratégias.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.3.6', chapter: '5.3 CUSTOS PESSOAL', title: '5.3.6 Conclusão Custos', description: 'SÍNTESE 5.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 5.4 GOVERNANÇA
  { id: '5.4.0', chapter: '5.4 GOVERNANÇA', title: '5.4.0 Intro Governança', description: 'Sócios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '5.4.1', chapter: '5.4 GOVERNANÇA', title: '5.4.1 Estrutura', description: 'Quem é quem.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.4.2', chapter: '5.4 GOVERNANÇA', title: '5.4.2 Papéis', description: 'SCine/4Movie/Labd12.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.4.3', chapter: '5.4 GOVERNANÇA', title: '5.4.3 Alçadas', description: 'Decisão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.4.4', chapter: '5.4 GOVERNANÇA', title: '5.4.4 Controles', description: 'Auditoria.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.4.5', chapter: '5.4 GOVERNANÇA', title: '5.4.5 Relação BRDE', description: 'Report.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '5.4.6', chapter: '5.4 GOVERNANÇA', title: '5.4.6 Conclusão Governança', description: 'SÍNTESE 5.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 6: FINANCEIRO ---
  { id: '6.0', chapter: '6. PLANO FINANCEIRO', title: '6.0 Introdução Financeira', description: 'Resumo números.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 6.1 PREMISSAS RECEITA
  { id: '6.1.0', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.0 Intro Receita', description: 'Entradas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '6.1.1', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.1 Receitas B2C', description: 'Assinaturas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1.2', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.2 Receitas B2B', description: 'Serviços.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1.3', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.3 Publicidade', description: 'Ads.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1.4', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.4 Outras', description: 'Locação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1.5', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.5 Crescimento', description: 'Curva.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1.6', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.6 Conexão Mercado', description: 'Coerência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.1.7', chapter: '6.1 PREMISSAS RECEITA', title: '6.1.7 Conclusão Receita', description: 'SÍNTESE 6.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 6.2 PREMISSAS CUSTO
  { id: '6.2.0', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.0 Intro Custo', description: 'Saídas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '6.2.1', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.1 OPEX', description: 'Fixos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.2.2', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.2 Variáveis', description: 'Por uso.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.2.3', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.3 CAPEX', description: 'Investimentos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.2.4', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.4 Tributos', description: 'Impostos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.2.5', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.5 Macro', description: 'Inflação/CDI.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.2.6', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.6 Coerência', description: 'Check.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.2.7', chapter: '6.2 PREMISSAS CUSTO', title: '6.2.7 Conclusão Custo', description: 'SÍNTESE 6.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 6.3 DEMONSTRAÇÕES
  { id: '6.3.0', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.0 Intro DRE', description: 'Tabelas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '6.3.1', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.1 DRE 24m', description: 'Detalhada.', content: '', status: SectionStatus.PENDING, type: SectionType.FINANCIAL }, 
  { id: '6.3.2', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.2 DRE 5 Anos', description: 'Longo prazo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.3.3', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.3 Fluxo Caixa', description: 'Oper/Inv/Fin.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.3.4', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.4 Balanço', description: 'Ativo/Passivo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.3.5', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.5 Ponto Equilíbrio', description: 'Breakeven.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.3.6', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.6 Cronograma Dívida', description: 'Pagamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.3.7', chapter: '6.3 DEMONSTRAÇÕES', title: '6.3.7 Conclusão DRE', description: 'SÍNTESE 6.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 6.4 INDICADORES
  { id: '6.4.0', chapter: '6.4 INDICADORES', title: '6.4.0 Intro Indicadores', description: 'KPIs.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '6.4.1', chapter: '6.4 INDICADORES', title: '6.4.1 Margens', description: 'Bruta/Liq.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.4.2', chapter: '6.4 INDICADORES', title: '6.4.2 Payback', description: 'Retorno.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.4.3', chapter: '6.4 INDICADORES', title: '6.4.3 ROI/TIR', description: 'Rentabilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.4.4', chapter: '6.4 INDICADORES', title: '6.4.4 LTV/CAC', description: 'Eficiência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.4.5', chapter: '6.4 INDICADORES', title: '6.4.5 DSCR', description: 'Cobertura Dívida.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.4.6', chapter: '6.4 INDICADORES', title: '6.4.6 Conclusão Indicadores', description: 'SÍNTESE 6.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 6.5 CENÁRIOS
  { id: '6.5.0', chapter: '6.5 CENÁRIOS', title: '6.5.0 Intro Cenários', description: 'Sensibilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '6.5.1', chapter: '6.5 CENÁRIOS', title: '6.5.1 Pessimista', description: 'Abaixo meta.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.5.2', chapter: '6.5 CENÁRIOS', title: '6.5.2 Realista', description: 'Base.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.5.3', chapter: '6.5 CENÁRIOS', title: '6.5.3 Otimista', description: 'Acima meta.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.5.4', chapter: '6.5 CENÁRIOS', title: '6.5.4 Sensibilidade', description: 'Variaveis.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.5.5', chapter: '6.5 CENÁRIOS', title: '6.5.5 Ajustes', description: 'Plano B.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.5.6', chapter: '6.5 CENÁRIOS', title: '6.5.6 Conclusão Cenários', description: 'SÍNTESE 6.5.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 6.6 MATRIZ ESTRUTURAL
  { id: '6.6.0', chapter: '6.6 MATRIZ DÍVIDA', title: '6.6.0 Intro Matriz', description: 'Escalonamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '6.6.1', chapter: '6.6 MATRIZ DÍVIDA', title: '6.6.1 Fase Inicial', description: 'Mínima.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.6.2', chapter: '6.6 MATRIZ DÍVIDA', title: '6.6.2 Marcos Aumento', description: 'Gatilhos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.6.3', chapter: '6.6 MATRIZ DÍVIDA', title: '6.6.3 Ampliação', description: 'HUB/Van.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.6.4', chapter: '6.6 MATRIZ DÍVIDA', title: '6.6.4 Regras Dívida', description: 'Segurança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '6.6.5', chapter: '6.6 MATRIZ DÍVIDA', title: '6.6.5 Conclusão Matriz', description: 'SÍNTESE 6.6.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 7: JURÍDICO ---
  { id: '7.0', chapter: '7. JURÍDICO E COMPLIANCE', title: '7.0 Intro Jurídico', description: 'Estrutura legal.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  
  // 7.1 SOCIETÁRIO
  { id: '7.1.0', chapter: '7.1 ESTRUTURA SOCIETÁRIA', title: '7.1.0 Intro Societária', description: 'Empresas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '7.1.1', chapter: '7.1 ESTRUTURA SOCIETÁRIA', title: '7.1.1 Tipo Societário', description: 'Entrega: LTDA/SA, Sócios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.1.2', chapter: '7.1 ESTRUTURA SOCIETÁRIA', title: '7.1.2 Veículos', description: 'Entrega: SCine/4Movie/Labd12.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.1.3', chapter: '7.1 ESTRUTURA SOCIETÁRIA', title: '7.1.3 CNAEs', description: 'Entrega: Objeto social.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.1.4', chapter: '7.1 ESTRUTURA SOCIETÁRIA', title: '7.1.4 Responsabilidade', description: 'Entrega: Garantias sócios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.1.5', chapter: '7.1 ESTRUTURA SOCIETÁRIA', title: '7.1.5 Conclusão Societária', description: 'SÍNTESE 7.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 7.2 USUÁRIOS
  { id: '7.2.0', chapter: '7.2 RELAÇÃO USUÁRIOS', title: '7.2.0 Intro Usuários', description: 'Termos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '7.2.1', chapter: '7.2 RELAÇÃO USUÁRIOS', title: '7.2.1 Termos de Uso', description: 'Entrega: Regras.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.2.2', chapter: '7.2 RELAÇÃO USUÁRIOS', title: '7.2.2 LGPD', description: 'Entrega: Privacidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.2.3', chapter: '7.2 RELAÇÃO USUÁRIOS', title: '7.2.3 Cobrança', description: 'Entrega: Cancelamento/CDC.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.2.4', chapter: '7.2 RELAÇÃO USUÁRIOS', title: '7.2.4 Menores', description: 'Entrega: Classificação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.2.5', chapter: '7.2 RELAÇÃO USUÁRIOS', title: '7.2.5 Conclusão Usuários', description: 'SÍNTESE 7.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 7.3 CVM
  { id: '7.3.0', chapter: '7.3 REGULATÓRIO CVM', title: '7.3.0 Intro CVM', description: 'Investidor.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '7.3.1', chapter: '7.3 REGULATÓRIO CVM', title: '7.3.1 Modelo', description: 'Entrega: Assinante-Investidor.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.3.2', chapter: '7.3 REGULATÓRIO CVM', title: '7.3.2 Enquadramento', description: 'Entrega: Valor mobiliário?', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.3.3', chapter: '7.3 REGULATÓRIO CVM', title: '7.3.3 Contrato', description: 'Entrega: Estrutura segura.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.3.4', chapter: '7.3 REGULATÓRIO CVM', title: '7.3.4 Mitigação', description: 'Entrega: Comunicação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.3.5', chapter: '7.3 REGULATÓRIO CVM', title: '7.3.5 Conclusão CVM', description: 'SÍNTESE 7.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 7.4 ANCINE
  { id: '7.4.0', chapter: '7.4 ANCINE/INCENTIVO', title: '7.4.0 Intro ANCINE', description: 'Fomento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '7.4.1', chapter: '7.4 ANCINE/INCENTIVO', title: '7.4.1 Registro', description: 'Entrega: Regularidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.4.2', chapter: '7.4 ANCINE/INCENTIVO', title: '7.4.2 Leis', description: 'Entrega: Rouanet/Estadual.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.4.3', chapter: '7.4 ANCINE/INCENTIVO', title: '7.4.3 Prestação Contas', description: 'Entrega: Obrigações.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.4.4', chapter: '7.4 ANCINE/INCENTIVO', title: '7.4.4 Compatibilidade', description: 'Entrega: Incentivo x Empréstimo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.4.5', chapter: '7.4 ANCINE/INCENTIVO', title: '7.4.5 Conclusão ANCINE', description: 'SÍNTESE 7.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 7.5 DIREITOS
  { id: '7.5.0', chapter: '7.5 DIREITOS AUTORAIS', title: '7.5.0 Intro Direitos', description: 'Conteúdo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '7.5.1', chapter: '7.5 DIREITOS AUTORAIS', title: '7.5.1 Contratos', description: 'Entrega: Modelos licença.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.5.2', chapter: '7.5 DIREITOS AUTORAIS', title: '7.5.2 Gestão', description: 'Entrega: ECAD/Autores.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.5.3', chapter: '7.5 DIREITOS AUTORAIS', title: '7.5.3 Janelas', description: 'Entrega: Exclusividade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.5.4', chapter: '7.5 DIREITOS AUTORAIS', title: '7.5.4 Clearance', description: 'Entrega: Liberação imagem.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.5.5', chapter: '7.5 DIREITOS AUTORAIS', title: '7.5.5 Conclusão Direitos', description: 'SÍNTESE 7.5.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 7.6 COMPLIANCE
  { id: '7.6.0', chapter: '7.6 COMPLIANCE', title: '7.6.0 Intro Compliance', description: 'Integridade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '7.6.1', chapter: '7.6 COMPLIANCE', title: '7.6.1 Política', description: 'Entrega: Anticorrupção.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.6.2', chapter: '7.6 COMPLIANCE', title: '7.6.2 Controles', description: 'Entrega: Uso recursos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.6.3', chapter: '7.6 COMPLIANCE', title: '7.6.3 Auditoria', description: 'Entrega: Relatórios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.6.4', chapter: '7.6 COMPLIANCE', title: '7.6.4 Riscos', description: 'Entrega: Gestão contínua.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '7.6.5', chapter: '7.6 COMPLIANCE', title: '7.6.5 Conclusão Compliance', description: 'SÍNTESE 7.6.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 8: FINANCIAMENTO BRDE ---
  { id: '8.0', chapter: '8. ESTRUTURA DE FINANCIAMENTO', title: '8.0 Intro Financiamento', description: 'O Pedido.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.1 LINHA
  { id: '8.1.0', chapter: '8.1 LINHA DE CRÉDITO', title: '8.1.0 Intro Linha', description: 'Enquadramento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.1.1', chapter: '8.1 LINHA DE CRÉDITO', title: '8.1.1 Nome Linha', description: 'Entrega: Inovação/Acessibilidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.1.2', chapter: '8.1 LINHA DE CRÉDITO', title: '8.1.2 Valor/Prazo', description: 'Entrega: 10 anos/2 carência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.1.3', chapter: '8.1 LINHA DE CRÉDITO', title: '8.1.3 Taxas', description: 'Entrega: 0.5% + TR.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.1.4', chapter: '8.1 LINHA DE CRÉDITO', title: '8.1.4 Condições', description: 'Entrega: Impacto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.1.5', chapter: '8.1 LINHA DE CRÉDITO', title: '8.1.5 Conclusão Linha', description: 'SÍNTESE 8.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.2 OBJETIVO
  { id: '8.2.0', chapter: '8.2 OBJETIVO CRÉDITO', title: '8.2.0 Intro Objetivo', description: 'Uso.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.2.1', chapter: '8.2 OBJETIVO CRÉDITO', title: '8.2.1 Geral', description: 'Entrega: Papel financiamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.2.2', chapter: '8.2 OBJETIVO CRÉDITO', title: '8.2.2 Tangíveis', description: 'Entrega: Obras/Equip.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.2.3', chapter: '8.2 OBJETIVO CRÉDITO', title: '8.2.3 Intangíveis', description: 'Entrega: Software/Conteúdo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.2.4', chapter: '8.2 OBJETIVO CRÉDITO', title: '8.2.4 Contrapartida', description: 'Entrega: Recursos próprios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.2.5', chapter: '8.2 OBJETIVO CRÉDITO', title: '8.2.5 Conclusão Objetivo', description: 'SÍNTESE 8.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.3 FASEAMENTO
  { id: '8.3.0', chapter: '8.3 USO FASEADO', title: '8.3.0 Intro Faseamento', description: 'Liberação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.3.1', chapter: '8.3 USO FASEADO', title: '8.3.1 Cronograma', description: 'Entrega: Desembolsos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.3.2', chapter: '8.3 USO FASEADO', title: '8.3.2 Marcos', description: 'Entrega: CAPEX x Ramp-up.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.3.3', chapter: '8.3 USO FASEADO', title: '8.3.3 Critérios', description: 'Entrega: Gatilhos liberação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.3.4', chapter: '8.3 USO FASEADO', title: '8.3.4 Controle', description: 'Entrega: Prestação contas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.3.5', chapter: '8.3 USO FASEADO', title: '8.3.5 Conclusão Faseamento', description: 'SÍNTESE 8.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.4 CAPITAL
  { id: '8.4.0', chapter: '8.4 GESTÃO CAPITAL', title: '8.4.0 Intro Capital', description: 'Recursos conta.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.4.1', chapter: '8.4 GESTÃO CAPITAL', title: '8.4.1 Política', description: 'Entrega: Segurança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.4.2', chapter: '8.4 GESTÃO CAPITAL', title: '8.4.2 Aplicação', description: 'Entrega: Baixo risco.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.4.3', chapter: '8.4 GESTÃO CAPITAL', title: '8.4.3 Liquidez', description: 'Entrega: Cronograma.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.4.4', chapter: '8.4 GESTÃO CAPITAL', title: '8.4.4 Riscos', description: 'Entrega: Alocação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.4.5', chapter: '8.4 GESTÃO CAPITAL', title: '8.4.5 Conclusão Capital', description: 'SÍNTESE 8.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.5 RESERVAS
  { id: '8.5.0', chapter: '8.5 RESERVAS', title: '8.5.0 Intro Reservas', description: 'Colchão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.5.1', chapter: '8.5 RESERVAS', title: '8.5.1 Giro Mínimo', description: 'Entrega: Segurança Op.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.5.2', chapter: '8.5 RESERVAS', title: '8.5.2 RSD', description: 'Entrega: Serviço Dívida.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.5.3', chapter: '8.5 RESERVAS', title: '8.5.3 Origem', description: 'Entrega: Aportes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.5.4', chapter: '8.5 RESERVAS', title: '8.5.4 Uso', description: 'Entrega: Recomposição.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.5.5', chapter: '8.5 RESERVAS', title: '8.5.5 Conclusão Reservas', description: 'SÍNTESE 8.5.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.6 GARANTIAS
  { id: '8.6.0', chapter: '8.6 GARANTIAS', title: '8.6.0 Intro Garantias', description: 'Segurança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.6.1', chapter: '8.6 GARANTIAS', title: '8.6.1 Tipos', description: 'Entrega: Real/Fiança.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.6.2', chapter: '8.6 GARANTias', title: '8.6.2 Cobertura', description: 'Entrega: Valor bens.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.6.3', chapter: '8.6 GARANTias', title: '8.6.3 Recebíveis', description: 'Entrega: Cessão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.6.4', chapter: '8.6 GARANTias', title: '8.6.4 Complementares', description: 'Entrega: Seguros.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.6.5', chapter: '8.6 GARANTias', title: '8.6.5 Conclusão Garantias', description: 'SÍNTESE 8.6.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 8.7 RETORNO BRDE
  { id: '8.7.0', chapter: '8.7 RETORNO AO BRDE', title: '8.7.0 Intro Retorno', description: 'Pagamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '8.7.1', chapter: '8.7 RETORNO AO BRDE', title: '8.7.1 Projeção Serviço', description: 'Entrega: Parcelas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.7.2', chapter: '8.7 RETORNO AO BRDE', title: '8.7.2 Indicadores', description: 'Entrega: DSCR.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.7.3', chapter: '8.7 RETORNO AO BRDE', title: '8.7.3 Capacidade', description: 'Entrega: Crescimento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.7.4', chapter: '8.7 RETORNO AO BRDE', title: '8.7.4 Benefícios', description: 'Entrega: Mandato BRDE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '8.7.5', chapter: '8.7 RETORNO AO BRDE', title: '8.7.5 Conclusão Retorno', description: 'SÍNTESE 8.7.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 9: RISCOS ---
  { id: '9.0', chapter: '9. ANÁLISE DE RISCOS', title: '9.0 Introdução Riscos', description: 'Mapa geral.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 9.1 MERCADO
  { id: '9.1.0', chapter: '9.1 RISCO MERCADO', title: '9.1.0 Intro Mercado', description: 'Externos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '9.1.1', chapter: '9.1 RISCO MERCADO', title: '9.1.1 Demanda', description: 'Entrega: Baixa adesão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1.2', chapter: '9.1 RISCO MERCADO', title: '9.1.2 Concorrência', description: 'Entrega: Reação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1.3', chapter: '9.1 RISCO MERCADO', title: '9.1.3 Hábitos', description: 'Entrega: Mudança consumo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1.4', chapter: '9.1 RISCO MERCADO', title: '9.1.4 Parceiros', description: 'Entrega: Cancelamento.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1.5', chapter: '9.1 RISCO MERCADO', title: '9.1.5 Mitigação', description: 'Entrega: Estratégias.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.1.6', chapter: '9.1 RISCO MERCADO', title: '9.1.6 Conclusão Mercado', description: 'SÍNTESE 9.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 9.2 OPERACIONAL
  { id: '9.2.0', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.0 Intro Operacional', description: 'Dia a dia.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '9.2.1', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.1 Plataforma', description: 'Entrega: Falha técnica.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.2.2', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.2 Distribuição', description: 'Entrega: Erro ingest.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.2.3', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.3 Ao Vivo', description: 'Entrega: Queda link.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.2.4', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.4 Infra Física', description: 'Entrega: Danos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.2.5', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.5 Contingência', description: 'Entrega: Planos B.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.2.6', chapter: '9.2 RISCO OPERACIONAL', title: '9.2.6 Conclusão Operacional', description: 'SÍNTESE 9.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 9.3 FINANCEIRO
  { id: '9.3.0', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.0 Intro Financeiro', description: 'Caixa.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '9.3.1', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.1 Fluxo Operação', description: 'Entrega: Caixa curto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.3.2', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.2 Serviço Dívida', description: 'Entrega: Pagamento BRDE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.3.3', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.3 Índices', description: 'Entrega: Juros/Inflação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.3.4', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.4 Inadimplência', description: 'Entrega: Calote.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.3.5', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.5 Mitigação', description: 'Entrega: Reservas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.3.6', chapter: '9.3 RISCO FINANCEIRO', title: '9.3.6 Conclusão Financeiro', description: 'SÍNTESE 9.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 9.4 JURÍDICO
  { id: '9.4.0', chapter: '9.4 RISCO JURÍDICO', title: '9.4.0 Intro Jurídico', description: 'Legal.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '9.4.1', chapter: '9.4 RISCO JURÍDICO', title: '9.4.1 Contratos', description: 'Entrega: Litígio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.4.2', chapter: '9.4 RISCO JURÍDICO', title: '9.4.2 Regulatório', description: 'Entrega: ANCINE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.4.3', chapter: '9.4 RISCO JURÍDICO', title: '9.4.3 CVM', description: 'Entrega: Investidor.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.4.4', chapter: '9.4 RISCO JURÍDICO', title: '9.4.4 LGPD', description: 'Entrega: Dados.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.4.5', chapter: '9.4 RISCO JURÍDICO', title: '9.4.5 Mitigação', description: 'Entrega: Compliance.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.4.6', chapter: '9.4 RISCO JURÍDICO', title: '9.4.6 Conclusão Jurídico', description: 'SÍNTESE 9.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 9.5 GOVERNANÇA
  { id: '9.5.0', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.0 Intro Governança', description: 'Gestão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '9.5.1', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.1 Centralização', description: 'Entrega: Dependência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.5.2', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.2 Conflito', description: 'Entrega: Sócios.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.5.3', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.3 Turnover', description: 'Entrega: Talentos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.5.4', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.4 Ética', description: 'Entrega: Fraude.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.5.5', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.5 Mitigação', description: 'Entrega: Acordos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.5.6', chapter: '9.5 RISCO GOVERNANÇA', title: '9.5.6 Conclusão Governança', description: 'SÍNTESE 9.5.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 9.6 MATRIZ AÇÃO
  { id: '9.6.0', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.0 Intro Matriz', description: 'Priorização.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '9.6.1', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.1 Classificação', description: 'Entrega: Probabilidade/Impacto.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.6.2', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.2 Críticos', description: 'Entrega: Ameaça BRDE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.6.3', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.3 Plano Ação', description: 'Entrega: Quem/Quando.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.6.4', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.4 Integração', description: 'Entrega: Rotina.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.6.5', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.5 Revisão', description: 'Entrega: Periodicidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '9.6.6', chapter: '9.6 MATRIZ AÇÃO', title: '9.6.6 Conclusão Matriz', description: 'SÍNTESE 9.6.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 10: IMPACTOS ---
  { id: '10.0', chapter: '10. IMPACTOS E RESULTADOS', title: '10.0 Intro Impactos', description: 'Retorno social.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 10.1 CULTURAIS
  { id: '10.1.0', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.0 Intro Cultura', description: 'Identidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '10.1.1', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.1 Valorização', description: 'Entrega: Narrativas SC.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.1.2', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.2 Circulação', description: 'Entrega: Artistas locais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.1.3', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.3 Memória', description: 'Entrega: Patrimônio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.1.4', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.4 Diversidade', description: 'Entrega: Inclusão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.1.5', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.5 Indicadores', description: 'Entrega: Métricas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.1.6', chapter: '10.1 IMPACTOS CULTURAIS', title: '10.1.6 Conclusão Cultura', description: 'SÍNTESE 10.1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 10.2 SOCIAIS
  { id: '10.2.0', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.0 Intro Social', description: 'Educação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '10.2.1', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.1 Acesso', description: 'Entrega: Interiorização.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.2.2', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.2 Escolas', description: 'Entrega: Projetos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.2.3', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.3 Acessibilidade', description: 'Entrega: Libras/AD.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.2.4', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.4 Talentos', description: 'Entrega: Novos criadores.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.2.5', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.5 Indicadores', description: 'Entrega: Alcance.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.2.6', chapter: '10.2 IMPACTOS SOCIAIS', title: '10.2.6 Conclusão Social', description: 'SÍNTESE 10.2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 10.3 ECONÔMICOS
  { id: '10.3.0', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.0 Intro Econômico', description: 'Renda.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '10.3.1', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.1 Empregos', description: 'Entrega: CLT/PJ.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.3.2', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.2 Cadeia', description: 'Entrega: Fornecedores.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.3.3', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.3 Tributos', description: 'Entrega: Impostos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.3.4', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.4 Turismo', description: 'Entrega: Eventos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.3.5', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.5 Indicadores', description: 'Entrega: Metas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.3.6', chapter: '10.3 IMPACTOS ECONÔMICOS', title: '10.3.6 Conclusão Econômico', description: 'SÍNTESE 10.3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 10.4 INOVAÇÃO
  { id: '10.4.0', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.0 Intro Inovação', description: 'Tech.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '10.4.1', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.1 Soluções', description: 'Entrega: Modelo híbrido.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.4.2', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.2 Digitalização', description: 'Entrega: Cadeia local.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.4.3', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.3 Dados', description: 'Entrega: Políticas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.4.4', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.4 Ecossistema', description: 'Entrega: Universidades.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.4.5', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.5 Indicadores', description: 'Entrega: Adoção.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.4.6', chapter: '10.4 IMPACTOS INOVAÇÃO', title: '10.4.6 Conclusão Inovação', description: 'SÍNTESE 10.4.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 10.5 POLÍTICAS
  { id: '10.5.0', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.0 Intro Políticas', description: 'Mandato.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '10.5.1', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.1 Cultura', description: 'Entrega: Planos setoriais.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.5.2', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.2 Regional', description: 'Entrega: BRDE.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.5.3', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.3 ODS', description: 'Entrega: ONU.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.5.4', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.4 Sinergia', description: 'Entrega: Inclusão.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.5.5', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.5 Narrativa', description: 'Entrega: Valor público.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.5.6', chapter: '10.5 POLÍTICAS PÚBLICAS', title: '10.5.6 Conclusão Políticas', description: 'SÍNTESE 10.5.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 10.6 MONITORAMENTO
  { id: '10.6.0', chapter: '10.6 MONITORAMENTO', title: '10.6.0 Intro Monitoramento', description: 'Report.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '10.6.1', chapter: '10.6 MONITORAMENTO', title: '10.6.1 KPIs', description: 'Entrega: Painel.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.6.2', chapter: '10.6 MONITORAMENTO', title: '10.6.2 Coleta', description: 'Entrega: Fontes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.6.3', chapter: '10.6 MONITORAMENTO', title: '10.6.3 Relatórios', description: 'Entrega: Frequência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.6.4', chapter: '10.6 MONITORAMENTO', title: '10.6.4 Escuta', description: 'Entrega: Participação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.6.5', chapter: '10.6 MONITORAMENTO', title: '10.6.5 Ajuste', description: 'Entrega: Feedback loop.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '10.6.6', chapter: '10.6 MONITORAMENTO', title: '10.6.6 Conclusão Monitoramento', description: 'SÍNTESE 10.6.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // --- CAPÍTULO 11: ANEXOS ---
  { id: '11.0', chapter: '11. ANEXOS', title: '11.0 Introdução Anexos', description: 'Visão geral do Dossiê.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.1 SOCIETÁRIO
  { id: '11.1.0', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.0 Intro Societário', description: 'Legalidade.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.1.1', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.1 Contratos/Estatutos', description: 'Entrega: Atos constitutivos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.1.2', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.2 CNPJ/Inscrições', description: 'Entrega: Regularidade fiscal.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.1.3', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.3 Certidões', description: 'Entrega: Negativas débitos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.1.4', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.4 Identificação Sócios', description: 'Entrega: RG/CPF Dirigentes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.1.5', chapter: '11.1 DOCUMENTOS SOCIETÁRIOS', title: '11.1.5 Conclusão Societário', description: 'Checklist 11.1 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.2 MERCADO
  { id: '11.2.0', chapter: '11.2 ESTUDOS MERCADO', title: '11.2.0 Intro Mercado', description: 'Evidências.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.2.1', chapter: '11.2 ESTUDOS MERCADO', title: '11.2.1 Pesquisa Público', description: 'Entrega: Relatório completo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.2.2', chapter: '11.2 ESTUDOS MERCADO', title: '11.2.2 Fontes Externas', description: 'Entrega: Dados IBGE/Setor.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.2.3', chapter: '11.2 ESTUDOS MERCADO', title: '11.2.3 Benchmarking', description: 'Entrega: Comparativo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.2.4', chapter: '11.2 ESTUDOS MERCADO', title: '11.2.4 Estudos Setoriais', description: 'Entrega: Artigos/Papers.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.2.5', chapter: '11.2 ESTUDOS MERCADO', title: '11.2.5 Conclusão Mercado', description: 'Checklist 11.2 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.3 ORÇAMENTOS
  { id: '11.3.0', chapter: '11.3 ORÇAMENTOS E CUSTOS', title: '11.3.0 Intro Orçamentos', description: 'Valores.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.3.1', chapter: '11.3 ORÇAMENTOS E CUSTOS', title: '11.3.1 Equipamentos', description: 'Entrega: Cotações CAPEX.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.3.2', chapter: '11.3 ORÇAMENTOS E CUSTOS', title: '11.3.2 Tecnologia', description: 'Entrega: Plataforma/Soft.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.3.3', chapter: '11.3 ORÇAMENTOS E CUSTOS', title: '11.3.3 Obras/Reformas', description: 'Entrega: Orçamento Civil.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.3.4', chapter: '11.3 ORÇAMENTOS E CUSTOS', title: '11.3.4 Memória Cálculo', description: 'Entrega: Planilhas OPEX.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.3.5', chapter: '11.3 ORÇAMENTOS E CUSTOS', title: '11.3.5 Conclusão Orçamentos', description: 'Checklist 11.3 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.4 TÉCNICO
  { id: '11.4.0', chapter: '11.4 MATERIAL TÉCNICO', title: '11.4.0 Intro Técnico', description: 'Projetos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.4.1', chapter: '11.4 MATERIAL TÉCNICO', title: '11.4.1 Planta HUB', description: 'Entrega: Arquitetônico.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.4.2', chapter: '11.4 MATERIAL TÉCNICO', title: '11.4.2 Layout Técnico', description: 'Entrega: Estúdios/Ilhas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.4.3', chapter: '11.4 MATERIAL TÉCNICO', title: '11.4.3 Projeto Van 4K', description: 'Entrega: Diagrama Vídeo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.4.4', chapter: '11.4 MATERIAL TÉCNICO', title: '11.4.4 Mapas Cobertura', description: 'Entrega: Rota/Alcance.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.4.5', chapter: '11.4 MATERIAL TÉCNICO', title: '11.4.5 Conclusão Técnico', description: 'Checklist 11.4 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.5 EQUIPE
  { id: '11.5.0', chapter: '11.5 CURRÍCULOS', title: '11.5.0 Intro Currículos', description: 'Competência.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.5.1', chapter: '11.5 CURRÍCULOS', title: '11.5.1 CVs Chave', description: 'Entrega: Gestão/Técnica.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.5.2', chapter: '11.5 CURRÍCULOS', title: '11.5.2 Portfólio', description: 'Entrega: Projetos Realizados.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.5.3', chapter: '11.5 CURRÍCULOS', title: '11.5.3 Prêmios', description: 'Entrega: Certificações.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.5.4', chapter: '11.5 CURRÍCULOS', title: '11.5.4 Recomendações', description: 'Entrega: Cartas Atestado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.5.5', chapter: '11.5 CURRÍCULOS', title: '11.5.5 Conclusão Currículos', description: 'Checklist 11.5 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.6 PARCERIAS
  { id: '11.6.0', chapter: '11.6 CARTAS INTENÇÃO', title: '11.6.0 Intro Parcerias', description: 'Apoio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.6.1', chapter: '11.6 CARTAS INTENÇÃO', title: '11.6.1 Conteúdo', description: 'Entrega: Produtoras.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.6.2', chapter: '11.6 CARTAS INTENÇÃO', title: '11.6.2 B2B', description: 'Entrega: Clientes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.6.3', chapter: '11.6 CARTAS INTENÇÃO', title: '11.6.3 Institucional', description: 'Entrega: Associações.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.6.4', chapter: '11.6 CARTAS INTENÇÃO', title: '11.6.4 Articulação', description: 'Entrega: Outros.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.6.5', chapter: '11.6 CARTAS INTENÇÃO', title: '11.6.5 Conclusão Parcerias', description: 'Checklist 11.6 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.7 HISTÓRICO FINANCEIRO
  { id: '11.7.0', chapter: '11.7 HISTÓRICO FINANCEIRO', title: '11.7.0 Intro Histórico', description: 'Passado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.7.1', chapter: '11.7 HISTÓRICO FINANCEIRO', title: '11.7.1 Balanços', description: 'Entrega: DREs anteriores.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.7.2', chapter: '11.7 HISTÓRICO FINANCEIRO', title: '11.7.2 Faturamento', description: 'Entrega: Comprovantes.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.7.3', chapter: '11.7 HISTÓRICO FINANCEIRO', title: '11.7.3 Endividamento', description: 'Entrega: Posição atual.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.7.4', chapter: '11.7 HISTÓRICO FINANCEIRO', title: '11.7.4 Suporte Projeções', description: 'Entrega: Bases cálculo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.7.5', chapter: '11.7 HISTÓRICO FINANCEIRO', title: '11.7.5 Conclusão Histórico', description: 'Checklist 11.7 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.8 FORMULÁRIOS BRDE
  { id: '11.8.0', chapter: '11.8 DOCUMENTOS BRDE', title: '11.8.0 Intro Formulários', description: 'Burocracia.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.8.1', chapter: '11.8 DOCUMENTOS BRDE', title: '11.8.1 Checklist', description: 'Entrega: Lista oficial.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.8.2', chapter: '11.8 DOCUMENTOS BRDE', title: '11.8.2 Cadastros', description: 'Entrega: Fichas.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.8.3', chapter: '11.8 DOCUMENTOS BRDE', title: '11.8.3 Declarações', description: 'Entrega: Termos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.8.4', chapter: '11.8 DOCUMENTOS BRDE', title: '11.8.4 Edital', description: 'Entrega: Específicos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.8.5', chapter: '11.8 DOCUMENTOS BRDE', title: '11.8.5 Conclusão Formulários', description: 'Checklist 11.8 OK.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  // 11.9 QUADRO RESUMO
  { id: '11.9.0', chapter: '11.9 ÍNDICE ANEXOS', title: '11.9.0 Intro Índice', description: 'Organização.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '11.9.1', chapter: '11.9 ÍNDICE ANEXOS', title: '11.9.1 Tabela Mestra', description: 'Entrega: Lista arquivos.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.9.2', chapter: '11.9 ÍNDICE ANEXOS', title: '11.9.2 Vínculos', description: 'Entrega: Referência Cruzada.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.9.3', chapter: '11.9 ÍNDICE ANEXOS', title: '11.9.3 Versões', description: 'Entrega: Controle.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.9.4', chapter: '11.9 ÍNDICE ANEXOS', title: '11.9.4 Orientações', description: 'Entrega: Guia leitura.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '11.9.5', chapter: '11.9 ÍNDICE ANEXOS', title: '11.9.5 Conclusão Final', description: 'SÍNTESE GERAL.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
];

export const DEFAULT_METHODOLOGY = "Metodologia SEBRAE + Manual de Crédito BRDE/FSA";

export const IMAGE_PROMPTS = {
  logo: "Logotipo profissional e moderno para 'SCine', uma plataforma de streaming e HUB criativo em Santa Catarina. Estilo tech, vibrante, cores laranja e roxo, vetor minimalista.",
  floorplan: "Planta baixa arquitetônica técnica de um HUB Audiovisual de 600m². Incluindo: 2 estúdios de vídeo, 4 ilhas de edição, área de coworking, recepção e depósito técnico. Estilo blueprint azul.",
  map: "Mapa estratégico do estado de Santa Catarina, Brasil, mostrando pontos de conexão digital e uma rota ilustrada de uma Van de Transmissão 4K percorrendo as principais cidades.",
};
export const DEFAULT_STRATEGIC_MATRIX: StrategicMatrix = {
    customerSegments: { items: [], description: "", source: "", clarityLevel: 0 },
    valueProposition: { items: [], description: "", source: "", clarityLevel: 0 },
    channels: { items: [], description: "", source: "", clarityLevel: 0 },
    customerRelationships: { items: [], description: "", source: "", clarityLevel: 0 },
    revenueStreams: { items: [], description: "", source: "", clarityLevel: 0 },
    keyResources: { items: [], description: "", source: "", clarityLevel: 0 },
    keyActivities: { items: [], description: "", source: "", clarityLevel: 0 },
    keyPartnerships: { items: [], description: "", source: "", clarityLevel: 0 },
    costStructure: { items: [], description: "", source: "", clarityLevel: 0 },
    // FIX: Added missing swot and generatedAt properties to match the StrategicMatrix type.
    swot: {
        strengths: { items: [], description: "", source: "", clarityLevel: 0 },
        weaknesses: { items: [], description: "", source: "", clarityLevel: 0 },
        opportunities: { items: [], description: "", source: "", clarityLevel: 0 },
        threats: { items: [], description: "", source: "", clarityLevel: 0 },
    },
    generatedAt: 0,
};
