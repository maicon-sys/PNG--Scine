# Diagnóstico de erros e pontos frágeis

## 1) Chamada de IA quebra sem API key ao gerar seções/imagens
- `getAIClient` lança erro quando `VITE_API_KEY`/`API_KEY` não está presente. As funções `generateSectionContent` e `generateProjectImage` chamam esse helper **fora de blocos try/catch**, então um ambiente sem chave derruba a renderização com erro de runtime (sintoma: tela branca/React erro 310 quando o usuário pede geração de conteúdo ou imagem).
- Onde: `services/gemini.ts`, `getAIClient` linhas 5-11; chamadas sem try/catch em `generateSectionContent` (linhas 93-140) e `generateProjectImage` (linhas 211-233). 
- Como corrigir: validar a chave antes de renderizar botões ou envolver essas funções em try/catch retornando fallback seguro (string de erro ou base64 vazio) para não propagar exceções ao React.

## 2) Diagnosis/Matrix usam Promise.all mas dependem do mesmo contexto e podem propagar exceções iniciais
- `handleRunDiagnosis` dispara `generateGlobalDiagnosis` e `generateValueMatrix` em `Promise.all`. Se a inicialização do cliente falhar (mesma causa de API key), a exceção ocorre **antes** do catch do componente e derruba a tela. O catch do componente só pega erros já tratados dentro das funções.
- Onde: `App.tsx` linhas 112-136 chamam `Promise.all([generateGlobalDiagnosis, generateValueMatrix])` sem verificar pré-condições de API key.
- Como corrigir: validar a presença da chave antes de chamar a IA ou encapsular cada chamada em try/catch individual antes do `Promise.all` para garantir que um fallback seja retornado ao estado mesmo se o cliente não inicializar.

## 3) Diagnóstico exibe painel vazio quando a IA retorna resposta incompleta
- Embora `generateGlobalDiagnosis` tenha fallback, a UI assume que `latestDiagnosis` existe para exibir histórico. Se a IA falhar antes de povoar `diagnosisHistory`, o painel fica vazio, parecendo “tela branca” para o usuário.
- Onde: `App.tsx` linhas 156-189 (renderização do histórico) dependem de `latestDiagnosis` não nulo.
- Como corrigir: armazenar e exibir uma mensagem de erro/alerta no estado quando a IA falhar, em vez de renderizar nada. Alternativamente, sempre empurrar um diagnóstico de fallback no estado para evitar layout vazio.

## 4) Matriz de valores é opcional e não bloqueia geração textual
- `generateSectionContent` constrói `matrixContext` com "Matriz de valores não gerada ainda." quando a matriz falta; isso permite que a IA invente números, contrariando a ideia de “fonte da verdade” e pode gerar inconsistência no diagnóstico.
- Onde: `services/gemini.ts` linhas 86-101.
- Como corrigir: exigir matriz válida antes de habilitar botões de geração ou bloquear números no prompt quando `valueMatrix` estiver ausente.

## 5) Geração de imagem usa schema/mime inconsistentes e lança se a IA não retornar
- `generateProjectImage` pede `responseMimeType: 'image/png'` mas define schema `Type.STRING` e procura `inlineData`; se a API responder em outro formato, a função lança e não é tratada no chamador, resultando em quebra ao tentar gerar imagens.
- Onde: `services/gemini.ts` linhas 211-233; chamado em `App.tsx` linhas 173-184 dentro de try/catch porém apenas alerta, não impede erro inicial de cliente.
- Como corrigir: alinhar configuração com a API suportada (schema binário correto) e manter try/catch para garantir que falhas não afetem o restante do fluxo.
