import jsPDF from "jspdf";

// Brand colors
const C = {
  primary: [37, 99, 235] as const,       // #2563EB
  primaryDark: [29, 78, 186] as const,    // #1D4EBA
  accent: [22, 163, 74] as const,         // #16A34A
  accentLight: [220, 252, 231] as const,  // #DCFCE7
  dark: [15, 23, 42] as const,            // #0F172A
  text: [51, 65, 85] as const,            // #334155
  gray: [107, 114, 128] as const,         // #6B7280
  lightGray: [241, 245, 249] as const,    // #F1F5F9
  border: [226, 232, 240] as const,       // #E2E8F0
  white: [255, 255, 255] as const,
  red: [239, 68, 68] as const,            // #EF4444
  amber: [245, 158, 11] as const,         // #F59E0B
  yellow: [250, 204, 21] as const,        // #FACC15
};

type RGB = readonly [number, number, number];

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

// ─── Helper functions ───────────────────────────────────────

const setColor = (doc: jsPDF, color: RGB) => {
  doc.setTextColor(color[0], color[1], color[2]);
};

const setFill = (doc: jsPDF, color: RGB) => {
  doc.setFillColor(color[0], color[1], color[2]);
};

const setDraw = (doc: jsPDF, color: RGB) => {
  doc.setDrawColor(color[0], color[1], color[2]);
};

const drawHeader = (doc: jsPDF, w: number) => {
  setFill(doc, C.primary);
  doc.rect(0, 0, w, 6, "F");
  setFill(doc, C.accent);
  doc.rect(0, 6, w, 1.5, "F");
};

const drawFooter = (doc: jsPDF, w: number, h: number, page: number, total: number) => {
  setDraw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(20, h - 18, w - 20, h - 18);

  doc.setFontSize(7);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.text(`Página ${page} de ${total}`, w / 2, h - 12, { align: "center" });
  doc.text("Relatório Confidencial • Grou 360°", w / 2, h - 7, { align: "center" });
};

const checkPage = (doc: jsPDF, y: number, need: number, ph: number, pw: number): number => {
  if (y + need > ph - 25) {
    doc.addPage();
    drawHeader(doc, pw);
    return 18;
  }
  return y;
};

const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxW: number, ph: number, pw: number): number => {
  const lines: string[] = doc.splitTextToSize(text || "—", maxW);
  let cy = y;
  for (const line of lines) {
    cy = checkPage(doc, cy, 5, ph, pw);
    doc.text(line, x, cy);
    cy += 4.5;
  }
  return cy;
};

const drawRatingBar = (doc: jsPDF, x: number, y: number, rating: number, w: number = 50, h: number = 6) => {
  // Track background
  setFill(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");

  // Filled portion
  const fw = Math.max((rating / 5) * w, h);
  const color: RGB = rating >= 4 ? C.accent : rating >= 3 ? C.amber : C.red;
  setFill(doc, color);
  doc.roundedRect(x, y, fw, h, h / 2, h / 2, "F");

  // Text
  doc.setFontSize(7);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text(`${rating.toFixed(1)}`, x + fw / 2, y + h / 2 + 2, { align: "center" });
};

const drawSectionTitle = (doc: jsPDF, title: string, x: number, y: number, color: RGB = C.primary): number => {
  doc.setFontSize(16);
  setColor(doc, color);
  doc.setFont("helvetica", "bold");
  doc.text(title, x, y);
  setDraw(doc, color);
  doc.setLineWidth(0.8);
  doc.line(x, y + 2, x + doc.getTextWidth(title), y + 2);
  return y + 10;
};

const drawKpiCard = (doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, sub?: string) => {
  setFill(doc, C.lightGray);
  doc.roundedRect(x, y, w, h, 3, 3, "F");

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.text(label.toUpperCase(), x + w / 2, y + 10, { align: "center" });

  doc.setFontSize(22);
  setColor(doc, C.dark);
  doc.setFont("helvetica", "bold");
  doc.text(value, x + w / 2, y + 24, { align: "center" });

  if (sub) {
    doc.setFontSize(7);
    setColor(doc, C.gray);
    doc.setFont("helvetica", "normal");
    doc.text(sub, x + w / 2, y + 31, { align: "center" });
  }
};

// ─── Main Report Generator ──────────────────────────────────

export const generateEvaluationReport = (
  evaluatedName: string,
  evaluatedEmail: string,
  evaluatedPosition: string,
  evaluations: Evaluation[],
  _evaluatorProfiles: Record<string, EvaluatorProfile>,
  selfEvaluation?: SelfEvaluation | null
) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;
  const cw = pw - 2 * m;

  // ═══════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════
  setFill(doc, C.primary);
  doc.rect(0, 0, pw, ph, "F");

  // Decorative elements
  setFill(doc, C.primaryDark);
  doc.rect(0, 0, pw, 90, "F");

  // Logo text
  doc.setFontSize(32);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text("IEE", pw / 2, 40, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("INSTITUTO DE ESTUDOS EMPRESARIAIS", pw / 2, 50, { align: "center" });

  // White accent line
  setFill(doc, C.white);
  doc.rect(pw / 2 - 30, 58, 60, 1.5, "F");

  // Title block
  doc.setFontSize(38);
  doc.setFont("helvetica", "bold");
  doc.text("AVALIAÇÃO", pw / 2, 115, { align: "center" });
  doc.setFontSize(52);
  doc.text("360°", pw / 2, 135, { align: "center" });

  // Member info card
  const cardY = 165;
  setFill(doc, C.white);
  doc.roundedRect(m + 15, cardY, cw - 30, 55, 4, 4, "F");

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.text("COLABORADOR", m + 25, cardY + 12);
  doc.setFontSize(16);
  setColor(doc, C.dark);
  doc.setFont("helvetica", "bold");
  doc.text(evaluatedName, m + 25, cardY + 22);

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.text("CARGO", m + 25, cardY + 33);
  doc.setFontSize(11);
  setColor(doc, C.dark);
  doc.setFont("helvetica", "normal");
  doc.text(evaluatedPosition, m + 25, cardY + 41);

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.text("DATA", m + 25, cardY + 50);
  doc.setFontSize(10);
  setColor(doc, C.dark);
  doc.text(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), m + 25, cardY + 57 - 2);

  // Footer
  doc.setFontSize(7);
  setColor(doc, [180, 200, 255]);
  doc.text("Relatório gerado por Grou 360° • Documento Confidencial", pw / 2, ph - 12, { align: "center" });

  // ═══════════════════════════════════════
  // PAGE 2: ANALYTICS DASHBOARD
  // ═══════════════════════════════════════
  doc.addPage();
  drawHeader(doc, pw);
  let y = 18;

  y = drawSectionTitle(doc, "Painel Analítico", m, y);

  // KPI Cards Row
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
    const mean = avgRating;
    const variance = ratings.reduce((sum, r) => sum + (r - mean) ** 2, 0) / ratings.length;
    return Math.sqrt(variance);
  })();

  const cardW = (cw - 15) / 4;
  drawKpiCard(doc, m, y, cardW, 36, "Média Geral", avgRating.toFixed(1), "de 5.0");
  drawKpiCard(doc, m + cardW + 5, y, cardW, 36, "Mediana", median.toFixed(1), "de 5.0");
  drawKpiCard(doc, m + (cardW + 5) * 2, y, cardW, 36, "Avaliações", `${evaluations.length}`, "recebidas");
  drawKpiCard(doc, m + (cardW + 5) * 3, y, cardW, 36, "Desvio Padrão", stdDev.toFixed(2), `Min: ${minRating} / Max: ${maxRating}`);
  y += 44;

  // Rating bar comparison
  y = drawSectionTitle(doc, "Média vs. Autoavaliação", m, y, C.dark);

  // Peer average bar
  doc.setFontSize(9);
  setColor(doc, C.text);
  doc.setFont("helvetica", "normal");
  doc.text("Avaliação dos pares", m, y + 4);
  drawRatingBar(doc, m + 55, y, avgRating, cw - 55, 7);
  y += 14;

  if (selfEvaluation) {
    doc.text("Autoavaliação", m, y + 4);
    drawRatingBar(doc, m + 55, y, selfEvaluation.rating, cw - 55, 7);
    y += 14;

    const gap = selfEvaluation.rating - avgRating;
    doc.setFontSize(8);
    setColor(doc, C.gray);
    doc.setFont("helvetica", "italic");
    const gapText = gap > 0
      ? `A autoavaliação está ${gap.toFixed(1)} ponto(s) acima da média dos pares`
      : gap < 0
        ? `A autoavaliação está ${Math.abs(gap).toFixed(1)} ponto(s) abaixo da média dos pares`
        : "A autoavaliação está alinhada com a média dos pares";
    doc.text(gapText, m, y + 3);
    y += 10;
  }

  // Distribution chart (horizontal bar chart)
  y += 3;
  y = drawSectionTitle(doc, "Distribuição de Notas", m, y, C.dark);

  const dist = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: evaluations.filter(e => e.rating === r).length,
  }));
  const maxCount = Math.max(...dist.map(d => d.count), 1);

  for (const d of dist) {
    doc.setFontSize(9);
    setColor(doc, C.text);
    doc.setFont("helvetica", "bold");
    doc.text(`${d.rating} ★`, m, y + 5);

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

  // Performance interpretation
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
    ? "Desempenho excepcional. O colaborador demonstra consistência elevada nas competências avaliadas."
    : avgRating >= 3.5
      ? "Bom desempenho. O colaborador atende às expectativas com oportunidades pontuais de desenvolvimento."
      : avgRating >= 2.5
        ? "Desempenho adequado. Há áreas significativas que podem ser desenvolvidas."
        : "Atenção necessária. Recomenda-se um plano de desenvolvimento individual.";
  const interpLines = doc.splitTextToSize(interpretation, cw - 16);
  doc.text(interpLines, m + 8, y + 15);

  // ═══════════════════════════════════════
  // PAGE 3+: ANONYMOUS EVALUATIONS
  // ═══════════════════════════════════════
  doc.addPage();
  drawHeader(doc, pw);
  y = 18;

  y = drawSectionTitle(doc, "Avaliações Recebidas", m, y);

  doc.setFontSize(8);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "italic");
  doc.text("As avaliações são apresentadas de forma anônima para preservar a confidencialidade.", m, y);
  y += 8;

  evaluations.forEach((evaluation, index) => {
    y = checkPage(doc, y, 50, ph, pw);

    // Card container
    const cardStartY = y - 2;

    // Card header with number
    setFill(doc, index % 2 === 0 ? C.lightGray : C.white);
    doc.roundedRect(m, y - 3, cw, 11, 2, 2, "F");

    setFill(doc, C.primary);
    doc.roundedRect(m, y - 3, 28, 11, 2, 2, "F");
    // Fix corner overlap
    doc.rect(m + 26, y - 3, 2, 11, "F");

    doc.setFontSize(9);
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.text(`#${String(index + 1).padStart(2, "0")}`, m + 5, y + 4);

    // Rating on right
    drawRatingBar(doc, pw - m - 45, y - 1, evaluation.rating, 40, 7);

    // Date
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

  // ═══════════════════════════════════════
  // SELF-EVALUATION SECTION
  // ═══════════════════════════════════════
  if (selfEvaluation) {
    y = checkPage(doc, y, 60, ph, pw);
    y += 5;

    y = drawSectionTitle(doc, "Autoavaliação", m, y, C.accent);

    // Card
    setFill(doc, C.accentLight);
    doc.roundedRect(m, y - 2, cw, 11, 2, 2, "F");

    setFill(doc, C.accent);
    doc.roundedRect(m, y - 2, 40, 11, 2, 2, "F");
    doc.rect(m + 38, y - 2, 2, 11, "F");

    doc.setFontSize(9);
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.text("PRÓPRIA", m + 6, y + 5);

    drawRatingBar(doc, pw - m - 45, y, selfEvaluation.rating, 40, 7);

    y += 15;

    // Strengths
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
    y = wrapText(doc, selfEvaluation.improvements, m + 5, y, cw - 10, ph, pw);
  }

  // ═══════════════════════════════════════
  // FOOTERS
  // ═══════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, pw, ph, i - 1, totalPages - 1);
  }

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
