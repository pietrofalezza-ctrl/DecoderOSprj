-- Static analysis state persisted at file level and per-project analysis preference.

ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS static_scan_status TEXT NOT NULL DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS static_scan_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS static_scan_finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS static_scan_report JSONB,
  ADD COLUMN IF NOT EXISTS static_entropy_global NUMERIC(8,4),
  ADD COLUMN IF NOT EXISTS static_entropy_window NUMERIC(8,4),
  ADD COLUMN IF NOT EXISTS static_decision TEXT,
  ADD COLUMN IF NOT EXISTS static_last_error TEXT;

ALTER TABLE public.files
  ADD CONSTRAINT files_static_scan_status_check
    CHECK (static_scan_status IN ('pending', 'scanning', 'safe', 'warn', 'block')),
  ADD CONSTRAINT files_static_decision_check
    CHECK (static_decision IS NULL OR static_decision IN ('allow', 'warn', 'block'));

CREATE INDEX IF NOT EXISTS files_static_scan_status_idx
  ON public.files (static_scan_status);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS analysis_mode TEXT NOT NULL DEFAULT 'both';

ALTER TABLE public.projects
  ADD CONSTRAINT projects_analysis_mode_check
    CHECK (analysis_mode IN ('static', 'llm', 'both'));
