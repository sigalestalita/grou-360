

## Analise

O template enviado e praticamente identico ao layout ja implementado no codigo. A diferenca principal e que o template usa **texto com acentos** em portugues (Avaliações, Relatório, Interpretação, etc.), enquanto o codigo atual usa versoes sem acento (Avaliacoes, Relatorio, Interpretacao). Acentos como ã, ç, é, ó estao dentro do Latin-1 (< U+00FF) e funcionam perfeitamente com Helvetica no jsPDF — nao precisam ser removidos.

Alem disso, o template usa "O lider" na interpretacao em vez de "O colaborador", e o texto descritivo na pagina de avaliacoes tambem tem acentos.

## Plano

### 1. Atualizar textos hardcoded com acentos corretos

**`src/utils/pdf/helpers.ts`**:
- Linha 60: `"Relatorio "` → `"Relat\u00F3rio "` (Relatório)
- Linha 87: `"Pagina"` → `"P\u00E1gina"` (Página)
- Linha 88: `"Relatorio Confidencial"` → `"Relat\u00F3rio Confidencial"`

**`src/utils/pdf/analyticsPage.ts`**:
- Linha 30: `"Media Geral"` → `"M\u00E9dia Geral"` (MÉDIA GERAL)
- Linha 31: `"Avaliacoes"` → `"Avalia\u00E7\u00F5es"` (AVALIAÇÕES)
- Linha 35: `"Media vs. Autoavaliacao"` → `"M\u00E9dia vs. Autoavalia\u00E7\u00E3o"`
- Linha 40: `"Avaliacao dos pares"` → `"Avalia\u00E7\u00E3o dos pares"`
- Linha 45: `"Autoavaliacao"` → `"Autoavalia\u00E7\u00E3o"`
- Linha 53: `"Distribuicao de notas"` → `"Distribui\u00E7\u00E3o de notas"`
- Linha 97: `"Interpretacao"` → `"Interpreta\u00E7\u00E3o"`
- Linhas 103-108: Atualizar texto de interpretacao, usando "l\u00EDder" em vez de "colaborador"

**`src/utils/pdf/evaluationsPage.ts`**:
- Linha 19: `"Avaliacoes Recebidas"` → `"Avalia\u00E7\u00F5es Recebidas"`
- Linha 24: Texto descritivo com acentos: `"As avalia\u00E7\u00F5es s\u00E3o apresentadas de forma an\u00F4nima para preservar a confidencialidade."`
- Linha 97: `"Autoavaliacao"` → `"Autoavalia\u00E7\u00E3o"`
- Linha 110: `"PROPRIA"` → `"PR\u00D3PRIA"`

### 2. Usar unicode escapes para seguranca

Todos os acentos serao escritos como unicode escapes (`\u00E7` para ç, `\u00E3` para ã, etc.) para garantir que o arquivo fonte nao tenha problemas de encoding. Alternativamente, como estes caracteres sao Latin-1, podem ser escritos diretamente — ambas abordagens funcionam.

Sao alteracoes puramente textuais em 3 arquivos, sem mudanca de logica ou layout.

