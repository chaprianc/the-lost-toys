import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  toyName: string;
  price: number;
  city: string;
  sellerPhone: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toyName, price, city, sellerPhone }: NotifyRequest = await req.json();

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    if (!apiKey) {
      console.log("Resend API key not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminEmail) {
      console.log("Admin email not configured, skipping email notification");
      return new Response(
        JSON.stringify({ success: false, message: "Admin email not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending email notification to admin...");

    const emailResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "צעצועי שניר <onboarding@resend.dev>",
        to: [adminEmail],
        subject: "🎁 צעצוע חדש ממתין לאישור!",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h1 style="color: #1f2937; margin-bottom: 20px;">🎁 צעצוע חדש לאישור!</h1>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 10px 0;"><strong>📦 שם הצעצוע:</strong> ${toyName}</p>
              <p style="margin: 10px 0;"><strong>💰 מחיר:</strong> ₪${price}</p>
              <p style="margin: 10px 0;"><strong>📍 עיר:</strong> ${city}</p>
              <p style="margin: 10px 0;"><strong>📞 טלפון מוכר:</strong> ${sellerPhone}</p>
            </div>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://shnirtoys.lovable.app/admin" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                👉 היכנס לממשק הניהול
              </a>
            </div>
            
            <p style="margin-top: 16px; color: #9ca3af; font-size: 12px; text-align: center;">
              לחץ על הכפתור למעלה כדי לאשר או לדחות את הצעצוע.
            </p>
          </div>
        `,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    if (!emailResponse.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email notification sent", data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-admin-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
