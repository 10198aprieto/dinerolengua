import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Coins, LogOut, Pencil, PiggyBank, Plus, Trash2, UserRound, WalletCards, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const logoUrl = "/la-hucha-de-lengua.svg";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel | La Hucha de Lengua" },
      { name: "description", content: "Panel privado para gestionar las multas de Lengua de 4.º A, 4.º B y 4.º C." },
      { property: "og:title", content: "Panel | La Hucha de Lengua" },
      { property: "og:description", content: "Control privado de las multas de Lengua." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type Fine = Tables<"fines">;
type Student = Tables<"students">;
type ClassName = "4ºA" | "4ºB" | "4ºC";
const classes: ClassName[] = ["4ºA", "4ºB", "4ºC"];
const amounts = [10, 20, 30, 40, 50];
const money = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [fines, setFines] = useState<Fine[]>([]);
  const [profileName, setProfileName] = useState("Profesor");
  const [activeClass, setActiveClass] = useState<ClassName>("4ºA");
  const [status, setStatus] = useState<"all" | "paid" | "pending">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editing, setEditing] = useState<Fine | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [allowedClasses, setAllowedClasses] = useState<ClassName[]>([]);

  async function saveStudentEmail(student: Student, email: string) {
    const value = email.trim() || null;
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Correo no válido");
      return;
    }
    const { error } = await supabase.from("students").update({ email: value }).eq("id", student.id);
    if (error) {
      toast.error("No se pudo guardar el correo");
      return;
    }
    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, email: value } : s)));
    toast.success(`Correo de ${student.full_name} guardado`);
  }
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
  }, []);

  function playCoinSound() {
    const context = new AudioContext();
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
    gain.connect(context.destination);

    [1046, 1568].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.82, now + 0.22 + index * 0.07);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.07);
      oscillator.stop(now + 0.3 + index * 0.07);
    });
    window.setTimeout(() => void context.close(), 500);
  }

  function celebrateDeposit() {
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    setCelebrating(true);
    playCoinSound();
    celebrationTimer.current = setTimeout(() => setCelebrating(false), 2200);
  }

  async function loadData() {
    const [{ data: fineRows, error }, { data: profile }, { data: studentRows }, { data: roleRows }] = await Promise.all([
      supabase.from("fines").select("*").order("occurred_on", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      supabase.from("students").select("*").order("full_name"),
      supabase.from("user_roles").select("role, class_name").eq("user_id", user.id),
    ]);
    if (error) toast.error("No se pudieron cargar los registros");
    setFines(fineRows ?? []);
    setStudents(studentRows ?? []);
    const roles = roleRows ?? [];
    const allowed = roles.some((r) => r.role === "teacher")
      ? classes
      : classes.filter((c) => roles.some((r) => r.role === "delegate" && r.class_name === c));
    setAllowedClasses(allowed);
    if (allowed.length && !allowed.includes(activeClass)) setActiveClass(allowed[0]!);
    if (profile?.display_name) setProfileName(profile.display_name);
    else await supabase.from("profiles").upsert({ id: user.id, display_name: "Profesor" });
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  const classFines = fines.filter((fine) => fine.class_name === activeClass);
  const visibleFines = classFines.filter((fine) => status === "all" || (status === "paid" ? fine.is_paid : !fine.is_paid));
  const totals = useMemo(() => {
    const paid = classFines.filter((fine) => fine.is_paid).reduce((sum, fine) => sum + fine.amount_cents, 0);
    const pending = classFines.filter((fine) => !fine.is_paid).reduce((sum, fine) => sum + fine.amount_cents, 0);
    return { paid, pending, total: paid + pending };
  }, [classFines]);

  async function ensureStudent(name: string, className: ClassName) {
    const existing = students.find((s) => s.class_name === className && s.full_name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const { data, error } = await supabase.from("students").insert({ teacher_id: user.id, class_name: className, full_name: name }).select("id").single();
    if (error) {
      const { data: found } = await supabase.from("students").select("id").eq("class_name", className).ilike("full_name", name).maybeSingle();
      return found?.id ?? null;
    }
    return data.id;
  }

  async function saveFine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const studentName = String(form.get("student_name") ?? "").trim();
    if (!studentName) { toast.error("Elige o escribe un alumno"); return; }
    const amountCents = Math.round(Number(String(form.get("amount_euros") ?? "").replace(",", ".")) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0 || amountCents > 100000) { toast.error("Escribe un importe válido en euros (máx. 1000 €)"); return; }
    const studentId = await ensureStudent(studentName, activeClass);
    const payload = {
      teacher_id: user.id,
      class_name: activeClass,
      student_name: studentName,
      student_id: studentId,
      amount_cents: amountCents,
      occurred_on: String(form.get("occurred_on")),
      is_paid: form.get("is_paid") === "on",
      notes: String(form.get("notes") ?? "").trim() || null,
    };
    const wasEditing = Boolean(editing);
    const result = editing
      ? await supabase.from("fines").update(payload).eq("id", editing.id)
      : await supabase.from("fines").insert(payload);
    if (result.error) {
      toast.error("No se pudo guardar la multa");
      return;
    }
    toast.success(wasEditing ? "Multa actualizada" : "Multa añadida");
    setDialogOpen(false);
    setEditing(null);
    if (!wasEditing) celebrateDeposit();
    await loadData();
  }

  async function togglePaid(fine: Fine) {
    const { error } = await supabase.from("fines").update({ is_paid: !fine.is_paid }).eq("id", fine.id);
    if (error) {
      toast.error("No se pudo cambiar el estado");
      return;
    }
    await loadData();
  }

  async function removeFine(fine: Fine) {
    if (!window.confirm(`¿Eliminar la multa de ${fine.student_name}?`)) return;
    const { error } = await supabase.from("fines").delete().eq("id", fine.id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    toast.success("Multa eliminada");
    await loadData();
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/", replace: true });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("display_name") ?? "").trim();
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName });
    if (error) {
      toast.error("No se pudo guardar el perfil");
      return;
    }
    setProfileName(displayName);
    setProfileOpen(false);
    toast.success("Perfil actualizado");
  }

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(fine: Fine) { setEditing(fine); setActiveClass(fine.class_name as ClassName); setDialogOpen(true); }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo de La Hucha de Lengua" className="size-10 rounded-md object-contain" />
            <div><p className="font-display text-lg font-bold leading-tight">La Hucha de Lengua</p><p className="text-xs text-muted-foreground">CENTRO CULTURAL VALLISOLETANO · 4.º ESO</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setProfileOpen(true)}><UserRound />{profileName}</Button>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="mb-1 text-sm font-semibold text-primary">CURSO 2026 · 2027</p><h1 className="font-display text-3xl font-bold sm:text-4xl">Control de multas</h1><p className="mt-2 text-muted-foreground">Cada palabra cuenta. Cada céntimo también.</p></div>
          <div className="flex gap-2"><Button size="lg" variant="outline" onClick={() => setStudentsOpen(true)}><UserRound /> Alumnos</Button><Button size="lg" onClick={openCreate}><Plus /> Nueva multa</Button></div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-md bg-secondary p-1.5">
          {allowedClasses.map((className) => <Button key={className} variant={activeClass === className ? "default" : "ghost"} className="h-11" onClick={() => setActiveClass(className)}>{className}</Button>)}
        </div>

        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <Summary icon={<Check />} label="Recaudado" value={money(totals.paid)} tone="success" />
          <Summary icon={<WalletCards />} label="Pendiente" value={money(totals.pending)} tone="warning" />
          <Summary icon={<Coins />} label="Total" value={money(totals.total)} tone="primary" />
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-2xl font-bold">Historial de {activeClass}</h2><p className="text-sm text-muted-foreground">{classFines.length} {classFines.length === 1 ? "registro" : "registros"}</p></div>
            <div className="flex gap-1 rounded-md border border-border bg-card p-1">
              {([['all', 'Todas'], ['pending', 'Pendientes'], ['paid', 'Pagadas']] as const).map(([value, label]) => <Button key={value} size="sm" variant={status === value ? "secondary" : "ghost"} onClick={() => setStatus(value)}>{label}</Button>)}
            </div>
          </div>

          {loading ? <div className="py-16 text-center text-muted-foreground">Cargando registros…</div> : visibleFines.length === 0 ? (
            <div className="empty-state py-16 text-center"><Coins className="mx-auto mb-4 size-10 text-muted-foreground" /><h3 className="font-display text-xl font-bold">La hucha está vacía</h3><p className="mt-1 text-sm text-muted-foreground">No hay multas en esta vista.</p><Button className="mt-5" onClick={openCreate}><Plus /> Añadir la primera</Button></div>
          ) : (
            <div className="space-y-2">
              {visibleFines.map((fine) => (
                <article key={fine.id} className="record-row grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-border bg-card px-4 py-3 sm:grid-cols-[1fr_120px_130px_auto]">
                  <div className="min-w-0"><p className="truncate font-semibold">{fine.student_name}</p><p className="truncate text-xs text-muted-foreground">{new Date(`${fine.occurred_on}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}{fine.notes ? ` · ${fine.notes}` : ""}</p></div>
                  <p className="font-display text-xl font-bold">{money(fine.amount_cents)}</p>
                  <Button size="sm" variant={fine.is_paid ? "secondary" : "outline"} className="justify-self-start" onClick={() => togglePaid(fine)}>{fine.is_paid ? <Check /> : <ChevronRight />}{fine.is_paid ? "Pagada" : "Pendiente"}</Button>
                  <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => openEdit(fine)} aria-label="Editar multa" title="Editar"><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => removeFine(fine)} aria-label="Eliminar multa" title="Eliminar"><Trash2 /></Button></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Editar multa" : `Nueva multa · ${activeClass}`}</DialogTitle><DialogDescription>Elige el alumno y escribe el importe en euros.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={saveFine}>
            <StudentField key={editing?.id ?? "new"} names={students.filter((s) => s.class_name === activeClass).map((s) => s.full_name)} initial={editing?.student_name ?? ""} />
            <div className="space-y-2"><Label htmlFor="amount_euros">Importe (€)</Label><Input id="amount_euros" name="amount_euros" type="text" inputMode="decimal" autoComplete="off" pattern="^\d{1,4}([.,]\d{1,2})?$" defaultValue={editing ? (editing.amount_cents / 100).toFixed(2).replace(".", ",") : ""} placeholder="Ej.: 0,20" required /><p className="text-xs text-muted-foreground">Usa coma o punto para los céntimos.</p></div>
            <div className="space-y-2"><Label htmlFor="occurred_on">Fecha</Label><Input id="occurred_on" name="occurred_on" type="date" defaultValue={editing?.occurred_on ?? new Date().toISOString().slice(0, 10)} required /></div>
            <label className="flex items-center gap-3 rounded-md border border-border p-3"><input type="checkbox" name="is_paid" defaultChecked={editing?.is_paid} className="size-4 accent-primary" /><span className="text-sm font-medium">Ya está pagada</span></label>
            <div className="space-y-2"><Label htmlFor="notes">Nota <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="notes" name="notes" defaultValue={editing?.notes ?? ""} placeholder="Contexto o recordatorio" maxLength={500} /></div>
            <Button type="submit" size="lg" className="w-full">{editing ? "Guardar cambios" : "Añadir a la hucha"}</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={studentsOpen} onOpenChange={setStudentsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-2xl">Alumnos de {activeClass}</DialogTitle><DialogDescription>Añade su correo para que reciban cada viernes a las 7:00 un recordatorio de lo que deben.</DialogDescription></DialogHeader>
          {students.filter((s) => s.class_name === activeClass).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Los alumnos aparecerán aquí al ponerles su primera multa.</p>
          ) : (
            <div className="space-y-3">
              {students.filter((s) => s.class_name === activeClass).map((student) => (
                <form key={student.id} className="space-y-1.5" onSubmit={(e) => { e.preventDefault(); void saveStudentEmail(student, String(new FormData(e.currentTarget).get("email") ?? "")); }}>
                  <Label htmlFor={`email-${student.id}`}>{student.full_name}</Label>
                  <div className="flex gap-2"><Input id={`email-${student.id}`} name="email" type="email" defaultValue={student.email ?? ""} placeholder="correo@ejemplo.com" maxLength={255} /><Button type="submit" variant="secondary">Guardar</Button></div>
                </form>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-2xl">Perfil del profesor</DialogTitle><DialogDescription>Este nombre aparece en la cabecera del panel.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={saveProfile}>
            <div className="space-y-2"><Label htmlFor="display_name">Nombre visible</Label><Input id="display_name" name="display_name" defaultValue={profileName} required maxLength={80} /></div>
            <Button type="submit" className="w-full">Guardar nombre</Button>
          </form>
        </DialogContent>
      </Dialog>
      {celebrating && (
        <div className="piggy-celebration fixed inset-0 z-50 grid place-items-center bg-foreground/25 px-4" role="status" aria-live="polite">
          <div className="relative flex w-full max-w-xs flex-col items-center rounded-md border border-border bg-card px-6 pb-7 pt-12 text-center shadow-xl">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setCelebrating(false)} aria-label="Cerrar animación" title="Cerrar">
              <X />
            </Button>
            <div className="piggy-scene relative mb-4 h-32 w-44" aria-hidden="true">
              {[0, 1, 2].map((coin) => <span key={coin} className={`falling-coin falling-coin-${coin}`}>€</span>)}
              <PiggyBank className="piggy-bank absolute bottom-0 left-1/2 size-28 -translate-x-1/2 text-primary" strokeWidth={1.7} />
            </div>
            <p className="font-display text-2xl font-bold">¡A la hucha!</p>
            <p className="mt-1 text-sm text-muted-foreground">La multa se ha guardado correctamente.</p>
          </div>
        </div>
      )}
    </main>
  );
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "warning" | "primary" }) {
  return <div className="summary-card flex items-center gap-4 rounded-md border border-border bg-card p-4"><div className={`summary-icon summary-icon-${tone} flex size-11 shrink-0 items-center justify-center rounded-md`}>{icon}</div><div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div></div>;
}