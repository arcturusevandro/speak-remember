import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, ReminderCard, ReminderCardSkeleton } from "@/components/vt/reminder-card";
import {
  deleteReminder,
  listReminders,
  remindersQueryKey,
  updateReminder,
} from "@/lib/reminders/api";
import { isToday, reminderDateTime } from "@/lib/reminders/format";
import type { Reminder } from "@/lib/reminders/types";

export const Route = createFileRoute("/_authenticated/lembretes")({
  head: () => ({
    meta: [
      { title: "Meus lembretes — Voztrace" },
      {
        name: "description",
        content: "Veja, filtre, edite e conclua os lembretes que você criou no Voztrace.",
      },
      { property: "og:title", content: "Meus lembretes — Voztrace" },
      {
        property: "og:description",
        content: "Veja, filtre, edite e conclua os lembretes que você criou no Voztrace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Lembretes,
});

type Filter = "upcoming" | "today" | "recurring" | "done";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "upcoming", label: "Próximos" },
  { value: "today", label: "Hoje" },
  { value: "recurring", label: "Recorrentes" },
  { value: "done", label: "Concluídos" },
];

const EMPTY: Record<Filter, { title: string; hint: string }> = {
  upcoming: {
    title: "Nenhum lembrete pendente",
    hint: "Crie um novo no painel falando ou escrevendo naturalmente.",
  },
  today: { title: "Nada marcado para hoje", hint: "Aproveite — ou registre algo novo." },
  recurring: {
    title: "Nenhum lembrete recorrente",
    hint: "Experimente dizer “toda segunda às 8h enviar o relatório”.",
  },
  done: { title: "Nada concluído ainda", hint: "Os lembretes finalizados aparecem aqui." },
};

function Lembretes() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [search, setSearch] = useState("");

  const query = useQuery({ queryKey: remindersQueryKey, queryFn: listReminders });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: remindersQueryKey });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateReminder>[1] }) =>
      updateReminder(id, patch),
    onSuccess: invalidate,
    onError: () => toast.error("Não consegui atualizar o lembrete."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => {
      invalidate();
      toast.success("Lembrete excluído.");
    },
    onError: () => toast.error("Não consegui excluir o lembrete."),
  });

  const reminders = useMemo(() => {
    const all = query.data ?? [];
    const term = search.trim().toLowerCase();
    return all
      .filter((reminder) => {
        if (term && !reminder.title.toLowerCase().includes(term)) return false;
        if (filter === "done") return reminder.status === "done";
        if (reminder.status === "done") return false;
        if (filter === "today") return isToday(reminder.due_date);
        if (filter === "recurring") return reminder.recurrence !== "none";
        return true;
      })
      .sort((a, b) => {
        const diff =
          reminderDateTime(a.due_date, a.due_time).getTime() -
          reminderDateTime(b.due_date, b.due_time).getTime();
        return filter === "done" ? -diff : diff;
      });
  }, [query.data, filter, search]);

  const busy = update.isPending || remove.isPending;

  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Meus lembretes
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Tudo o que você registrou, organizado por data e horário.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtros">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`h-9 cursor-pointer rounded-full border px-4 text-sm transition-colors ${
                filter === item.value
                  ? "border-transparent bg-foreground text-background"
                  : "border-border-strong text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar…"
          aria-label="Buscar lembretes"
          className="h-9 rounded-full border border-border-strong bg-surface px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-48"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {query.isLoading ? (
          <>
            <ReminderCardSkeleton />
            <ReminderCardSkeleton />
            <ReminderCardSkeleton />
          </>
        ) : reminders.length === 0 ? (
          <EmptyState title={EMPTY[filter].title} hint={EMPTY[filter].hint} />
        ) : (
          reminders.map((reminder: Reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              busy={busy}
              onToggleDone={(item) =>
                update.mutate({
                  id: item.id,
                  patch: { status: item.status === "done" ? "pending" : "done" },
                })
              }
              onDelete={(item) => remove.mutate(item.id)}
              onSave={(item, patch) => update.mutate({ id: item.id, patch })}
            />
          ))
        )}
      </div>
    </main>
  );
}
