import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MessageCircle, Bell, CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Voztrace" },
      {
        name: "description",
        content: "Ajuste seu nome, fuso horário e veja o que vem por aí no Voztrace.",
      },
      { property: "og:title", content: "Configurações — Voztrace" },
      {
        property: "og:description",
        content: "Ajuste seu nome, fuso horário e veja o que vem por aí no Voztrace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Configuracoes,
});

const ROADMAP = [
  { icon: MessageCircle, title: "Lembretes no WhatsApp", body: "Receba o aviso onde você já conversa." },
  { icon: Bell, title: "Notificações push", body: "Alertas no navegador e no celular." },
  { icon: CalendarDays, title: "Sincronizar agenda", body: "Espelhe seus lembretes no calendário." },
];

async function loadProfile() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Sessão expirada.");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, timezone")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (error) throw error;
  return { ...data, email: userData.user.email ?? "" };
}

function Configuracoes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["profile"], queryFn: loadProfile });

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setName(query.data.display_name ?? "");
    setTimezone(query.data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, [query.data]);

  const save = useMutation({
    mutationFn: async () => {
      const id = query.data?.id;
      if (!id) throw new Error("Perfil indisponível.");
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name.trim() || null, timezone })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Preferências salvas.");
    },
    onError: () => toast.error("Não consegui salvar suas preferências."),
  });

  const zones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [Intl.DateTimeFormat().resolvedOptions().timeZone];

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Configurações
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        O fuso horário define como as datas e horários são interpretados.
      </p>

      <section className="mt-8 rounded-3xl border border-border bg-surface p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="vt-label">Nome</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 rounded-2xl border border-border-strong bg-background px-4 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="vt-label">E-mail</span>
            <input
              value={query.data?.email ?? ""}
              readOnly
              className="h-11 rounded-2xl border border-border bg-background/60 px-4 text-[15px] text-muted"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="vt-label">Fuso horário</span>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="h-11 rounded-2xl border border-border-strong bg-background px-4 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || query.isLoading}
          className="mt-5 h-11 cursor-pointer rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {save.isPending ? "Salvando…" : "Salvar preferências"}
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Em breve</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ROADMAP.map((item) => (
            <div key={item.title} className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-4">
              <item.icon className="size-4 text-primary" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          await navigate({ to: "/" });
        }}
        className="mt-8 cursor-pointer text-sm text-muted transition-colors hover:text-destructive"
      >
        Sair da conta
      </button>
    </main>
  );
}
