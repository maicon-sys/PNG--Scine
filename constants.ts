import { PlanSection, SectionStatus, SectionType } from './types';

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
- Modelo de Negócio: Ecossistema Híbrido (OTT + HUB + Van 4K).
- Público B2C: Assinantes (Planos Free, Star, Premium).
- Público B2B: Prefeituras, Empresas, Festivais.
- Tecnologia: Vodlix (white label), Gateways (Asaas/Pagar.me).
- Objetivo do Crédito: Construção do HUB, compra da Van 4K e tração da base.
`;

export const DEFAULT_METHODOLOGY = 'Metodologia Sebrae + BRDE';

export const DEFAULT_STRATEGIC_MATRIX = {
  pilares: ['Mercado', 'Produto', 'Operação', 'Finanças', 'Riscos'],
  canvas: [
    { bloco: 'Mercado', pontos: ['TAM/SAM/SOM', 'Concorrência', 'Segmentos prioritários'] },
    { bloco: 'Produto', pontos: ['OTT', 'HUB', 'Unidade móvel', 'Proposta de valor'] },
    { bloco: 'Operação', pontos: ['Equipe', 'Fornecedores críticos', 'Parcerias B2B/B2C'] },
    { bloco: 'Finanças', pontos: ['Receitas B2C/B2B', 'CAPEX/OPEX', 'Serviço da dívida'] },
    { bloco: 'Riscos', pontos: ['Mercado', 'Operacional', 'Financeiro', 'Jurídico'] }
  ]
};

export const GLOSSARY_TERMS: Record<string, string> = {
  CAC: 'Custo de Aquisição de Cliente',
  LTV: 'Lifetime Value (valor total por cliente)',
  Churn: 'Taxa de cancelamento de assinaturas',
  'Break-even': 'Ponto de equilíbrio financeiro',
  Payback: 'Tempo para recuperar o investimento',
  ROI: 'Retorno Sobre o Investimento',
  EBITDA: 'Lucros antes de juros, impostos, depreciação e amortização',
  CAPEX: 'Capital Expenditure (investimento em bens)',
  OPEX: 'Operational Expenditure (despesas operacionais)',
  DSCR: 'Índice de Cobertura do Serviço da Dívida',
  TAM: 'Total Addressable Market',
  SAM: 'Serviceable Available Market',
  SOM: 'Serviceable Obtainable Market',
  OTT: 'Over-The-Top (streaming via internet)',
  VOD: 'Video On Demand',
  AVOD: 'Advertising VOD',
  SVOD: 'Subscription VOD',
  TR: 'Taxa Referencial',
  CDI: 'Certificado de Depósito Interbancário',
  FSA: 'Fundo Setorial do Audiovisual',
  ANCINE: 'Agência Nacional do Cinema',
  LGPD: 'Lei Geral de Proteção de Dados',
};

export const IMAGE_PROMPTS: Record<'logo' | 'map' | 'floorplan', string> = {
  logo: 'Crie um logotipo minimalista para a marca SCine, cores laranja e preto, estilo flat.',
  map: 'Mapa estilizado destacando Santa Catarina e polos audiovisuais, com ícones simples.',
  floorplan: 'Planta baixa simplificada de um hub audiovisual com estúdios, ilhas de edição e coworking.'
};

export const INITIAL_SECTIONS: PlanSection[] = [
  { id: '1.0', chapter: '1. SUMÁRIO EXECUTIVO', title: '1.0 Introdução Geral', description: 'Resumo de todo o plano.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '1.1', chapter: '1. SUMÁRIO EXECUTIVO', title: '1.1 Proposta de Valor', description: 'Visão geral do negócio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '1.2', chapter: '1. SUMÁRIO EXECUTIVO', title: '1.2 Conclusão Sumário', description: 'Síntese do capítulo 1.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  { id: '2.0', chapter: '2. MERCADO', title: '2.0 Introdução Mercado', description: 'Contexto de mercado.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '2.1', chapter: '2. MERCADO', title: '2.1 Clientes e Personas', description: 'Segmentos e dores.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.2', chapter: '2. MERCADO', title: '2.2 Concorrência', description: 'Mapa competitivo.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '2.3', chapter: '2. MERCADO', title: '2.3 Conclusão Mercado', description: 'Síntese do capítulo 2.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  { id: '3.0', chapter: '3. PRODUTO E MODELO', title: '3.0 Introdução Produto', description: 'Visão do portfólio.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },
  { id: '3.1', chapter: '3. PRODUTO E MODELO', title: '3.1 Portfólio OTT/HUB/Van', description: 'Descrição dos pilares.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.2', chapter: '3. PRODUTO E MODELO', title: '3.2 Monetização', description: 'Planos B2C e serviços B2B.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },
  { id: '3.3', chapter: '3. PRODUTO E MODELO', title: '3.3 Conclusão Produto', description: 'Síntese do capítulo 3.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT, isLocked: true },

  { id: '4.0', chapter: '4. OPERAÇÃO', title: '4.0 Equipe e Processos', description: 'Time, fornecedores e parceiros.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  { id: '5.0', chapter: '5. FINANCEIRO', title: '5.0 Planejamento Financeiro', description: 'Projeções e indicadores.', content: '', status: SectionStatus.PENDING, type: SectionType.FINANCIAL },

  { id: '6.0', chapter: '6. RISCOS', title: '6.0 Análise de Riscos', description: 'Riscos e mitigação.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  { id: '7.0', chapter: '7. BRDE/FSA', title: '7.0 Estrutura de Financiamento', description: 'Enquadramento BRDE e garantias.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT },

  { id: '8.0', chapter: '8. ANEXOS', title: '8.0 Glossário e Referências', description: 'Anexos finais e glossário.', content: '', status: SectionStatus.PENDING, type: SectionType.TEXT }
];
