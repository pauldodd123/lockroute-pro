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

    const apiKey = Deno.env.get("GETADDRESS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "getAddress API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://api.getAddress.io/find/${encodeURIComponent(cleanPostcode)}?api-key=${apiKey}&expand=true`,
      { method: "GET" }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 404) {
        return new Response(
          JSON.stringify({ error: "Postcode not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Lookup limit reached for today" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Address lookup error (${status})` }),
        { status: status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const addresses = (data.addresses || []).map((addr: any) => {
      const parts = [
        addr.line_1,
        addr.line_2,
        addr.line_3,
        addr.line_4,
        addr.locality,
        addr.town_or_city,
        addr.county,
      ].filter((p: string) => p && p.trim() !== "");

      return {
        formatted: parts.join(", "),
        line1: addr.line_1 || "",
        line2: addr.line_2 || "",
        town: addr.town_or_city || "",
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
