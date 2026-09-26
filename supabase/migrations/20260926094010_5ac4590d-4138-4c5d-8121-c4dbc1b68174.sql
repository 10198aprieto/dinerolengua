GRANT SELECT ON public.fines TO anon;

CREATE POLICY "Public can view fines"
ON public.fines
FOR SELECT
TO anon
USING (true);