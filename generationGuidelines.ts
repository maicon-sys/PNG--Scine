// FEATURE: Novo "cérebro de conteúdo" da IA.
// Este arquivo mapeia cada seção do plano de negócios para as exigências
// específicas do SEBRAE e BRDE, conforme detalhado pelo usuário.
// A IA usará isso como um roteiro obrigatório para gerar texto.

export interface SectionGuideline {
  title: string;
  sebrae: string[];
  brde: string[];
  keywords: string[];
}

export const generationGuidelines: Record<string, SectionGuideline> = {
  // --- TÓPICO 2: ANÁLISE DE MERCADO ---
  '2.1': {
    title: 'Segmentação de Mercado',
    sebrae: [
      'Identificação clara dos grupos de clientes (público, empresas, instituições).',
      'Dados demográficos, geográficos e comportamentais.',
      'Frequência de consumo, hábitos digitais e poder de compra.',
      'Prova de que o segmento é grande o suficiente para sustentar o modelo.',
    ],
    brde: [
      'Evidência de tamanho de mercado suficiente para justificar o crédito.',
      'Dados concretos (pesquisa própria + dados externos).',
      'Clareza sobre quem paga, quanto paga, e por quê.',
    ],
    keywords: ['segmentação', 'cliente', 'público', 'demografia', 'geografia', 'comportamento', 'consumo', 'poder de compra', 'tamanho de mercado']
  },
  '2.2': {
    title: 'Perfil do Cliente / Persona',
    sebrae: [
      'Descrição estruturada do comportamento do cliente: motivadores, barreiras, objeções.',
      'Mapeamento dos fatores que influenciam a decisão (preço, identidade, utilidade, conteúdo).',
      'Prova de que o cliente identificado combina com o produto oferecido.',
    ],
    brde: [
      'Coerência entre cliente-alvo e projeções de venda.',
      'Indicação de capacidade econômica real do cliente para manter assinatura.',
    ],
    keywords: ['perfil do cliente', 'persona', 'comportamento', 'motivadores', 'barreiras', 'objeções', 'decisão de compra']
  },
  '2.3': {
    title: 'Necessidades, Problemas e Oportunidades',
    sebrae: [
      'Quais dores o mercado possui e que a SCine resolve.',
      'Oportunidades ignoradas pelas concorrentes (ex.: acessibilidade, nichos regionais).',
      'Dados que comprovam que o problema existe (pesquisa própria + estudos externos).',
    ],
    brde: [
      'Justificativa sólida mostrando por que a SCine é necessária ao mercado.',
      'Evidências de que há espaço não ocupado por grandes players.',
    ],
    keywords: ['dores', 'problemas', 'necessidades', 'oportunidades', 'solução', 'nicho']
  },
  '2.4': {
    title: 'Pesquisa de Mercado Primária',
    sebrae: [
      'Dados coletados diretamente com o público-alvo.',
      'Conclusões claras sobre interesse, preço, barreiras, hábitos, taxa de adoção.',
      'Amostra robusta (BRDE exige coerência entre amostra e projeção).',
    ],
    brde: [
      'Prova de que as projeções financeiras são realistas.',
      'Evidência de que existe demanda suficiente para sustentar o crescimento previsto.',
      'Validação real das hipóteses (preço, assinaturas, interesse por lives, etc.).',
    ],
    keywords: ['pesquisa de mercado', 'pesquisa primária', 'questionário', 'entrevista', 'amostra', 'validação']
  },
  '2.5': {
    title: 'Mercado Potencial – Quantificação',
    sebrae: [
      'Tamanho total do mercado (TAM)',
      'Tamanho do mercado disponível (SAM)',
      'Tamanho do mercado atendível (SOM).',
    ],
    brde: [
      'Cálculo transparente que mostre: quantas pessoas realmente podem assinar, quantas devem assinar, qual proporção é viável economicamente.',
      'Coerência com o tamanho da população, renda média, penetração digital etc.',
    ],
    keywords: ['tam', 'sam', 'som', 'mercado potencial', 'quantificação', 'tamanho de mercado', 'cálculo']
  },
  '2.6': {
    title: 'Análise da Concorrência',
    sebrae: [
      'Quem são os concorrentes diretos e indiretos.',
      'O que oferecem, quanto custam, como atendem (ou não) o público.',
      'Comparação objetiva (benchmarking) entre SCine e players (GloboPlay, Netflix, Looke, plataformas locais).',
      'Pontos fortes, fracos e brechas estratégicas.',
    ],
    brde: [
      'Que você demonstre conhecimento real do setor e riscos de competição.',
      'Que deixe claro que a SCine não disputa catálogo, mas sim identidade e regionalidade.',
      'Que mostre por que o público pagaria por mais uma plataforma.',
    ],
    keywords: ['concorrência', 'concorrentes', 'competidores', 'benchmarking', 'comparativo', 'players']
  },
  '2.7': {
    title: 'Análise de Tendências de Mercado',
    sebrae: [
      'Crescimento do streaming no Brasil (Kantar, DataReportal, Nielsen).',
      'Consumo de vídeo sob demanda e consumo móvel.',
      'Crescimento de transmissões ao vivo.',
      'Tendências de regionalização e economia criativa.',
    ],
    brde: [
      'Prova de que o setor é crescente, estável e seguro para financiamento.',
      'Dados atualizados e fontes confiáveis.',
      'Fundamentação para projeções de receita.',
    ],
    keywords: ['tendências', 'crescimento', 'streaming', 'vod', 'lives', 'regionalização', 'fontes']
  },
  '2.8': {
    title: 'Análise do Ambiente Externo – Fatores PESTEL',
    sebrae: [
      'Análise objetiva dos fatores: Político, Econômico, Social, Tecnológico, Ambiental e Legal.',
      'Impactos no streaming, cultura, publicidade e produção audiovisual.',
    ],
    brde: [
      'Identificação clara de riscos externos.',
      'Entendimento de regulamentações importantes (ANCINE, LGPD, ISS, IVA digital).',
      'Avaliação de como políticas públicas influenciam o projeto (PIC, SIMDEC, FSA).',
    ],
    keywords: ['pestel', 'ambiente externo', 'político', 'econômico', 'social', 'tecnológico', 'legal', 'regulamentação']
  },
  '2.9': {
    title: 'Análise Setorial',
    sebrae: [
      'Como funciona o setor audiovisual e de streaming no Brasil.',
      'Volume de produções, circulação, plataformas, estrutura de custos.',
      'Dados reais sobre monetização, publicidade, modelos híbridos e B2B.',
    ],
    brde: [
      'Clareza sobre custos reais, ciclos de produção e sazonalidade.',
      'Coerência entre capacidade produtiva da SCine e o setor.',
    ],
    keywords: ['setor', 'setorial', 'audiovisual', 'streaming', 'monetização', 'custos do setor']
  },
  '2.10': {
    title: 'Barreiras de Entrada e Riscos de Mercado',
    sebrae: [
      'Barreiras tecnológicas',
      'Barreiras de catálogo',
      'Barreiras regulatórias',
      'Barreiras financeiras',
    ],
    brde: [
      'Maturidade na identificação de riscos.',
      'Planos de mitigação sólidos.',
      'Transparência sobre limitações (concorrência, churn, dependência de conteúdo).',
    ],
    keywords: ['barreiras de entrada', 'riscos de mercado', 'mitigação', 'ameaças']
  },
  '2.11': {
    title: 'Oportunidades Competitivas',
    sebrae: [
      'Por que a SCine tem vantagem competitiva frente ao mercado.',
      'Fatores diferenciadores: identidade local, Van 4K, HUB, acessibilidade, coproduções.',
    ],
    brde: [
      'Que você prove que existe um espaço real onde a SCine domina.',
      'Que a vantagem é sustentável e não baseada em moda ou sorte.',
    ],
    keywords: ['vantagem competitiva', 'diferenciais', 'oportunidades', 'posicionamento']
  },
  '2.12': {
    title: 'Síntese da Análise de Mercado',
    sebrae: [
      'Conclusão lógica conectando dados → oportunidades → público → viabilidade.',
      'Evidência de que o negócio é financeiramente plausível no mercado identificado.',
    ],
    brde: [
      '“Uma síntese lógica, fundamentada e compatível com as projeções financeiras.”',
      'Essa síntese é o que reduz o risco percebido e aumenta a pontuação do crédito.',
    ],
    keywords: ['síntese', 'conclusão', 'veredito', 'viabilidade de mercado', 'resumo do mercado']
  },
  // Placeholder para os próximos capítulos (a serem detalhados)
  '3.1': {
    title: 'Produto/Serviço',
    sebrae: ['Descrição clara do produto', 'Benefícios', 'Diferenciais', 'Portfólio de serviços', 'Como funciona'],
    brde: ['Prova técnica de que o produto pode ser entregue', 'Pipeline operacional documentado', 'Padrões de qualidade', 'Acessibilidade (AD, Libras, CC) como processo', 'Conexão entre produto → equipe → custos', 'Roadmap de evolução técnica'],
    keywords: ['produto', 'serviço', 'plataforma', 'ott', 'hub', 'van 4k', 'funcionalidades', 'pipeline', 'roadmap']
  },
  '4.1': {
      title: 'Plano de Marketing',
      sebrae: ['4 Ps', 'Estratégia de aquisição', 'Segmentação', 'Posicionamento', 'Canais de comunicação'],
      brde: ['CAC projetado', 'LTV e ARPU projetados', 'Metas trimestrais', 'Cronograma de execução', 'Prova de que o CAC cabe no OPEX', 'Projeção de vendas coerente com finanças'],
      keywords: ['marketing', 'aquisição', 'cac', 'ltv', 'arpu', 'funil', 'canais', 'posicionamento']
  },
  '5.1': {
      title: 'Plano Operacional',
      sebrae: ['Como a empresa funciona no dia a dia', 'Quais processos operacionais existem', 'Que recursos são necessários'],
      brde: ['Processo estrutural completo (pipeline)', 'Prova de capacidade operacional', 'Estimativas de produtividade editorial', 'Conexão entre operação e orçamento', 'Acessibilidade integrada', 'Critérios de qualidade e performance'],
      keywords: ['operação', 'processos', 'pipeline', 'fluxo', 'capacidade', 'sla']
  },
  '6.1': {
      title: 'Equipe / Governança',
      sebrae: ['Quem faz parte', 'Funções básicas', 'Responsabilidades'],
      brde: ['Equipe mínima garantida', 'Três níveis de governança', 'Divisão entre SCine / 4Movie / Labd12', 'Justificativa de custo da equipe', 'Organograma completo'],
      keywords: ['equipe', 'time', 'governança', 'organograma', 'sócios', 'funções']
  },
  '7.1': {
      title: 'Jurídico',
      sebrae: ['Enquadramento legal', 'Estrutura societária'],
      brde: ['Garantias', 'Política de privacidade', 'Aderência à ANCINE', 'Riscos jurídicos identificados', 'Modelos contratuais básicos'],
      keywords: ['jurídico', 'legal', 'societário', 'contratos', 'ancine', 'lgpd', 'riscos']
  },
  '8.1': {
      title: 'Financeiro',
      sebrae: ['DRE 3–5 anos', 'Fluxo de caixa', 'Ponto de equilíbrio'],
      brde: ['DRE 5 anos', 'Fluxo de caixa mensal', 'Matriz CAPEX detalhada', 'Matriz OPEX detalhada', 'DSCR', 'RSD', 'Análise de sensibilidade', 'Garantias', 'Cronograma físico-financeiro'],
      keywords: ['financeiro', 'dre', 'fluxo de caixa', 'capex', 'opex', 'dscr', 'sensibilidade', 'projeções']
  },
  '9.1': {
      title: 'Gatilhos e Covenants',
      sebrae: ['N/A'],
      brde: ['Lista de gatilhos por fase', 'Documentos que comprovam cada gatilho', 'Modelo de relatório para enviar ao banco', 'Exemplo de covenant financeiro', 'Projeção de cumprimento trimestre a trimestre'],
      keywords: ['gatilhos', 'covenants', 'triggers', 'relatório', 'banco', 'compromissos']
  }
};
