import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, value } = await req.json();

    if (!type || !value) {
      return new Response(
        JSON.stringify({ error: 'Missing type or value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type !== 'email' && type !== 'password') {
      return new Response(
        JSON.stringify({ error: 'Invalid setting type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For email updates, verify the format
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For password updates, validate minimum length
    if (type === 'password') {
      if (value.length < 6) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 6 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create Supabase client with service role for database updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine the setting key
    const settingKey = type === 'email' ? 'admin_email' : 'admin_password';

    // Update or insert the setting in the database
    const { error: upsertError } = await supabase
      .from('admin_settings')
      .upsert(
        { setting_key: settingKey, setting_value: value, updated_at: new Date().toISOString() },
        { onConflict: 'setting_key' }
      );

    if (upsertError) {
      console.error('Database error:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save setting' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin setting updated: ${type}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type === 'email' ? 'Email' : 'Password'} updated successfully`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
