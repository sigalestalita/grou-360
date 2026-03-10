

## Diagnóstico

O problema é o caractere especial `★` (estrela Unicode) na linha 320 do `pdfGenerator.ts`. O jsPDF com a fonte padrão Helvetica não consegue renderizar caracteres Unicode fora do Latin-1, causando um erro silencioso capturado pelo `try-catch` — o toast de sucesso aparece, mas o PDF nunca é gerado.

Mesma causa raiz do problema anterior com o emoji 📊.

## Correção

**Arquivo: `src/utils/pdfGenerator.ts`**

- **Linha 320**: Substituir `` `${d.rating} ★` `` por `` `${d.rating}` `` (remover o caractere ★)
- Adicionar `console.error` mais detalhado no catch para facilitar debug futuro
- Opcionalmente, desenhar estrelas como formas geométricas (pequenos polígonos) ao invés de texto, para manter o visual

A correção é de uma única linha.

