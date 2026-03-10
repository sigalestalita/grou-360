import jsPDF from "jspdf";
import JSZip from "jszip";
import { Evaluation, SelfEvaluation, EvaluatorProfile } from "./pdf/constants";
import { drawFooter, savePdf } from "./pdf/helpers";
import { drawCoverPage } from "./pdf/coverPage";
import { drawAnalyticsPage } from "./pdf/analyticsPage";
import { drawEvaluationsPage } from "./pdf/evaluationsPage";

export type { Evaluation, SelfEvaluation, EvaluatorProfile };

const buildReport = (
  evaluatedName: string,
  evaluatedPosition: string,
  evaluations: Evaluation[],
  selfEvaluation?: SelfEvaluation | null
): jsPDF => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  drawCoverPage(doc, evaluatedName, evaluatedPosition);
  drawAnalyticsPage(doc, evaluations, selfEvaluation);
  drawEvaluationsPage(doc, evaluations, selfEvaluation);

  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, pw, ph, i - 1, totalPages - 1);
  }

  return doc;
};

export const generateEvaluationReport = (
  evaluatedName: string,
  _evaluatedEmail: string,
  evaluatedPosition: string,
  evaluations: Evaluation[],
  _evaluatorProfiles: Record<string, EvaluatorProfile>,
  selfEvaluation?: SelfEvaluation | null
) => {
  try {
    const doc = buildReport(evaluatedName, evaluatedPosition, evaluations, selfEvaluation);
    const fileName = `Avaliacao360_${evaluatedName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    savePdf(doc, fileName);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error, (error as Error)?.stack);
    throw error;
  }
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

export const generateAllReportsAsZip = async (
  groupedData: Array<{
    name: string;
    email: string;
    position: string;
    evaluations: Evaluation[];
    selfEvaluation?: SelfEvaluation | null;
  }>,
) => {
  const zip = new JSZip();
  const date = new Date().toISOString().split("T")[0];

  for (const member of groupedData) {
    try {
      const doc = buildReport(member.name, member.position, member.evaluations, member.selfEvaluation);
      const blob = doc.output("blob");
      const fileName = `Avaliacao360_${member.name.replace(/\s+/g, "_")}_${date}.pdf`;
      zip.file(fileName, blob);
    } catch (error) {
      console.error(`Erro ao gerar PDF para ${member.name}:`, error);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Relatorios_360_${date}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
