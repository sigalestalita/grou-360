import jsPDF from "jspdf";
import { COLORS as C, RGB, MARGIN as m, Evaluation, SelfEvaluation } from "./constants";
import { setColor, setFill, drawHeader, drawSectionTitle, drawRatingBar, drawKpiCard, checkPage } from "./helpers";

export const drawAnalyticsPage = (
  doc: jsPDF,
  evaluations: Evaluation[],
  selfEvaluation?: SelfEvaluation | null
): void => {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cw = pw - 2 * m;

  doc.addPage();
  drawHeader(doc, pw);
  let y = 18;

  y = drawSectionTitle(doc, "Painel Analitico", m, y);

  // Calculate statistics
  const avgRating = evaluations.length > 0
    ? evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length
    : 0;

  const ratings = evaluations.map(e => e.rating);
  const minRating = ratings.length > 0 ? Math.min(...ratings) : 0;
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;

  const median = (() => {
    if (ratings.length === 0) return 0;
    const sorted = [...ratings].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })();

  const stdDev = (() => {
    if (ratings.length < 2) return 0;
    const variance = ratings.reduce((sum, r) => sum + (r - avgRating) ** 2, 0) / ratings.length;
    return Math.sqrt(variance);
  })();

  // KPI Cards
  const cardW = (cw - 15) / 4;
  drawKpiCard(doc, m, y, cardW, 36, "Media Geral", avgRating.toFixed(1), "de 5.0");
  drawKpiCard(doc, m + cardW + 5, y, cardW, 36, "Mediana", median.toFixed(1), "de 5.0");
  drawKpiCard(doc, m + (cardW + 5) * 2, y, cardW, 36, "Avaliacoes", `${evaluations.length}`, "recebidas");
  drawKpiCard(doc, m + (cardW + 5) * 3, y, cardW, 36, "Desvio Padrao", stdDev.toFixed(2), `Min: ${minRating} / Max: ${maxRating}`);
  y += 44;

  // Rating comparison
  y = drawSectionTitle(doc, "Media vs. Autoavaliacao", m, y, C.dark);

  doc.setFontSize(9);
  setColor(doc, C.text);
  doc.setFont("helvetica", "normal");
  doc.text("Avaliacao dos pares", m, y + 4);
  drawRatingBar(doc, m + 55, y, avgRating, cw - 55, 7);
  y += 14;

  if (selfEvaluation) {
    doc.text("Autoavaliacao", m, y + 4);
    drawRatingBar(doc, m + 55, y, selfEvaluation.rating, cw - 55, 7);
    y += 14;

    const gap = selfEvaluation.rating - avgRating;
    doc.setFontSize(8);
    setColor(doc, C.gray);
    doc.setFont("helvetica", "italic");
    const gapText = gap > 0
      ? `A autoavaliacao esta ${gap.toFixed(1)} ponto(s) acima da media dos pares`
      : gap < 0
        ? `A autoavaliacao esta ${Math.abs(gap).toFixed(1)} ponto(s) abaixo da media dos pares`
        : "A autoavaliacao esta alinhada com a media dos pares";
    doc.text(gapText, m, y + 3);
    y += 10;
  }

  // Distribution chart
  y += 3;
  y = drawSectionTitle(doc, "Distribuicao de Notas", m, y, C.dark);

  const dist = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: evaluations.filter(e => e.rating === r).length,
  }));
  const maxCount = Math.max(...dist.map(d => d.count), 1);

  for (const d of dist) {
    doc.setFontSize(9);
    setColor(doc, C.text);
    doc.setFont("helvetica", "bold");
    doc.text(`${d.rating}`, m, y + 5);

    const barMaxW = cw - 50;
    const barW = Math.max((d.count / maxCount) * barMaxW, 2);

    setFill(doc, C.border);
    doc.roundedRect(m + 20, y + 1, barMaxW, 5, 2, 2, "F");

    const barColor: RGB = d.rating >= 4 ? C.accent : d.rating >= 3 ? C.amber : C.red;
    setFill(doc, barColor);
    doc.roundedRect(m + 20, y + 1, barW, 5, 2, 2, "F");

    doc.setFontSize(8);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    const pct = evaluations.length > 0 ? ((d.count / evaluations.length) * 100).toFixed(0) : "0";
    doc.text(`${d.count} (${pct}%)`, m + 20 + barMaxW + 3, y + 5);
    y += 9;
  }

  // Interpretation
  y += 5;
  y = checkPage(doc, y, 35, ph, pw);
  setFill(doc, C.lightGray);
  doc.roundedRect(m, y, cw, 28, 3, 3, "F");

  doc.setFontSize(9);
  setColor(doc, C.primary);
  doc.setFont("helvetica", "bold");
  doc.text("Interpretacao", m + 8, y + 8);

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
  const interpLines = doc.splitTextToSize(interpretation, cw - 16);
  doc.text(interpLines, m + 8, y + 15);
};
