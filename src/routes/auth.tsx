import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { VtLogo } from "@/components/vt/logo";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

type Mode = "entrar" | "criar";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { modo: Mode } => ({
    modo: search['modo'] === "criar" ? "criar" : "entrar",
  }),
  head: () => ({
    meta: [
      { title: "Entrar no Voztrace" },
      {
        name: "description",
        content: "Acesse sua conta Voztrace para criar e organizar lembretes por voz ou texto.",
      },
      { property: "og:title", content: "Entrar no Voztrace" },
      {
        property: "og:description",
        content: "Acesse sua conta Voztrace para criar e organizar lembretes por voz ou texto.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(modo);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setMode(modo), [modo]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "criar") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/painel`,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await navigate({ to: "/painel" });
        } else {
          toast.success("Conta criada! Confirme seu e-mail para entrar.");
          setMode("entrar");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/painel" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível continuar.";
      toast.error(
        message.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : message.includes("already registered")
            ? "Este e-mail já tem conta. Faça login."
            : message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    await navigate({ to: "/painel" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-5 py-6 md:px-8">
        <Link to="/" aria-label="Voztrace">
          <VtLogo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-[420px] animate-vt-rise">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {mode === "criar" ? "Criar sua conta" : "Bem-vindo de volta"}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {mode === "criar"
              ? "Comece a criar lembretes falando naturalmente."
              : "Entre para ver e criar seus lembretes."}
          </p>

          <button
            onClick={google}
            className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-border-strong bg-surface text-[15px] font-medium text-foreground transition-colors hover:bg-background"
          >
            <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
              />
            </svg>
            Continuar com Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="vt-label">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            {mode === "criar" ? (
              <label className="flex flex-col gap-1.5">
                <span className="vt-label">Nome</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Como quer ser chamado"
                  className="h-12 rounded-2xl border border-border-strong bg-surface px-4 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            ) : null}
            <label className="flex flex-col gap-1.5">
              <span className="vt-label">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="voce@email.com"
                className="h-12 rounded-2xl border border-border-strong bg-surface px-4 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="vt-label">Senha</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "criar" ? "new-password" : "current-password"}
                placeholder="Mínimo de 6 caracteres"
                className="h-12 rounded-2xl border border-border-strong bg-surface px-4 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 cursor-pointer rounded-2xl bg-primary text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Aguarde…" : mode === "criar" ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "criar" ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
            <button
              onClick={() => setMode(mode === "criar" ? "entrar" : "criar")}
              className="cursor-pointer font-medium text-primary hover:underline"
            >
              {mode === "criar" ? "Entrar" : "Criar agora"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
