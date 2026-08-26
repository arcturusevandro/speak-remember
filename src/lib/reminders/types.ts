export type Recurrence = "none" | "daily" | "weekly" | "monthly";
export type ReminderStatus = "pending" | "done" | "cancelled";

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string; // yyyy-MM-dd
  due_time: string; // HH:mm:ss
  timezone: string;
  recurrence: Recurrence;
  recurrence_weekday: number | null;
  recurrence_monthday: number | null;
  status: ReminderStatus;
  original_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderDraft {
  title: string;
  description: string | null;
  due_date: string;
  due_time: string;
  timezone: string;
  recurrence: Recurrence;
  recurrence_weekday: number | null;
  recurrence_monthday: number | null;
  original_text: string | null;
}

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: "Sem recorrência",
  daily: "Todos os dias",
  weekly: "Toda semana",
  monthly: "Todo mês",
};

export const WEEKDAY_LABEL = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export function recurrenceLabel(reminder: {
  recurrence: Recurrence;
  recurrence_weekday: number | null;
  recurrence_monthday: number | null;
}): string {
  switch (reminder.recurrence) {
    case "daily":
      return "Todos os dias";
    case "weekly":
      return reminder.recurrence_weekday === null
        ? "Toda semana"
        : `Toda ${WEEKDAY_LABEL[reminder.recurrence_weekday]}`;
    case "monthly":
      return reminder.recurrence_monthday === null
        ? "Todo mês"
        : `Todo dia ${reminder.recurrence_monthday}`;
    default:
      return "Sem recorrência";
  }
}
