
-- 1) preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_explanation_type text NOT NULL DEFAULT 'human'
    CHECK (preferred_explanation_type IN ('human','technical'));

-- 2) widen allowed activity kinds
ALTER TABLE public.analysis_activities
  DROP CONSTRAINT IF EXISTS analysis_activities_activity_kind_check;
ALTER TABLE public.analysis_activities
  ADD CONSTRAINT analysis_activities_activity_kind_check
  CHECK (activity_kind = ANY (ARRAY[
    'llm_explanation','llm_quality_analysis','llm_security_analysis',
    'llm_ai_origin_analysis','llm_folder_analysis','llm_fix_generation',
    'static_scan','static_verbalize','folder_chat','search_query'
  ]));

-- 3) folder chat sessions
CREATE TABLE IF NOT EXISTS public.folder_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  repository_id uuid NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  folder_path text NOT NULL,
  title text NOT NULL,
  provider text,
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.folder_chat_sessions TO authenticated;
GRANT ALL ON public.folder_chat_sessions TO service_role;

ALTER TABLE public.folder_chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own folder chat sessions" ON public.folder_chat_sessions;
CREATE POLICY "own folder chat sessions" ON public.folder_chat_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS folder_chat_sessions_repo_idx
  ON public.folder_chat_sessions (repository_id, folder_path, updated_at DESC);
CREATE INDEX IF NOT EXISTS folder_chat_sessions_owner_idx
  ON public.folder_chat_sessions (owner_id, updated_at DESC);

DROP TRIGGER IF EXISTS folder_chat_sessions_set_updated_at ON public.folder_chat_sessions;
CREATE TRIGGER folder_chat_sessions_set_updated_at
  BEFORE UPDATE ON public.folder_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) link messages to folder sessions (file_id stays on analysis_chat_sessions; folder messages reference folder session directly)
ALTER TABLE public.analysis_chat_messages
  ADD COLUMN IF NOT EXISTS folder_session_id uuid
    REFERENCES public.folder_chat_sessions(id) ON DELETE CASCADE;

-- session_id is currently NOT NULL (file-chat). Loosen it so folder-chat rows can use folder_session_id instead.
ALTER TABLE public.analysis_chat_messages
  ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE public.analysis_chat_messages
  DROP CONSTRAINT IF EXISTS analysis_chat_messages_one_session;
ALTER TABLE public.analysis_chat_messages
  ADD CONSTRAINT analysis_chat_messages_one_session
  CHECK ((session_id IS NOT NULL) <> (folder_session_id IS NOT NULL));

CREATE INDEX IF NOT EXISTS analysis_chat_messages_folder_session_idx
  ON public.analysis_chat_messages (folder_session_id, created_at);
