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

      const { data, error } = await supabase.functions.invoke("create-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const results = data?.results || [];
      const successCount = results.filter((r: any) => r.status === "success").length;
      const skippedCount = results.filter((r: any) => r.status === "skipped").length;
      const errorCount = results.filter((r: any) => r.status === "error").length;

      toast({
        title: "Criação de usuários concluída",
        description: `Criados: ${successCount} | Já existiam: ${skippedCount} | Erros: ${errorCount}`,
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
          Criar Usuários do IEE
        </>
      )}
    </Button>
  );
};
