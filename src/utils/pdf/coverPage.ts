import jsPDF from "jspdf";
import { COLORS as C, MARGIN as m } from "./constants";
import { setColor, setFill } from "./helpers";

export const drawCoverPage = (
  doc: jsPDF,
  evaluatedName: string,
  evaluatedPosition: string
) => {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cw = pw - 2 * m;

  setFill(doc, C.primary);
  doc.rect(0, 0, pw, ph, "F");

  // Dark header band
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

  // Accent line
  setFill(doc, C.white);
  doc.rect(pw / 2 - 30, 58, 60, 1.5, "F");

  // Title
  doc.setFontSize(38);
  doc.setFont("helvetica", "bold");
  doc.text("AVALIACAO", pw / 2, 115, { align: "center" });
  doc.setFontSize(52);
  doc.text("360", pw / 2, 135, { align: "center" });

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
  doc.text(
    new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    m + 25,
    cardY + 55
  );

  // Footer
  doc.setFontSize(7);
  setColor(doc, [180, 200, 255]);
  doc.text("Relatorio gerado por Grou 360 - Documento Confidencial", pw / 2, ph - 12, { align: "center" });
};
