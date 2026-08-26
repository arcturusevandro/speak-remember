import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { fromDateString } from "@/lib/nlp/parse-reminder";

export function reminderDateTime(dueDate: string, dueTime: string): Date {
  const base = fromDateString(dueDate);
  const [h, m] = dueTime.split(":").map(Number);
  base.setHours(h ?? 0, m ?? 0, 0, 0);
  return base;
}

export function timeLabel(dueTime: string): string {
  return dueTime.slice(0, 5);
}

/** "Hoje", "Amanhã", "Ontem" ou "17 de março". */
export function dateLabel(dueDate: string, now: Date = new Date()): string {
  const date = fromDateString(dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === 2) return "Depois de amanhã";
  if (diff === -1) return "Ontem";
  if (diff > 2 && diff < 7) return format(date, "EEEE", { locale: ptBR });
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

/** Rótulo curto para o selo do cartão: "Hoje", "Qui" ou "17 mar". */
export function shortDateLabel(dueDate: string, now: Date = new Date()): string {
  const date = fromDateString(dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  if (diff > 1 && diff < 7) return format(date, "EEE", { locale: ptBR }).replace(".", "");
  return format(date, "d MMM", { locale: ptBR }).replace(".", "");
}

export function fullDateLabel(dueDate: string): string {
  return format(fromDateString(dueDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function isToday(dueDate: string, now: Date = new Date()): boolean {
  return isSameDay(fromDateString(dueDate), now);
}
