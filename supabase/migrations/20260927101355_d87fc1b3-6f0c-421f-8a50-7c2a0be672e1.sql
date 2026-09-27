CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  class_name text NOT NULL CHECK (class_name IN ('4ºA','4ºB','4ºC')),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
  email text CHECK (email IS NULL OR char_length(email) <= 255),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX students_unique_name ON public.students (teacher_id, class_name, lower(full_name));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers view their students" ON public.students FOR SELECT TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers create their students" ON public.students FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers update their students" ON public.students FOR UPDATE TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers delete their students" ON public.students FOR DELETE TO authenticated USING (auth.uid() = teacher_id);
CREATE TRIGGER students_set_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.fines ADD COLUMN student_id uuid REFERENCES public.students(id) ON DELETE SET NULL;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT vault.create_secret(encode(gen_random_bytes(24), 'hex'), 'reminder_token');

CREATE OR REPLACE FUNCTION public.get_reminder_token()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'reminder_token' LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_reminder_token() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_reminder_token() TO service_role;

SELECT cron.schedule(
  'friday-fine-reminders',
  '0 5,6 * * 5',
  $$
  SELECT net.http_post(
    url := 'https://dinerolengua.lovable.app/api/public/reminders',
    headers := jsonb_build_object('Content-Type','application/json','x-reminder-token',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='reminder_token' LIMIT 1)),
    body := '{}'::jsonb
  );
  $$
);