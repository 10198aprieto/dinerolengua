import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

const links = [
  { to: "/metodologia", label: "Metodología" },
  { to: "/aviso-legal", label: "Aviso legal" },
  { to: "/politica-de-privacidad", label: "Política de privacidad" },
  { to: "/politica-de-cookies", label: "Política de cookies" },
  { to: "/terminos-de-uso", label: "Términos de uso" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <nav aria-label="Información y documentos legales" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          {links.map(({ to, label }) => <Link key={to} to={to} className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{label}</Link>)}
          <a
            href="https://github.com/10198aprieto/dinerolengua"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Github className="size-4 shrink-0" aria-hidden="true" />
            Código (Repositorio de GitHub)
          </a>
        </nav>
        <div className="mt-6 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
          <p>© 2026 La Hucha de Lengua. Todos los derechos reservados.</p>
          <p>Diseño y creación por: <span className="font-semibold text-foreground">Mateo Fernández Prieto</span>.</p>
        </div>
      </div>
    </footer>
  );
}
