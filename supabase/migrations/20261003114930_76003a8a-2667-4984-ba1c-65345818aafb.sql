ALTER TABLE public.fines DROP CONSTRAINT fines_class_name_check;
ALTER TABLE public.fines ADD CONSTRAINT fines_class_name_check CHECK (class_name IN ('4ºA','4ºB','4ºC','3ºA'));
ALTER TABLE public.students DROP CONSTRAINT students_class_name_check;
ALTER TABLE public.students ADD CONSTRAINT students_class_name_check CHECK (class_name IN ('4ºA','4ºB','4ºC','3ºA'));
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_class_name_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_class_name_check CHECK (class_name IN ('4ºA','4ºB','4ºC','3ºA'));