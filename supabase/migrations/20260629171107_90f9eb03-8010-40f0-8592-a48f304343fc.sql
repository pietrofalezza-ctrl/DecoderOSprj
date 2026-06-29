
-- Enums
DO $$ BEGIN
  CREATE TYPE public.knowledge_entry_status AS ENUM ('ai_draft','in_review','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.knowledge_entry_source AS ENUM ('manual','pr','changelog','codebase_scan','user_doc');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.knowledge_entry_type AS ENUM ('capability','concept','integration','format','case_study','guide');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.knowledge_opportunity_status AS ENUM ('open','accepted','dismissed','converted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) knowledge_entries
CREATE TABLE public.knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  type public.knowledge_entry_type NOT NULL,
  status public.knowledge_entry_status NOT NULL DEFAULT 'ai_draft',
  source public.knowledge_entry_source NOT NULL DEFAULT 'manual',
  source_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  lang_default text NOT NULL DEFAULT 'en',
  category text,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  related_slugs text[] NOT NULL DEFAULT ARRAY[]::text[],
  priority int NOT NULL DEFAULT 50,
  seo_impact int NOT NULL DEFAULT 50,
  doc_impact int NOT NULL DEFAULT 50,
  difficulty int NOT NULL DEFAULT 50,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_knowledge_entries_status ON public.knowledge_entries(status);
CREATE INDEX idx_knowledge_entries_type ON public.knowledge_entries(type);
CREATE INDEX idx_knowledge_entries_slug ON public.knowledge_entries(slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_entries TO authenticated;
GRANT SELECT ON public.knowledge_entries TO anon;
GRANT ALL ON public.knowledge_entries TO service_role;

ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published entries"
  ON public.knowledge_entries FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can read all entries"
  ON public.knowledge_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert entries"
  ON public.knowledge_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update entries"
  ON public.knowledge_entries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete entries"
  ON public.knowledge_entries FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_knowledge_entries_updated_at
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2) knowledge_translations
CREATE TABLE public.knowledge_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  lang text NOT NULL CHECK (lang IN ('en','it','zh')),
  title text NOT NULL,
  summary text,
  body_md text,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  glossary jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  og_image text,
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entry_id, lang)
);
CREATE INDEX idx_knowledge_translations_entry ON public.knowledge_translations(entry_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_translations TO authenticated;
GRANT SELECT ON public.knowledge_translations TO anon;
GRANT ALL ON public.knowledge_translations TO service_role;

ALTER TABLE public.knowledge_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read translations of published entries"
  ON public.knowledge_translations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.knowledge_entries e
    WHERE e.id = entry_id AND e.status = 'published'
  ));

CREATE POLICY "Admins manage translations"
  ON public.knowledge_translations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_knowledge_translations_updated_at
  BEFORE UPDATE ON public.knowledge_translations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) knowledge_edges (graph)
CREATE TABLE public.knowledge_edges (
  from_entry uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  to_entry uuid NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  relation text NOT NULL DEFAULT 'related',
  weight numeric NOT NULL DEFAULT 1,
  auto_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (from_entry, to_entry, relation),
  CHECK (from_entry <> to_entry)
);
CREATE INDEX idx_knowledge_edges_to ON public.knowledge_edges(to_entry);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_edges TO authenticated;
GRANT SELECT ON public.knowledge_edges TO anon;
GRANT ALL ON public.knowledge_edges TO service_role;

ALTER TABLE public.knowledge_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read edges between published entries"
  ON public.knowledge_edges FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.knowledge_entries e WHERE e.id = from_entry AND e.status = 'published')
    AND EXISTS (SELECT 1 FROM public.knowledge_entries e WHERE e.id = to_entry AND e.status = 'published')
  );

CREATE POLICY "Admins manage edges"
  ON public.knowledge_edges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) knowledge_opportunities (gap analysis queue)
CREATE TABLE public.knowledge_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  title text NOT NULL,
  rationale text,
  suggested_slug text,
  suggested_type public.knowledge_entry_type,
  related_entries uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  priority int NOT NULL DEFAULT 50,
  seo_impact int NOT NULL DEFAULT 50,
  doc_impact int NOT NULL DEFAULT 50,
  difficulty int NOT NULL DEFAULT 50,
  eta_minutes int,
  status public.knowledge_opportunity_status NOT NULL DEFAULT 'open',
  generated_from jsonb NOT NULL DEFAULT '{}'::jsonb,
  source public.knowledge_entry_source NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_knowledge_opportunities_status ON public.knowledge_opportunities(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_opportunities TO authenticated;
GRANT ALL ON public.knowledge_opportunities TO service_role;

ALTER TABLE public.knowledge_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage opportunities"
  ON public.knowledge_opportunities FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_knowledge_opportunities_updated_at
  BEFORE UPDATE ON public.knowledge_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5) knowledge_sources (raw ingest)
CREATE TABLE public.knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  ref text,
  sha text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ingested_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kind, ref, sha)
);
CREATE INDEX idx_knowledge_sources_kind ON public.knowledge_sources(kind);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;

ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sources"
  ON public.knowledge_sources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) knowledge_audit (immutable log)
CREATE TABLE public.knowledge_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES public.knowledge_entries(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.knowledge_opportunities(id) ON DELETE SET NULL,
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_knowledge_audit_entry ON public.knowledge_audit(entry_id);

GRANT SELECT, INSERT ON public.knowledge_audit TO authenticated;
GRANT ALL ON public.knowledge_audit TO service_role;

ALTER TABLE public.knowledge_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit"
  ON public.knowledge_audit FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit"
  ON public.knowledge_audit FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND actor = auth.uid());
-- No UPDATE/DELETE policies → immutable
