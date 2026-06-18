-- Durable multi-turn file chat history.

CREATE TABLE public.analysis_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'File chat',
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.analysis_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.analysis_chat_sessions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_chat_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_chat_messages TO authenticated;
GRANT ALL ON public.analysis_chat_sessions TO service_role;
GRANT ALL ON public.analysis_chat_messages TO service_role;

ALTER TABLE public.analysis_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own chat sessions" ON public.analysis_chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "own chat messages" ON public.analysis_chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX analysis_chat_sessions_file_updated_idx
  ON public.analysis_chat_sessions (file_id, updated_at DESC);
CREATE INDEX analysis_chat_sessions_owner_updated_idx
  ON public.analysis_chat_sessions (owner_id, updated_at DESC);
CREATE INDEX analysis_chat_messages_session_created_idx
  ON public.analysis_chat_messages (session_id, created_at ASC);
CREATE INDEX analysis_chat_messages_owner_created_idx
  ON public.analysis_chat_messages (owner_id, created_at DESC);

CREATE TRIGGER analysis_chat_sessions_set_updated_at
  BEFORE UPDATE ON public.analysis_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

COMMENT ON TABLE public.analysis_chat_sessions IS
  'Durable per-file multi-turn LLM chat sessions owned by the authenticated user.';
COMMENT ON TABLE public.analysis_chat_messages IS
  'Durable user/assistant/system messages for analysis_chat_sessions.';
