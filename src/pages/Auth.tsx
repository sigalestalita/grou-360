import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import logoIEE from "@/assets/Logo_IEE.svg";
import { z } from "zod";
import { Footer } from "@/components/Footer";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/", {
          replace: true
        });
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/", {
          replace: true
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword
    });
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      if (error) throw error;
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta."
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = z.string().email("Email inválido").safeParse(resetEmail);
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um email válido",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) throw error;
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
      setResetEmail("");
      setShowPasswordReset(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={logoIEE} alt="IEE" className="h-16" />
          </div>
          <div>
            <CardTitle className="text-2xl text-center">Sistema de Avaliações</CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!showPasswordReset ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input 
                  id="login-password" 
                  type="password" 
                  placeholder="••••••" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <button 
                type="button" 
                onClick={() => setShowPasswordReset(true)} 
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={resetEmail} 
                  onChange={e => setResetEmail(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
              <button 
                type="button" 
                onClick={() => setShowPasswordReset(false)} 
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar ao login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
      <Footer />
    </div>;
};
export default Auth;