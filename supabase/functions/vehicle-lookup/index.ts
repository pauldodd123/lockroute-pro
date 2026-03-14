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
    const { registration } = await req.json();

    if (!registration) {
      return new Response(
        JSON.stringify({ error: "Registration number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanReg = registration.replace(/\s+/g, "").toUpperCase();

    const dvlaApiKey = Deno.env.get("DVLA_API_KEY");
    if (!dvlaApiKey) {
      return new Response(
        JSON.stringify({ error: "DVLA API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": dvlaApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationNumber: cleanReg }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 404) {
        return new Response(
          JSON.stringify({ error: "Vehicle not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `DVLA API error (${status})` }),
        { status: status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const vehicle = {
      registration: data.registrationNumber,
      make: data.make,
      colour: data.colour,
      yearOfManufacture: data.yearOfManufacture,
      engineCapacity: data.engineCapacity,
      fuelType: data.fuelType,
      taxStatus: data.taxStatus,
      taxDueDate: data.taxDueDate,
      motStatus: data.motStatus,
      motExpiryDate: data.motExpiryDate,
      co2Emissions: data.co2Emissions,
    };

    return new Response(
      JSON.stringify(vehicle),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
