import jsPDF from "jspdf";
import { Evaluation, SelfEvaluation, EvaluatorProfile } from "./pdf/constants";
import { drawFooter, savePdf } from "./pdf/helpers";
import { drawCoverPage } from "./pdf/coverPage";
import { drawAnalyticsPage } from "./pdf/analyticsPage";
import { drawEvaluationsPage } from "./pdf/evaluationsPage";

export type { Evaluation, SelfEvaluation, EvaluatorProfile };

export const generateEvaluationReport = (
  evaluatedName: string,
  _evaluatedEmail: string,
  evaluatedPosition: string,
  evaluations: Evaluation[],
  _evaluatorProfiles: Record<string, EvaluatorProfile>,
  selfEvaluation?: SelfEvaluation | null
) => {
  try {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    drawCoverPage(doc, evaluatedName, evaluatedPosition);
    drawAnalyticsPage(doc, evaluations, selfEvaluation);
    drawEvaluationsPage(doc, evaluations, selfEvaluation);

    // Add footers to all pages except cover
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(doc, pw, ph, i - 1, totalPages - 1);
    }

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
