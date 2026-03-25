import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { postcode } = await req.json();

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: "Postcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPostcode = postcode.replace(/\s+/g, "").toUpperCase();

    const apiKey = Deno.env.get("IDEAL_POSTCODES_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Ideal Postcodes API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(cleanPostcode)}?api_key=${apiKey}`,
      { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok || data.code !== 2000) {
      const code = data.code;
      if (code === 4040) {
        return new Response(
          JSON.stringify({ error: "Postcode not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (code === 4010) {
        return new Response(
          JSON.stringify({ error: "Invalid API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (code === 4020) {
        return new Response(
          JSON.stringify({ error: "Lookup limit reached" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: data.message || `Address lookup error (${response.status})` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const addresses = (data.result || []).map((addr: any) => {
      const parts = [
        addr.line_1,
        addr.line_2,
        addr.line_3,
        addr.post_town,
        addr.county,
      ].filter((p: string) => p && p.trim() !== "");

      return {
        formatted: parts.join(", "),
        line1: addr.line_1 || "",
        line2: addr.line_2 || "",
        town: addr.post_town || "",
        county: addr.county || "",
      };
    });

    return new Response(
      JSON.stringify({ postcode: cleanPostcode, addresses }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
