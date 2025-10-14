import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserToCreate {
  email: string;
  name: string;
  position: string;
}

const usersToCreate: UserToCreate[] = [
  { email: "presidencia@iee.com.br", name: "Tiago Dinon Carpenedo", position: "Presidente" },
  { email: "vp@iee.com.br", name: "Hugo de Oliveira Muller", position: "Vice-Presidente" },
  { email: "diretoriaeventos@iee.com.br", name: "Alan Martins Elbling", position: "Diretor de Eventos" },
  { email: "diretoriaformacao@iee.com.br", name: "Gustavo Corrêa Fernandes", position: "Diretor de Formação" },
  { email: "diretoriacomunicacao@iee.com.br", name: "Milena Waitikoski Pedroso", position: "Diretora de Comunicação" },
  { email: "diretoriafinanceira@iee.com.br", name: "Rodrigo Villa Real Mello", position: "Diretor Financeiro" },
  { email: "diretoriaforum@iee.com.br", name: "Victoria Werner De Nadal", position: "Diretora de Relações Institucionais e do Fórum da Liberdade" }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requester is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      throw new Error('User is not an admin');
    }

    const results = [];
    const defaultPassword = "Grou@2025";

    for (const userData of usersToCreate) {
      console.log(`Creating user: ${userData.email}`);
      
      // Check if user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingProfile) {
        console.log(`User ${userData.email} already exists, skipping`);
        results.push({
          email: userData.email,
          status: 'skipped',
          message: 'User already exists'
        });
        continue;
      }

      // Create auth user
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          position: userData.position
        }
      });

      if (createError) {
        console.error(`Error creating user ${userData.email}:`, createError);
        results.push({
          email: userData.email,
          status: 'error',
          message: createError.message
        });
        continue;
      }

      // Update profile to set password_changed to false
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ password_changed: false })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error(`Error updating profile for ${userData.email}:`, updateError);
      }

      results.push({
        email: userData.email,
        status: 'success',
        message: 'User created successfully'
      });
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-users function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
