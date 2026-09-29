import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const sendStudentReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ studentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Verify the caller can manage this student's class.
    const { data: student, error } = await supabase
      .from("students")
      .select("id, full_name, class_name, email")
      .eq("id", data.studentId)
      .maybeSingle();
    if (error || !student) throw new Error("Alumno no encontrado");
    if (!student.email) throw new Error("Este alumno no tiene correo guardado");

    const { data: owedRows } = await supabase
      .from("fines")
      .select("amount_cents")
      .eq("student_id", student.id)
      .eq("is_paid", false);
    const owed = (owedRows ?? []).reduce((sum, f) => sum + f.amount_cents, 0);
    if (owed <= 0) throw new Error("Este alumno no debe nada");

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) throw new Error("RESEND_API_KEY no configurada");

    const name = escapeHtml(student.full_name);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "La Hucha de Lengua <recuerda@dinerolengua.es>",
        to: [student.email],
        subject: `Recordatorio: debes ${money(owed)} a la hucha de Lengua`,
        html: `<div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937"><h2 style="color:#15803d">La Hucha de Lengua</h2><p>Hola, ${name}:</p><p>Te recordamos que tienes pendiente <strong>${money(owed)}</strong> en la hucha de Lengua de ${escapeHtml(student.class_name)}.</p><p>¡Cada palabra cuenta!</p><p style="color:#6b7280;font-size:12px">Centro Cultural Vallisoletano · 4.º ESO</p></div>`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Resend failed [${res.status}]: ${body}`);
      throw new Error(`No se pudo enviar el correo [${res.status}]`);
    }
    return { sent: true, owed };
  });
