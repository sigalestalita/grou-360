import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCog, Lock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  position: string;
  is_active: boolean;
  password_changed: boolean;
  created_at: string;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Usuário ${!user.is_active ? "ativado" : "inativado"} com sucesso.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openResetPasswordDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma nova senha.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-user-password", {
        body: {
          userId: selectedUser.id,
          newPassword: newPassword,
        },
      });

      if (error) throw error;

      toast({
        title: "Senha resetada",
        description: "A senha foi alterada com sucesso. O usuário deverá trocar a senha no próximo login.",
      });

      setShowPasswordDialog(false);
      setNewPassword("");
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao resetar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Gestão de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Gestão de Usuários
            </CardTitle>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Senha Alterada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.position || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.password_changed ? "outline" : "destructive"}>
                        {user.password_changed ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user)}
                          disabled={actionLoading}
                        >
                          {user.is_active ? "Inativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openResetPasswordDialog(user)}
                          disabled={actionLoading}
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Resetar Senha
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha do Usuário</DialogTitle>
            <DialogDescription>
              Digite a nova senha para {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={actionLoading}>
              {actionLoading ? "Resetando..." : "Resetar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
