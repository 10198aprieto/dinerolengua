import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DocumentSection = { title: string; paragraphs: string[] };

export function DocumentPage({ title, subtitle, sections, legal = false }: { title: string; subtitle: string; sections: DocumentSection[]; legal?: boolean }) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/android-chrome-512x512.png" alt="" width={56} height={56} className="size-14 shrink-0 object-contain" />
            <span className="font-display text-lg font-bold">La Hucha de Lengua</span>
          </Link>
          <Button variant="outline" asChild><Link to="/"><ArrowLeft />Volver al contador</Link></Button>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
        {legal && <aside className="mt-6 border-l-4 border-primary bg-secondary px-4 py-3 text-sm leading-relaxed"><strong>Borrador pendiente de completar y revisar.</strong> Faltan la identidad legal del titular y del responsable de los datos, su domicilio y el contacto de privacidad. La autoría del diseño no identifica por sí sola al responsable. Este documento no acredita el cumplimiento legal del sitio.</aside>}
        <div className="mt-10 space-y-9">
          {sections.map((section) => <section key={section.title}>
            <h2 className="font-display text-xl font-bold leading-snug sm:text-2xl">{section.title}</h2>
            <div className="mt-4 space-y-4 text-base leading-7">{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          </section>)}
        </div>
      </article>
    </main>
  );
}