import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/DashboardHeader";
import { UserCard } from "@/components/UserCard";
import { EvaluationForm } from "@/components/EvaluationForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import logoVerde from "@/assets/Logo_Verde.webp";

interface Profile {
  id: string;
  email: string;
  name: string;
  position: string;
}

interface Evaluation {
  rating: number;
  strengths: string;
  improvements: string;
}

// Mock data for users that can be evaluated
const mockUsers: Profile[] = [
  { id: "1", email: "presidencia@iee.com.br", name: "Tiago Dinon Carpenedo", position: "Presidente" },
  { id: "2", email: "vp@iee.com.br", name: "Hugo de Oliveira Muller", position: "Vice-Presidente" },
  { id: "3", email: "diretoriaeventos@iee.com.br", name: "Alan Martins Elbling", position: "Diretor de Eventos" },
  { id: "4", email: "diretoriaformacao@iee.com.br", name: "Gustavo Corrêa Fernandes", position: "Diretor de Formação" },
  { id: "5", email: "diretoriacomunicacao@iee.com.br", name: "Milena Waitikoski Pedroso", position: "Diretora de Comunicação" },
  { id: "6", email: "diretoriafinanceira@iee.com.br", name: "Rodrigo Villa Real Mello", position: "Diretor Financeiro" },
  { id: "7", email: "diretoriaforum@iee.com.br", name: "Victoria Werner De Nadal", position: "Diretora de Relações Institucionais e do Fórum da Liberdade" },
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile();
    checkAdminStatus();
    fetchMyEvaluations();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data);
  };

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const fetchMyEvaluations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("evaluator_id", user.id);

    if (error) {
      console.error("Error fetching evaluations:", error);
      return;
    }

    const evaluationsMap: Record<string, Evaluation> = {};
    data?.forEach(evaluation => {
      evaluationsMap[evaluation.evaluated_user_email] = {
        rating: evaluation.rating,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      };
    });
    setEvaluations(evaluationsMap);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleEvaluate = (evaluatedUser: Profile) => {
    setSelectedUser(evaluatedUser);
  };

  const handleSubmitEvaluation = async (data: Evaluation) => {
    if (!selectedUser || !user) return;

    try {
      // Check if evaluation already exists
      const { data: existingEvaluation } = await supabase
        .from("evaluations")
        .select("id")
        .eq("evaluator_id", user.id)
        .eq("evaluated_user_email", selectedUser.email)
        .maybeSingle();

      if (existingEvaluation) {
        // Update existing evaluation
        const { error } = await supabase
          .from("evaluations")
          .update({
            rating: data.rating,
            strengths: data.strengths,
            improvements: data.improvements,
          })
          .eq("id", existingEvaluation.id);

        if (error) throw error;
      } else {
        // Create new evaluation
        const { error } = await supabase
          .from("evaluations")
          .insert({
            evaluator_id: user.id,
            evaluated_user_email: selectedUser.email,
            evaluated_user_name: selectedUser.name,
            evaluated_user_position: selectedUser.position,
            rating: data.rating,
            strengths: data.strengths,
            improvements: data.improvements,
          });

        if (error) throw error;
      }

      setEvaluations(prev => ({
        ...prev,
        [selectedUser.email]: data
      }));

      toast({
        title: "Avaliação enviada",
        description: `Sua avaliação de ${selectedUser.name} foi registrada com sucesso.`,
      });
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar avaliação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user || !profile) {
    return null;
  }

  // Evaluation form screen
  if (selectedUser) {
    return (
      <EvaluationForm
        evaluatedUser={{
          id: selectedUser.id,
          email: selectedUser.email,
          name: selectedUser.name,
          position: selectedUser.position,
        }}
        existingEvaluation={evaluations[selectedUser.email]}
        onSubmit={handleSubmitEvaluation}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  // Dashboard screen
  const otherUsers = mockUsers.filter(u => u.email !== user.email);
  const completedEvaluations = Object.keys(evaluations).length;
  const totalEvaluations = otherUsers.length;
  const progress = totalEvaluations > 0 ? (completedEvaluations / totalEvaluations) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <DashboardHeader
        user={{
          id: profile.id,
          email: profile.email,
          name: profile.name || "Usuário",
          position: profile.position || "Cargo",
        }}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        {isAdmin && (
          <div className="mb-6">
            <Link to="/admin">
              <Button variant="outline" className="w-full md:w-auto">
                <Shield className="mr-2 h-4 w-4" />
                Acessar Painel Admin
              </Button>
            </Link>
          </div>
        )}

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Progresso das Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedEvaluations} de {totalEvaluations} avaliações concluídas
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Avalie seus colegas</h2>
          <p className="text-muted-foreground">
            Selecione um membro da equipe para avaliar sua gestão e liderança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherUsers.map((evaluatedUser) => (
            <UserCard
              key={evaluatedUser.id}
              user={{
                id: evaluatedUser.id,
                email: evaluatedUser.email,
                name: evaluatedUser.name,
                position: evaluatedUser.position,
              }}
              isEvaluated={!!evaluations[evaluatedUser.email]}
              onEvaluate={() => handleEvaluate(evaluatedUser)}
            />
          ))}
        </div>
      </main>
      
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Desenvolvido por</span>
            <img src={logoVerde} alt="Grow" className="h-6" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
