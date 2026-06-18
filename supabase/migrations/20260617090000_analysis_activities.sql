-- Persist LLM and static scan activities (chat/analysis/search history).

CREATE TABLE public.analysis_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  activity_kind TEXT NOT NULL CHECK (
    activity_kind IN (
      'llm_explanation',
      'llm_quality_analysis',
      'llm_security_analysis',
      'llm_ai_origin_analysis',
      'llm_folder_analysis',
      'llm_fix_generation',
      'static_scan',
      'search_query'
    )
  ),
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'warn', 'error')),
  provider TEXT,
  model TEXT,
  language TEXT,
  query_text TEXT,
  result_summary TEXT,
  result_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE, UPDATE ON public.analysis_activities TO authenticated;
GRANT ALL ON public.analysis_activities TO service_role;

ALTER TABLE public.analysis_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own activities" ON public.analysis_activities
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX analysis_activities_owner_created_idx
  ON public.analysis_activities (owner_id, created_at DESC);
CREATE INDEX analysis_activities_repository_idx
  ON public.analysis_activities (repository_id, created_at DESC);
CREATE INDEX analysis_activities_file_idx
  ON public.analysis_activities (file_id, created_at DESC);

COMMENT ON COLUMN public.analysis_activities.activity_kind IS
  'Kind of action tracked for reproducible analysis history.';
COMMENT ON COLUMN public.analysis_activities.query_text IS
  'Optional textual query when a search/chat-like action is executed.';
COMMENT ON COLUMN public.analysis_activities.result_metadata IS
  'Opaque metadata for reproducing and debugging scanner/LLM calls.';
