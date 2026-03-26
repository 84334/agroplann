import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CalendarReminder {
  id: string;
  reminder_date: string;
  reminder_time: string;
  message: string;
  email: string;
  sent: boolean;
}

export function useCalendarReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_date", { ascending: true });

    if (data && !error) {
      setReminders(data as CalendarReminder[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (date: string, time: string, message: string) => {
    if (!user) return;
    const { error } = await supabase.from("calendar_reminders").insert({
      user_id: user.id,
      reminder_date: date,
      reminder_time: time,
      message,
      email: user.email!,
    });
    if (error) {
      toast.error("Failed to set reminder");
    } else {
      toast.success("Reminder set! You'll be notified by email.");
      fetchReminders();
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from("calendar_reminders").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete reminder");
    } else {
      toast.success("Reminder deleted");
      fetchReminders();
    }
  };

  // Get reminders for a specific date
  const getRemindersForDate = (dateKey: string) => {
    return reminders.filter((r) => r.reminder_date === dateKey);
  };

  return { reminders, loading, addReminder, deleteReminder, getRemindersForDate };
}
