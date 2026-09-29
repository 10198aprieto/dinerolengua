import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Festivos (nacionales, Castilla y León y Valladolid) y vacaciones escolares aproximadas.
const HOLIDAYS = new Set([
  "2026-10-12", "2026-11-02", "2026-12-07", "2026-12-08",
  ...range("2026-12-21", "2027-01-07"),
  "2027-03-19", ...range("2027-03-22", "2027-03-29"), "2027-04-23", "2027-05-13", "2027-09-08",
  "2027-10-12", "2027-11-01", "2027-12-06", "2027-12-08",
]);
function range(from: string, to: string) {
  const out: string[] = [];
  for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10));
  return out;
}

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

        // Cron runs Mon-Fri at 05 and 06 UTC; only send at 07:00 Madrid on school days.
        const madrid = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        const part = (t: string) => madrid.find((p) => p.type === t)?.value;
        const force = new URL(request.url).searchParams.get("force") === "1";
        const dateKey = `${part("year")}-${part("month")}-${part("day")}`;
        const weekday = part("weekday");
        if (!force && (part("hour") !== "07" || weekday === "Sat" || weekday === "Sun" || HOLIDAYS.has(dateKey))) {
          return Response.json({ skipped: true });
        }
        const isFriday = weekday === "Fri" || force;

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
        if (!isFriday) return Response.json({ sent, failures, teacherSummary: false });
        // Weekly summary for the teacher (Fridays): who owes money in each class.
        const { data: allStudents } = await supabaseAdmin
          .from("students")
          .select("full_name, class_name, fines(amount_cents, is_paid)")
          .order("full_name");
        const sections = ["4ºA", "4ºB", "4ºC"].map((cls) => {
          const rows = (allStudents ?? [])
            .filter((s) => s.class_name === cls)
            .map((s) => ({ name: s.full_name, owed: (s.fines ?? []).filter((f) => !f.is_paid).reduce((sum, f) => sum + f.amount_cents, 0) }))
            .filter((r) => r.owed > 0);
          const total = rows.reduce((sum, r) => sum + r.owed, 0);
          const list = rows.length
            ? `<ul>${rows.map((r) => `<li>${escapeHtml(r.name)}: <strong>${money(r.owed)}</strong></li>`).join("")}</ul><p>Total pendiente: <strong>${money(total)}</strong></p>`
            : `<p>Nadie debe dinero. 🎉</p>`;
          return `<h3 style="color:#15803d">${cls}</h3>${list}`;
        }).join("");
        const summaryRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `teacher-summary-${dateKey}` },
          body: JSON.stringify({
            from: "La Hucha de Lengua <recuerda@dinerolengua.es>",
            to: ["kevin@maristasccv.es"],
            subject: `Resumen semanal de la hucha de Lengua (${dateKey})`,
            html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937"><h2 style="color:#15803d">La Hucha de Lengua · Resumen semanal</h2>${sections}<p style="color:#6b7280;font-size:12px">Centro Cultural Vallisoletano · 4.º ESO</p></div>`,
          }),
        });
        if (!summaryRes.ok) {
          console.error(`Teacher summary failed [${summaryRes.status}]: ${await summaryRes.text()}`);
          failures.push(`teacher-summary: ${summaryRes.status}`);
        }
        return Response.json({ sent, failures, teacherSummary: summaryRes.ok });
      },
    },
  },
});
