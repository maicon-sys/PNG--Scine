// FEATURE: Novo "cérebro de conteúdo" da IA.
// Este arquivo mapeia cada seção do plano de negócios para as exigências
// específicas do SEBRAE e BRDE, conforme detalhado pelo usuário.
// A IA usará isso como um roteiro obrigatório para gerar texto.

export interface SectionGuideline {
  title: string;
  // Para geração estruturada simples
  sebrae?: string[];
  brde?: string[];
  keywords?: string[];
  // FEATURE: Para geração complexa de alta fidelidade
  fullPrompt?: string; 
}

// FIX: A `generationGuidelines` agora usa a interface `SectionGuideline` mais flexível.
export const generationGuidelines: Record<string, SectionGuideline> = {
  // --- TÓPICO 2: ANÁLISE DE MERCADO ---

  '2.0': {
    title: 'Introdução à Análise de Mercado',
    fullPrompt: `
      Role:
      You are the AI responsible for writing sub-chapter 2.0 – Introduction to Market Analysis for the SCine Business Plan, following the SEBRAE Methodology and BRDE requirements.

      1. Objective of sub-chapter 2.0

      In the final text, you must:

      - Explain why Market Analysis is critical for the SCine plan: demand validation, risk reduction, support for financial projections, and strategic decisions.
      - Contextualize which market dimensions will be analyzed in the following sub-items (2.1, 2.2, 2.3, etc.): segments, customer profile, needs, competition, market size, trends, risks.
      - Make it clear, in general terms, that the analysis is built upon: research conducted with the target audience, secondary market data, internal planning information (without mentioning file or matrix names).
      - Connect the Market Analysis with: the Marketing Plan, the Financial Plan (associating market ↔ subscriber and revenue projections), and the credit risk assessment made by a financier like BRDE.
      - The text must be explanatory, objective, and technical, without appearing like a draft and without going into numerical details (those are for the sub-items).

      2. SEBRAE Requirements for 2.0

      In this introduction, you must make it clear to the reader that:

      - The Market Analysis exists to provide structured answers to:
        - Who is SCine's customer?
        - What is the size and potential of this market?
        - Who are the competitors?
        - What trends and risks affect the business?
      - Chapter 2 is built upon:
        - market research,
        - reference data and studies,
        - and internal analyses.
      - Do not detail methodologies here; just frame what the reader will find in the sub-items.

      3. BRDE Requirements for 2.0

      You must explicitly state, in simple language, that:

      - This section serves to support the credit request because it shows that:
        - there is real demand,
        - the target audience has the capacity to pay,
        - the competition has been analyzed,
        - the financial projections are supported by data.
      - From this analysis, the financier will be able to assess if:
        - the subscriber goals are reasonable,
        - SCine's positioning finds a competitive space,
        - the project's risk is acceptable.
      - Without using excessive banking jargon – just make this function clear.

      4. Information Search Order (For internal use, not to be mentioned in the text)

      To construct the text for 2.0, follow this internal order:

      - First, use the STRATEGIC_MATRIX_SCINE, primarily reading:
        - customerSegments
        - valueProposition
        - channels
        - swot
        - any marketContext field or similar, if it exists.
      - Use these fields only as an internal basis for understanding:
        - who the customers are,
        - what pains and needs exist,
        - what opportunities and risks have already been identified.
      - Then, consult the internal documents (market analysis, marketing plan, SCine research) to refine this vision.
      - In the final text:
        - DO NOT mention "STRATEGIC_MATRIX_SCINE", "file X", or PDF names.
        - You can speak generically about "conducted research", "market studies", "internal analyses".
      - If, after analyzing the Matrix + documents, you notice that there are still gaps in certain points of the analysis:
        - do not invent data,
        - do not promise details that are not described,
        - just keep the introduction at a general level, without going into details that are not supported.

      5. Suggested Structure of the Final Text (2.0)

      Organize the final text into 3 or 4 paragraphs:

      - Paragraph 1 – Explain, in general terms, the role of the Market Analysis within the SCine plan.
      - Paragraph 2 – Present, in broad strokes, which aspects will be analyzed (segments, profile, competition, size, trends, risks).
      - Paragraph 3 – Indicate, generically, that the analysis was built based on research with the audience, market data, and internal studies.
      - Optional Paragraph – Connect this analysis with the financial plan and the risk perspective of a financier.
      
      Final Instruction: Based on all the rules above and the user-provided context (documents, notes), generate the final text for section 2.0 in Brazilian Portuguese.
    `,
  },
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
  // --- TÓPICO 3: PRODUTO/SERVIÇO ---
  '3.1': {
    title: 'Produto/Serviço',
    sebrae: ['Descrição clara do produto', 'Benefícios', 'Diferenciais', 'Portfólio de serviços', 'Como funciona'],
    brde: ['Prova técnica de que o produto pode ser entregue', 'Pipeline operacional documentado', 'Padrões de qualidade', 'Acessibilidade (AD, Libras, CC) como processo', 'Conexão entre produto → equipe → custos', 'Roadmap de evolução técnica'],
    keywords: ['produto', 'serviço', 'plataforma', 'ott', 'hub', 'van 4k', 'funcionalidades', 'pipeline', 'roadmap']
  },
  // --- TÓPICO 4: PLANO DE MARKETING ---
  '4.1': {
    title: 'Estratégia de Posicionamento e Canais',
    sebrae: ['Definição dos 4 Ps (Produto, Preço, Praça, Promoção).', 'Estratégia de posicionamento da marca no mercado.', 'Descrição dos canais de comunicação e distribuição.'],
    brde: ['Coerência do preço com a capacidade de pagamento do público-alvo (verificado na Análise de Mercado).'],
    keywords: ['marketing', '4p', 'produto', 'preço', 'praça', 'promoção', 'posicionamento', 'marca', 'canais', 'comunicação', 'distribuição']
  },
  '4.2': {
    title: 'Estratégia de Aquisição e Métricas Financeiras',
    sebrae: ['Descrição clara da estratégia de aquisição de clientes.', 'Funil de aquisição por fase (atração, conversão, retenção).'],
    brde: ['Cálculo e projeção do Custo de Aquisição de Cliente (CAC).', 'Cálculo e projeção do Lifetime Value (LTV) e Receita Média por Usuário (ARPU).', 'Prova de que o CAC projetado é sustentável dentro do OPEX (orçamento operacional).'],
    keywords: ['aquisição', 'clientes', 'funil', 'cac', 'ltv', 'arpu', 'métricas', 'opex', 'custo', 'lifetime value']
  },
  '4.3': {
    title: 'Metas e Cronograma de Marketing',
    sebrae: ['Estabelecimento de metas claras de marketing.'],
    brde: ['Metas de aquisição de assinantes divididas trimestralmente.', 'Cronograma tático de execução das campanhas e ações de marketing.', 'Prova de que a projeção de vendas/assinantes é coerente com o plano financeiro (DRE).'],
    keywords: ['metas', 'kpi', 'cronograma', 'trimestral', 'execução', 'campanhas', 'projeção de vendas', 'dre']
  },
  // --- TÓPICO 5: PLANO OPERACIONAL ---
  '5.1': {
      title: 'Plano Operacional',
      sebrae: ['Como a empresa funciona no dia a dia', 'Quais processos operacionais existem', 'Que recursos são necessários'],
      brde: ['Processo estrutural completo (pipeline)', 'Prova de capacidade operacional', 'Estimativas de produtividade editorial', 'Conexão entre operação e orçamento', 'Acessibilidade integrada', 'Critérios de qualidade e performance'],
      keywords: ['operação', 'processos', 'pipeline', 'fluxo', 'capacidade', 'sla']
  },
  // --- TÓPICO 6: EQUIPE / GOVERNANÇA ---
  '6.1': {
      title: 'Equipe / Governança',
      sebrae: ['Quem faz parte', 'Funções básicas', 'Responsabilidades'],
      brde: ['Equipe mínima garantida', 'Três níveis de governança', 'Divisão entre SCine / 4Movie / Labd12', 'Justificativa de custo da equipe', 'Organograma completo'],
      keywords: ['equipe', 'time', 'governança', 'organograma', 'sócios', 'funções']
  },
  // --- TÓPICO 7: JURÍDICO ---
  '7.1': {
      title: 'Jurídico',
      sebrae: ['Enquadramento legal', 'Estrutura societária'],
      brde: ['Garantias', 'Política de privacidade', 'Aderência à ANCINE', 'Riscos jurídicos identificados', 'Modelos contratuais básicos'],
      keywords: ['jurídico', 'legal', 'societário', 'contratos', 'ancine', 'lgpd', 'riscos']
  },
  // --- TÓPICO 8: FINANCEIRO ---
  '8.1': {
      title: 'Financeiro',
      sebrae: ['DRE 3–5 anos', 'Fluxo de caixa', 'Ponto de equilíbrio'],
      brde: ['DRE 5 anos', 'Fluxo de caixa mensal', 'Matriz CAPEX detalhada', 'Matriz OPEX detalhada', 'DSCR', 'RSD', 'Análise de sensibilidade', 'Garantias', 'Cronograma físico-financeiro'],
      keywords: ['financeiro', 'dre', 'fluxo de caixa', 'capex', 'opex', 'dscr', 'sensibilidade', 'projeções']
  },
  // --- TÓPICO 9: GATILHOS E COVENANTS ---
  '9.1': {
      title: 'Gatilhos e Covenants',
      sebrae: ['N/A'],
      brde: ['Lista de gatilhos por fase', 'Documentos que comprovam cada gatilho', 'Modelo de relatório para enviar ao banco', 'Exemplo de covenant financeiro', 'Projeção de cumprimento trimestre a trimestre'],
      keywords: ['gatilhos', 'covenants', 'triggers', 'relatório', 'banco', 'compromissos']
  }
};
