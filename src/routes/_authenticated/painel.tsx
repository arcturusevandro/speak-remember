import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Composer } from "@/components/vt/composer";
import { EmptyState, ReminderCard, ReminderCardSkeleton } from "@/components/vt/reminder-card";
import {
  createReminder,
  deleteReminder,
  listReminders,
  remindersQueryKey,
  updateReminder,
} from "@/lib/reminders/api";
import { reminderDateTime } from "@/lib/reminders/format";
import type { Reminder, ReminderDraft } from "@/lib/reminders/types";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — Voztrace" },
      {
        name: "description",
        content: "Crie lembretes por voz ou texto e confirme antes de salvar.",
      },
      { property: "og:title", content: "Painel — Voztrace" },
      {
        property: "og:description",
        content: "Crie lembretes por voz ou texto e confirme antes de salvar.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function Painel() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: remindersQueryKey, queryFn: listReminders });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: remindersQueryKey });

  const create = useMutation({
    mutationFn: (draft: ReminderDraft) => createReminder(draft),
    onSuccess: () => {
      invalidate();
      toast.success("Lembrete salvo.");
    },
    onError: () => toast.error("Não consegui salvar o lembrete. Tente novamente."),
  });

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

  const upcoming = (query.data ?? [])
    .filter((reminder) => reminder.status === "pending")
    .sort(
      (a, b) =>
        reminderDateTime(a.due_date, a.due_time).getTime() -
        reminderDateTime(b.due_date, b.due_time).getTime(),
    )
    .slice(0, 4);

  const busy = update.isPending || remove.isPending;

  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:px-8">
      <p className="vt-label">{greeting()}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        O que você não quer esquecer?
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Fale ou escreva como preferir. Eu interpreto e confirmo com você antes de salvar.
      </p>

      <Composer saving={create.isPending} onConfirm={async (draft) => create.mutateAsync(draft)} />

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Próximos lembretes</h2>
          <Link
            to="/lembretes"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            Ver todos <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {query.isLoading ? (
            <>
              <ReminderCardSkeleton />
              <ReminderCardSkeleton />
            </>
          ) : upcoming.length === 0 ? (
            <EmptyState
              title="Nenhum lembrete por aqui ainda"
              hint="Experimente: “me lembra amanhã às 10h de ligar para o Carlos”."
            />
          ) : (
            upcoming.map((reminder: Reminder) => (
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
      </section>
    </main>
  );
}
