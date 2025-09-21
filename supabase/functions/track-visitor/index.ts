
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the visitor's IP
    let ip = req.headers.get('x-forwarded-for') || 'unknown';
    // Clean the IP (sometimes x-forwarded-for includes multiple IPs)
    ip = ip.split(',')[0].trim();

    const { data: existingVisitor, error: checkError } = await supabaseClient
      .from('user_visits')
      .select('id')
      .eq('ip_address', ip)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking visitor:', checkError);
      throw checkError;
    }

    if (!existingVisitor) {
      // Record new visitor
      const { error: insertError } = await supabaseClient
        .from('user_visits')
        .insert({
          ip_address: ip,
          user_agent: req.headers.get('user-agent') || 'unknown',
          user_id: crypto.randomUUID()
        });

      if (insertError) {
        console.error('Error inserting visitor:', insertError);
        throw insertError;
      }
    }

    // Get total visitor count
    const { data: visitorCount, error: countError } = await supabaseClient
      .from('user_visits')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('Error counting visitors:', countError);
      throw countError;
    }

    return new Response(
      JSON.stringify({ 
        count: visitorCount.length,
        success: true 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
