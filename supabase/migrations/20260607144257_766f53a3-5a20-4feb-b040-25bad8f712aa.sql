
CREATE TABLE public.user_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  acknowledgement_type text NOT NULL,
  accepted_terms_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  accepted_language text NOT NULL,
  ip_address inet NULL,
  user_agent text NULL,
  CONSTRAINT user_acknowledgements_unique UNIQUE (user_id, acknowledgement_type, accepted_terms_version)
);

CREATE INDEX user_acknowledgements_user_type_idx
  ON public.user_acknowledgements (user_id, acknowledgement_type);

GRANT SELECT, INSERT ON public.user_acknowledgements TO authenticated;
GRANT ALL ON public.user_acknowledgements TO service_role;

ALTER TABLE public.user_acknowledgements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own acks read"
  ON public.user_acknowledgements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own acks insert"
  ON public.user_acknowledgements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
