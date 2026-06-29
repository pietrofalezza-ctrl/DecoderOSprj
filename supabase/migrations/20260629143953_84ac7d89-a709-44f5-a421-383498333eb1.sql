CREATE OR REPLACE FUNCTION public.admin_reschedule_cron(
  _job_name text,
  _schedule text,
  _command text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  IF _job_name IS NULL OR length(_job_name) = 0 THEN
    RAISE EXCEPTION 'job_name required';
  END IF;
  -- Unschedule if present (cron.unschedule throws if not, so guard it)
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = _job_name) THEN
    PERFORM cron.unschedule(_job_name);
  END IF;
  PERFORM cron.schedule(_job_name, _schedule, _command);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reschedule_cron(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_reschedule_cron(text, text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reschedule_cron(text, text, text) TO service_role;
