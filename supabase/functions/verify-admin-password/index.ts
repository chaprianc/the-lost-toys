import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import {
  createSessionToken,
  hashPassword,
  hashSha256,
  verifyPassword,
} from "../_shared/admin-security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await req.json();
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!password || password.length > 256) {
      return json({ success: false, error: "Invalid credentials" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientAddress = req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") || forwardedFor || "unknown";
    const rateSalt = Deno.env.get("ADMIN_RATE_LIMIT_SECRET") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const keyHash = await hashSha256(`${rateSalt}:${clientAddress}`);
    const now = Date.now();

    const { data: attempt } = await supabase
      .from("admin_login_attempts")
      .select("attempts, window_started_at, blocked_until")
      .eq("key_hash", keyHash)
      .maybeSingle();

    const blockedUntil = attempt?.blocked_until ? Date.parse(attempt.blocked_until) : 0;
    if (blockedUntil > now) {
      return json({
        success: false,
        error: "Too many attempts",
        retryAfterSeconds: Math.ceil((blockedUntil - now) / 1000),
      }, 429);
    }

    const { data: setting } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "admin_password")
      .maybeSingle();
    const storedPassword = setting?.setting_value || Deno.env.get("ADMIN_PASSWORD") || "";

    if (!storedPassword) {
      console.error("Admin authentication is not configured");
      return json({ success: false, error: "Authentication is not configured" }, 500);
    }

    const verification = await verifyPassword(password, storedPassword);
    if (!verification.valid) {
      const windowStarted = attempt?.window_started_at
        ? Date.parse(attempt.window_started_at)
        : 0;
      const withinWindow = windowStarted > now - LOGIN_WINDOW_MS;
      const attempts = withinWindow ? (attempt?.attempts || 0) + 1 : 1;
      const blocked = attempts >= MAX_ATTEMPTS;

      await supabase.from("admin_login_attempts").upsert({
        key_hash: keyHash,
        attempts,
        window_started_at: withinWindow
          ? attempt!.window_started_at
          : new Date(now).toISOString(),
        blocked_until: blocked ? new Date(now + LOGIN_WINDOW_MS).toISOString() : null,
      });

      return json({
        success: false,
        error: blocked ? "Too many attempts" : "Invalid credentials",
        retryAfterSeconds: blocked ? LOGIN_WINDOW_MS / 1000 : undefined,
      }, blocked ? 429 : 401);
    }

    await supabase.from("admin_login_attempts").delete().eq("key_hash", keyHash);

    if (verification.needsUpgrade) {
      const upgradedPassword = await hashPassword(password);
      const { error: upgradeError } = await supabase.from("admin_settings").upsert({
        setting_key: "admin_password",
        setting_value: upgradedPassword,
        updated_at: new Date(now).toISOString(),
      }, { onConflict: "setting_key" });
      if (upgradeError) console.error("Unable to upgrade admin password hash");
    }

    await supabase.from("admin_sessions").delete().lt("expires_at", new Date(now).toISOString());

    const token = createSessionToken();
    const tokenHash = await hashSha256(token);
    const expiresAt = new Date(now + SESSION_DURATION_MS).toISOString();
    const { error: sessionError } = await supabase.from("admin_sessions").insert({
      token_hash: tokenHash,
      expires_at: expiresAt,
      last_used_at: new Date(now).toISOString(),
    });

    if (sessionError) {
      console.error("Unable to create admin session");
      return json({ success: false, error: "Unable to create session" }, 500);
    }

    return json({ success: true, token, expiresAt });
  } catch (error) {
    console.error("Admin login failed:", error instanceof Error ? error.message : "Unknown error");
    return json({ success: false, error: "Internal server error" }, 500);
  }
});
