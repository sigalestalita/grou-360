import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  position: string;
}

interface EvaluationFormProps {
  evaluatedUser: User;
  existingEvaluation?: {
    rating: number;
    strengths: string;
    improvements: string;
  };
  onSubmit: (data: { rating: number; strengths: string; improvements: string }) => void;
  onBack: () => void;
}

const ratingOptions = [
  { value: "5", label: "5 - Supera o esperado" },
  { value: "4", label: "4 - Atende plenamente" },
  { value: "3", label: "3 - Atende parcialmente" },
  { value: "2", label: "2 - Atende minimamente" },
  { value: "1", label: "1 - Não atende" },
];

export const EvaluationForm = ({
  evaluatedUser,
  existingEvaluation,
  onSubmit,
  onBack,
}: EvaluationFormProps) => {
  const [rating, setRating] = useState(existingEvaluation?.rating?.toString() || "");
  const [strengths, setStrengths] = useState(existingEvaluation?.strengths || "");
  const [improvements, setImprovements] = useState(existingEvaluation?.improvements || "");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma nota.",
        variant: "destructive",
      });
      return;
    }

    if (!strengths.trim() || !improvements.trim()) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, preencha todas as perguntas descritivas.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      rating: parseInt(rating),
      strengths: strengths.trim(),
      improvements: improvements.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Avaliação de {evaluatedUser.name}
            </CardTitle>
            <p className="text-muted-foreground">{evaluatedUser.position}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Question 1 - Rating */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  1. Como você avalia a gestão da pasta de {evaluatedUser.name} | {evaluatedUser.position}?
                </Label>
                <RadioGroup value={rating} onValueChange={setRating}>
                  {ratingOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`rating-${option.value}`} />
                      <Label htmlFor={`rating-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 2 - Strengths */}
              <div className="space-y-4">
                <Label htmlFor="strengths" className="text-base font-semibold">
                  2. Na sua visão quais são os maiores talentos de {evaluatedUser.name} na liderança e gestão da pasta?
                </Label>
                <Textarea
                  id="strengths"
                  placeholder="Descreva os principais pontos fortes..."
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Question 3 - Improvements */}
              <div className="space-y-4">
                <Label htmlFor="improvements" className="text-base font-semibold">
                  3. Quais são as oportunidades de melhoria que você acredita que {evaluatedUser.name} pudesse intervir, alavancaria performance e/ou teria um impacto mais favorável sobre sua liderança?
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="Descreva as oportunidades de melhoria..."
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                {existingEvaluation ? "Atualizar Avaliação" : "Enviar Avaliação"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
