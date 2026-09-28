import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(1).max(80),
  inviteCode: z.string().min(1),
});

const delegates = [
  { className: "4ºA", env: "DELEGATE_CODE_4A", email: "a.kdutra@maristasccv.es" },
  { className: "4ºB", env: "DELEGATE_CODE_4B", email: "a.smartin@maristasccv.es" },
  { className: "4ºC", env: "DELEGATE_CODE_4C", email: "a.serjove@maristasccv.es" },
];

export const createTeacherAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const code = data.inviteCode.trim();
    const email = data.email.trim().toLowerCase();
    let role: { role: "teacher" | "delegate"; class_name: string | null } | null = null;

    const teacherCode = process.env["TEACHER_INVITE_CODE"];
    if (teacherCode && code === teacherCode) role = { role: "teacher", class_name: null };
    for (const d of delegates) {
      const expected = process.env[d.env];
      if (expected && code === expected) {
        if (email !== d.email) throw new Error("Este código no corresponde a ese correo.");
        role = { role: "delegate", class_name: d.className };
      }
    }
    if (!role) throw new Error("El código de invitación no es correcto.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(
        createError?.message?.includes("already been registered")
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo crear la cuenta. Inténtalo de nuevo.",
      );
    }

    const [{ error: profileError }, { error: roleError }] = await Promise.all([
      supabaseAdmin.from("profiles").upsert({ id: created.user.id, display_name: data.displayName }),
      supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, ...role }),
    ]);
    if (profileError || roleError) {
      throw new Error("La cuenta se creó, pero no se pudo guardar el perfil.");
    }

    return { ok: true };
  });
