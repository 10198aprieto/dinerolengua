CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Profesor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can view their profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Teachers can create their profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Teachers can update their profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Teachers can delete their profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.fines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  class_name text NOT NULL CHECK (class_name IN ('4ºA', '4ºB', '4ºC')),
  student_name text NOT NULL CHECK (char_length(trim(student_name)) BETWEEN 1 AND 100),
  amount_cents integer NOT NULL CHECK (amount_cents BETWEEN 10 AND 50 AND amount_cents % 10 = 0),
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  is_paid boolean NOT NULL DEFAULT false,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fines TO authenticated;
GRANT ALL ON public.fines TO service_role;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can view their fines" ON public.fines FOR SELECT TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create their fines" ON public.fines FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their fines" ON public.fines FOR UPDATE TO authenticated USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their fines" ON public.fines FOR DELETE TO authenticated USING (auth.uid() = teacher_id);
CREATE INDEX fines_teacher_class_date_idx ON public.fines (teacher_id, class_name, occurred_on DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER fines_set_updated_at BEFORE UPDATE ON public.fines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();