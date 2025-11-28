# Code Audit — Stratégia AI

## App.tsx
- Lines 238-243: `getFullContext` concatenates uploaded file contents without a hard size cap per run; large files still inflate prompts and can stall or fail AI calls.
- Lines 247-279: `handleRunDiagnosis` wraps AI calls, but any synchronous initialization failure before the internal catches (e.g., AI client misconfiguration) will surface as a user-facing alert and abort both diagnosis and matrix updates.
- Lines 304-314: `handleGenerateSection` invokes AI even when `contextState.valueMatrix` is undefined; the prompt then uses the string “Matriz de valores não gerada ainda.” which lets the model invent numbers instead of blocking generation until the matrix exists.

## services/gemini.ts
- Lines 7-16: `getAIClient` reads `process.env.API_KEY`, which is undefined in a Vite browser build; this throws and forces every generator into its fallback path, so AI features will never succeed until the key is read from `import.meta.env` or injected at build time.
- Lines 34-119: `generateValueMatrix` trusts the model output without post-parse validation (numeric coercion, conflict checks). Malformed or fabricated entries can be stored and later treated as “oficiais”.
- Lines 170-209: `generateSectionContent` lacks a try/catch around client setup and parsing, so initialization errors bubble to callers. The prompt also injects full raw context with numbers, allowing the model to sidestep the matrix even when present.
- Lines 266-318: `generateGlobalDiagnosis` ignores the ValueMatrix entirely, basing readiness and suggested sections only on raw context and prior gaps, which can diverge from consolidated numbers.

## components/LiveDocumentPreview.tsx
- Lines 18-31: Sections are sorted by numeric parsing of the ID; AI-generated IDs like `ai-gen-...` resolve to `NaN` parts and can appear in unpredictable order in the final document.
- Lines 116-126: Table of contents is purely visual (no anchors), limiting navigation and potentially confusing users expecting clickable entries.

## Overall logic and stability
- With `process.env.API_KEY` unavailable in the browser, all AI calls currently fall back, preventing diagnosis, matrix, financial, and section generation from succeeding in production builds.
- Section generation can still fabricate numbers when the matrix is missing or malformed because prompts proceed without validated numeric inputs.
