import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toyName, price, city, sellerPhone } = await req.json();

    const apiKey = Deno.env.get("CALLMEBOT_API_KEY");
    const adminPhone = Deno.env.get("ADMIN_WHATSAPP_PHONE") || "972526901137";

    if (!apiKey) {
      console.log("CallMeBot API key not configured, skipping WhatsApp notification");
      return new Response(
        JSON.stringify({ success: false, message: "WhatsApp notifications not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format message in Hebrew
    const message = `🎁 צעצוע חדש לאישור!

📦 שם: ${toyName}
💰 מחיר: ₪${price}
📍 עיר: ${city}
📞 טלפון מוכר: ${sellerPhone}

👉 היכנס לממשק הניהול לאישור`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // CallMeBot WhatsApp API
    const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodedMessage}&apikey=${apiKey}`;

    console.log("Sending WhatsApp notification to admin...");
    
    const response = await fetch(url);
    const responseText = await response.text();
    
    console.log("CallMeBot response:", responseText);

    if (response.ok || responseText.includes("Message queued")) {
      return new Response(
        JSON.stringify({ success: true, message: "WhatsApp notification sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("CallMeBot error:", responseText);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send notification" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in notify-admin-whatsapp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});