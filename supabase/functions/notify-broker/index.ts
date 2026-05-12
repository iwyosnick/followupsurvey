import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * notify-broker — Supabase Edge Function
 *
 * Triggered by a Database Webhook on INSERT to survey_responses.
 * If the rating is <= 3, sends an instant alert email to the broker
 * via the Resend API.
 *
 * Security:
 * - Validates the webhook signature via a shared secret (Critique C-1).
 * - Uses the survey_responses.id as a Resend idempotency key (Critique H-3).
 *
 * Required Supabase Secrets:
 * - WEBHOOK_SECRET: Shared secret for webhook signature verification.
 * - RESEND_API_KEY: API key for the Resend email service.
 * - BROKER_EMAIL: Destination email address for negative review alerts.
 */

interface WebhookPayload {
  type: "INSERT";
  table: string;
  schema: string;
  record: {
    id: string;
    created_at: string;
    client_id: string;
    loved_one: string;
    facility: string;
    rating: number;
    feedback_text: string | null;
  };
  old_record: null;
}

Deno.serve(async (req: Request) => {
  // ── 1. Verify webhook signature ──
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  const authHeader = req.headers.get("authorization");

  if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
    console.error("Unauthorized webhook request — signature mismatch");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── 2. Parse the webhook payload ──
  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { record } = payload;

  // ── 3. Only alert on negative reviews (1-3 stars) ──
  if (record.rating > 3) {
    return new Response(
      JSON.stringify({ message: "Positive review — no alert needed" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 4. Send alert email via Resend ──
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const brokerEmail = Deno.env.get("BROKER_EMAIL");

  if (!resendApiKey || !brokerEmail) {
    console.error("Missing RESEND_API_KEY or BROKER_EMAIL secrets");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const feedbackSnippet = record.feedback_text
    ? record.feedback_text.substring(0, 500)
    : "(No additional details provided)";

  const emailBody = `
    <h2>⚠️ Negative Review Alert</h2>
    <p>A family has submitted a low rating for a recent placement.</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 16px 8px 0; font-weight: bold;">Rating</td>
        <td style="padding: 8px 0;">${"⭐".repeat(record.rating)} (${record.rating}/5)</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px 8px 0; font-weight: bold;">Loved One</td>
        <td style="padding: 8px 0;">${escapeHtml(record.loved_one)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px 8px 0; font-weight: bold;">Facility</td>
        <td style="padding: 8px 0;">${escapeHtml(record.facility)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px 8px 0; font-weight: bold;">Client ID</td>
        <td style="padding: 8px 0;">${escapeHtml(record.client_id)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 16px 8px 0; font-weight: bold; vertical-align: top;">Feedback</td>
        <td style="padding: 8px 0;">${escapeHtml(feedbackSnippet)}</td>
      </tr>
    </table>
    <p style="color: #666; font-size: 12px;">
      Survey ID: ${record.id} | Submitted: ${record.created_at}
    </p>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": record.id, // Prevents duplicate emails on retries
      },
      body: JSON.stringify({
        from: "ElderGuide Alerts <alerts@elderguide.care>",
        to: [brokerEmail],
        subject: sanitizeSubject(`⚠️ ${record.rating}-Star Review — ${record.loved_one} at ${record.facility}`),
        html: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error(`Resend API error: ${resendResponse.status} — ${errorText}`);
      // Return 500 so Supabase will retry the webhook
      return new Response(
        JSON.stringify({ error: "Email delivery failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Alert sent for survey ${record.id}`);
    return new Response(
      JSON.stringify({ message: "Alert email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Failed to send alert email:", err);
    return new Response(
      JSON.stringify({ error: "Email delivery failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * Escapes HTML entities to prevent XSS in the broker email.
 * User-generated content (loved_one, facility, feedback) must be sanitized.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips control characters and newlines to prevent email header injection.
 */
function sanitizeSubject(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\r\n\x00-\x1F\x7F]/g, "").substring(0, 150);
}
