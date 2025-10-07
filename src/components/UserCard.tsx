import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  position: string;
}

interface UserCardProps {
  user: User;
  isEvaluated: boolean;
  onEvaluate: () => void;
}

export const UserCard = ({ user, isEvaluated, onEvaluate }: UserCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.position}</p>
          </div>
          {isEvaluated ? (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Avaliado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted">
              <Circle className="h-3 w-3 mr-1" />
              Pendente
            </Badge>
          )}
        </div>
        <Button
          onClick={onEvaluate}
          className="w-full"
          variant={isEvaluated ? "outline" : "default"}
        >
          {isEvaluated ? "Ver Avaliação" : "Avaliar"}
        </Button>
      </CardContent>
    </Card>
  );
};
