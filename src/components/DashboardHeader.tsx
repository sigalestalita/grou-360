import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoIEE from "@/assets/Logo_IEE.svg";

interface User {
  id: string;
  email: string;
  name: string;
  position: string;
}

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

export const DashboardHeader = ({ user, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logoIEE} alt="IEE Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold">Sistema de Feedback 360°</h1>
            <p className="text-sm text-muted-foreground">Instituto de Estudos Empresariais</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.position}</p>
          </div>
          <Button variant="outline" size="icon" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
