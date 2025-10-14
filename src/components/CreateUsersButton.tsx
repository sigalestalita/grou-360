import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";

export const CreateUsersButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar autenticado");
      }

      const { data, error } = await supabase.functions.invoke("create-evaluation-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const successCount = data.results.filter((r: any) => r.success).length;
      const failCount = data.results.filter((r: any) => !r.success).length;

      toast({
        title: "Usuários criados",
        description: `${successCount} usuários criados com sucesso${failCount > 0 ? `, ${failCount} falharam` : ""}.`,
      });

      console.log("Resultados:", data.results);
    } catch (error: any) {
      console.error("Erro ao criar usuários:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateUsers} 
      disabled={loading}
      className="w-full md:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Criando usuários...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Criar Usuários de Avaliação
        </>
      )}
    </Button>
  );
};
