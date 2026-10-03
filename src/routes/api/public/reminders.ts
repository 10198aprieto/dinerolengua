import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { studentReminderEmail, teacherSummaryEmail } from "@/lib/reminder-email";

const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
// Festivos (nacionales, Castilla y León y Valladolid) y vacaciones escolares aproximadas.
// Calendario escolar oficial Castilla y León 2026/2027 + fiestas locales de Valladolid.
const HOLIDAYS = new Set([
  "2026-10-12", "2026-10-30", "2026-11-02", "2026-12-07", "2026-12-08",
  ...range("2026-12-23", "2027-01-10"),
  "2027-02-08", "2027-02-09",
  ...range("2027-03-20", "2027-03-30"),
  "2027-04-23", "2027-05-01", "2027-05-13",
  ...range("2027-06-24", "2027-09-08"), // verano
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

        // Cron runs Fridays and Sundays at 05 and 06 UTC; only send at 07:00 Madrid on school days.
        const madrid = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
        const part = (t: string) => madrid.find((p) => p.type === t)?.value;
        const force = new URL(request.url).searchParams.get("force") === "1";
        const dateKey = `${part("year")}-${part("month")}-${part("day")}`;
        const weekday = part("weekday");
        if (!force && (part("hour") !== "07" || (weekday !== "Fri" && weekday !== "Sun") || HOLIDAYS.has(dateKey))) {
          return Response.json({ skipped: true });
        }

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
              html: studentReminderEmail(s.full_name, s.class_name, owed),
            }),
          });
          if (res.ok) sent++;
          else {
            const body = await res.text();
            console.error(`Resend failed [${res.status}]: ${body}`);
            failures.push(`${s.id}: ${res.status}`);
          }
        }
        // Weekly summary for the teacher (Fridays only): who owes money in each class.
        let summaryOk = false;
        if (force || weekday === "Fri") {
          const { data: allStudents } = await supabaseAdmin
            .from("students")
            .select("full_name, class_name, fines(amount_cents, is_paid)")
            .order("full_name");
          const summaries = ["3ºA", "4ºA", "4ºB", "4ºC"].map((className) => ({
            className,
            students: (allStudents ?? [])
              .filter((student) => student.class_name === className)
              .map((student) => ({
                name: student.full_name,
                owed: (student.fines ?? []).filter((fine) => !fine.is_paid).reduce((sum, fine) => sum + fine.amount_cents, 0),
              }))
              .filter((student) => student.owed > 0),
          }));
          const summaryRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `teacher-summary-${dateKey}` },
            body: JSON.stringify({
              from: "La Hucha de Lengua <recuerda@dinerolengua.es>",
              to: ["kevin@maristasccv.es"],
              subject: `Resumen semanal de la hucha de Lengua (${dateKey})`,
              html: teacherSummaryEmail("Kevin", summaries),
            }),
          });
          summaryOk = summaryRes.ok;
          if (!summaryRes.ok) {
            console.error(`Teacher summary failed [${summaryRes.status}]: ${await summaryRes.text()}`);
            failures.push(`teacher-summary: ${summaryRes.status}`);
          }
        }
        return Response.json({ sent, failures, teacherSummary: summaryOk });
      },
    },
  },
});
