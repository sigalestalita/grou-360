

## Plano: Relatório PDF Profissional com Identidade Visual

### O que será feito

Reescrever completamente o `pdfGenerator.ts` para gerar um PDF com layout profissional e identidade visual, incluindo:

1. **Capa do relatório** com logo IEE, título "Avaliação 360°", nome do avaliado, cargo e data
2. **Página de resumo** com nota média, total de avaliações, gráfico visual de nota (barra de progresso)
3. **Avaliações detalhadas** com layout em cards estilizados, separação visual clara
4. **Autoavaliação** incluída no relatório quando disponível
5. **Rodapé** com logo Grou em todas as páginas
6. **Botão "Exportar Todos"** no painel admin para gerar todos os relatórios de uma vez

### Detalhes Técnicos

**Arquivo: `src/utils/pdfGenerator.ts`** — Reescrita completa:
- Cores da marca: primary azul (`#2563EB` do HSL 221 83% 53%), accent verde (`#16A34A` do HSL 142 76% 36%)
- Logo IEE como SVG embutido (converter para base64 data URI para uso no jsPDF via `addImage`)
- Logo Grou no rodapé (converter webp para base64)
- Layout com header colorido, seções com fundos alternados usando `rect()` com fill
- Barra visual de rating (retângulos preenchidos proporcionalmente)
- Nova função `generateAllReports()` que gera um PDF consolidado com todos os membros
- Nova função que aceita `selfEvaluation` como parâmetro opcional
- Paginação automática com "Página X de Y" no rodapé

**Arquivo: `src/pages/AdminDashboard.tsx`** — Alterações:
- Buscar self_evaluations junto com evaluations
- Adicionar botão "Exportar Todos os Relatórios" que gera PDF consolidado
- Passar autoavaliação para o gerador de PDF
- Converter logos em base64 em tempo de execução usando canvas

### Estrutura do PDF por membro

```text
┌─────────────────────────┐
│  [Logo IEE]             │
│                         │
│  AVALIAÇÃO 360°         │
│  ─────────────────      │
│  Nome: João Silva       │
│  Cargo: Analista        │
│  Data: 10/03/2026       │
│                         │
│        [Logo Grou]      │
└─────────────────────────┘
┌─────────────────────────┐
│  RESUMO                 │
│  Média: 4.2/5  ████░    │
│  Total avaliações: 6    │
│  Autoavaliação: 4/5     │
├─────────────────────────┤
│  AVALIAÇÃO 1            │
│  Avaliador: Maria       │
│  Nota: 4/5  ████░       │
│  Fortes: ...            │
│  Melhorias: ...         │
├─────────────────────────┤
│  AUTOAVALIAÇÃO          │
│  Nota: 4/5              │
│  Fortes: ...            │
│  Melhorias: ...         │
└─────────────────────────┘
```

