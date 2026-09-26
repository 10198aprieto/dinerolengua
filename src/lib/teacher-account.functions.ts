import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(1).max(80),
  inviteCode: z.string().min(1),
});

export const createTeacherAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const expectedCode = process.env["TEACHER_INVITE_CODE"];
    if (!expectedCode || data.inviteCode !== expectedCode) {
      throw new Error("El código de invitación no es correcto.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
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

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: created.user.id, display_name: data.displayName });
    if (profileError) {
      throw new Error("La cuenta se creó, pero no se pudo guardar el perfil.");
    }

    return { ok: true };
  });
