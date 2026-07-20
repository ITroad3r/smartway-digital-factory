// Public endpoint to submit a Waya chatbot lead.
// Uses the service role key server-side; RLS still blocks direct client inserts.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SALES_WEBHOOK_URL = Deno.env.get("SALES_WEBHOOK_URL") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Simple in-memory cooldown (per instance, best-effort)
const recent = new Map<string, number>();
const COOLDOWN_MS = 20_000;

const VALID_SERVICES = new Set([
  "software_development", "cloud_devops", "data_ai", "ux_ui",
  "digital_strategy", "integration_modernization", "cybersecurity_compliance",
  "general_enquiry",
]);

function bad(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hashIp(ip: string) {
  const buf = new TextEncoder().encode(ip + "smartway-waya");
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad("Method not allowed", 405);

  let body: any;
  try { body = await req.json(); } catch { return bad("Invalid JSON"); }

  // Honeypot
  if (body.website && String(body.website).trim() !== "") {
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const ipKey = await hashIp(ip);
  const last = recent.get(ipKey) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) {
    return bad("Please wait a moment before submitting again.", 429);
  }

  const trim = (v: any, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";
  const name = trim(body.name, 120);
  const email = trim(body.email, 254).toLowerCase();
  const phone = trim(body.phone, 40);
  const company = trim(body.company, 160);
  const service = trim(body.service_interest, 60);
  const locale = body.locale === "en" ? "en" : "fr";
  const source_url = trim(body.source_url, 500);
  const free_text = trim(body.free_text, 2000);
  const company_size = trim(body.company_size, 20);
  const region = trim(body.region, 40);
  const industry = trim(body.industry, 120);
  const qualifying = (body.qualifying_answers && typeof body.qualifying_answers === "object" && !Array.isArray(body.qualifying_answers))
    ? body.qualifying_answers : {};

  if (!name) return bad("Name is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Valid email required");
  if (!phone || phone.length < 6) return bad("Phone required");
  if (!company) return bad("Company required");
  if (!VALID_SERVICES.has(service)) return bad("Invalid service");

  // Priority heuristic for cybersecurity active concern
  let priority = "normal";
  const urgency = String(qualifying.urgency ?? "").toLowerCase();
  if (service === "cybersecurity_compliance" && urgency === "active_concern") priority = "high";

  const requires_human_followup = service === "general_enquiry";

  const { data: lead, error } = await supabase
    .from("smartway_leads")
    .insert({
      name, email, phone, company,
      service_interest: service,
      qualifying_answers: qualifying,
      company_size: company_size || null,
      region: region || null,
      industry: industry || null,
      locale,
      source_url: source_url || null,
      free_text: free_text || null,
      priority,
      requires_human_followup,
      status: "awaiting_sales_call",
      preferred_followup: "phone_call",
      ip_hash: ipKey,
    })
    .select("id")
    .single();

  if (error) {
    console.error("insert lead error", error);
    return bad("Could not save your request. Please try again.", 500);
  }

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    actor: null,
    activity_type: "lead_created",
    message: "Lead submitted via Waya chatbot",
    metadata: { service, locale, priority },
  });

  recent.set(ipKey, Date.now());

  // Fire-and-forget notification (never rolls back the saved lead)
  if (SALES_WEBHOOK_URL) {
    try {
      await fetch(SALES_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_lead",
          lead_id: lead.id,
          name, company, email, phone, service_interest: service,
          qualifying_answers: qualifying, urgency, priority,
          source_url, submitted_at: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("notification failed", e);
    }
  } else {
    console.log("NEW_LEAD", { lead_id: lead.id, name, company, service, priority });
  }

  return new Response(JSON.stringify({ ok: true, lead_id: lead.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
