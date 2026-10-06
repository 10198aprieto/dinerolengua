import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Coins, LockKeyhole, LogIn, Mail, Settings, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const logoUrl = "/la-hucha-de-lengua.svg";
import { createTeacherAccount } from "@/lib/teacher-account.functions";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "La Hucha de Lengua | Contador de 3.º y 4.º ESO" },
    { name: "description", content: "Consulta pública del dinero recaudado y pendiente en las clases de Lengua de 4.º A, 4.º B y 4.º C." },
    { property: "og:title", content: "La Hucha de Lengua" },
    { property: "og:description", content: "Contador público de las multas de Lengua de 3.º y 4.º ESO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

type Fine = Tables<"fines">;
type ClassName = "3ºA" | "4ºA" | "4ºB" | "4ºC";
const classes: ClassName[] = ["3ºA", "4ºA", "4ºB", "4ºC"];
const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

function Index() {
  const navigate = useNavigate();
  const [fines, setFines] = useState<Fine[]>([]);
  const [activeClass, setActiveClass] = useState<ClassName>("4ºA");
  const [status, setStatus] = useState<"all" | "paid" | "pending">("all");
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [adOpen, setAdOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("arroyobus-ad-seen")) return;
    const timer = setTimeout(() => {
      setAdOpen(true);
      sessionStorage.setItem("arroyobus-ad-seen", "1");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    void supabase.from("fines").select("*").order("occurred_on", { ascending: false }).order("created_at", { ascending: false }).then(({ data }) => {
      setFines(data ?? []);
      setLoading(false);
    });
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const classFines = fines.filter((fine) => fine.class_name === activeClass);
  const filteredFines = classFines.filter((fine) => status === "all" || (status === "paid" ? fine.is_paid : !fine.is_paid));
  const visibleFines = useMemo(() => {
    const groups = new Map<string, { key: string; student_name: string; amount_cents: number; is_paid: boolean; occurred_on: string }>();
    for (const fine of filteredFines) {
      const key = `${fine.student_id ?? fine.student_name.toLowerCase()}|${fine.is_paid ? "paid" : "pending"}`;
      const group = groups.get(key);
      if (group) {
        group.amount_cents += fine.amount_cents;
        if (fine.occurred_on > group.occurred_on) group.occurred_on = fine.occurred_on;
      } else {
        groups.set(key, { key, student_name: fine.student_name, amount_cents: fine.amount_cents, is_paid: fine.is_paid, occurred_on: fine.occurred_on });
      }
    }
    return [...groups.values()].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
  }, [filteredFines]);
  const totals = useMemo(() => {
    const paid = classFines.filter((fine) => fine.is_paid).reduce((sum, fine) => sum + fine.amount_cents, 0);
    const pending = classFines.filter((fine) => !fine.is_paid).reduce((sum, fine) => sum + fine.amount_cents, 0);
    return { paid, pending, total: paid + pending };
  }, [classFines]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setLoginError("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    setSigningIn(false);
    if (error) {
      setLoginError("El correo o la contraseña no son correctos.");
      return;
    }
    await navigate({ to: "/dashboard" });
  }

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setLoginError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    try {
      await createTeacherAccount({ data: {
        email,
        password,
        displayName: String(form.get("displayName")),
        inviteCode: String(form.get("inviteCode")),
      } });
    } catch (error) {
      setSigningIn(false);
      setLoginError(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSigningIn(false);
    if (error) {
      setLoginError("La cuenta se creó, pero no se pudo iniciar sesión. Prueba a entrar.");
      setMode("login");
      return;
    }
    await navigate({ to: "/dashboard" });
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo de La Hucha de Lengua" className="size-10 rounded-md object-contain" />
            <div><p className="font-display text-lg font-bold leading-tight">La Hucha de Lengua</p><p className="text-xs text-muted-foreground">CENTRO CULTURAL VALLISOLETANO · 3.º y 4.º ESO</p></div>
          </div>
          {signedIn
            ? <Button onClick={() => navigate({ to: "/dashboard" })}><Settings /> <span className="hidden sm:inline">Gestionar</span></Button>
            : <Button variant="outline" onClick={() => setLoginOpen(true)}><LogIn /> <span className="sm:hidden">Entrar</span><span className="hidden sm:inline">Iniciar sesión</span></Button>}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7"><p className="mb-1 text-sm font-semibold text-primary">CURSO 2026 · 2027</p><h1 className="font-display text-3xl font-bold sm:text-4xl">Contador de multas</h1><p className="mt-2 text-muted-foreground">Cada palabra cuenta. Cada céntimo también.</p></div>

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-md bg-secondary p-1.5">
          {classes.map((className) => <Button key={className} variant={activeClass === className ? "default" : "ghost"} className="h-11" onClick={() => setActiveClass(className)}>{className}</Button>)}
        </div>

        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <Summary icon={<Check />} label="Recaudado" value={money(totals.paid)} tone="success" />
          <Summary icon={<WalletCards />} label="Pendiente" value={money(totals.pending)} tone="warning" />
          <Summary icon={<Coins />} label="Total" value={money(totals.total)} tone="primary" />
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-2xl font-bold">Historial de {activeClass}</h2><p className="text-sm text-muted-foreground">{visibleFines.length} {visibleFines.length === 1 ? "alumno" : "alumnos"}</p></div>
            <div className="flex gap-1 rounded-md border border-border bg-card p-1">
              {([['all', 'Todas'], ['pending', 'Pendientes'], ['paid', 'Pagadas']] as const).map(([value, label]) => <Button key={value} size="sm" variant={status === value ? "secondary" : "ghost"} onClick={() => setStatus(value)}>{label}</Button>)}
            </div>
          </div>
          {loading ? <div className="py-16 text-center text-muted-foreground">Cargando registros…</div> : visibleFines.length === 0 ? (
            <div className="empty-state py-16 text-center"><Coins className="mx-auto mb-4 size-10 text-muted-foreground" /><h3 className="font-display text-xl font-bold">La hucha está vacía</h3><p className="mt-1 text-sm text-muted-foreground">No hay multas en esta vista.</p></div>
          ) : (
            <div className="space-y-2">{visibleFines.map((fine) => (
              <article key={fine.key} className="record-row grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-border bg-card px-4 py-3 sm:grid-cols-[1fr_120px_130px]">
                <div className="min-w-0"><p className="truncate font-semibold">{fine.student_name}</p><p className="truncate text-xs text-muted-foreground">Última multa: {new Date(`${fine.occurred_on}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                <p className="font-display text-xl font-bold">{money(fine.amount_cents)}</p>
                <div className={`inline-flex h-9 items-center gap-2 justify-self-start rounded-md border px-3 text-sm font-medium ${fine.is_paid ? "bg-secondary" : "bg-background"}`}>{fine.is_paid ? <Check className="size-4" /> : <ChevronRight className="size-4" />}{fine.is_paid ? "Pagado" : "Debe"}</div>
              </article>
            ))}</div>
          )}
        </section>
      </div>

      <footer className="mt-4 border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-6xl justify-center px-4 sm:px-6">
          <a
            href="https://arroyobus.net"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 rounded-md border border-border bg-secondary/40 px-8 py-5 transition-colors hover:border-primary hover:bg-secondary/70"
            title="Visitar arroyobus.net"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Patrocinado por</span>
            <img src="/arroyobus.png" alt="ArroyoBUS, transporte urbano de Arroyo de la Encomienda" className="h-12 w-auto transition-transform group-hover:scale-105" />
            <span className="text-xs text-muted-foreground">Transporte urbano de Arroyo de la Encomienda · arroyobus.net</span>
          </a>
        </div>
      </footer>

      <Dialog open={adOpen} onOpenChange={setAdOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Anuncio de ArroyoBUS</DialogTitle>
            <DialogDescription>ArroyoBUS, transporte urbano de Arroyo de la Encomienda, patrocina La Hucha de Lengua.</DialogDescription>
          </DialogHeader>
          <a
            href="https://arroyobus.net"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-card p-8 transition-opacity hover:opacity-90"
            onClick={() => setAdOpen(false)}
            title="Visitar arroyobus.net"
          >
            <img src="/arroyobus.png" alt="ArroyoBUS, transporte urbano de Arroyo de la Encomienda" className="mx-auto w-full max-w-xs" />
          </a>
          <p className="bg-secondary/50 px-4 py-2 text-center text-[11px] uppercase tracking-wide text-muted-foreground">Contenido patrocinado · arroyobus.net</p>
        </DialogContent>
      </Dialog>

      <Dialog open={loginOpen} onOpenChange={(open) => { setLoginOpen(open); if (!open) { setMode("login"); setLoginError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{mode === "login" ? "Acceso del profesor" : "Crear cuenta"}</DialogTitle>
            <DialogDescription>{mode === "login" ? "Inicia sesión para añadir y gestionar multas." : "Necesitas el código de invitación del centro."}</DialogDescription>
          </DialogHeader>
          {mode === "login" ? (
            <form className="space-y-4" onSubmit={signIn}>
              <div className="space-y-2"><Label htmlFor="email">Correo electrónico</Label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" id="email" name="email" type="email" autoComplete="email" required /></div></div>
              <div className="space-y-2"><Label htmlFor="password">Contraseña</Label><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" id="password" name="password" type="password" autoComplete="current-password" required /></div></div>
              {loginError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={signingIn}>{signingIn ? "Entrando…" : "Entrar al panel"}</Button>
              <p className="text-center text-sm text-muted-foreground">¿Aún no tienes cuenta? <button type="button" className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => { setMode("signup"); setLoginError(""); }}>Crear cuenta</button></p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={signUp}>
              <div className="space-y-2"><Label htmlFor="displayName">Nombre y apellidos</Label><Input id="displayName" name="displayName" autoComplete="name" maxLength={80} required /></div>
              <div className="space-y-2"><Label htmlFor="signup-email">Correo electrónico</Label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" id="signup-email" name="email" type="email" autoComplete="email" required /></div></div>
              <div className="space-y-2"><Label htmlFor="signup-password">Contraseña</Label><div className="relative"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div><p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p></div>
              <div className="space-y-2"><Label htmlFor="inviteCode">Código de invitación</Label><Input id="inviteCode" name="inviteCode" autoComplete="off" required /></div>
              {loginError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={signingIn}>{signingIn ? "Creando cuenta…" : "Crear cuenta y entrar"}</Button>
              <p className="text-center text-sm text-muted-foreground">¿Ya tienes cuenta? <button type="button" className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => { setMode("login"); setLoginError(""); }}>Iniciar sesión</button></p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "warning" | "primary" }) {
  return <div className="summary-card flex items-center gap-4 rounded-md border border-border bg-card p-4"><div className={`summary-icon summary-icon-${tone} flex size-11 shrink-0 items-center justify-center rounded-md`}>{icon}</div><div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div></div>;
}