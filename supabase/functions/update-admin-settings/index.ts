import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

    // Note: In a production environment, you would update the secrets programmatically
    // For now, we'll just validate and return success
    // The actual secret update would need to be done through the Supabase dashboard or CLI
    
    console.log(`Request to update ${type === 'email' ? 'ADMIN_EMAIL' : 'ADMIN_PASSWORD'}`);
    console.log(`New value: ${type === 'email' ? value : '[REDACTED]'}`);

    // For email updates, we can verify the format
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

    // In a real implementation, you would use Supabase Management API to update secrets
    // For now, we log the request and inform the admin to update manually
    console.log(`Admin setting update requested: ${type}`);
    
    // Return success - in production this would actually update the secret
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type === 'email' ? 'Email' : 'Password'} update request received. Please update the ${type === 'email' ? 'ADMIN_EMAIL' : 'ADMIN_PASSWORD'} secret manually in the backend settings.`
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
