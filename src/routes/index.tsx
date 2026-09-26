import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, LockKeyhole, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "La Hucha de Lengua | Acceso del profesor" },
    { name: "description", content: "Control privado del dinero de las multas de Lengua de 4.º ESO." },
    { property: "og:title", content: "La Hucha de Lengua" },
    { property: "og:description", content: "Control privado de las multas de Lengua de 4.º ESO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    setLoading(false);
    if (signInError) return setError("El correo o la contraseña no son correctos.");
    await navigate({ to: "/dashboard" });
  }

  return (
    <main className="login-page min-h-screen px-4 py-8 sm:py-14">
      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-5xl items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <section className="hidden lg:block"><div className="mb-7 flex size-16 items-center justify-center rounded-md bg-primary text-primary-foreground"><BookOpen className="size-8" /></div><p className="mb-3 text-sm font-bold uppercase text-primary">Lengua · 4.º ESO</p><h1 className="font-display max-w-xl text-6xl font-bold leading-[1.05]">Cada palabra cuenta.</h1><p className="mt-5 max-w-lg text-xl leading-relaxed text-muted-foreground">Una forma sencilla de llevar la cuenta de las multas de 4.º A, 4.º B y 4.º C.</p><div className="mt-12 flex gap-3">{["4ºA", "4ºB", "4ºC"].map((item) => <span key={item} className="class-stamp">{item}</span>)}</div></section>
        <section className="rounded-md border border-border bg-card p-6 shadow-lg sm:p-8">
          <div className="mb-8 text-center lg:text-left"><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-secondary text-secondary-foreground lg:mx-0"><LockKeyhole /></div><h2 className="font-display text-3xl font-bold">Acceso del profesor</h2><p className="mt-2 text-sm text-muted-foreground">Entra para gestionar la hucha de tus clases.</p></div>
          <form className="space-y-5" onSubmit={signIn}>
            <div className="space-y-2"><Label htmlFor="email">Correo electrónico</Label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-10" id="email" name="email" type="email" autoComplete="email" placeholder="profesor@centro.es" required /></div></div>
            <div className="space-y-2"><Label htmlFor="password">Contraseña</Label><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-11 pl-10" id="password" name="password" type="password" autoComplete="current-password" required /></div></div>
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar al panel"}</Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">Acceso privado · Solo personal autorizado</p>
        </section>
      </div>
    </main>
  );
}
