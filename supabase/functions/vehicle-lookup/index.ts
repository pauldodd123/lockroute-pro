import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getDvsaToken(): Promise<string> {
  const clientId = Deno.env.get("DVSA_CLIENT_ID")!;
  const clientSecret = Deno.env.get("DVSA_CLIENT_SECRET")!;
  const scopeUrl = Deno.env.get("DVSA_SCOPE_URL")!;
  const tokenUrl = Deno.env.get("DVSA_TOKEN_URL")!;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: scopeUrl,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`DVSA token error (${res.status})`);
  const json = await res.json();
  return json.access_token;
}

interface DvsaData {
  model: string | null;
  mileage: number | null;
}

async function getDvsaData(registration: string): Promise<DvsaData> {
  const apiKey = Deno.env.get("DVSA_API_KEY")!;
  const token = await getDvsaToken();

  const res = await fetch(
    `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${encodeURIComponent(registration)}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-api-key": apiKey,
      },
    }
  );

  if (!res.ok) return { model: null, mileage: null };
  const data = await res.json();

  // Response is a single object (not an array)
  const record = Array.isArray(data) ? data[0] : data;
  const model = record?.model ?? null;

  // Get mileage from most recent MOT test
  let mileage: number | null = null;
  if (record?.motTests?.length > 0) {
    const raw = record.motTests[0].odometerValue;
    if (raw != null) {
      const parsed = parseInt(String(raw), 10);
      if (!isNaN(parsed)) mileage = parsed;
    }
  }

  return { model, mileage };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const registration = body.registration || body.registrationNumber;

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

    // Attempt DVSA MOT History lookup for model + mileage — failure is non-fatal
    let model: string | null = null;
    let mileage: number | null = null;
    try {
      const dvsaData = await getDvsaData(cleanReg);
      model = dvsaData.model;
      mileage = dvsaData.mileage;
    } catch (_) {
      // DVSA lookup failed (e.g. new vehicle with no MOT history) — proceed without model/mileage
    }

    const vehicle = {
      registration: data.registrationNumber,
      make: data.make,
      model: model,
      colour: data.colour,
      yearOfManufacture: data.yearOfManufacture,
      engineCapacity: data.engineCapacity ?? null,
      fuelType: data.fuelType,
      taxStatus: data.taxStatus,
      taxDueDate: data.taxDueDate,
      motStatus: data.motStatus,
      motExpiryDate: data.motExpiryDate ?? null,
      co2Emissions: data.co2Emissions,
      mileage: mileage,
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
