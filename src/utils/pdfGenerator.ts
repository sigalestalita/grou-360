import jsPDF from "jspdf";

interface Evaluation {
  evaluator_id: string;
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

interface EvaluatorProfile {
  name: string;
  email: string;
}

export const generateEvaluationReport = (
  evaluatedName: string,
  evaluatedEmail: string,
  evaluatedPosition: string,
  evaluations: Evaluation[],
  evaluatorProfiles: Record<string, EvaluatorProfile>
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  // Título
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Avaliação", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Informações do Avaliado
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${evaluatedName}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Email: ${evaluatedEmail}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Cargo: ${evaluatedPosition}`, margin, yPosition);
  yPosition += 10;

  // Estatísticas
  const avgRating = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)
    : "0";
  
  doc.setFont("helvetica", "bold");
  doc.text(`Total de Avaliações: ${evaluations.length}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Média Geral: ${avgRating}/5`, margin, yPosition);
  yPosition += 15;

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Avaliações individuais
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Avaliações Detalhadas", margin, yPosition);
  yPosition += 10;

  evaluations.forEach((evaluation, index) => {
    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    const evaluatorName = evaluatorProfiles[evaluation.evaluator_id]?.name || "Anônimo";
    const evaluatorEmail = evaluatorProfiles[evaluation.evaluator_id]?.email || "";
    const evaluationDate = new Date(evaluation.created_at).toLocaleDateString("pt-BR");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Avaliação ${index + 1}`, margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Avaliador: ${evaluatorName} (${evaluatorEmail})`, margin, yPosition);
    yPosition += 5;
    doc.text(`Data: ${evaluationDate}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Nota: ${evaluation.rating}/5`, margin, yPosition);
    yPosition += 8;

    // Pontos Fortes
    doc.setFont("helvetica", "bold");
    doc.text("Pontos Fortes:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    const strengthsLines = doc.splitTextToSize(evaluation.strengths, contentWidth);
    doc.text(strengthsLines, margin, yPosition);
    yPosition += strengthsLines.length * 5 + 5;

    // Áreas de Melhoria
    doc.setFont("helvetica", "bold");
    doc.text("Áreas de Melhoria:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    const improvementsLines = doc.splitTextToSize(evaluation.improvements, contentWidth);
    doc.text(improvementsLines, margin, yPosition);
    yPosition += improvementsLines.length * 5 + 10;

    // Linha separadora entre avaliações
    if (index < evaluations.length - 1) {
      doc.setLineWidth(0.2);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    }
  });

  // Salvar PDF
  const fileName = `Relatorio_${evaluatedName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
