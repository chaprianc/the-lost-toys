import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { hashPassword, hashSha256 } from "../_shared/admin-security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-session",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statuses = new Set(["available", "sold", "hidden"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const token = req.headers.get("x-admin-session") || "";
    if (!/^[0-9a-f]{64}$/i.test(token)) {
      return json({ error: "Unauthorized", code: "session_invalid" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const tokenHash = await hashSha256(token);
    const { data: session } = await supabase
      .from("admin_sessions")
      .select("id, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (!session || Date.parse(session.expires_at) <= Date.now()) {
      if (session) await supabase.from("admin_sessions").delete().eq("id", session.id);
      return json({ error: "Session expired", code: "session_expired" }, 401);
    }

    await supabase.from("admin_sessions")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", session.id);

    const payload = await req.json();
    const action = typeof payload.action === "string" ? payload.action : "";

    if (action === "validate") return json({ success: true });

    if (action === "logout") {
      await supabase.from("admin_sessions").delete().eq("id", session.id);
      return json({ success: true });
    }

    if (action === "list_toys") {
      const { data, error } = await supabase
        .from("toys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ toys: data || [] });
    }

    if (action === "update_toy_status") {
      if (!uuidPattern.test(payload.id) || !statuses.has(payload.status)) {
        return json({ error: "Invalid toy update" }, 400);
      }
      const { data, error } = await supabase
        .from("toys")
        .update({ status: payload.status })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) throw error;
      return json({ toy: data });
    }

    if (action === "delete_toy") {
      if (!uuidPattern.test(payload.id)) return json({ error: "Invalid toy id" }, 400);
      const { error } = await supabase.from("toys").delete().eq("id", payload.id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "list_blocked_phones") {
      const { data, error } = await supabase
        .from("blocked_phones")
        .select("*")
        .order("blocked_at", { ascending: false });
      if (error) throw error;
      return json({ blockedPhones: data || [] });
    }

    if (action === "block_phone") {
      const phone = typeof payload.phone === "string"
        ? payload.phone.replace(/[-\s]/g, "")
        : "";
      const reason = typeof payload.reason === "string" ? payload.reason.trim().slice(0, 250) : null;
      if (!/^0?5\d{8}$/.test(phone)) {
        return json({ error: "Invalid phone number", code: "invalid_phone" }, 400);
      }
      const { data, error } = await supabase
        .from("blocked_phones")
        .insert({ phone, reason: reason || null })
        .select()
        .single();
      if (error?.code === "23505") {
        return json({ error: "Phone already blocked", code: "23505" }, 409);
      }
      if (error) throw error;
      return json({ blockedPhone: data });
    }

    if (action === "unblock_phone") {
      if (!uuidPattern.test(payload.id)) return json({ error: "Invalid block id" }, 400);
      const { error } = await supabase.from("blocked_phones").delete().eq("id", payload.id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "update_setting") {
      const type = payload.type;
      const value = typeof payload.value === "string" ? payload.value.trim() : "";
      if (type !== "email" && type !== "password") {
        return json({ error: "Invalid setting type" }, 400);
      }
      if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return json({ error: "Invalid email address" }, 400);
      }
      if (type === "password" && (value.length < 10 || value.length > 256)) {
        return json({ error: "Password must contain at least 10 characters" }, 400);
      }

      const settingValue = type === "password" ? await hashPassword(value) : value;
      const settingKey = type === "password" ? "admin_password" : "admin_email";
      const { error } = await supabase.from("admin_settings").upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        updated_at: new Date().toISOString(),
      }, { onConflict: "setting_key" });
      if (error) throw error;

      if (type === "password") {
        await supabase.from("admin_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        return json({ success: true, requiresReauthentication: true });
      }
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("Admin API failed:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Internal server error" }, 500);
  }
});

