import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProxyRequestBody {
  endpoint: "list" | "search" | "translations";
  params?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Kodik proxy request received");
    const { endpoint, params }: ProxyRequestBody = await req.json();
    console.log("📝 Request data:", { endpoint, params });

    if (!endpoint || !["list", "search", "translations"].includes(endpoint)) {
      console.error("❌ Invalid endpoint:", endpoint);
      return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("KODIK_API_TOKEN") ?? "54eb773d434f45f4c9bb462bc3ce0342";
    const targetUrl = `https://kodikapi.com/${endpoint}?token=${token}`;
    console.log("🎯 Target URL:", targetUrl);
    console.log("📤 Sending params:", JSON.stringify(params));

    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params ?? {}),
    });

    console.log("📡 Kodik API response status:", upstream.status);
    const text = await upstream.text();
    console.log("📨 Response length:", text.length);
    
    // Try to parse response to check if it's valid JSON
    try {
      const parsed = JSON.parse(text);
      console.log("✅ Response parsed successfully, results:", parsed.results?.length || 0);
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", parseError);
      console.log("Raw response:", text.substring(0, 500) + "...");
    }

    return new Response(text, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ kodik-proxy error:", err?.message || err);
    return new Response(
      JSON.stringify({ error: "Failed to proxy request", details: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});