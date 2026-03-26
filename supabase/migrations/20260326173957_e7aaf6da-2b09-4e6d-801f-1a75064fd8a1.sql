CREATE TABLE public.calendar_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reminder_date date NOT NULL,
  reminder_time time NOT NULL DEFAULT '08:00:00',
  message text NOT NULL DEFAULT '',
  email text NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.calendar_reminders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" ON public.calendar_reminders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON public.calendar_reminders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON public.calendar_reminders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;