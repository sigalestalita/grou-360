import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const users = [
  { email: "presidencia@iee.com.br", name: "Tiago Dinon Carpenedo", position: "Presidente" },
  { email: "vp@iee.com.br", name: "Hugo de Oliveira Muller", position: "Vice-Presidente" },
  { email: "diretoriaeventos@iee.com.br", name: "Alan Martins Elbling", position: "Diretor de Eventos" },
  { email: "diretoriaformacao@iee.com.br", name: "Gustavo Corrêa Fernandes", position: "Diretor de Formação" },
  { email: "diretoriacomunicacao@iee.com.br", name: "Milena Waitikoski Pedroso", position: "Diretora de Comunicação" },
  { email: "diretoriafinanceira@iee.com.br", name: "Rodrigo Villa Real Mello", position: "Diretor Financeiro" },
  { email: "diretoriaforum@iee.com.br", name: "Victoria Werner De Nadal", position: "Diretora de Relações Institucionais e do Fórum da Liberdade" },
];

const DEFAULT_PASSWORD = "Grou@2025";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseAdmin
      .rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (!isAdmin) {
      throw new Error("User is not an admin");
    }

    const results = [];

    for (const userData of users) {
      console.log(`Creating user: ${userData.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          position: userData.position,
        },
      });

      if (authError) {
        console.error(`Error creating user ${userData.email}:`, authError);
        results.push({
          email: userData.email,
          success: false,
          error: authError.message,
        });
        continue;
      }

      // Update profile to ensure password_changed is false
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ password_changed: false })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error(`Error updating profile for ${userData.email}:`, profileError);
      }

      results.push({
        email: userData.email,
        success: true,
        userId: authData.user.id,
      });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in create-evaluation-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
