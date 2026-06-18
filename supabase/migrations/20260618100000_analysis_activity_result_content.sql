-- Persist generated LLM/static result bodies alongside the activity ledger.
-- This turns analysis_activities from a summary-only audit trail into a
-- reloadable history source for one-shot chats, snippet explanations, and fixes.

ALTER TABLE public.analysis_activities
  ADD COLUMN IF NOT EXISTS result_content TEXT;

COMMENT ON COLUMN public.analysis_activities.result_content IS
  'Optional generated output body for durable analysis/chat history. Prompts and source code are intentionally not duplicated here.';
