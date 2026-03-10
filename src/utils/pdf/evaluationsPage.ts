import jsPDF from "jspdf";
import { COLORS as C, MARGIN as m, Evaluation, SelfEvaluation } from "./constants";
import { setColor, setFill, setDraw, drawHeader, drawSectionTitle, drawRatingBar, checkPage, wrapText } from "./helpers";

export const drawEvaluationsPage = (
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

  y = drawSectionTitle(doc, "Avaliacoes Recebidas", m, y);

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "italic");
  doc.text("As avaliacoes sao apresentadas de forma anonima para preservar a confidencialidade.", m, y);
  y += 8;

  evaluations.forEach((evaluation, index) => {
    y = checkPage(doc, y, 50, ph, pw);

    // Card header
    setFill(doc, index % 2 === 0 ? C.lightGray : C.white);
    doc.roundedRect(m, y - 3, cw, 11, 2, 2, "F");

    setFill(doc, C.primary);
    doc.roundedRect(m, y - 3, 28, 11, 2, 2, "F");
    doc.rect(m + 26, y - 3, 2, 11, "F");

    doc.setFontSize(9);
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.text(`#${String(index + 1).padStart(2, "0")}`, m + 5, y + 4);

    drawRatingBar(doc, pw - m - 45, y - 1, evaluation.rating, 40, 7);

    const evalDate = new Date(evaluation.created_at).toLocaleDateString("pt-BR");
    doc.setFontSize(7);
    setColor(doc, C.gray);
    doc.setFont("helvetica", "normal");
    doc.text(evalDate, m + 33, y + 4);

    y += 13;

    // Strengths
    doc.setFontSize(9);
    setColor(doc, C.accent);
    doc.setFont("helvetica", "bold");
    doc.text("Pontos Fortes", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, evaluation.strengths, m + 5, y, cw - 10, ph, pw);
    y += 2;

    // Improvements
    y = checkPage(doc, y, 12, ph, pw);
    doc.setFontSize(9);
    setColor(doc, C.primary);
    doc.setFont("helvetica", "bold");
    doc.text("Oportunidades de Melhoria", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, evaluation.improvements, m + 5, y, cw - 10, ph, pw);
    y += 6;

    // Separator
    if (index < evaluations.length - 1) {
      setDraw(doc, C.border);
      doc.setLineWidth(0.2);
      doc.line(m + 5, y, pw - m - 5, y);
      y += 6;
    }
  });

  // Self-evaluation section
  if (selfEvaluation) {
    y = checkPage(doc, y, 60, ph, pw);
    y += 5;

    y = drawSectionTitle(doc, "Autoavaliacao", m, y, C.accent);

    setFill(doc, C.accentLight);
    doc.roundedRect(m, y - 2, cw, 11, 2, 2, "F");

    setFill(doc, C.accent);
    doc.roundedRect(m, y - 2, 40, 11, 2, 2, "F");
    doc.rect(m + 38, y - 2, 2, 11, "F");

    doc.setFontSize(9);
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.text("PROPRIA", m + 6, y + 5);

    drawRatingBar(doc, pw - m - 45, y, selfEvaluation.rating, 40, 7);

    y += 15;

    doc.setFontSize(9);
    setColor(doc, C.accent);
    doc.setFont("helvetica", "bold");
    doc.text("Pontos Fortes", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, selfEvaluation.strengths, m + 5, y, cw - 10, ph, pw);
    y += 2;

    y = checkPage(doc, y, 12, ph, pw);
    doc.setFontSize(9);
    setColor(doc, C.primary);
    doc.setFont("helvetica", "bold");
    doc.text("Oportunidades de Melhoria", m + 5, y);
    y += 4;

    doc.setFontSize(8.5);
    setColor(doc, C.text);
    doc.setFont("helvetica", "normal");
    y = wrapText(doc, selfEvaluation.improvements, m + 5, y, cw - 10, ph, pw);
  }
};
