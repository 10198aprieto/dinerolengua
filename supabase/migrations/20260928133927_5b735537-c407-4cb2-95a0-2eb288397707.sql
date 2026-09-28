CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('teacher','delegate')),
  class_name text CHECK (class_name IN ('4ºA','4ºB','4ºC')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, class_name)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.can_manage_class(_user_id uuid, _class text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND (role = 'teacher' OR (role = 'delegate' AND class_name = _class)))
$$;

DROP POLICY IF EXISTS "Teachers can create their fines" ON public.fines;
DROP POLICY IF EXISTS "Teachers can delete their fines" ON public.fines;
DROP POLICY IF EXISTS "Teachers can update their fines" ON public.fines;
DROP POLICY IF EXISTS "Teachers can view their fines" ON public.fines;
CREATE POLICY "Managers view class fines" ON public.fines FOR SELECT TO authenticated USING (public.can_manage_class(auth.uid(), class_name));
CREATE POLICY "Managers create class fines" ON public.fines FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id AND public.can_manage_class(auth.uid(), class_name));
CREATE POLICY "Managers update class fines" ON public.fines FOR UPDATE TO authenticated USING (public.can_manage_class(auth.uid(), class_name)) WITH CHECK (public.can_manage_class(auth.uid(), class_name));
CREATE POLICY "Managers delete class fines" ON public.fines FOR DELETE TO authenticated USING (public.can_manage_class(auth.uid(), class_name));

DROP POLICY IF EXISTS "Teachers create their students" ON public.students;
DROP POLICY IF EXISTS "Teachers delete their students" ON public.students;
DROP POLICY IF EXISTS "Teachers update their students" ON public.students;
DROP POLICY IF EXISTS "Teachers view their students" ON public.students;
CREATE POLICY "Managers view class students" ON public.students FOR SELECT TO authenticated USING (public.can_manage_class(auth.uid(), class_name));
CREATE POLICY "Managers create class students" ON public.students FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id AND public.can_manage_class(auth.uid(), class_name));
CREATE POLICY "Managers update class students" ON public.students FOR UPDATE TO authenticated USING (public.can_manage_class(auth.uid(), class_name)) WITH CHECK (public.can_manage_class(auth.uid(), class_name));
CREATE POLICY "Managers delete class students" ON public.students FOR DELETE TO authenticated USING (public.can_manage_class(auth.uid(), class_name));

DO $$ DECLARE idx text; BEGIN
  FOR idx IN SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='students' AND indexdef ILIKE '%UNIQUE%' AND indexdef ILIKE '%lower(full_name)%' LOOP
    EXECUTE format('DROP INDEX public.%I', idx);
  END LOOP;
END $$;
CREATE UNIQUE INDEX students_class_name_unique ON public.students (class_name, lower(full_name));

INSERT INTO public.user_roles (user_id, role) VALUES
  ('65a39992-8e03-4ca5-8638-3f4b8aee9e86','teacher'),
  ('0c9b2b01-6696-48a3-8410-94b865b4342f','teacher');