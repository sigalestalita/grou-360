import jsPDF from "jspdf";
import { COLORS as C, MARGIN as m, Evaluation, SelfEvaluation } from "./constants";
import { setColor, setFill, setDraw, drawPageHeader, drawSectionTitle, drawRatingBar, checkPage, wrapText } from "./helpers";

export const drawEvaluationsPage = (
  doc: jsPDF,
  evaluatedName: string,
  evaluations: Evaluation[],
  selfEvaluation?: SelfEvaluation | null
): void => {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cw = pw - 2 * m;

  doc.addPage();
  drawPageHeader(doc, pw, evaluatedName);
  let y = 66;

  y = drawSectionTitle(doc, "Avalia\u00E7\u00F5es Recebidas", m, y);

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.text("As avalia\u00E7\u00F5es s\u00E3o apresentadas de forma an\u00F4nima para preservar a confidencialidade.", m, y);
  y += 10;

  evaluations.forEach((evaluation, index) => {
    y = checkPage(doc, y, 55, ph, pw, evaluatedName);

    // Card header row: [#01] date ............... [rating bar]
    setFill(doc, C.lightGray);
    doc.roundedRect(m, y - 3, cw, 11, 2, 2, "F");

    // Navy tag with number
    setFill(doc, C.navyTag);
    doc.roundedRect(m, y - 3, 28, 11, 2, 2, "F");
    doc.rect(m + 26, y - 3, 2, 11, "F");

    doc.setFontSize(9);
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.text(`#${String(index + 1).padStart(2, "0")}`, m + 5, y + 4);

    // Date
    const evalDate = new Date(evaluation.created_at).toLocaleDateString("pt-BR");
    doc.setFontSize(7);
    setColor(doc, C.gray);
    doc.setFont("helvetica", "normal");
    doc.text(evalDate, m + 33, y + 4);

    // Rating bar on right
    drawRatingBar(doc, pw - m - 45, y - 1, evaluation.rating, 40, 7);

    y += 14;

    // Pontos Fortes
    doc.setFontSize(9);
    setColor(doc, C.dark);
    doc.setFont("helvetica", "bold");
    doc.text("Pontos Fortes", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, evaluation.strengths, m + 5, y, cw - 10, ph, pw, evaluatedName);
    y += 3;

    // Oportunidades de Melhoria — orange label
    y = checkPage(doc, y, 12, ph, pw, evaluatedName);
    doc.setFontSize(9);
    setColor(doc, C.orange);
    doc.setFont("helvetica", "bold");
    doc.text("Oportunidades de Melhoria", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, evaluation.improvements, m + 5, y, cw - 10, ph, pw, evaluatedName);
    y += 6;

    // Separator line
    if (index < evaluations.length - 1) {
      setDraw(doc, C.border);
      doc.setLineWidth(0.2);
      doc.line(m + 5, y, pw - m - 5, y);
      y += 8;
    }
  });

  // Self-evaluation section
  if (selfEvaluation) {
    y = checkPage(doc, y, 60, ph, pw, evaluatedName);
    y += 8;

    y = drawSectionTitle(doc, "Autoavaliacao", m, y);

    // Header row with "PROPRIA" tag
    setFill(doc, C.lightGray);
    doc.roundedRect(m, y - 2, cw, 11, 2, 2, "F");

    setFill(doc, C.navyTag);
    doc.roundedRect(m, y - 2, 40, 11, 2, 2, "F");
    doc.rect(m + 38, y - 2, 2, 11, "F");

    doc.setFontSize(9);
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.text("PROPRIA", m + 6, y + 5);

    drawRatingBar(doc, pw - m - 45, y, selfEvaluation.rating, 40, 7);

    y += 16;

    // Pontos Fortes
    doc.setFontSize(9);
    setColor(doc, C.dark);
    doc.setFont("helvetica", "bold");
    doc.text("Pontos Fortes", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, selfEvaluation.strengths, m + 5, y, cw - 10, ph, pw, evaluatedName);
    y += 3;

    // Oportunidades de Melhoria
    y = checkPage(doc, y, 12, ph, pw, evaluatedName);
    doc.setFontSize(9);
    setColor(doc, C.orange);
    doc.setFont("helvetica", "bold");
    doc.text("Oportunidades de Melhoria", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, selfEvaluation.improvements, m + 5, y, cw - 10, ph, pw, evaluatedName);
  }
};
