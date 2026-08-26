import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";

import { VtLogo } from "@/components/vt/logo";
import { supabase } from "@/integrations/supabase/client";

const LINKS = [
  { to: "/painel", label: "Início" },
  { to: "/lembretes", label: "Meus lembretes" },
  { to: "/configuracoes", label: "Configurações" },
] as const;

export function AppNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/painel" aria-label="Voztrace">
          <VtLogo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={signOut}
            className="hidden cursor-pointer text-sm text-muted transition-colors hover:text-foreground sm:block"
          >
            Sair
          </button>
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label="Abrir menu"
            aria-expanded={open}
            className="grid size-9 cursor-pointer place-items-center rounded-full border border-border-strong text-foreground md:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-surface px-5 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-background hover:text-foreground"
                  activeProps={{ className: "text-foreground font-medium bg-background" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={signOut}
                className="block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-background hover:text-foreground"
              >
                Sair
              </button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
