import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import type { ParsedReminder } from "@/lib/nlp/parse-reminder";
import { dateLabel, timeLabel } from "@/lib/reminders/format";
import type { Recurrence, ReminderDraft } from "@/lib/reminders/types";
import { WEEKDAY_LABEL } from "@/lib/reminders/types";
import { fromDateString } from "@/lib/nlp/parse-reminder";

interface Props {
  parsed: ParsedReminder;
  saving?: boolean;
  onConfirm: (draft: ReminderDraft) => void;
  onDismiss: () => void;
}

const RECURRENCE_OPTIONS: Array<{ value: Recurrence; label: string }> = [
  { value: "none", label: "Não se repete" },
  { value: "daily", label: "Todos os dias" },
  { value: "weekly", label: "Toda semana" },
  { value: "monthly", label: "Todo mês" },
];

function recurrenceChip(recurrence: Recurrence, date: string | null): string {
  if (recurrence === "none") return "Sem recorrência";
  if (recurrence === "daily") return "Todos os dias";
  if (!date) return recurrence === "weekly" ? "Toda semana" : "Todo mês";
  const parsedDate = fromDateString(date);
  return recurrence === "weekly"
    ? `Toda ${WEEKDAY_LABEL[parsedDate.getDay()]}`
    : `Todo dia ${parsedDate.getDate()}`;
}

export function ConfirmationCard({ parsed, saving, onConfirm, onDismiss }: Props) {
  const [title, setTitle] = useState(parsed.title);
  const [date, setDate] = useState(parsed.date ?? "");
  const [time, setTime] = useState(parsed.time ?? "");
  const [recurrence, setRecurrence] = useState<Recurrence>(parsed.recurrence);
  const [editing, setEditing] = useState(parsed.missing.length > 0);

  useEffect(() => {
    setTitle(parsed.title);
    setDate(parsed.date ?? "");
    setTime(parsed.time ?? "");
    setRecurrence(parsed.recurrence);
    setEditing(parsed.missing.length > 0);
  }, [parsed]);

  const incomplete = !title.trim() || !date || !time;

  const question = useMemo(() => {
    if (!parsed.title) return "O que você quer ser lembrado?";
    if (parsed.missing.includes("date") && parsed.missing.includes("time"))
      return "Quando você quer ser lembrado?";
    if (parsed.missing.includes("date")) return "Em que dia você quer ser lembrado?";
    if (parsed.missing.includes("time")) return "A que horas você quer ser lembrado?";
    return null;
  }, [parsed]);

  function submit() {
    if (incomplete) return;
    const parsedDate = fromDateString(date);
    onConfirm({
      title: title.trim(),
      description: null,
      due_date: date,
      due_time: `${time}:00`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrence,
      recurrence_weekday: recurrence === "weekly" ? parsedDate.getDay() : null,
      recurrence_monthday: recurrence === "monthly" ? parsedDate.getDate() : null,
      original_text: parsed.originalText,
    });
  }

  return (
    <div className="mt-5 animate-vt-pop rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
            question ? "bg-muted/25 text-foreground" : "bg-primary text-primary-foreground"
          }`}
          aria-hidden
        >
          {question ? "?" : <Check className="size-3.5" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {question ?? "Entendi seu lembrete"}
          </p>

          {question ? (
            <p className="mt-0.5 text-sm text-muted">
              Não vou inventar essa informação — preencha abaixo para eu salvar.
            </p>
          ) : null}

          {editing ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 flex flex-col gap-1.5">
                <span className="vt-label">Lembrete</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Ligar para o Carlos"
                  className="h-10 rounded-xl border border-border-strong bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="vt-label">Data</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-10 rounded-xl border border-border-strong bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="vt-label">Horário</span>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="h-10 rounded-xl border border-border-strong bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="sm:col-span-2 flex flex-col gap-1.5">
                <span className="vt-label">Recorrência</span>
                <select
                  value={recurrence}
                  onChange={(event) => setRecurrence(event.target.value as Recurrence)}
                  className="h-10 rounded-xl border border-border-strong bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <>
              <p className="mt-0.5 text-sm text-foreground/90">{title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                  {dateLabel(date)}
                </span>
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                  {timeLabel(time)}
                </span>
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                  {recurrenceChip(recurrence, date)}
                </span>
              </div>
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={submit}
              disabled={incomplete || saving}
              className="h-9 cursor-pointer rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Salvando…" : "Confirmar lembrete"}
            </button>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border-strong px-4 text-sm text-foreground transition-colors hover:bg-surface"
              >
                <Pencil className="size-3.5" /> Editar
              </button>
            ) : null}
            <button
              onClick={onDismiss}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm text-muted transition-colors hover:text-foreground"
            >
              <X className="size-3.5" /> Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
