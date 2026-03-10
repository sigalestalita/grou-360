

## Diagnostico

O problema **nao** e mais caracteres no codigo-fonte (emoji/estrela). Agora o crash silencioso vem dos **dados do banco de dados** que contem caracteres Unicode fora do Latin-1, que a fonte Helvetica do jsPDF nao suporta.

Especificamente, os textos das avaliacoes contem **aspas curvas** (smart quotes): `\u201C` e `\u201D` (por exemplo: `"se esconder"`, `"desligar"`, `"fazer diferente"`). Esses caracteres causam falha silenciosa no jsPDF.

Tambem ha risco com `toLocaleDateString("pt-BR", { month: "long" })` que pode gerar caracteres problematicos dependendo do locale do navegador.

## Plano de Correcao

**Arquivo: `src/utils/pdf/helpers.ts`**

Adicionar uma funcao `sanitizeText` que substitui caracteres Unicode problematicos por equivalentes ASCII:
- Aspas curvas `\u201C \u201D` por `"`
- Aspas simples curvas `\u2018 \u2019` por `'`
- Travessao `\u2014` por `--`
- Meia-risca `\u2013` por `-`
- Reticencias `\u2026` por `...`
- Qualquer outro caractere fora do Latin-1 (> U+00FF) removido

Aplicar `sanitizeText` em todas as funcoes que renderizam texto:
- `wrapText` - sanitizar o parametro `text`
- `drawKpiCard` - sanitizar `label`, `value`, `sub`
- `drawSectionTitle` - sanitizar `title`

**Arquivo: `src/utils/pdf/coverPage.ts`**

- Trocar `toLocaleDateString` com `month: "long"` por formato numerico seguro (`dd/MM/yyyy`)

**Arquivo: `src/utils/pdf/evaluationsPage.ts`**

- Sem mudancas necessarias (ja usa `wrapText` que sera sanitizado)

**Arquivo: `src/utils/pdf/analyticsPage.ts`**

- Sem mudancas necessarias (textos sao hardcoded em ASCII)

Sao mudancas em 2 arquivos, focadas em uma unica funcao de sanitizacao.

