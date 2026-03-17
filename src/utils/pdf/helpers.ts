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

/** Dark gradient header with branding + person name */
export const drawPageHeader = (doc: jsPDF, pw: number, name: string) => {
  const headerH = 58;
  const steps = 40;
  const stepH = headerH / steps;

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(35 + t * 45);
    const g = Math.round(28 + t * 22);
    const b = Math.round(22 + t * 15);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stepH, pw, stepH + 0.5, "F");
  }

  // "grou" brand
  doc.setFontSize(16);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text("grou", pw / 2, 14, { align: "center" });

  // "FEEDBACK 360°"
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  setColor(doc, C.white);
  doc.text("FEEDBACK 360", pw / 2 - 1, 22, { align: "center" });
  // degree symbol as "o"
  doc.setFontSize(7);
  const fw = doc.getTextWidth("FEEDBACK 360");
  doc.text("o", pw / 2 + fw / 2, 19);

  // "Relatório Individual"
  doc.setFontSize(28);
  doc.setFont("helvetica", "normal");
  setColor(doc, C.white);
  const relText = "Relat\u00F3rio ";
  const indText = "Individual";
  const relW = doc.getTextWidth(relText);
  const indW = doc.getTextWidth(indText);
  const totalW = relW + indW;
  const startX = (pw - totalW) / 2;
  doc.text(relText, startX, 36);

  doc.setFont("helvetica", "bold");
  setColor(doc, C.orange);
  doc.text(indText, startX + relW, 36);

  // Person name
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  setColor(doc, [190, 180, 170]);
  doc.text(sanitizeText(name), pw / 2, 46, { align: "center" });
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

export const checkPage = (doc: jsPDF, y: number, need: number, ph: number, pw: number, name?: string): number => {
  if (y + need > ph - 25) {
    doc.addPage();
    if (name) {
      drawPageHeader(doc, pw, name);
      return 66;
    }
    return 18;
  }
  return y;
};

export const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxW: number, ph: number, pw: number, name?: string): number => {
  const lines: string[] = doc.splitTextToSize(sanitizeText(text) || "-", maxW);
  let cy = y;
  for (const line of lines) {
    cy = checkPage(doc, cy, 5, ph, pw, name);
    doc.text(line, x, cy);
    cy += 4.5;
  }
  return cy;
};

export const drawRatingBar = (doc: jsPDF, x: number, y: number, rating: number, w: number = 50, h: number = 7) => {
  // Background
  setFill(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");

  // Filled portion - orange gradient simulated
  const fw = Math.max((rating / 5) * w, h);
  // Draw gradient bar with strips
  const steps = 20;
  const stepW = fw / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(243 + t * 12);
    const g = Math.round(115 + t * 50);
    const b = Math.round(33 + t * 57);
    doc.setFillColor(Math.min(r, 255), Math.min(g, 255), Math.min(b, 255));
    const sx = x + i * stepW;
    if (i === 0) {
      doc.roundedRect(sx, y, stepW + 1, h, h / 2, 0, "F");
    } else if (i === steps - 1) {
      doc.roundedRect(sx, y, stepW, h, 0, h / 2, "F");
    } else {
      doc.rect(sx, y, stepW + 0.5, h, "F");
    }
  }
  // Clean edges with rounded overlay
  setFill(doc, C.orange);
  doc.roundedRect(x, y, fw, h, h / 2, h / 2, "F");
  // Re-draw gradient on top but keep rounded
  // Actually let's keep it simple - solid orange with slight gradient feel
  // The roundedRect already looks good

  // Rating text
  doc.setFontSize(7);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text(`${rating.toFixed(1)}`, x + fw / 2, y + h / 2 + 2, { align: "center" });
};

export const drawSectionTitle = (doc: jsPDF, title: string, x: number, y: number): number => {
  const safeTitle = sanitizeText(title);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(doc, C.dark);
  doc.text(safeTitle, x, y);
  return y + 10;
};

export const drawKpiCard = (doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, sub?: string) => {
  // Orange rounded card
  setFill(doc, C.orange);
  doc.roundedRect(x, y, w, h, 4, 4, "F");

  doc.setFontSize(7);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(label).toUpperCase(), x + w / 2, y + 10, { align: "center" });

  doc.setFontSize(28);
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizeText(value), x + w / 2, y + 28, { align: "center" });

  if (sub) {
    doc.setFontSize(7);
    setColor(doc, C.white);
    doc.setFont("helvetica", "normal");
    doc.text(sanitizeText(sub), x + w / 2, y + 35, { align: "center" });
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
