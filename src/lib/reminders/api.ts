import { supabase } from "@/integrations/supabase/client";
import type { Reminder, ReminderDraft, ReminderStatus } from "@/lib/reminders/types";

export async function listReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reminder[];
}

export async function createReminder(draft: ReminderDraft): Promise<Reminder> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Sessão expirada.");

  const { data, error } = await supabase
    .from("reminders")
    .insert({ ...draft, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Reminder;
}

export async function updateReminder(
  id: string,
  patch: Partial<ReminderDraft> & { status?: ReminderStatus },
): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Reminder;
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}

export const remindersQueryKey = ["reminders"] as const;
