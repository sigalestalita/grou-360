import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { CreateUsersButton } from "@/components/CreateUsersButton";
import { UserManagement } from "@/components/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileDown, Download } from "lucide-react";
import { Session, User } from "@supabase/supabase-js";
import { generateEvaluationReport, generateAllReports } from "@/utils/pdfGenerator";
import { Footer } from "@/components/Footer";

interface Evaluation {
  id: string;
  evaluator_id: string;
  evaluated_user_email: string;
  evaluated_user_name: string;
  evaluated_user_position: string;
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

interface SelfEvaluation {
  user_id: string;
  rating: number;
  strengths: string;
  improvements: string;
  created_at: string;
}

interface Profile {
  name: string;
  email: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selfEvaluations, setSelfEvaluations] = useState<SelfEvaluation[]>([]);
  const [evaluatorProfiles, setEvaluatorProfiles] = useState<Record<string, Profile>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    checkAdminStatus();
  }, [authChecked, user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evalResult, selfEvalResult] = await Promise.all([
        supabase.from("evaluations").select("*").order("created_at", { ascending: false }),
        supabase.from("self_evaluations").select("*"),
      ]);

      if (evalResult.error) throw evalResult.error;
      if (selfEvalResult.error) throw selfEvalResult.error;

      setEvaluations(evalResult.data || []);
      setSelfEvaluations(selfEvalResult.data || []);

      // Fetch evaluator profiles
      const evaluatorIds = [...new Set(evalResult.data?.map(e => e.evaluator_id) || [])];
      if (evaluatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", evaluatorIds);

        const profilesMap: Record<string, Profile> = {};
        profiles?.forEach(p => {
          profilesMap[p.id] = { name: p.name || "Anônimo", email: p.email };
        });
        setEvaluatorProfiles(profilesMap);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar avaliações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      navigate("/auth", { replace: true });
    }
  };

  const getSelfEvaluationForUser = (userEmail: string): SelfEvaluation | null => {
    // Match self-evaluation by finding the profile with this email, then matching user_id
    const profileEntry = Object.entries(evaluatorProfiles).find(([_, p]) => p.email === userEmail);
    if (profileEntry) {
      const [userId] = profileEntry;
      return selfEvaluations.find(se => se.user_id === userId) || null;
    }
    // Also check evaluations to find user_id from evaluator profiles
    const evalByUser = evaluations.find(e => {
      const profile = evaluatorProfiles[e.evaluator_id];
      return profile?.email === userEmail;
    });
    if (evalByUser) {
      return selfEvaluations.find(se => se.user_id === evalByUser.evaluator_id) || null;
    }
    return null;
  };

  const handleExportPDF = (evaluatedEmail: string) => {
    const userEvaluations = evaluations.filter(
      (e) => e.evaluated_user_email === evaluatedEmail
    );

    if (userEvaluations.length === 0) {
      toast({
        title: "Sem avaliações",
        description: "Não há avaliações para este usuário.",
        variant: "destructive",
      });
      return;
    }

    const firstEval = userEvaluations[0];
    const selfEval = getSelfEvaluationForUser(evaluatedEmail);

    generateEvaluationReport(
      firstEval.evaluated_user_name,
      firstEval.evaluated_user_email,
      firstEval.evaluated_user_position,
      userEvaluations,
      evaluatorProfiles,
      selfEval
    );

    toast({
      title: "PDF gerado",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  const handleExportAll = () => {
    const grouped = Object.values(groupedEvaluations).map((group) => ({
      name: group.name,
      email: group.email,
      position: group.position,
      evaluations: group.evaluations,
      selfEvaluation: getSelfEvaluationForUser(group.email),
    }));

    generateAllReports(grouped, evaluatorProfiles);

    toast({
      title: "PDFs gerados",
      description: `${grouped.length} relatórios foram baixados com sucesso.`,
    });
  };

  // Group evaluations by evaluated user
  const groupedEvaluations = evaluations.reduce((acc, evaluation) => {
    const key = evaluation.evaluated_user_email;
    if (!acc[key]) {
      acc[key] = {
        name: evaluation.evaluated_user_name,
        email: evaluation.evaluated_user_email,
        position: evaluation.evaluated_user_position,
        evaluations: [],
        avgRating: 0,
      };
    }
    acc[key].evaluations.push(evaluation);
    return acc;
  }, {} as Record<string, { name: string; email: string; position: string; evaluations: Evaluation[]; avgRating: number }>);

  Object.values(groupedEvaluations).forEach((group) => {
    const sum = group.evaluations.reduce((acc, e) => acc + e.rating, 0);
    group.avgRating = sum / group.evaluations.length;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <DashboardHeader
        user={{
          id: user?.id || "",
          email: user?.email || "",
          name: "Administrador",
          position: "Admin",
        }}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <CreateUsersButton />
        </div>

        <UserManagement />

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : evaluations.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhuma avaliação encontrada.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div>
              <h2 className="text-3xl font-bold mb-6">Analytics das Avaliações</h2>
              <AdminAnalytics evaluations={evaluations} />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">Relatórios Individuais</CardTitle>
                <Button onClick={handleExportAll} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todos os Relatórios
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Avaliado</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Nº Avaliações</TableHead>
                        <TableHead>Média</TableHead>
                        <TableHead>Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(groupedEvaluations).map((group) => (
                        <TableRow key={group.email}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{group.name}</div>
                              <div className="text-muted-foreground text-xs">{group.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{group.position}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{group.evaluations.length}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={group.avgRating >= 4 ? "default" : "secondary"}>
                              {group.avgRating.toFixed(1)}/5
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportPDF(group.email)}
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Exportar PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Todas as Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Avaliador</TableHead>
                        <TableHead>Avaliado</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Nota</TableHead>
                        <TableHead>Pontos Fortes</TableHead>
                        <TableHead>Melhorias</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluations.map((evaluation) => (
                        <TableRow key={evaluation.id}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {evaluatorProfiles[evaluation.evaluator_id]?.name || "Carregando..."}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {evaluatorProfiles[evaluation.evaluator_id]?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{evaluation.evaluated_user_name}</div>
                              <div className="text-muted-foreground text-xs">
                                {evaluation.evaluated_user_email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {evaluation.evaluated_user_position}
                          </TableCell>
                          <TableCell>
                            <Badge variant={evaluation.rating >= 4 ? "default" : "secondary"}>
                              {evaluation.rating}/5
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm line-clamp-2">{evaluation.strengths}</p>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm line-clamp-2">{evaluation.improvements}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(evaluation.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
