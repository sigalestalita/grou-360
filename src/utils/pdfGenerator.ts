import jsPDF from "jspdf";

// Brand colors
const COLORS = {
  primary: { r: 37, g: 99, b: 235 },      // #2563EB
  primaryDark: { r: 29, g: 78, b: 186 },   // #1D4EBA
  accent: { r: 22, g: 163, b: 74 },        // #16A34A
  dark: { r: 4, g: 0, b: 6 },              // #040006
  gray: { r: 107, g: 114, b: 128 },        // #6B7280
  lightGray: { r: 243, g: 244, b: 246 },   // #F3F4F6
  white: { r: 255, g: 255, b: 255 },
  starFilled: { r: 250, g: 204, b: 21 },   // #FACC15
  starEmpty: { r: 229, g: 231, b: 235 },   // #E5E7EB
};

interface Evaluation {
  evaluator_id: string;
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

interface SelfEvaluation {
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

interface EvaluatorProfile {
  name: string;
  email: string;
}

const drawHeader = (doc: jsPDF, pageWidth: number) => {
  // Blue header bar
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, pageWidth, 8, "F");
};

const drawFooter = (doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number) => {
  // Footer line
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

  // Page number
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.setFont("helvetica", "normal");
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: "center" });

  // Grou branding
  doc.setFontSize(7);
  doc.text("Powered by Grou | grou360.lovable.app", pageWidth / 2, pageHeight - 7, { align: "center" });
};

const drawRatingBar = (doc: jsPDF, x: number, y: number, rating: number, width: number = 60, height: number = 8) => {
  // Background
  doc.setFillColor(COLORS.starEmpty.r, COLORS.starEmpty.g, COLORS.starEmpty.b);
  doc.roundedRect(x, y, width, height, 2, 2, "F");

  // Filled portion
  const filledWidth = (rating / 5) * width;
  if (filledWidth > 0) {
    doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.roundedRect(x, y, filledWidth, height, 2, 2, "F");
  }

  // Rating text
  doc.setFontSize(8);
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.text(`${rating.toFixed(1)} / 5`, x + width / 2, y + height / 2 + 2.5, { align: "center" });
};

const drawStars = (doc: jsPDF, x: number, y: number, rating: number) => {
  const starSize = 5;
  const gap = 1.5;
  for (let i = 0; i < 5; i++) {
    if (i < Math.round(rating)) {
      doc.setFillColor(COLORS.starFilled.r, COLORS.starFilled.g, COLORS.starFilled.b);
    } else {
      doc.setFillColor(COLORS.starEmpty.r, COLORS.starEmpty.g, COLORS.starEmpty.b);
    }
    const sx = x + i * (starSize + gap);
    doc.roundedRect(sx, y, starSize, starSize, 1, 1, "F");
  }
};

const checkPageBreak = (doc: jsPDF, yPosition: number, needed: number, pageHeight: number, pageWidth: number): number => {
  if (yPosition + needed > pageHeight - 30) {
    doc.addPage();
    drawHeader(doc, pageWidth);
    return 18;
  }
  return yPosition;
};

const drawWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, pageHeight: number, pageWidth: number): number => {
  const lines = doc.splitTextToSize(text || "N/A", maxWidth);
  let currentY = y;
  for (const line of lines) {
    currentY = checkPageBreak(doc, currentY, 5, pageHeight, pageWidth);
    doc.text(line, x, currentY);
    currentY += 5;
  }
  return currentY;
};

export const generateEvaluationReport = (
  evaluatedName: string,
  evaluatedEmail: string,
  evaluatedPosition: string,
  evaluations: Evaluation[],
  evaluatorProfiles: Record<string, EvaluatorProfile>,
  selfEvaluation?: SelfEvaluation | null
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // ═══════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════
  
  // Full blue background for cover
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // White accent stripe
  doc.setFillColor(255, 255, 255);
  doc.rect(0, pageHeight * 0.38, pageWidth, 2, "F");

  // IEE text logo
  doc.setFontSize(28);
  doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  doc.setFont("helvetica", "bold");
  doc.text("IEE", pageWidth / 2, 55, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Instituto de Estudos Empresariais", pageWidth / 2, 65, { align: "center" });

  // Title
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("AVALIAÇÃO", pageWidth / 2, pageHeight * 0.32, { align: "center" });
  doc.text("360°", pageWidth / 2, pageHeight * 0.32 + 15, { align: "center" });

  // Member info card
  const cardY = pageHeight * 0.5;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 10, cardY, contentWidth - 20, 60, 4, 4, "F");

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("NOME", margin + 20, cardY + 15);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(evaluatedName, margin + 20, cardY + 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text("CARGO", margin + 20, cardY + 36);
  doc.setFontSize(12);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(evaluatedPosition, margin + 20, cardY + 44);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text("DATA DO RELATÓRIO", margin + 20, cardY + 54);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(new Date().toLocaleDateString("pt-BR"), margin + 20, cardY + 62 - 2);

  // Footer on cover
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 255);
  doc.text("Relatório gerado por Grou 360° • Confidencial", pageWidth / 2, pageHeight - 15, { align: "center" });

  // ═══════════════════════════════════════
  // SUMMARY PAGE
  // ═══════════════════════════════════════
  doc.addPage();
  drawHeader(doc, pageWidth);

  let y = 22;

  // Section title
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo da Avaliação", margin, y);
  y += 4;

  // Underline
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + 60, y);
  y += 12;

  // Stats cards
  const avgRating = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length
    : 0;

  // Card 1: Average Rating
  doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.roundedRect(margin, y, contentWidth / 2 - 5, 45, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.setFont("helvetica", "normal");
  doc.text("MÉDIA GERAL", margin + 10, y + 12);

  doc.setFontSize(28);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFont("helvetica", "bold");
  doc.text(avgRating.toFixed(1), margin + 10, y + 30);

  doc.setFontSize(12);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.text("/ 5", margin + 35, y + 30);

  drawRatingBar(doc, margin + 10, y + 35, avgRating, contentWidth / 2 - 25, 6);

  // Card 2: Total evaluations + self-evaluation
  const card2X = margin + contentWidth / 2 + 5;
  doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.roundedRect(card2X, y, contentWidth / 2 - 5, 45, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL DE AVALIAÇÕES", card2X + 10, y + 12);

  doc.setFontSize(28);
  doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.setFont("helvetica", "bold");
  doc.text(`${evaluations.length}`, card2X + 10, y + 30);

  if (selfEvaluation) {
    doc.setFontSize(9);
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.setFont("helvetica", "normal");
    doc.text(`Autoavaliação: ${selfEvaluation.rating}/5`, card2X + 10, y + 40);
  }

  y += 55;

  // Individual ratings overview
  doc.setFontSize(14);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.setFont("helvetica", "bold");
  doc.text("Notas Individuais", margin, y);
  y += 8;

  evaluations.forEach((evaluation, index) => {
    y = checkPageBreak(doc, y, 14, pageHeight, pageWidth);
    const evaluatorName = evaluatorProfiles[evaluation.evaluator_id]?.name || "Avaliador";

    doc.setFontSize(9);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}. ${evaluatorName}`, margin, y + 4);

    drawRatingBar(doc, margin + 80, y, evaluation.rating, 50, 7);
    y += 12;
  });

  // ═══════════════════════════════════════
  // DETAILED EVALUATIONS
  // ═══════════════════════════════════════
  doc.addPage();
  drawHeader(doc, pageWidth);
  y = 22;

  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFont("helvetica", "bold");
  doc.text("Avaliações Detalhadas", margin, y);
  y += 4;
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + 70, y);
  y += 12;

  evaluations.forEach((evaluation, index) => {
    // Estimate space needed (min ~50px)
    y = checkPageBreak(doc, y, 60, pageHeight, pageWidth);

    const evaluatorName = evaluatorProfiles[evaluation.evaluator_id]?.name || "Avaliador";
    const evaluatorEmail = evaluatorProfiles[evaluation.evaluator_id]?.email || "";
    const evaluationDate = new Date(evaluation.created_at).toLocaleDateString("pt-BR");

    // Card background
    doc.setFillColor(index % 2 === 0 ? 249 : 243, index % 2 === 0 ? 250 : 244, index % 2 === 0 ? 251 : 246);
    doc.roundedRect(margin, y - 2, contentWidth, 10, 2, 2, "F");

    // Evaluation header
    doc.setFontSize(11);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFont("helvetica", "bold");
    doc.text(`Avaliação ${index + 1}`, margin + 5, y + 5);

    // Rating on the right
    drawStars(doc, pageWidth - margin - 35, y, evaluation.rating);

    y += 14;

    // Evaluator info
    doc.setFontSize(9);
    doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
    doc.setFont("helvetica", "normal");
    doc.text(`Avaliador: ${evaluatorName}${evaluatorEmail ? ` (${evaluatorEmail})` : ""}`, margin + 5, y);
    y += 5;
    doc.text(`Data: ${evaluationDate}  •  Nota: ${evaluation.rating}/5`, margin + 5, y);
    y += 8;

    // Strengths
    doc.setFontSize(10);
    doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.setFont("helvetica", "bold");
    doc.text("▸ Pontos Fortes", margin + 5, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFont("helvetica", "normal");
    y = drawWrappedText(doc, evaluation.strengths, margin + 5, y, contentWidth - 10, pageHeight, pageWidth);
    y += 3;

    // Improvements
    y = checkPageBreak(doc, y, 15, pageHeight, pageWidth);
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFont("helvetica", "bold");
    doc.text("▸ Áreas de Melhoria", margin + 5, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFont("helvetica", "normal");
    y = drawWrappedText(doc, evaluation.improvements, margin + 5, y, contentWidth - 10, pageHeight, pageWidth);
    y += 8;

    // Separator
    if (index < evaluations.length - 1) {
      doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.setLineWidth(0.3);
      doc.line(margin + 10, y, pageWidth - margin - 10, y);
      y += 8;
    }
  });

  // ═══════════════════════════════════════
  // SELF-EVALUATION
  // ═══════════════════════════════════════
  if (selfEvaluation) {
    y = checkPageBreak(doc, y, 70, pageHeight, pageWidth);

    if (y < 30) {
      // We're on a fresh page already
    } else {
      y += 5;
    }

    doc.setFontSize(16);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFont("helvetica", "bold");
    doc.text("Autoavaliação", margin, y);
    y += 4;
    doc.setDrawColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + 45, y);
    y += 10;

    // Self-eval card
    doc.setFillColor(240, 253, 244); // light green bg
    doc.roundedRect(margin, y - 4, contentWidth, 12, 2, 2, "F");

    doc.setFontSize(10);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFont("helvetica", "bold");
    doc.text("Nota da Autoavaliação", margin + 5, y + 4);
    drawRatingBar(doc, margin + 80, y - 1, selfEvaluation.rating, 50, 7);
    y += 16;

    // Strengths
    doc.setFontSize(10);
    doc.setTextColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.setFont("helvetica", "bold");
    doc.text("▸ Pontos Fortes", margin + 5, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFont("helvetica", "normal");
    y = drawWrappedText(doc, selfEvaluation.strengths, margin + 5, y, contentWidth - 10, pageHeight, pageWidth);
    y += 3;

    // Improvements
    y = checkPageBreak(doc, y, 15, pageHeight, pageWidth);
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFont("helvetica", "bold");
    doc.text("▸ Áreas de Melhoria", margin + 5, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFont("helvetica", "normal");
    y = drawWrappedText(doc, selfEvaluation.improvements, margin + 5, y, contentWidth - 10, pageHeight, pageWidth);
  }

  // ═══════════════════════════════════════
  // ADD FOOTERS TO ALL PAGES
  // ═══════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) { // Skip cover page footer (it has its own)
      drawFooter(doc, pageWidth, pageHeight, i - 1, totalPages - 1);
    }
  }

  // Save
  const fileName = `Avaliacao360_${evaluatedName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

export const generateAllReports = (
  groupedData: Array<{
    name: string;
    email: string;
    position: string;
    evaluations: Evaluation[];
    selfEvaluation?: SelfEvaluation | null;
  }>,
  evaluatorProfiles: Record<string, EvaluatorProfile>
) => {
  groupedData.forEach((member) => {
    generateEvaluationReport(
      member.name,
      member.email,
      member.position,
      member.evaluations,
      evaluatorProfiles,
      member.selfEvaluation
    );
  });
};
