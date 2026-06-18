ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS static_scan_status TEXT NOT NULL DEFAULT 'safe',
  ADD COLUMN IF NOT EXISTS static_scan_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS static_scan_finished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS static_scan_report JSONB,
  ADD COLUMN IF NOT EXISTS static_entropy_global NUMERIC(8,4),
  ADD COLUMN IF NOT EXISTS static_entropy_window NUMERIC(8,4),
  ADD COLUMN IF NOT EXISTS static_decision TEXT,
  ADD COLUMN IF NOT EXISTS static_last_error TEXT;

DO $$ BEGIN
  ALTER TABLE public.files ADD CONSTRAINT files_static_scan_status_check
    CHECK (static_scan_status IN ('pending','scanning','safe','warn','block'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.files ADD CONSTRAINT files_static_decision_check
    CHECK (static_decision IS NULL OR static_decision IN ('allow','warn','block'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS files_static_scan_status_idx ON public.files (static_scan_status);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS analysis_mode TEXT NOT NULL DEFAULT 'both';

DO $$ BEGIN
  ALTER TABLE public.projects ADD CONSTRAINT projects_analysis_mode_check
    CHECK (analysis_mode IN ('static','llm','both'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.analysis_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  activity_kind TEXT NOT NULL CHECK (
    activity_kind IN (
      'llm_explanation','llm_quality_analysis','llm_security_analysis',
      'llm_ai_origin_analysis','llm_folder_analysis','llm_fix_generation',
      'static_scan','search_query'
    )
  ),
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','warn','error')),
  provider TEXT, model TEXT, language TEXT,
  query_text TEXT, result_summary TEXT,
  result_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE, UPDATE ON public.analysis_activities TO authenticated;
GRANT ALL ON public.analysis_activities TO service_role;
ALTER TABLE public.analysis_activities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "own activities" ON public.analysis_activities FOR ALL TO authenticated
    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS analysis_activities_owner_created_idx ON public.analysis_activities (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analysis_activities_repository_idx ON public.analysis_activities (repository_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analysis_activities_file_idx ON public.analysis_activities (file_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.analysis_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'File chat',
  provider TEXT, model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analysis_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.analysis_chat_sessions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_chat_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_chat_messages TO authenticated;
GRANT ALL ON public.analysis_chat_sessions TO service_role;
GRANT ALL ON public.analysis_chat_messages TO service_role;

ALTER TABLE public.analysis_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "own chat sessions" ON public.analysis_chat_sessions FOR ALL TO authenticated
    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "own chat messages" ON public.analysis_chat_messages FOR ALL TO authenticated
    USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS analysis_chat_sessions_file_updated_idx ON public.analysis_chat_sessions (file_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS analysis_chat_sessions_owner_updated_idx ON public.analysis_chat_sessions (owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS analysis_chat_messages_session_created_idx ON public.analysis_chat_messages (session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS analysis_chat_messages_owner_created_idx ON public.analysis_chat_messages (owner_id, created_at DESC);

DO $$ BEGIN
  CREATE TRIGGER analysis_chat_sessions_set_updated_at
    BEFORE UPDATE ON public.analysis_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;