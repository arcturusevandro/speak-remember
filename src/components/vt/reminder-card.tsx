import { useState } from "react";
import { Check, Pencil, Trash2, Undo2, X } from "lucide-react";

import { dateLabel, shortDateLabel, timeLabel } from "@/lib/reminders/format";
import type { Recurrence, Reminder, ReminderDraft } from "@/lib/reminders/types";
import { recurrenceLabel } from "@/lib/reminders/types";
import { fromDateString } from "@/lib/nlp/parse-reminder";

interface Props {
  reminder: Reminder;
  onToggleDone: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
  onSave: (reminder: Reminder, patch: Partial<ReminderDraft>) => void;
  busy?: boolean;
}

const RECURRENCE_OPTIONS: Array<{ value: Recurrence; label: string }> = [
  { value: "none", label: "Não se repete" },
  { value: "daily", label: "Todos os dias" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
];

export function ReminderCard({ reminder, onToggleDone, onDelete, onSave, busy }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(reminder.title);
  const [date, setDate] = useState(reminder.due_date);
  const [time, setTime] = useState(timeLabel(reminder.due_time));
  const [recurrence, setRecurrence] = useState<Recurrence>(reminder.recurrence);

  const done = reminder.status === "done";

  function cancel() {
    setTitle(reminder.title);
    setDate(reminder.due_date);
    setTime(timeLabel(reminder.due_time));
    setRecurrence(reminder.recurrence);
    setEditing(false);
  }

  function save() {
    if (!title.trim() || !date || !time) return;
    const parsedDate = fromDateString(date);
    onSave(reminder, {
      title: title.trim(),
      due_date: date,
      due_time: `${time}:00`,
      recurrence,
      recurrence_weekday: recurrence === "weekly" ? parsedDate.getDay() : null,
      recurrence_monthday: recurrence === "monthly" ? parsedDate.getDate() : null,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <article className="rounded-2xl border border-primary/25 bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="vt-label">Lembrete</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 rounded-xl border border-border-strong bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="vt-label">Data</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 rounded-xl border border-border-strong bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="vt-label">Horário</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="h-10 rounded-xl border border-border-strong bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="vt-label">Recorrência</span>
            <select
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value as Recurrence)}
              className="h-10 rounded-xl border border-border-strong bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={save}
            disabled={busy}
            className="h-9 cursor-pointer rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Salvar
          </button>
          <button
            onClick={cancel}
            className="h-9 cursor-pointer rounded-full border border-border-strong px-4 text-sm"
          >
            Cancelar
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl border border-border bg-surface p-4 transition-opacity ${done ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-14 shrink-0 rounded-xl py-1.5 text-center ${done ? "bg-success/15" : "bg-primary-soft"}`}
        >
          <p
            className={`font-mono text-[10px] uppercase ${done ? "text-success" : "text-primary"}`}
          >
            {shortDateLabel(reminder.due_date)}
          </p>
          <p className="font-mono text-sm font-medium text-foreground">
            {timeLabel(reminder.due_time)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[15px] font-medium leading-snug ${done ? "line-through decoration-muted/50" : ""}`}
          >
            {reminder.title}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            {dateLabel(reminder.due_date)} · {timeLabel(reminder.due_time)} ·{" "}
            {recurrenceLabel(reminder)}
            {done ? " · Concluído" : ""}
          </p>
        </div>

        <div className="flex shrink-0 gap-1 text-muted">
          <button
            onClick={() => onToggleDone(reminder)}
            disabled={busy}
            aria-label={done ? "Reabrir lembrete" : "Marcar como concluído"}
            title={done ? "Reabrir" : "Concluir"}
            className="grid size-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-background hover:text-foreground"
          >
            {done ? <Undo2 className="size-4" /> : <Check className="size-4" />}
          </button>
          <button
            onClick={() => setEditing(true)}
            aria-label="Editar lembrete"
            title="Editar"
            className="grid size-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-background hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onDelete(reminder)}
            disabled={busy}
            aria-label="Excluir lembrete"
            title="Excluir"
            className="grid size-8 cursor-pointer place-items-center rounded-full transition-colors hover:bg-background hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ReminderCardSkeleton() {
  return (
    <div className="h-[86px] animate-pulse rounded-2xl border border-border bg-surface" />
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 px-5 py-10 text-center">
      <X className="mx-auto mb-3 size-5 text-muted" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
