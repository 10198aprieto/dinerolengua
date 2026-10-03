import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { studentReminderEmail } from "@/lib/reminder-email";

const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "La Hucha de Lengua <recuerda@dinerolengua.es>",
        to: [student.email],
        subject: `Recordatorio: debes ${money(owed)} a la hucha de Lengua`,
        html: studentReminderEmail(student.full_name, student.class_name, owed),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Resend failed [${res.status}]: ${body}`);
      throw new Error(`No se pudo enviar el correo [${res.status}]`);
    }
    return { sent: true, owed };
  });
