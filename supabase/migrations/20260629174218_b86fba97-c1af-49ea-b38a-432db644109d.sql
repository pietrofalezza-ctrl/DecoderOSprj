-- Allow admins to read all acknowledgements for audit/compliance
CREATE POLICY "admins can read all acks"
  ON public.user_acknowledgements
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS user_acknowledgements_accepted_at_idx
  ON public.user_acknowledgements (accepted_at DESC);