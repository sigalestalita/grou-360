import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { DashboardHeader } from "@/components/DashboardHeader";
import { UserCard } from "@/components/UserCard";
import { EvaluationForm } from "@/components/EvaluationForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface User {
  id: string;
  email: string;
  name: string;
  position: string;
  mustChangePassword: boolean;
}

interface Evaluation {
  rating: number;
  strengths: string;
  improvements: string;
}

// Mock data for demonstration
const mockUsers: User[] = [
  { id: "1", email: "presidencia@iee.com.br", name: "Tiago Dinon Carpenedo", position: "Presidente", mustChangePassword: false },
  { id: "2", email: "vp@iee.com.br", name: "Hugo de Oliveira Muller", position: "Vice-Presidente", mustChangePassword: false },
  { id: "3", email: "diretoriaeventos@iee.com.br", name: "Alan Martins Elbling", position: "Diretor de Eventos", mustChangePassword: false },
  { id: "4", email: "diretoriaformacao@iee.com.br", name: "Gustavo Corrêa Fernandes", position: "Diretor de Formação", mustChangePassword: false },
  { id: "5", email: "diretoriacomunicacao@iee.com.br", name: "Milena Waitikoski Pedroso", position: "Diretora de Comunicação", mustChangePassword: false },
  { id: "6", email: "diretoriafinanceira@iee.com.br", name: "Rodrigo Villa Real Mello", position: "Diretor Financeiro", mustChangePassword: false },
  { id: "7", email: "diretoriaforum@iee.com.br", name: "Victoria Werner De Nadal", position: "Diretora de Relações Institucionais e do Fórum da Liberdade", mustChangePassword: false },
];

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Mock login - check password is "1234"
    if (password !== "1234") {
      toast({
        title: "Erro de autenticação",
        description: "Senha incorreta. Use a senha provisória: 1234",
        variant: "destructive",
      });
      return;
    }

    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser({ ...user, mustChangePassword: true });
      setShowChangePassword(true);
      toast({
        title: "Login realizado",
        description: "Por favor, altere sua senha provisória.",
      });
    } else {
      toast({
        title: "Usuário não encontrado",
        description: "Email não cadastrado no sistema.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChanged = (newPassword: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, mustChangePassword: false });
      setShowChangePassword(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedUser(null);
    setEvaluations({});
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const handleEvaluate = (user: User) => {
    setSelectedUser(user);
  };

  const handleSubmitEvaluation = (data: Evaluation) => {
    if (selectedUser) {
      setEvaluations(prev => ({
        ...prev,
        [selectedUser.id]: data
      }));
      toast({
        title: "Avaliação enviada",
        description: `Sua avaliação de ${selectedUser.name} foi registrada com sucesso.`,
      });
      setSelectedUser(null);
    }
  };

  // Login screen
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Evaluation form screen
  if (selectedUser) {
    return (
      <EvaluationForm
        evaluatedUser={selectedUser}
        existingEvaluation={evaluations[selectedUser.id]}
        onSubmit={handleSubmitEvaluation}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  // Dashboard screen
  const otherUsers = mockUsers.filter(u => u.id !== currentUser.id);
  const completedEvaluations = Object.keys(evaluations).length;
  const totalEvaluations = otherUsers.length;
  const progress = (completedEvaluations / totalEvaluations) * 100;

  return (
    <>
      <ChangePasswordDialog
        open={showChangePassword}
        onPasswordChanged={handlePasswordChanged}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <DashboardHeader user={currentUser} onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 py-8">
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
            {otherUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isEvaluated={!!evaluations[user.id]}
                onEvaluate={() => handleEvaluate(user)}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
