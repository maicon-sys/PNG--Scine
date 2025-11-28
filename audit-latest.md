# Auditoria técnica do repositório

## 1) Checklist de requisitos (derivado das instruções do usuário)
- Priorizar a **Matriz Estratégica/Matriz de Valores** consolidada como fonte primária; só usar documentos anexados se o dado não estiver na matriz.
- Proibir menções a nomes de arquivos internos, PDFs/planilhas ou nome da própria matriz no texto final.
- Seguir a **metodologia Sebrae + exigências BRDE**, mantendo estrutura hierárquica (1.x, 2.x etc.).
- Tratar lacunas sem inventar números: se um dado não existir, não “chutar”; marcar conflitos ou omissões.
- Diagnóstico evolutivo com histórico de gaps (id, status, score) e evolução entre rodadas.
- Geração de seções deve usar números exclusivamente da matriz consolidada.
- Documento final em A4 com sumário e glossário (sem vazamentos de nomes de arquivos).

## 2) Arquitetura e módulos relevantes
- **services/gemini.ts**: encapsula todas as chamadas de IA (matriz, diagnóstico, seções, finanças, imagem). Usa `GoogleGenAI` com API key lida de `import.meta.env`/`process.env`. Define prompts e validação de JSON por `responseSchema` em algumas chamadas.
- **constants.ts**: configura `DEFAULT_METHODOLOGY`, matriz estratégica básica, termos de glossário e `INITIAL_SECTIONS` (estrutura de tópicos). Regras BRDE/SCINE e prompts de imagem também residem aqui.
- **types.ts**: modela `ValueEntry/ValueMatrix`, `AnalysisGap/DiagnosisResponse`, seções, projetos e ativos.
- **App.tsx**: orquestra UI/estado: carrega projetos, roda diagnóstico (`handleRunDiagnosis`), gera seções, bloqueia uso de IA sem API key (`hasGeminiKey`), e aciona a matriz/diagnóstico/geração.
- **components/LiveDocumentPreview.tsx**: monta documento A4 simulado, sumário e glossário dinâmico; renderiza apenas seções `COMPLETED` em ordem.

## 3) Verificação requisito a requisito
[MATRIz COMO FONTE PRIMÁRIA]  
Status: **PARCIAL**  
- Arquivos: `services/gemini.ts` (prompts `generateSectionContent`, `generateFinancialData`), `App.tsx` (passa `valueMatrix` quando existe).  
- Como: prompts afirmam “Use a MATRIZ DE VALORES como única fonte de verdade” e formatam entradas da matriz para o LLM.  
- Falha: diagnóstico não recebe a matriz; geração de seções inclui também `context` bruto completo, permitindo que a IA misture dados externos ou ignore a matriz se estiver vazia. Nenhuma validação/filtragem impede números inventados quando `valueMatrix` está vazio ou malformado.

[PROIBIR NOMES DE ARQUIVOS INTERNOS NO TEXTO FINAL]  
Status: **NÃO ATENDIDO**  
- Arquivos: prompts em `services/gemini.ts` não instruem a ocultar nomes de arquivos; `LiveDocumentPreview` apenas renderiza Markdown.  
- Não há sanitização ou pós-processamento para remover menções a PDFs/planilhas ou ao nome da matriz.

[ESTRUTURA SEBRAE + BRDE (tópicos 1.x, 2.x…)]  
Status: **PARCIAL**  
- Arquivos: `constants.ts` define `INITIAL_SECTIONS` com capítulos 1–8, mas a granularidade é mínima (faltam sub-subtópicos).  
- O fluxo do app respeita essa lista ao renderizar capítulos; no entanto, a cobertura completa Sebrae/BRDE não está codificada (capítulos reduzidos, ausência de muitos subitens obrigatórios).

[NÃO INVENTAR DADOS / TRATAR LACUNAS]  
Status: **PARCIAL**  
- Arquivos: prompts da matriz e seções dizem “Não invente valores”; diagnóstico devolve `gaps` e fallback vazio em erro (`generateGlobalDiagnosis`).  
- Falha: não há validação de `ValueMatrix` no front; se a IA retornar números fictícios ou schema incompleto, eles são aceitos. Geração de seções recebe `context` bruto e pode inventar números quando a matriz está ausente. Diagnóstico não é blindado contra respostas parciais com estrutura errada além do try/catch.

[HISTÓRICO EVOLUTIVO DE GAPS]  
Status: **PARCIAL**  
- Arquivos: `types.ts` define `AnalysisGap` com id/status/score; `App.tsx` guarda `diagnosisHistory` e exibe o último; `generateGlobalDiagnosis` aceita histórico e pede ao LLM reclassificar.  
- Falha: não há garantia de reutilização de IDs ou merge determinístico; tudo depende do LLM. Histórico não persiste status manualmente; nenhuma UI para marcar resolvido.

[USO EXCLUSIVO DA MATRIZ NA GERAÇÃO NUMÉRICA]  
Status: **PARCIAL**  
- Arquivos: `generateSectionContent` e `generateFinancialData` injetam `valueMatrix`, mas também enviam `context` bruto; matriz é opcional (string “Matriz não gerada”).  
- Falha: não bloqueia geração se a matriz estiver vazia; risco de números inventados ou divergentes.

[DOCUMENTO A4 COM SUMÁRIO E GLOSSÁRIO]  
Status: **PARCIAL**  
- Arquivos: `components/LiveDocumentPreview.tsx` monta capa, sumário visual, corpo A4 (210mm) e rodapé de glossário por seção.  
- Falta: sumário não é clicável; glossário é por seção (não consolidado); não há bloqueio de nomes de arquivos nem tratamento de ativos/imagens.

## 4) Mapa das regras críticas no código
1. **Ordem de leitura (Matriz primeiro, documentos depois)**  
   - Arquivos/Funções: `services/gemini.ts` → `generateSectionContent`, `generateFinancialData`.  
   - Lógica: prompts dizem “Use a MATRIZ DE VALORES como sua única fonte de verdade”, mas também fornecem todo o `context` textual; não há filtro/prioridade programática.

2. **Proibição de citar nomes de arquivos internos**  
   - Arquivos/Funções: não implementado em prompts ou pós-processamento.  
   - Nenhum filtro/sanitização em `services/gemini.ts` ou `LiveDocumentPreview.tsx`.

3. **Evitar invenção de dados**  
   - Arquivos/Funções: prompts da matriz/diagnóstico/seções mencionam “Não invente”, e respostas malformadas retornam fallback vazio nas funções com try/catch.  
   - Falta: validação de schema antes de usar a matriz; bloqueio de geração quando matriz está vazia; diagnóstico sem matriz; reliance no LLM para consistência.

4. **Estrutura de tópicos Sebrae/BRDE**  
   - Arquivos/Funções: `constants.ts` define `INITIAL_SECTIONS` (capítulos 1–8) e é usada em `App.tsx` para renderização e controle de status.  
   - Cobertura parcial: não inclui sub-subtópicos completos nem capítulos 9–11 típicos da metodologia estendida.

5. **Outras regras relevantes**  
   - **Diagnóstico evolutivo**: `generateGlobalDiagnosis` usa histórico e retorna gaps; `App.tsx` exibe último diagnóstico com barras de progresso.  
   - **Glossário**: `LiveDocumentPreview` detecta termos por regex e adiciona rodapé por seção; não há consolidação global.

## 5) Parecer crítico
- **Bem encaminhado**: tipos da matriz e gaps estruturados; prompts da matriz e seções mencionam usar a matriz como fonte; fallback JSON nas chamadas de IA evita quebra total; preview A4 funcional para texto/tabelas.
- **Frágil/ambíguo**:
  - Geração continua funcionando sem matriz válida, permitindo alucinação de números. Falta bloqueio/validação no front e diagnóstico não consome a matriz.
  - Proibição de citar arquivos internos não existe; qualquer resposta pode vazar nomes de PDFs ou da matriz.
  - Estrutura Sebrae/BRDE está resumida; faltam tópicos obrigatórios e âncoras no sumário.
  - Evolução de gaps depende do LLM reusar IDs; não há merge/controle determinístico nem UI de resolução manual.
- **Desvios potenciais**: prioridade “matriz primeiro” é apenas textual; como `context` bruto é fornecido, o LLM pode preferir números divergentes. Não há saneamento de respostas incompletas além do try/catch; um JSON parcial pode zerar gaps ou números sem alertar o usuário.

### Onde reforçar
- `services/gemini.ts`: validar `valueMatrix` antes de gerar seções/finanças; remover números do `context` ou omitir `context` numérico; inserir instruções de não citar arquivos; passar a matriz também para o diagnóstico.
- `App.tsx`: bloquear geração/diagnóstico se matriz estiver vazia ou se API key faltar; tratar resultados parciais com mensagens claras; permitir marcação manual de gaps.
- `LiveDocumentPreview.tsx`: sanitizar menções a arquivos; adicionar âncoras no sumário e glossário consolidado.
