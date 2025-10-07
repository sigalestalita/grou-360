import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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

interface AdminAnalyticsProps {
  evaluations: Evaluation[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AdminAnalytics = ({ evaluations }: AdminAnalyticsProps) => {
  // Calcular estatísticas por avaliado
  const evaluatedStats = evaluations.reduce((acc, evaluation) => {
    const key = evaluation.evaluated_user_email;
    if (!acc[key]) {
      acc[key] = {
        name: evaluation.evaluated_user_name,
        email: evaluation.evaluated_user_email,
        position: evaluation.evaluated_user_position,
        totalRating: 0,
        count: 0,
        ratings: [],
      };
    }
    acc[key].totalRating += evaluation.rating;
    acc[key].count += 1;
    acc[key].ratings.push(evaluation.rating);
    return acc;
  }, {} as Record<string, { name: string; email: string; position: string; totalRating: number; count: number; ratings: number[] }>);

  const avgRatingsData = Object.values(evaluatedStats).map(stat => ({
    name: stat.name,
    avgRating: (stat.totalRating / stat.count).toFixed(1),
    count: stat.count,
  }));

  // Distribuição de notas
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} estrela${rating > 1 ? 's' : ''}`,
    count: evaluations.filter(e => e.rating === rating).length,
  }));

  // Estatísticas gerais
  const totalEvaluations = evaluations.length;
  const avgRating = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)
    : "0";
  const uniqueEvaluators = new Set(evaluations.map(e => e.evaluator_id)).size;
  const uniqueEvaluated = Object.keys(evaluatedStats).length;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avaliadores Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueEvaluators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pessoas Avaliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueEvaluated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Média de Avaliação por Pessoa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgRatingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avgRating" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rating, count }) => `${rating}: ${count}`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
