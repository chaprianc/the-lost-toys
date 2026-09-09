import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const categories = new Set(["vehicles", "dolls", "board-games", "outdoor", "educational", "other"]);
const conditions = new Set(["new", "like-new", "used"]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json();
    const toyName = typeof payload.toy_name === "string" ? payload.toy_name.trim() : "";
    const city = typeof payload.city === "string" ? payload.city.trim() : "";
    const phone = typeof payload.seller_phone === "string"
      ? payload.seller_phone.replace(/[-\s]/g, "")
      : "";
    const price = Number(payload.price);
    const images = Array.isArray(payload.images)
      ? payload.images.filter((value: unknown): value is string => typeof value === "string")
      : [];

    if (
      toyName.length < 2 || toyName.length > 100 ||
      city.length < 2 || city.length > 60 ||
      !/^0?5\d{8}$/.test(phone) ||
      !Number.isFinite(price) || price < 1 || price > 50000 ||
      !categories.has(payload.category) ||
      !conditions.has(payload.condition) ||
      images.length < 1 || images.length > 3 ||
      images.some((url: string) => !url.startsWith("https://"))
    ) {
      return json({ error: "Invalid listing details" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: blocked } = await supabase
      .from("blocked_phones")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (blocked) return json({ error: "This phone number cannot publish listings" }, 403);

    const { data: toy, error: toyError } = await supabase
      .from("toys")
      .insert({
        toy_name: toyName,
        category: payload.category,
        condition: payload.condition,
        price,
        city,
        seller_phone: phone,
        images,
        status: "hidden",
      })
      .select()
      .single();

    if (toyError || !toy) {
      console.error("Toy insert failed:", toyError?.message);
      return json({ error: "Unable to create listing" }, 500);
    }

    const managementToken = randomToken();
    const tokenHash = await hashToken(managementToken);
    const { error: tokenError } = await supabase
      .from("seller_management_tokens")
      .insert({ toy_id: toy.id, token_hash: tokenHash });

    if (tokenError) {
      console.error("Token insert failed:", tokenError.message);
      await supabase.from("toys").delete().eq("id", toy.id);
      return json({ error: "Unable to create management link" }, 500);
    }

    return json({ toy, managementToken }, 201);
  } catch (error) {
    console.error("create-toy failed:", error instanceof Error ? error.message : error);
    return json({ error: "Unexpected server error" }, 500);
  }
});
