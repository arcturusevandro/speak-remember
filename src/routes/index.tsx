import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Mic, Repeat, ShieldCheck, Sparkles } from "lucide-react";

import { VtLogo } from "@/components/vt/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voztrace — lembretes criados por voz e linguagem natural" },
      {
        name: "description",
        content:
          "Diga “me lembra amanhã às 10h de ligar para o Carlos” e o Voztrace cria o lembrete com data, horário e recorrência — sempre confirmando antes de salvar.",
      },
      { property: "og:title", content: "Voztrace — lembretes por voz e linguagem natural" },
      {
        property: "og:description",
        content:
          "Fale ou escreva naturalmente. O Voztrace interpreta, confirma com você e organiza seus lembretes.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    label: "01",
    title: "Fale ou escreva",
    body: "“Me lembra amanhã às 10 horas de ligar para o Carlos sobre o orçamento.” Sem formulários, sem campos.",
  },
  {
    label: "02",
    title: "O Voztrace interpreta",
    body: "A frase vira título, data, horário e recorrência. Se faltar algo, ele pergunta — nunca inventa.",
  },
  {
    label: "03",
    title: "Você confirma",
    body: "Uma confirmação clara aparece antes de salvar. Ajuste em um toque e pronto.",
  },
];

const FEATURES = [
  {
    icon: Mic,
    title: "Entrada por voz",
    body: "Gravação com visualização em tempo real e transcrição automática do que você falou.",
  },
  {
    icon: Sparkles,
    title: "Linguagem natural",
    body: "“Sexta às 9h”, “daqui a 2 horas”, “dia 15 às 14:30” — tudo entendido em português.",
  },
  {
    icon: Repeat,
    title: "Recorrência",
    body: "Lembretes diários, semanais ou mensais criados direto da frase: “toda segunda às 8h”.",
  },
  {
    icon: ShieldCheck,
    title: "Nada é inventado",
    body: "Sem data explícita, o Voztrace pergunta em vez de assumir. Seus horários são só seus.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <VtLogo />
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              search={{ modo: "entrar" }}
              className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              to="/auth"
              search={{ modo: "criar" }}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-vt-rise">
              <p className="vt-label">Assistente de lembretes</p>
              <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                Diga o que precisa lembrar.
                <br />
                <span className="text-primary">O resto é com a gente.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
                O Voztrace escuta uma frase comum — “me lembra amanhã às 10h de ligar para o
                Carlos” — e transforma em um lembrete organizado, com data, horário e recorrência.
                Sempre confirmando com você antes de salvar.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/auth"
                  search={{ modo: "criar" }}
                  className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-[15px] font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Começar gratuitamente
                </Link>
                <Link
                  to="/auth"
                  search={{ modo: "entrar" }}
                  className="inline-flex h-12 items-center rounded-full border border-border-strong px-6 text-[15px] text-foreground transition-colors hover:bg-surface"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>

            <div className="animate-vt-pop rounded-3xl border border-border bg-surface p-5 md:p-6">
              <p className="vt-label">Você diz</p>
              <p className="mt-2 text-[17px] leading-relaxed text-foreground">
                “Me lembra amanhã às 10 horas de ligar para o Carlos sobre o orçamento.”
              </p>

              <div className="my-5 h-px bg-border" />

              <p className="vt-label">Voztrace entende</p>
              <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-foreground">
                      Ligar para o Carlos sobre o orçamento
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {["Amanhã", "10:00", "Sem recorrência"].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 font-mono text-[11px] text-muted">
                confirmação obrigatória antes de salvar
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Três passos, nenhum formulário
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.label}>
                  <p className="font-mono text-sm text-primary">{step.label}</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-border bg-surface p-6">
                <feature.icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
          <div className="rounded-3xl border border-border bg-foreground px-6 py-14 text-center md:px-10">
            <h2 className="text-2xl font-semibold tracking-tight text-background md:text-3xl">
              Um lembrete começa com uma frase
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-background/70">
              Crie sua conta e registre o primeiro lembrete em menos de um minuto.
            </p>
            <Link
              to="/auth"
              search={{ modo: "criar" }}
              className="mt-7 inline-flex h-12 items-center rounded-full bg-background px-7 text-[15px] font-medium text-foreground transition-transform hover:scale-[1.02]"
            >
              Criar minha conta
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row md:px-8">
          <VtLogo />
          <p className="font-mono text-[11px]">© {new Date().getFullYear()} Voztrace</p>
        </div>
      </footer>
    </div>
  );
}
