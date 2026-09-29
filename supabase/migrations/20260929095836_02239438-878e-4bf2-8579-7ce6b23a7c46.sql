ALTER TABLE public.fines DROP CONSTRAINT fines_amount_cents_check;
ALTER TABLE public.fines ADD CONSTRAINT fines_amount_cents_check CHECK (amount_cents > 0 AND amount_cents <= 100000);
SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname='friday-fine-reminders'), schedule := '0 5,6 * * 1-5');