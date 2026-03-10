import jsPDF from "jspdf";
import { COLORS as C, RGB, MARGIN as m, Evaluation, SelfEvaluation } from "./constants";
import { setColor, setFill, drawPageHeader, drawSectionTitle, drawRatingBar, drawKpiCard, checkPage, sanitizeText } from "./helpers";

export const drawAnalyticsPage = (
  doc: jsPDF,
  evaluatedName: string,
  evaluations: Evaluation[],
  selfEvaluation?: SelfEvaluation | null
): void => {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cw = pw - 2 * m;

  // Page 1 — header is drawn on the first page (no addPage)
  drawPageHeader(doc, pw, evaluatedName);
  let y = 72;

  // KPI Cards — 2 orange cards centered
  const cardW = 65;
  const cardH = 42;
  const gap = 10;
  const totalCardsW = cardW * 2 + gap;
  const startX = (pw - totalCardsW) / 2;

  const avgRating = evaluations.length > 0
    ? evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length
    : 0;

  drawKpiCard(doc, startX, y, cardW, cardH, "Media Geral", avgRating.toFixed(1), "de 5.0");
  drawKpiCard(doc, startX + cardW + gap, y, cardW, cardH, "Avaliacoes", `${evaluations.length}`, "recebidas");
  y += cardH + 16;

  // Média vs. Autoavaliação
  y = drawSectionTitle(doc, "Media vs. Autoavaliacao", m, y);

  doc.setFontSize(9);
  setColor(doc, C.text);
  doc.setFont("helvetica", "normal");
  doc.text("Avaliacao dos pares", m + 5, y + 4);
  drawRatingBar(doc, m + 55, y, avgRating, cw - 55, 7);
  y += 14;

  if (selfEvaluation) {
    doc.text("Autoavaliacao", m + 5, y + 4);
    drawRatingBar(doc, m + 55, y, selfEvaluation.rating, cw - 55, 7);
    y += 14;
  }

  y += 6;

  // Distribuição de notas
  y = drawSectionTitle(doc, "Distribuicao de notas", m, y);

  const dist = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: evaluations.filter(e => e.rating === r).length,
  }));
  const maxCount = Math.max(...dist.map(d => d.count), 1);

  for (const d of dist) {
    doc.setFontSize(9);
    setColor(doc, C.text);
    doc.setFont("helvetica", "bold");
    doc.text(`${d.rating}`, m + 5, y + 5);

    const barMaxW = cw - 50;
    const barW = Math.max((d.count / maxCount) * barMaxW, 2);

    setFill(doc, C.border);
    doc.roundedRect(m + 20, y + 1, barMaxW, 5, 2, 2, "F");

    setFill(doc, C.orange);
    if (barW > 4) {
      doc.roundedRect(m + 20, y + 1, barW, 5, 2, 2, "F");
    } else {
      doc.rect(m + 20, y + 1, barW, 5, "F");
    }

    doc.setFontSize(8);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    const pct = evaluations.length > 0 ? ((d.count / evaluations.length) * 100).toFixed(0) : "0";
    doc.text(`${d.count} (${pct}%)`, m + 20 + barMaxW + 3, y + 5);
    y += 9;
  }

  // Interpretação
  y += 8;
  y = checkPage(doc, y, 35, ph, pw, evaluatedName);
  setFill(doc, C.lightGray);
  doc.roundedRect(m, y, cw, 28, 3, 3, "F");

  doc.setFontSize(10);
  setColor(doc, C.orange);
  doc.setFont("helvetica", "bold");
  doc.text("Interpretacao", m + 8, y + 9);

  doc.setFontSize(8);
  setColor(doc, C.text);
  doc.setFont("helvetica", "normal");
  const interpretation = avgRating >= 4.5
    ? "Desempenho excepcional. O colaborador demonstra consistencia elevada nas competencias avaliadas."
    : avgRating >= 3.5
      ? "Bom desempenho. O colaborador atende as expectativas com oportunidades pontuais de desenvolvimento."
      : avgRating >= 2.5
        ? "Desempenho adequado. Ha areas significativas que podem ser desenvolvidas."
        : "Atencao necessaria. Recomenda-se um plano de desenvolvimento individual.";
  const interpLines = doc.splitTextToSize(sanitizeText(interpretation), cw - 16);
  doc.text(interpLines, m + 8, y + 16);
};
