import jsPDF from "jspdf";
import { COLORS as C, RGB, MARGIN as m } from "./constants";

export const sanitizeText = (text: string): string => {
  if (!text) return "";
  let s = String(text);
  s = s.replace(/[\u201C\u201D]/g, '"');
  s = s.replace(/[\u2018\u2019]/g, "'");
  s = s.replace(/\u2014/g, "--");
  s = s.replace(/\u2013/g, "-");
  s = s.replace(/\u2026/g, "...");
  s = s.replace(/[^\x00-\xFF]/g, "");
  return s;
};

export const setColor = (doc: jsPDF, color: RGB) =>
  doc.setTextColor(color[0], color[1], color[2]);

export const setFill = (doc: jsPDF, color: RGB) =>
  doc.setFillColor(color[0], color[1], color[2]);

export const setDraw = (doc: jsPDF, color: RGB) =>
  doc.setDrawColor(color[0], color[1], color[2]);

export const drawHeader = (doc: jsPDF, w: number) => {
  setFill(doc, C.primary);
  doc.rect(0, 0, w, 6, "F");
  setFill(doc, C.accent);
  doc.rect(0, 6, w, 1.5, "F");
};

export const drawFooter = (doc: jsPDF, w: number, h: number, page: number, total: number) => {
  setDraw(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(20, h - 18, w - 20, h - 18);

  doc.setFontSize(7);
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.text(`Pagina ${page} de ${total}`, w / 2, h - 12, { align: "center" });
  doc.text("Relatorio Confidencial - Grou 360", w / 2, h - 7, { align: "center" });
};

export const checkPage = (doc: jsPDF, y: number, need: number, ph: number, pw: number): number => {
  if (y + need > ph - 25) {
    doc.addPage();
    drawHeader(doc, pw);
    return 18;
  }
  return y;
};

export const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxW: number, ph: number, pw: number): number => {
  const lines: string[] = doc.splitTextToSize(sanitizeText(text) || "-", maxW);
  let cy = y;
  for (const line of lines) {
    cy = checkPage(doc, cy, 5, ph, pw);
    doc.text(line, x, cy);
    cy += 4.5;
  }
  return cy;
};

export const drawRatingBar = (doc: jsPDF, x: number, y: number, rating: number, w: number = 50, h: number = 6) => {
  setFill(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");

  const fw = Math.max((rating / 5) * w, h);
  const color: RGB = rating >= 4 ? C.accent : rating >= 3 ? C.amber : C.red;
  setFill(doc, color);
  doc.roundedRect(x, y, fw, h, h / 2, h / 2, "F");

  doc.setFontSize(7);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text(`${rating.toFixed(1)}`, x + fw / 2, y + h / 2 + 2, { align: "center" });
};

export const drawSectionTitle = (doc: jsPDF, title: string, x: number, y: number, color: RGB = C.primary): number => {
  const safeTitle = sanitizeText(title);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(safeTitle, x, y);
  setDraw(doc, color);
  doc.setLineWidth(0.8);
  doc.line(x, y + 2, x + doc.getTextWidth(safeTitle), y + 2);
  return y + 10;
};

export const drawKpiCard = (doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, sub?: string) => {
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

export const savePdf = (doc: jsPDF, fileName: string) => {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
