CREATE TABLE public.maintenance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  request_id text,
  status text NOT NULL CHECK (status IN ('ok','error')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX maintenance_audit_log_job_started_idx
  ON public.maintenance_audit_log (job_name, started_at DESC);

GRANT SELECT ON public.maintenance_audit_log TO authenticated;
GRANT ALL ON public.maintenance_audit_log TO service_role;

ALTER TABLE public.maintenance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read maintenance audit log"
  ON public.maintenance_audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
