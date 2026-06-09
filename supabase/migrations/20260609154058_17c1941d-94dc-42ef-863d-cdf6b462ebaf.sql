CREATE TABLE public.password_reset_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX password_reset_challenges_user_id_idx ON public.password_reset_challenges(user_id, created_at DESC);

GRANT ALL ON public.password_reset_challenges TO service_role;

ALTER TABLE public.password_reset_challenges ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: only service_role (server functions) may access.

CREATE TRIGGER password_reset_challenges_set_updated_at
  BEFORE UPDATE ON public.password_reset_challenges
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();