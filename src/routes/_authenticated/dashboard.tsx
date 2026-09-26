import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Check, ChevronRight, Coins, LogOut, Pencil, Plus, Trash2, UserRound, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  const [editing, setEditing] = useState<Fine | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [{ data: fineRows, error }, { data: profile }] = await Promise.all([
      supabase.from("fines").select("*").order("occurred_on", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    ]);
    if (error) toast.error("No se pudieron cargar los registros");
    setFines(fineRows ?? []);
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

  async function saveFine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      teacher_id: user.id,
      class_name: activeClass,
      student_name: String(form.get("student_name") ?? "").trim(),
      amount_cents: Number(form.get("amount_cents")),
      occurred_on: String(form.get("occurred_on")),
      is_paid: form.get("is_paid") === "on",
      notes: String(form.get("notes") ?? "").trim() || null,
    };
    const result = editing
      ? await supabase.from("fines").update(payload).eq("id", editing.id)
      : await supabase.from("fines").insert(payload);
    if (result.error) {
      toast.error("No se pudo guardar la multa");
      return;
    }
    toast.success(editing ? "Multa actualizada" : "Multa añadida");
    setDialogOpen(false);
    setEditing(null);
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

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(fine: Fine) { setEditing(fine); setActiveClass(fine.class_name as ClassName); setDialogOpen(true); }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><BookOpen /></div>
            <div><p className="font-display text-lg font-bold leading-tight">La Hucha de Lengua</p><p className="text-xs text-muted-foreground">IES · 4.º ESO</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><UserRound className="size-4" />{profileName}</span>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="mb-1 text-sm font-semibold text-primary">CURSO 2026 · 2027</p><h1 className="font-display text-3xl font-bold sm:text-4xl">Control de multas</h1><p className="mt-2 text-muted-foreground">Cada palabra cuenta. Cada céntimo también.</p></div>
          <Button size="lg" onClick={openCreate}><Plus /> Nueva multa</Button>
        </div>

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
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Editar multa" : `Nueva multa · ${activeClass}`}</DialogTitle><DialogDescription>Registra entre 0,10 € y 0,50 €.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={saveFine}>
            <div className="space-y-2"><Label htmlFor="student_name">Alumno</Label><Input id="student_name" name="student_name" defaultValue={editing?.student_name} placeholder="Nombre y apellidos" required maxLength={100} /></div>
            <fieldset><legend className="mb-2 text-sm font-medium">Importe</legend><div className="grid grid-cols-5 gap-2">{amounts.map((amount) => <label key={amount} className="amount-choice"><input className="peer sr-only" type="radio" name="amount_cents" value={amount} defaultChecked={(editing?.amount_cents ?? 10) === amount} /><span className="flex h-10 items-center justify-center rounded-md border border-input text-sm font-semibold peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">{amount}¢</span></label>)}</div></fieldset>
            <div className="space-y-2"><Label htmlFor="occurred_on">Fecha</Label><Input id="occurred_on" name="occurred_on" type="date" defaultValue={editing?.occurred_on ?? new Date().toISOString().slice(0, 10)} required /></div>
            <label className="flex items-center gap-3 rounded-md border border-border p-3"><input type="checkbox" name="is_paid" defaultChecked={editing?.is_paid} className="size-4 accent-primary" /><span className="text-sm font-medium">Ya está pagada</span></label>
            <div className="space-y-2"><Label htmlFor="notes">Nota <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="notes" name="notes" defaultValue={editing?.notes ?? ""} placeholder="Contexto o recordatorio" maxLength={500} /></div>
            <Button type="submit" size="lg" className="w-full">{editing ? "Guardar cambios" : "Añadir a la hucha"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "success" | "warning" | "primary" }) {
  return <div className="summary-card flex items-center gap-4 rounded-md border border-border bg-card p-4"><div className={`summary-icon summary-icon-${tone} flex size-11 shrink-0 items-center justify-center rounded-md`}>{icon}</div><div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div></div>;
}