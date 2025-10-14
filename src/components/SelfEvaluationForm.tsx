import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Loader2 } from "lucide-react";

interface SelfEvaluationFormProps {
  userId: string;
  onComplete?: () => void;
}

export const SelfEvaluationForm = ({ userId, onComplete }: SelfEvaluationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState<any>(null);
  const [rating, setRating] = useState<number>(3);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");

  useEffect(() => {
    fetchExistingEvaluation();
  }, [userId]);

  const fetchExistingEvaluation = async () => {
    try {
      const { data, error } = await supabase
        .from("self_evaluations")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingEvaluation(data);
        setRating(data.rating);
        setStrengths(data.strengths);
        setImprovements(data.improvements);
      }
    } catch (error: any) {
      console.error("Erro ao carregar autoavaliação:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strengths.trim() || !improvements.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todas as respostas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const evaluationData = {
        user_id: userId,
        rating,
        strengths: strengths.trim(),
        improvements: improvements.trim(),
      };

      if (existingEvaluation) {
        // Update existing evaluation
        const { error } = await supabase
          .from("self_evaluations")
          .update(evaluationData)
          .eq("id", existingEvaluation.id);

        if (error) throw error;

        toast({
          title: "Autoavaliação atualizada",
          description: "Sua autoavaliação foi atualizada com sucesso.",
        });
      } else {
        // Create new evaluation
        const { error } = await supabase
          .from("self_evaluations")
          .insert([evaluationData]);

        if (error) throw error;

        toast({
          title: "Autoavaliação enviada",
          description: "Sua autoavaliação foi registrada com sucesso.",
        });
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autoavaliação</CardTitle>
        <CardDescription>
          Avalie sua própria performance e desenvolvimento na sua função
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Question */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              1. Como você avalia seu desempenho geral na liderança e gestão da pasta nesta diretoria?
            </Label>
            <RadioGroup
              value={rating.toString()}
              onValueChange={(value) => setRating(parseInt(value))}
              className="flex flex-col space-y-2"
            >
              {[
                { value: 5, label: "Excelente" },
                { value: 4, label: "Muito Bom" },
                { value: 3, label: "Bom" },
                { value: 2, label: "Regular" },
                { value: 1, label: "Precisa Melhorar" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`rating-${option.value}`} />
                  <Label
                    htmlFor={`rating-${option.value}`}
                    className="font-normal cursor-pointer flex items-center gap-2"
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < option.value
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span>{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Strengths Question */}
          <div className="space-y-3">
            <Label htmlFor="strengths" className="text-base font-medium">
              2. Na sua visão, quais são as suas maiores fortalezas e potencialidades na liderança e gestão da pasta nesta diretoria?
            </Label>
            <Textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Descreva suas principais fortalezas e potencialidades..."
              className="min-h-32 resize-none"
              required
            />
          </div>

          {/* Improvements Question */}
          <div className="space-y-3">
            <Label htmlFor="improvements" className="text-base font-medium">
              3. E quais são as suas oportunidades de melhorias neste papel?
            </Label>
            <Textarea
              id="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Descreva suas oportunidades de melhoria..."
              className="min-h-32 resize-none"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : existingEvaluation ? (
              "Atualizar Autoavaliação"
            ) : (
              "Enviar Autoavaliação"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
