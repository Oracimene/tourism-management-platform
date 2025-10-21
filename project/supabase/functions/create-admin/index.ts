import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'ADM1212@admin.com',
      password: 'ACAD',
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Admin já existe',
            email: 'ADM1212@admin.com',
            password: 'ACAD'
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          },
        );
      }
      throw authError;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Administrador',
        role: 'admin',
      });

    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin criado com sucesso',
        email: 'ADM1212@admin.com',
        password: 'ACAD'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});