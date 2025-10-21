export async function createAdminUser() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/create-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error response:', data);
      return { success: false, error: data.error || 'Erro ao criar admin' };
    }

    return {
      success: true,
      credentials: {
        email: 'ADM1212@admin.com',
        password: 'ACAD'
      }
    };
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return { success: false, error };
  }
}
