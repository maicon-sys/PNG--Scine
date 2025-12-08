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

  // Briefing rico
  role?: string;
  objective?: string;
  negativeConstraints?: string[];

  // Ponte com dados e documentos (usaremos depois)
  requiredDocTags?: string[];
  metricKeys?: string[];

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
    title: 'Segmentação de Mercado e Perfis de Cliente',

    role: 'Analista de Mercado Sênior escrevendo para um comitê de crédito BRDE.',
    objective: 'Demonstrar que existem segmentos de clientes reais, acessíveis e com poder de compra suficiente para sustentar as metas de assinantes e de receita da SCine.',

    sebrae: [
      'Descrever claramente quais são os grupos de clientes B2C e, se aplicável, B2B.',
      'Detalhar características demográficas (idade, renda, localização) e comportamentais (hábitos de consumo de conteúdo, canais preferidos).',
      'Explicar por que esses segmentos têm interesse específico em conteúdo regional/cultural catarinense.'
    ],
    brde: [
      'Conectar o tamanho e o poder de compra dos segmentos com o preço das assinaturas e metas de adesão.',
      'Mostrar que o público descrito é numeroso o suficiente e tem renda compatível com o ticket médio proposto.',
      'Deixar claro como esses segmentos serão alcançados pelos canais de marketing descritos no capítulo 4.'
    ],

    negativeConstraints: [
      'Não afirmar que "o mercado é enorme" ou "todo mundo é cliente" sem delimitar segmentos.',
      'Não usar dados de mercado sem citar pelo menos uma fonte genérica (ex.: IBGE, pesquisas setoriais, pesquisa primária SCine).',
      'Não descrever personas fantasiosas desconectadas da pesquisa de mercado já realizada.'
    ],

    keywords: [
      'segmentação', 'segmentos', 'público-alvo', 'persona',
      'b2c', 'b2b', 'hábitos de consumo', 'poder de compra'
    ],

    requiredDocTags: ['ANALISE_MERCADO_SCINE', 'PESQUISA_PRIMARIA', 'PLANO_MARKETING_SCINE'],
    metricKeys: ['TAM_MERCADO_SC', 'META_ASSINANTES_24M', 'CAC_VALIDADO']
  },
  '2.2': {
    title: 'Perfil do Cliente / Persona',

    role: 'Analista de Comportamento do Consumidor escrevendo para um plano de negócios SEBRAE/BRDE.',
    objective: 'Demonstrar que o perfil de cliente identificado é real, bem compreendido e compatível com o produto oferecido, validando as premissas de adesão e retenção.',

    sebrae: [
      'Descrever de forma estruturada o comportamento do cliente-alvo: motivadores de compra, barreiras à adesão e objeções comuns.',
      'Mapear os fatores que influenciam a decisão de assinatura (preço, identidade regional, utilidade do conteúdo, experiência).',
      'Provar que o cliente identificado combina com o produto oferecido pela SCine, conectando persona com proposta de valor.'
    ],
    brde: [
      'Demonstrar coerência entre o cliente-alvo descrito e as projeções de venda e adesão apresentadas no plano financeiro.',
      'Indicar capacidade econômica real do cliente para manter assinatura recorrente, sustentando o modelo de receita.'
    ],

    negativeConstraints: [
      'Não criar personas fantasiosas desconectadas da pesquisa de mercado realizada.',
      'Não afirmar que "todos querem" ou "todos pagariam" sem dados de validação.',
      'Não ignorar barreiras e objeções reais identificadas na pesquisa primária.'
    ],

    keywords: ['perfil do cliente', 'persona', 'comportamento', 'motivadores', 'barreiras', 'objeções', 'decisão de compra', 'jornada do cliente'],
    requiredDocTags: ['PESQUISA_PRIMARIA', 'ANALISE_MERCADO_SCINE'],
    metricKeys: []
  },
  '2.3': {
    title: 'Necessidades, Problemas e Oportunidades',

    role: 'Analista de Mercado focado em identificação de oportunidades para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que existem dores reais no mercado que a SCine resolve, e oportunidades não exploradas que justificam a viabilidade do negócio.',

    sebrae: [
      'Identificar quais dores e necessidades o mercado possui que a SCine resolve de forma única ou superior.',
      'Mapear oportunidades ignoradas ou mal atendidas pelas concorrentes (ex.: acessibilidade, conteúdo regional, nichos culturais).',
      'Apresentar dados que comprovem que o problema existe e é relevante (pesquisa própria, estudos externos, tendências setoriais).'
    ],
    brde: [
      'Construir justificativa sólida mostrando por que a SCine é necessária ao mercado e não apenas mais uma opção.',
      'Apresentar evidências de que há espaço competitivo não ocupado por grandes players nacionais ou globais.'
    ],

    negativeConstraints: [
      'Não afirmar que "o mercado precisa" sem dados ou evidências concretas.',
      'Não ignorar que grandes players já atendem parte dessas necessidades.',
      'Não listar oportunidades vagas sem conectá-las com a proposta de valor da SCine.'
    ],

    keywords: ['dores', 'problemas', 'necessidades', 'oportunidades', 'solução', 'nicho', 'gap de mercado', 'demanda não atendida'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE', 'PESQUISA_PRIMARIA'],
    metricKeys: []
  },
  '2.4': {
    title: 'Pesquisa de Mercado Primária',

    role: 'Pesquisador de Mercado apresentando validação empírica para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que as premissas do plano foram validadas com dados primários coletados diretamente do público-alvo, sustentando as projeções financeiras. APRESENTAR UMA TABELA EM MARKDOWN com os principais resultados da pesquisa.',

    sebrae: [
      'Apresentar dados coletados diretamente com o público-alvo através de questionários, entrevistas ou grupos focais.',
      'Extrair conclusões claras sobre interesse real, disposição a pagar, barreiras à adesão, hábitos de consumo e taxa de adoção esperada.',
      'Demonstrar que a amostra é robusta e representativa o suficiente para sustentar as projeções (BRDE exige coerência entre amostra e escala projetada).',
      'APRESENTAR UMA TABELA EM MARKDOWN com colunas: Questão/Indicador, Resultado, Percentual/Valor, Tamanho da Amostra, Interpretação.'
    ],
    brde: [
      'Provar que as projeções financeiras de adesão, receita e crescimento são realistas e baseadas em dados concretos.',
      'Apresentar evidências de que existe demanda suficiente e validada para sustentar o crescimento previsto no plano.',
      'Validar hipóteses críticas do modelo de negócio (preço aceito, interesse em assinaturas, demanda por lives, preferências de conteúdo).'
    ],

    negativeConstraints: [
      'Não apresentar pesquisa com amostra insuficiente ou não representativa sem reconhecer limitações.',
      'Não extrapolar resultados de pesquisa pequena para projeções grandes sem justificativa metodológica.',
      'Não ignorar dados negativos ou barreiras identificadas na pesquisa.',
      'Não inventar resultados de pesquisa; usar apenas dados realmente coletados. Se a pesquisa não foi realizada ou está incompleta, explicitar claramente.'
    ],

    keywords: ['pesquisa de mercado', 'pesquisa primária', 'questionário', 'entrevista', 'amostra', 'validação', 'dados empíricos', 'metodologia', 'tabela'],
    requiredDocTags: ['PESQUISA_PRIMARIA', 'ANALISE_MERCADO_SCINE'],
    metricKeys: ['AMOSTRA_PESQUISA', 'TAXA_INTERESSE_VALIDADA', 'PRECO_ACEITO_PESQUISA']
  },
  '2.5': {
    title: 'Mercado Potencial – Quantificação',

    role: 'Analista de Mercado Quantitativo escrevendo para plano SEBRAE/BRDE.',
    objective: 'Quantificar o tamanho do mercado endereçável (TAM, SAM, SOM) de forma transparente e metodologicamente sólida, sustentando as metas de adesão e receita. APRESENTAR UMA TABELA EM MARKDOWN com os valores de TAM/SAM/SOM e incluir sugestões de gráficos ao final.',

    sebrae: [
      'Calcular e apresentar o Tamanho Total do Mercado (TAM) - universo completo de potenciais clientes.',
      'Calcular e apresentar o Tamanho do Mercado Disponível (SAM) - parcela do TAM que a SCine pode realisticamente atingir.',
      'Calcular e apresentar o Tamanho do Mercado Atingível (SOM) - parcela do SAM que a SCine pretende conquistar no horizonte do plano.',
      'APRESENTAR UMA TABELA EM MARKDOWN com colunas: Nível (TAM/SAM/SOM), Valor, Unidade, Metodologia/Fonte, Observações.'
    ],
    brde: [
      'Apresentar cálculo transparente e metodologicamente claro que mostre: quantas pessoas podem assinar, quantas devem assinar e qual proporção é viável economicamente.',
      'Demonstrar coerência com dados oficiais (tamanho da população, renda média, penetração digital, hábitos de consumo de streaming).',
      'Incluir ao final um bloco "Sugestões de gráficos:" com bullets indicando visualizações úteis (ex.: gráfico de barras comparando TAM/SAM/SOM, funil de mercado).'
    ],

    negativeConstraints: [
      'Não apresentar números de TAM/SAM/SOM sem explicar a metodologia e as fontes utilizadas.',
      'Não usar estimativas exageradas ou otimistas sem justificativa baseada em dados.',
      'Não ignorar limitações geográficas, econômicas ou de penetração digital ao calcular o mercado.',
      'Não inventar valores de TAM/SAM/SOM; se não houver dados suficientes, deixar explícito que os valores não foram definidos ou são estimativas preliminares.'
    ],

    keywords: ['tam', 'sam', 'som', 'mercado potencial', 'quantificação', 'tamanho de mercado', 'cálculo', 'metodologia', 'universo de clientes', 'tabela'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE'],
    metricKeys: ['TAM_MERCADO_SC', 'SAM_MERCADO_SC', 'SOM_MERCADO_SC']
  },
  '2.6': {
    title: 'Análise da Concorrência',

    role: 'Analista de Inteligência Competitiva escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar conhecimento profundo do cenário competitivo, identificando concorrentes diretos e indiretos, e evidenciando o espaço estratégico onde a SCine pode prosperar. APRESENTAR UMA TABELA EM MARKDOWN comparando principais concorrentes e incluir sugestões de gráficos ao final.',

    sebrae: [
      'Identificar quem são os concorrentes diretos (outras plataformas regionais) e indiretos (grandes streamings nacionais e globais).',
      'Descrever o que cada concorrente oferece, quanto custa, como atende (ou não atende) o público-alvo da SCine.',
      'Apresentar comparação objetiva (benchmarking) entre SCine e principais players (GloboPlay, Netflix, Looke, plataformas locais).',
      'Mapear pontos fortes, pontos fracos e brechas estratégicas no mercado competitivo.',
      'APRESENTAR UMA TABELA EM MARKDOWN com colunas: Concorrente, Modelo de Negócio, Preço Aproximado, Público-Alvo, Diferenciais/Posicionamento.'
    ],
    brde: [
      'Demonstrar conhecimento real do setor e dos riscos de competição, mostrando maturidade estratégica.',
      'Deixar claro que a SCine não disputa catálogo global, mas sim identidade regional, acessibilidade e conexão cultural.',
      'Explicar por que o público pagaria por mais uma plataforma, evidenciando diferenciação real.',
      'Incluir ao final um bloco "Sugestões de gráficos:" com bullets indicando visualizações úteis (ex.: gráfico de barras comparando preços, matriz de posicionamento competitivo).'
    ],

    negativeConstraints: [
      'Não subestimar concorrentes grandes afirmando que "eles não atendem" sem provas.',
      'Não ignorar a força de marca e recursos dos grandes players.',
      'Não fazer comparações superficiais sem dados concretos de preço, catálogo ou posicionamento.',
      'Não atribuir preços ou market share específicos sem base em dados públicos ou documentos; se não houver informação precisa, usar termos como "aproximadamente" ou "estimado".'
    ],

    keywords: ['concorrência', 'concorrentes', 'competidores', 'benchmarking', 'comparativo', 'players', 'análise competitiva', 'posicionamento', 'tabela'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE', 'BENCHMARKING_CONCORRENTES'],
    metricKeys: []
  },
  '2.7': {
    title: 'Análise de Tendências de Mercado',

    role: 'Analista de Tendências de Mercado escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que o setor de streaming é crescente e favorável, fundamentando as projeções de crescimento da SCine com dados atualizados e fontes confiáveis. APRESENTAR UMA TABELA EM MARKDOWN com principais tendências e dados setoriais.',

    sebrae: [
      'Apresentar dados sobre crescimento do streaming no Brasil (fontes: Kantar, DataReportal, Nielsen, ANCINE).',
      'Analisar tendências de consumo de vídeo sob demanda (VOD) e consumo em dispositivos móveis.',
      'Mapear crescimento de transmissões ao vivo (lives) e eventos digitais.',
      'Identificar tendências de regionalização de conteúdo e fortalecimento da economia criativa local.',
      'APRESENTAR UMA TABELA EM MARKDOWN com colunas: Tendência/Indicador, Valor/Taxa, Período, Fonte, Relevância para SCine.'
    ],
    brde: [
      'Provar que o setor é crescente, estável e seguro para financiamento de longo prazo.',
      'Apresentar dados atualizados (últimos 2-3 anos) de fontes confiáveis e reconhecidas.',
      'Conectar tendências setoriais com as projeções de receita e crescimento da SCine.'
    ],

    negativeConstraints: [
      'Não usar dados desatualizados ou de fontes não confiáveis.',
      'Não afirmar que "o mercado está crescendo" sem números e fontes específicas.',
      'Não ignorar tendências negativas do setor (ex.: saturação, churn alto, competição acirrada).',
      'Não inventar dados de crescimento ou tendências; usar apenas informações de fontes citadas ou documentos fornecidos.'
    ],

    keywords: ['tendências', 'crescimento', 'streaming', 'vod', 'lives', 'regionalização', 'fontes', 'dados setoriais', 'economia criativa', 'tabela'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE', 'DADOS_SETORIAIS'],
    metricKeys: ['CRESCIMENTO_STREAMING_BR', 'PENETRACAO_VOD_SC']
  },
  '2.8': {
    title: 'Análise do Ambiente Externo – Fatores PESTEL',

    role: 'Analista de Ambiente Externo e Riscos Macro escrevendo para plano SEBRAE/BRDE.',
    objective: 'Identificar e avaliar fatores políticos, econômicos, sociais, tecnológicos, ambientais e legais que impactam o negócio, demonstrando maturidade estratégica na gestão de riscos externos.',

    sebrae: [
      'Realizar análise objetiva dos fatores PESTEL: Político, Econômico, Social, Tecnológico, Ambiental e Legal.',
      'Avaliar impactos específicos no setor de streaming, cultura, publicidade e produção audiovisual.',
      'Conectar cada fator externo com oportunidades ou riscos concretos para a SCine.'
    ],
    brde: [
      'Identificar claramente riscos externos que podem afetar a capacidade de pagamento ou viabilidade do projeto.',
      'Demonstrar entendimento de regulamentações importantes (ANCINE, LGPD, ISS, IVA digital, tributação de streaming).',
      'Avaliar como políticas públicas influenciam o projeto (PIC, SIMDEC, FSA, editais de fomento).'
    ],

    negativeConstraints: [
      'Não fazer análise PESTEL genérica sem conexão com o negócio específico da SCine.',
      'Não ignorar riscos regulatórios relevantes (tributação, LGPD, ANCINE).',
      'Não listar fatores sem avaliar se são oportunidades, ameaças ou neutros.'
    ],

    keywords: ['pestel', 'ambiente externo', 'político', 'econômico', 'social', 'tecnológico', 'legal', 'regulamentação', 'ancine', 'lgpd', 'políticas públicas'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE'],
    metricKeys: []
  },
  '2.9': {
    title: 'Análise Setorial',

    role: 'Analista Setorial de Audiovisual e Streaming escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar conhecimento profundo sobre como funciona o setor audiovisual e de streaming no Brasil, evidenciando compreensão de custos, ciclos e dinâmicas operacionais.',

    sebrae: [
      'Explicar como funciona o setor audiovisual e de streaming no Brasil: cadeia produtiva, distribuição, consumo.',
      'Apresentar dados sobre volume de produções, circulação de conteúdo, plataformas ativas e estrutura de custos do setor.',
      'Analisar modelos de monetização: publicidade (AVOD), assinatura (SVOD), modelos híbridos e B2B.'
    ],
    brde: [
      'Demonstrar clareza sobre custos reais de produção, licenciamento e distribuição de conteúdo.',
      'Evidenciar compreensão de ciclos de produção, sazonalidade e dependência de conteúdo.',
      'Mostrar coerência entre capacidade produtiva da SCine e as dinâmicas do setor.'
    ],

    negativeConstraints: [
      'Não fazer afirmações sobre o setor sem dados ou fontes de referência.',
      'Não ignorar desafios setoriais conhecidos (custos de produção, dependência de catálogo, churn).',
      'Não descrever o setor de forma genérica sem conexão com a realidade da SCine.'
    ],

    keywords: ['setor', 'setorial', 'audiovisual', 'streaming', 'monetização', 'custos do setor', 'cadeia produtiva', 'avod', 'svod'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE', 'DADOS_SETORIAIS'],
    metricKeys: []
  },
  '2.10': {
    title: 'Barreiras de Entrada e Riscos de Mercado',

    role: 'Analista de Riscos de Mercado escrevendo para plano SEBRAE/BRDE.',
    objective: 'Identificar barreiras de entrada e riscos de mercado de forma madura e transparente, apresentando planos de mitigação sólidos que reduzam o risco percebido pelo financiador.',

    sebrae: [
      'Identificar barreiras tecnológicas (infraestrutura, plataforma, streaming).',
      'Identificar barreiras de catálogo (volume e qualidade de conteúdo necessário).',
      'Identificar barreiras regulatórias (ANCINE, LGPD, licenciamento).',
      'Identificar barreiras financeiras (investimento inicial, CAC, custo de conteúdo).'
    ],
    brde: [
      'Demonstrar maturidade na identificação de riscos, sem minimizá-los ou exagerá-los.',
      'Apresentar planos de mitigação sólidos e realistas para cada barreira/risco identificado.',
      'Ser transparente sobre limitações (concorrência, churn, dependência de conteúdo, sazonalidade).'
    ],

    negativeConstraints: [
      'Não minimizar riscos afirmando que "não há barreiras" ou "tudo está resolvido".',
      'Não listar riscos sem apresentar estratégias concretas de mitigação.',
      'Não ignorar riscos óbvios do setor (churn, competição, dependência de conteúdo).'
    ],

    keywords: ['barreiras de entrada', 'riscos de mercado', 'mitigação', 'ameaças', 'limitações', 'churn', 'concorrência'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE'],
    metricKeys: []
  },
  '2.11': {
    title: 'Oportunidades Competitivas',

    role: 'Estrategista de Posicionamento Competitivo escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que a SCine possui vantagens competitivas sustentáveis e um espaço estratégico real onde pode dominar, diferenciando-se de forma clara dos concorrentes.',

    sebrae: [
      'Explicar por que a SCine tem vantagem competitiva frente ao mercado existente.',
      'Detalhar fatores diferenciadores concretos: identidade local, Van 4K, HUB físico, acessibilidade, coproduções, eventos ao vivo.',
      'Demonstrar que esses diferenciais são relevantes para o público-alvo e difíceis de replicar.'
    ],
    brde: [
      'Provar que existe um espaço real e sustentável onde a SCine pode dominar ou se destacar.',
      'Demonstrar que a vantagem competitiva é sustentável e não baseada em moda passageira ou sorte.',
      'Conectar vantagens competitivas com capacidade de gerar receita e sustentar o modelo de negócio.'
    ],

    negativeConstraints: [
      'Não afirmar vantagens sem provas ou sem conexão com necessidades reais do público.',
      'Não listar diferenciais que são facilmente replicáveis por concorrentes maiores.',
      'Não ignorar que vantagens precisam ser sustentadas ao longo do tempo.'
    ],

    keywords: ['vantagem competitiva', 'diferenciais', 'oportunidades', 'posicionamento', 'espaço estratégico', 'identidade local', 'hub', 'van 4k'],
    requiredDocTags: ['ANALISE_MERCADO_SCINE', 'PLANO_MARKETING_SCINE'],
    metricKeys: []
  },
  '2.12': {
    title: 'SÃ­ntese da AnÃ¡lise de Mercado e Tese de Viabilidade',

    role: 'Consultor de negÃ³cios sÃªnior integrando anÃ¡lise de mercado para um comitÃª de crÃ©dito BRDE.',
    objective: 'Sintetizar os principais achados das seÃ§Ãµes 2.0 a 2.11, conectando dados de mercado, segmentaÃ§Ã£o, concorrÃªncia, TAM/SAM/SOM, riscos e oportunidades com a tese de viabilidade do plano de negÃ³cios para a SCine, respondendo Ã  pergunta: "Diante de tudo o que foi apresentado, faz sentido conceder crÃ©dito para este projeto?".',

    sebrae: [
      'Resumir os principais segmentos de cliente identificados e suas necessidades mapeadas, conectando com a proposta de valor da SCine.',
      'Consolidar os achados sobre tamanho de mercado (TAM/SAM/SOM), tendÃªncias setoriais e oportunidades competitivas.',
      'Integrar a anÃ¡lise de concorrÃªncia com o posicionamento estratÃ©gico da SCine, evidenciando o espaÃ§o competitivo identificado.',
      'Apresentar evidÃªncia consolidada de que o negÃ³cio Ã© financeiramente plausÃ­vel no mercado identificado, conectando anÃ¡lise qualitativa com viabilidade quantitativa.'
    ],
    brde: [
      'Construir conclusÃ£o lÃ³gica conectando: dados de mercado validados â†’ demanda real comprovada â†’ pÃºblico-alvo com capacidade de pagamento â†’ viabilidade das projeÃ§Ãµes financeiras.',
      'Evidenciar, de forma integrada, por que o mercado identificado Ã© suficiente para sustentar as projeÃ§Ãµes de receita e a capacidade de pagamento do crÃ©dito solicitado.',
      'Demonstrar que a anÃ¡lise de mercado reduz o risco percebido do projeto, apresentando dados concretos que sustentam a tese de investimento.',
      'Conectar claramente: mercado validado â†’ demanda real â†’ receita sustentÃ¡vel â†’ capacidade de pagamento â†’ risco mitigado.'
    ],

    negativeConstraints: [
      'NÃ£o repetir literalmente o texto das seÃ§Ãµes anteriores; a sÃ­ntese deve integrar e consolidar, nÃ£o copiar.',
      'NÃ£o fazer afirmaÃ§Ãµes vagas como "mercado enorme" ou "altÃ­ssimo potencial" sem conectar com dados especÃ­ficos apresentados nas seÃ§Ãµes 2.1 a 2.11.',
      'NÃ£o introduzir novos dados de mercado que nÃ£o estejam presentes nos documentos base ou nas seÃ§Ãµes anteriores.',
      'NÃ£o ignorar riscos e barreiras de mercado identificados; a sÃ­ntese deve mencionÃ¡-los junto com as oportunidades, de forma equilibrada.',
      'NÃ£o tratar a sÃ­ntese apenas como conclusÃ£o otimista; deve ser equilibrada, tÃ©cnica e aderente Ã  visÃ£o de risco do BRDE.',
      'NÃ£o apresentar conclusÃµes que contradigam dados ou anÃ¡lises anteriores das seÃ§Ãµes 2.1 a 2.11.'
    ],

    keywords: [
      'sÃ­ntese', 'conclusÃ£o', 'veredito', 'viabilidade de mercado',
      'resumo do mercado', 'consolidaÃ§Ã£o', 'tese de investimento',
      'risco', 'oportunidade', 'concorrÃªncia', 'tam', 'sam', 'som',
      'demanda', 'capacidade de pagamento', 'anÃ¡lise integrada'
    ],
    requiredDocTags: ['ANALISE_MERCADO_SCINE'],
    metricKeys: ['TAM_MERCADO_SC', 'META_ASSINANTES_24M', 'RECEITA_TOTAL_24M']
  },
  // --- TÓPICO 3: PRODUTO/SERVIÇO ---
  '3.1': {
    title: 'Produto/Serviço',

    role: 'Gerente de Produto escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que o produto/serviço da SCine é viável tecnicamente, aderente às necessidades do mercado e pode ser entregue com qualidade e escala conforme o plano.',

    sebrae: [
      'Descrever claramente o produto/serviço oferecido: plataforma OTT, HUB audiovisual, Van 4K.',
      'Explicar benefícios entregues ao cliente e diferenciais competitivos do portfólio.',
      'Detalhar como o produto funciona: tecnologia, pipeline de conteúdo, experiência do usuário.'
    ],
    brde: [
      'Apresentar prova técnica de que o produto pode ser entregue conforme prometido (infraestrutura, tecnologia, equipe).',
      'Documentar pipeline operacional: captação, produção, ingest, publicação, distribuição.',
      'Demonstrar padrões de qualidade e acessibilidade (AD, Libras, CC) integrados ao processo.',
      'Conectar capacidade de entrega do produto com custos operacionais (OPEX) e equipe necessária.',
      'Apresentar roadmap de evolução técnica e novas entregas ao longo do tempo.'
    ],

    negativeConstraints: [
      'Não descrever produto de forma vaga ou genérica sem detalhes técnicos.',
      'Não prometer funcionalidades sem evidenciar capacidade técnica e operacional de entrega.',
      'Não ignorar requisitos de acessibilidade e qualidade exigidos pelo BRDE.'
    ],

    keywords: ['produto', 'serviço', 'plataforma', 'ott', 'hub', 'van 4k', 'funcionalidades', 'pipeline', 'roadmap', 'acessibilidade', 'qualidade'],
    requiredDocTags: ['PLANO_OPERACIONAL_SCINE', 'ROADMAP_TECNICO'],
    metricKeys: []
  },
  // --- TÓPICO 4: PLANO DE MARKETING ---
  '4.1': {
    title: 'Estratégia de Posicionamento e Canais',

    role: 'Gerente de Marketing Estratégico escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que a estratégia de posicionamento e mix de marketing (4 Ps) é coerente com o público-alvo, competitiva e viável economicamente.',

    sebrae: [
      'Definir claramente os 4 Ps: Produto (o que é oferecido), Preço (estratégia de precificação), Praça (canais de distribuição), Promoção (comunicação).',
      'Apresentar estratégia de posicionamento da marca SCine no mercado: como quer ser percebida, qual espaço ocupa.',
      'Descrever canais de comunicação (redes sociais, eventos, parcerias, mídia) e canais de distribuição (plataforma web, apps, smart TVs).'
    ],
    brde: [
      'Demonstrar coerência do preço com a capacidade de pagamento do público-alvo (verificado na Análise de Mercado).',
      'Conectar estratégia de posicionamento com vantagens competitivas identificadas no capítulo 2.',
      'Evidenciar que os canais escolhidos são compatíveis com o orçamento de marketing e OPEX.'
    ],

    negativeConstraints: [
      'Não definir 4 Ps de forma genérica sem conexão com a realidade da SCine.',
      'Não estabelecer preço sem justificar com base na pesquisa de mercado e capacidade de pagamento.',
      'Não listar canais de marketing sem avaliar custo e efetividade.'
    ],

    keywords: ['marketing', '4p', 'produto', 'preço', 'praça', 'promoção', 'posicionamento', 'marca', 'canais', 'comunicação', 'distribuição'],
    requiredDocTags: ['PLANO_MARKETING_SCINE', 'ANALISE_MERCADO_SCINE'],
    metricKeys: ['PRECO_MEDIO_ASSINATURA', 'ORCAMENTO_MARKETING_ANUAL']
  },
  '4.2': {
    title: 'Estratégia de Aquisição e Métricas CAC, LTV e ARPU',

    role: 'Analista de Marketing e Growth escrevendo para um comitê de crédito BRDE.',
    objective: 'Demonstrar que o plano de aquisição e retenção da SCine gera assinantes pagantes em volume e custo compatíveis com as metas financeiras, com CAC, LTV e ARPU calculados de forma consistente com o plano financeiro. APRESENTAR UMA TABELA EM MARKDOWN com os principais indicadores e incluir sugestões de gráficos ao final.',

    sebrae: [
      'Descrever o funil de aquisição de clientes, da descoberta à assinatura paga.',
      'Explicar quais canais de marketing serão priorizados (orgânico, pago, parcerias, eventos, etc.).',
      'Apresentar metas de crescimento de base (assinantes por mês) alinhadas à análise de mercado e ao plano de marketing.',
      'APRESENTAR UMA TABELA EM MARKDOWN com colunas: Indicador, Valor Projetado, Unidade, Premissas/Fonte, Observações (incluindo CAC, LTV, ARPU, Churn, Ticket Médio, Meta de Assinantes).'
    ],
    brde: [
      'Apresentar o CAC projetado, explicando as premissas de investimento em marketing e taxa de conversão.',
      'Apresentar LTV e ARPU projetados, mostrando como a receita por cliente ao longo do tempo sustenta o modelo.',
      'Conectar CAC, LTV e ARPU às metas de payback, ponto de equilíbrio e capacidade de pagamento do crédito.',
      'Incluir ao final um bloco "Sugestões de gráficos:" com bullets indicando visualizações úteis (ex.: funil de aquisição, gráfico de linha LTV vs CAC ao longo do tempo, evolução de assinantes).'
    ],

    negativeConstraints: [
      'Não usar termos vagos como "vamos viralizar" ou "crescimento exponencial" sem números e premissas.',
      'Não apresentar CAC, LTV ou ARPU sem explicar de onde vêm os números (premissas e fontes).',
      'Não ignorar churn: sempre considerar cancelamentos na projeção de LTV.',
      'Não inventar valores de CAC, LTV, ARPU ou churn; usar apenas dados da Matriz de Valores ou documentos carregados. Se não houver dados, explicitar "dados não informados" ou "a definir".'
    ],

    keywords: [
      'cac', 'custo de aquisição', 'ltv', 'lifetime value',
      'arpu', 'ticket médio', 'assinantes pagantes',
      'funil de vendas', 'conversão', 'churn', 'tabela'
    ],

    requiredDocTags: ['PLANO_MARKETING_SCINE', 'ANALISE_MERCADO_SCINE', 'MATRIZ_FINANCEIRA_SCINE'],
    metricKeys: ['CAC_VALIDADO', 'LTV_PROJETADO', 'ARPU_PROJETADO', 'META_ASSINANTES_24M', 'CHURN_PROJETADO']
  },
  '4.3': {
    title: 'Metas e Cronograma de Marketing',

    role: 'Gerente de Marketing Tático escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que as metas de marketing são realistas, mensuráveis e alinhadas com o plano financeiro, com cronograma tático de execução bem definido.',

    sebrae: [
      'Estabelecer metas claras e mensuráveis de marketing (KPIs): alcance, engajamento, conversão, adesão.',
      'Apresentar cronograma tático de execução das campanhas e ações de marketing ao longo do tempo.',
      'Conectar metas de marketing com objetivos de negócio (crescimento de base, receita, brand awareness).'
    ],
    brde: [
      'Apresentar metas de aquisição de assinantes divididas trimestralmente, alinhadas com projeções do DRE.',
      'Demonstrar que a projeção de vendas/assinantes é coerente com o plano financeiro e capacidade operacional.',
      'Evidenciar que o orçamento de marketing é compatível com OPEX e metas de CAC.'
    ],

    negativeConstraints: [
      'Não estabelecer metas vagas ou não mensuráveis (ex.: "aumentar visibilidade").',
      'Não apresentar cronograma sem conexão com orçamento e recursos disponíveis.',
      'Não ignorar a coerência entre metas de marketing e projeções financeiras.'
    ],

    keywords: ['metas', 'kpi', 'cronograma', 'trimestral', 'execução', 'campanhas', 'projeção de vendas', 'dre', 'orçamento de marketing'],
    requiredDocTags: ['PLANO_MARKETING_SCINE', 'MATRIZ_FINANCEIRA_SCINE'],
    metricKeys: ['META_ASSINANTES_TRIMESTRAL', 'ORCAMENTO_MARKETING_ANUAL']
  },
  // --- TÓPICO 5: PLANO OPERACIONAL ---
  '5.1': {
    title: 'Plano Operacional',

    role: 'Gerente de Operações escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que a operação da SCine é viável, escalável e compatível com os custos operacionais (OPEX) e cronograma do plano.',

    sebrae: [
      'Descrever como a empresa funciona no dia a dia: processos operacionais, rotinas, fluxos de trabalho.',
      'Mapear quais processos operacionais existem: produção de conteúdo, ingest, publicação, atendimento, manutenção.',
      'Identificar que recursos são necessários: equipe, infraestrutura, tecnologia, fornecedores.'
    ],
    brde: [
      'Documentar processo estrutural completo (pipeline operacional) desde captação até distribuição.',
      'Apresentar prova de capacidade operacional: quantos conteúdos podem ser produzidos/publicados por mês.',
      'Fornecer estimativas de produtividade editorial e capacidade de entrega.',
      'Demonstrar conexão clara entre operação descrita e orçamento de OPEX.',
      'Evidenciar que acessibilidade (AD, Libras, CC) está integrada ao processo operacional.',
      'Apresentar critérios de qualidade, SLAs e performance operacional.'
    ],

    negativeConstraints: [
      'Não descrever operação de forma vaga sem detalhes de processos e fluxos.',
      'Não prometer capacidade operacional sem evidenciar recursos (equipe, infraestrutura) necessários.',
      'Não ignorar a conexão entre operação e custos (OPEX).'
    ],

    keywords: ['operação', 'processos', 'pipeline', 'fluxo', 'capacidade', 'sla', 'produtividade', 'opex', 'infraestrutura'],
    requiredDocTags: ['PLANO_OPERACIONAL_SCINE'],
    metricKeys: ['CAPACIDADE_PRODUCAO_MENSAL', 'OPEX_TOTAL_ANUAL']
  },
  // --- TÓPICO 6: EQUIPE / GOVERNANÇA ---
  '6.1': {
    title: 'Equipe / Governança',

    role: 'Gerente de Recursos Humanos e Governança escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que a equipe é qualificada, dimensionada adequadamente e que a governança é clara e transparente, sustentando a execução do plano.',

    sebrae: [
      'Apresentar quem faz parte da equipe: sócios, colaboradores-chave, consultores.',
      'Descrever funções básicas e responsabilidades de cada membro ou área.',
      'Evidenciar competências e experiência relevante da equipe para executar o plano.'
    ],
    brde: [
      'Garantir que a equipe mínima necessária está assegurada e dimensionada para o escopo do projeto.',
      'Apresentar três níveis de governança: estratégica, tática e operacional.',
      'Esclarecer divisão de responsabilidades entre SCine, 4Movie e Labd12 (estrutura societária).',
      'Justificar custo da equipe (salários, encargos) e demonstrar coerência com orçamento de OPEX.',
      'Apresentar organograma completo e claro da estrutura organizacional.'
    ],

    negativeConstraints: [
      'Não apresentar equipe sem evidenciar competências e experiência relevante.',
      'Não ignorar custos de equipe ou apresentá-los sem justificativa.',
      'Não deixar governança e divisão societária ambíguas ou confusas.'
    ],

    keywords: ['equipe', 'time', 'governança', 'organograma', 'sócios', 'funções', 'responsabilidades', 'competências', 'custo da equipe'],
    requiredDocTags: ['ORGANOGRAMA_SCINE', 'GOVERNANCA_SOCIETARIA'],
    metricKeys: ['CUSTO_EQUIPE_ANUAL']
  },
  // --- TÓPICO 7: JURÍDICO ---
  '7.1': {
    title: 'Jurídico',

    role: 'Advogado especializado em direito empresarial e audiovisual escrevendo para plano SEBRAE/BRDE.',
    objective: 'Demonstrar que a estrutura jurídica e societária é sólida, em conformidade com regulamentações e que riscos jurídicos foram mapeados e mitigados.',

    sebrae: [
      'Apresentar enquadramento legal da empresa: tipo societário, regime tributário, inscrições.',
      'Descrever estrutura societária: participação dos sócios, relação entre SCine/4Movie/Labd12.'
    ],
    brde: [
      'Apresentar garantias oferecidas ao financiamento (reais, pessoais, fundo garantidor).',
      'Documentar Política de Privacidade e Termos de Uso em conformidade com LGPD.',
      'Demonstrar aderência às regulamentações da ANCINE e setoriais do audiovisual.',
      'Mapear riscos jurídicos identificados (contratos, licenciamento, tributação, compliance).',
      'Apresentar modelos contratuais básicos: produtores, B2B, licenciamento de conteúdo.'
    ],

    negativeConstraints: [
      'Não deixar estrutura societária ambígua ou mal documentada.',
      'Não ignorar obrigações regulatórias (ANCINE, LGPD, tributação).',
      'Não apresentar garantias vagas sem especificar tipo e valor.'
    ],

    keywords: ['jurídico', 'legal', 'societário', 'contratos', 'ancine', 'lgpd', 'riscos', 'garantias', 'compliance', 'política de privacidade'],
    requiredDocTags: ['CONTRATO_SOCIAL', 'POLITICA_PRIVACIDADE', 'TERMOS_USO'],
    metricKeys: []
  },
  // --- TÓPICO 8: FINANCEIRO ---
  '8.1': {
    title: 'Demonstrações Financeiras, Indicadores e Capacidade de Pagamento',

    role: 'Analista Financeiro de Crédito escrevendo para o comitê do BRDE.',
    objective: 'Apresentar um quadro financeiro consolidado (DRE, fluxo de caixa, CAPEX/OPEX, indicadores e cenários) que demonstre de forma clara a capacidade de pagamento do crédito solicitado e a robustez do plano financeiro. APRESENTAR UMA TABELA EM MARKDOWN com os principais indicadores financeiros e incluir sugestões de gráficos ao final.',

    sebrae: [
      'Apresentar DRE projetado com receitas, custos, despesas e resultado para o horizonte mínimo de 5 anos.',
      'Apresentar fluxo de caixa projetado, destacando entradas, saídas e saldo ao longo do tempo.',
      'Explicitar as principais premissas financeiras (preço médio, número de assinantes, crescimento, inflação, reajustes, etc.).',
      'APRESENTAR UMA TABELA EM MARKDOWN com colunas: Indicador Financeiro, Valor Projetado, Unidade, Ano/Período, Premissas/Fonte (incluindo Investimento Total, Receita 24m, EBITDA, DSCR, Payback, Ponto de Equilíbrio, CAPEX, OPEX).'
    ],
    brde: [
      'Apresentar o cálculo do DSCR projetado, explicando as premissas de serviço da dívida e fluxo de caixa livre.',
      'Apresentar análise de sensibilidade (cenários otimista, realista e conservador) e seu impacto em DSCR, resultado e caixa.',
      'Conectar o cronograma físico-financeiro (desembolsos, fases do projeto) com o uso dos recursos e a geração de caixa.',
      'Explicar como garantias, contrapartidas e covenants financeiros se relacionam com o plano financeiro.',
      'Incluir ao final um bloco "Sugestões de gráficos:" com bullets indicando visualizações úteis (ex.: gráfico de linha de receita vs despesas ao longo do tempo, gráfico de barras de CAPEX/OPEX, gráfico de evolução do DSCR, análise de sensibilidade em cenários).'
    ],

    negativeConstraints: [
      'Não apresentar números soltos sem explicar a origem (planilha, matriz financeira, hipótese).',
      'Não mencionar DSCR, payback ou ponto de equilíbrio sem mostrar, ainda que em texto, a lógica do cálculo.',
      'Não ignorar a carência e a fase de amortização na análise da capacidade de pagamento.',
      'Não inventar indicadores financeiros ou alterar números da Matriz de Valores; usar apenas dados fornecidos. Se algum indicador não estiver disponível, explicitar "dado não informado" ou "a calcular".'
    ],

    keywords: [
      'dre', 'demonstração de resultado', 'fluxo de caixa',
      'capex', 'opex', 'ponto de equilíbrio',
      'dscr', 'payback', 'cenários', 'sensibilidade', 'tabela'
    ],

    requiredDocTags: ['MATRIZ_FINANCEIRA_SCINE', 'TABELA_11_SCINE', 'GATILHOS_COVENANTS_BRDE'],
    metricKeys: ['INVESTIMENTO_TOTAL', 'RECEITA_TOTAL_24M', 'PONTO_EQUILIBRIO', 'DSCR_PROJETADO', 'EBITDA_MARGEM', 'PAYBACK_ANOS']
  },
  // --- TÓPICO 9: GATILHOS E COVENANTS ---
  '9.1': {
    title: 'Riscos, Gatilhos de Desembolso e Covenants Financeiros',

    role: 'Especialista em Riscos e Compliance de Crédito escrevendo para o BRDE.',
    objective: 'Demonstrar que os principais riscos do projeto foram mapeados, que existem estratégias de mitigação claras e que os gatilhos de desembolso e covenants financeiros protegem tanto o banco quanto o proponente.',

    sebrae: [
      'Apresentar os principais riscos estratégicos, de mercado, operacionais, financeiros e jurídicos.',
      'Explicar, em linguagem clara, quais ações de mitigação serão adotadas para cada risco relevante.',
      'Indicar contrapartidas de impacto social, cultural e de acessibilidade vinculadas ao projeto.'
    ],
    brde: [
      'Listar gatilhos objetivos para liberação de parcelas do financiamento (por fase, marcos de entrega, indicadores).',
      'Apresentar exemplos de covenants financeiros (ex.: manutenção de DSCR mínimo, limites de alavancagem) e operacionais.',
      'Descrever o modelo de relatório periódico a ser enviado ao banco (conteúdo mínimo, periodicidade, responsáveis).'
    ],

    negativeConstraints: [
      'Não listar riscos de forma genérica sem associar uma ação concreta de mitigação.',
      'Não prometer garantias vagas sem conexão com os números do plano financeiro.',
      'Não ignorar riscos regulatórios e setoriais específicos do audiovisual e do streaming.'
    ],

    keywords: [
      'riscos', 'mitigação', 'contrapartida',
      'gatilhos', 'covenants', 'relatórios',
      'indicadores', 'monitoramento'
    ],

    requiredDocTags: ['GATILHOS_COVENANTS_BRDE', 'IMPACTO_SCINE', 'PLANO_FINANCEIRO_SCINE', 'ANALISE_MERCADO_SCINE'],
    metricKeys: ['DSCR_MINIMO_COVENANT', 'META_ASSINANTES_24M', 'INDICADORES_ESG_CHAVE']
  }
};
