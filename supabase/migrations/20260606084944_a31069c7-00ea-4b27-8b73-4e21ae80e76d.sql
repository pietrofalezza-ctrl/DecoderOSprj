
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','it','zh')),
  preferred_proficiency TEXT NOT NULL DEFAULT 'intermediate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects" ON public.projects FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Repositories
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'zip',
  file_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX repositories_project_idx ON public.repositories(project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repositories TO authenticated;
GRANT ALL ON public.repositories TO service_role;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own repos" ON public.repositories FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Files
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  language TEXT,
  size_bytes INT NOT NULL DEFAULT 0,
  sha256 TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX files_repo_idx ON public.files(repository_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT ALL ON public.files TO service_role;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own files" ON public.files FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Explanations
CREATE TABLE public.explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proficiency TEXT NOT NULL,
  explanation_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  provider TEXT NOT NULL,
  model TEXT,
  content TEXT NOT NULL,
  file_sha256 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (file_id, proficiency, explanation_type, language, file_sha256)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.explanations TO authenticated;
GRANT ALL ON public.explanations TO service_role;
ALTER TABLE public.explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own explanations" ON public.explanations FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- AI credentials (encrypted)
CREATE TABLE public.user_ai_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai','anthropic','gemini','openrouter')),
  encrypted_key TEXT NOT NULL,
  key_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, provider)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ai_credentials TO authenticated;
GRANT ALL ON public.user_ai_credentials TO service_role;
ALTER TABLE public.user_ai_credentials ENABLE ROW LEVEL SECURITY;
-- Block client SELECT of encrypted keys entirely; server functions use service role
CREATE POLICY "own creds insert" ON public.user_ai_credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own creds update" ON public.user_ai_credentials FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own creds delete" ON public.user_ai_credentials FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER cred_set_updated_at BEFORE UPDATE ON public.user_ai_credentials FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Local endpoints
CREATE TABLE public.user_local_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('ollama','lmstudio')),
  base_url TEXT NOT NULL,
  default_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_local_endpoints TO authenticated;
GRANT ALL ON public.user_local_endpoints TO service_role;
ALTER TABLE public.user_local_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own endpoints" ON public.user_local_endpoints FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER endpoint_set_updated_at BEFORE UPDATE ON public.user_local_endpoints FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
