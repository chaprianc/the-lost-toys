import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    const action = typeof body.action === "string" ? body.action : "get";

    if (!/^[0-9a-f]{64}$/.test(token)) return json({ error: "Invalid management link" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const tokenHash = await hashToken(token);

    const { data: capability, error: capabilityError } = await supabase
      .from("seller_management_tokens")
      .select("toy_id")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (capabilityError || !capability) return json({ error: "Management link not found" }, 404);

    await supabase
      .from("seller_management_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("toy_id", capability.toy_id);

    if (action === "delete") {
      const { error } = await supabase.from("toys").delete().eq("id", capability.toy_id);
      if (error) return json({ error: "Unable to delete listing" }, 500);
      return json({ success: true, deleted: true });
    }

    if (action === "update_price") {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 1 || price > 50000) {
        return json({ error: "Invalid price" }, 400);
      }
      const { error } = await supabase
        .from("toys")
        .update({ price })
        .eq("id", capability.toy_id);
      if (error) return json({ error: "Unable to update price" }, 500);
    } else if (action === "mark_sold") {
      const { error } = await supabase
        .from("toys")
        .update({ status: "sold" })
        .eq("id", capability.toy_id);
      if (error) return json({ error: "Unable to update listing" }, 500);
    } else if (action !== "get") {
      return json({ error: "Unsupported action" }, 400);
    }

    const { data: toy, error: toyError } = await supabase
      .from("toys")
      .select("id,toy_name,category,condition,price,city,images,status,created_at,updated_at")
      .eq("id", capability.toy_id)
      .maybeSingle();

    if (toyError || !toy) return json({ error: "Listing not found" }, 404);
    return json({ toy });
  } catch (error) {
    console.error("manage-toy failed:", error instanceof Error ? error.message : error);
    return json({ error: "Unexpected server error" }, 500);
  }
});
