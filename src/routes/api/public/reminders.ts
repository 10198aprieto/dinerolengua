import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const Route = createFileRoute("/api/public/reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const provided = request.headers.get("x-reminder-token") ?? "";
        const { data: expected } = await supabaseAdmin.rpc("get_reminder_token");
        const a = Buffer.from(provided);
        const b = Buffer.from(String(expected ?? ""));
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        // Cron runs at 05 and 06 UTC; only send when it is 07:00 in Madrid.
        const madrid = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        const part = (t: string) => madrid.find((p) => p.type === t)?.value;
        const force = new URL(request.url).searchParams.get("force") === "1";
        if (!force && (part("hour") !== "07" || part("weekday") !== "Fri")) {
          return Response.json({ skipped: true });
        }
        const dateKey = `${part("year")}-${part("month")}-${part("day")}`;

        const apiKey = process.env["RESEND_API_KEY"];
        if (!apiKey) return new Response("RESEND_API_KEY missing", { status: 500 });

        const { data: students, error } = await supabaseAdmin
          .from("students")
          .select("id, full_name, class_name, email, fines(amount_cents, is_paid)")
          .not("email", "is", null);
        if (error) return new Response(error.message, { status: 500 });

        let sent = 0;
        const failures: string[] = [];
        for (const s of students ?? []) {
          const owed = (s.fines ?? []).filter((f) => !f.is_paid).reduce((sum, f) => sum + f.amount_cents, 0);
          if (!s.email || owed <= 0) continue;
          const name = escapeHtml(s.full_name);
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "Idempotency-Key": `reminder-${s.id}-${dateKey}`,
            },
            body: JSON.stringify({
              from: "La Hucha de Lengua <recuerda@dinerolengua.es>",
              to: [s.email],
              subject: `Recordatorio: debes ${money(owed)} a la hucha de Lengua`,
              html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937"><h2 style="color:#15803d">La Hucha de Lengua</h2><p>Hola, ${name}:</p><p>Te recordamos que tienes pendiente <strong>${money(owed)}</strong> en la hucha de Lengua de ${escapeHtml(s.class_name)}.</p><p>¡Cada palabra cuenta!</p><p style="color:#6b7280;font-size:12px">Centro Cultural Vallisoletano · 4.º ESO</p></div>`,
            }),
          });
          if (res.ok) sent++;
          else {
            const body = await res.text();
            console.error(`Resend failed [${res.status}]: ${body}`);
            failures.push(`${s.id}: ${res.status}`);
          }
        }
        return Response.json({ sent, failures });
      },
    },
  },
});
