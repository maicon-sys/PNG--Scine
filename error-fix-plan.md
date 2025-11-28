# Guia de correção passo a passo

## 1) Evitar tela branca quando a chave da API está ausente
- **Problema**: `getAIClient` lança erro se `API Key` não estiver definida, e chamadas como geração de imagem não têm fallback interno.
- **Onde**: `services/gemini.ts`, função `getAIClient` e `generateProjectImage`.
- **Correção sugerida**:
  1. Antes de inicializar o cliente, valide a chave usando apenas variáveis expostas pelo bundler (`import.meta.env.VITE_API_KEY`) e trate ausência com retorno controlado.
  2. Envolva `generateProjectImage` em `try/catch` e retorne erro amigável para o componente evitar quebra.

## 2) Blindar a geração de diagnósticos e matriz
- **Problema**: se a IA retornar vazio ou malformado, `Promise.all` em `handleRunDiagnosis` pode receber exceção antes de popular o estado, deixando a UI sem dados.
- **Onde**: `services/gemini.ts` (`generateGlobalDiagnosis` e `generateValueMatrix`) e `src/App.tsx` (`handleRunDiagnosis`).
- **Correção sugerida**:
  1. Retornar objetos de fallback **sempre**, inclusive se a inicialização do cliente falhar, para que `Promise.all` não quebre.
  2. Após o `Promise.all`, validar o shape (ex.: `Array.isArray(result.gaps)`) antes de gravar no estado.

## 3) Evitar números inventados em seções
- **Problema**: quando a matriz não está carregada, o prompt envia "Matriz de valores não gerada ainda.", permitindo a IA inventar números.
- **Onde**: `generateSectionContent` em `services/gemini.ts`.
- **Correção sugerida**:
  1. Bloquear geração de seções financeiras se `valueMatrix.entries.length === 0` e avisar o usuário.
  2. Incluir no prompt a regra "não use nenhum número se a matriz estiver vazia".

## 4) Corrigir risco de React error #310 (render com dados indefinidos)
- **Problema**: trechos de renderização assumem diagnósticos disponíveis; se estado vier `null`, o React acusa erro em listas.
- **Onde**: `src/App.tsx`, seção de histórico de diagnósticos.
- **Correção sugerida**:
  1. Renderizar o card de diagnóstico somente quando `latestDiagnosis && Array.isArray(latestDiagnosis.gaps)`.
  2. Garantir valor padrão `[]` nas leituras (`latestDiagnosis?.gaps ?? []`).

## 5) Melhorar manejo da resposta da API de imagens
- **Problema**: leitura direta de `candidates[0].content.parts` sem verificar existência pode lançar.
- **Onde**: `generateProjectImage` em `services/gemini.ts`.
- **Correção sugerida**: checar `response?.response?.candidates?.length` antes de acessar, e se faltar, retornar mensagem clara ao usuário.
