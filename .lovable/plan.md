## Obiettivo

1. Rendere "recuperabile" lo storico delle analisi LLM su tre livelli (file multi-run, repository, account).
2. Aggiungere una chat per **interrogare una cartella** del repository, riusando il contesto già prodotto da `folder-analysis`.
3. Tutto LLM resta **BYOK + ack obbligatorio**, le analisi statiche restano libere.
4. Tono di voce / tecnicità della risposta = `proficiency` + `explanation_type` già esistenti, applicati anche alla nuova chat folder e mostrati nello storico.

## Cosa esiste già (non si tocca)

- Tabella `analysis_activities` (kind, status, provider, model, query, content, metadata, file_id/repo_id/project_id) — già scrive ogni esplicazione/quality/security/AI origin/fix/chat.
- Tabelle `analysis_chat_sessions` + `analysis_chat_messages` — già usate per la chat di file.
- `analysis-history.functions.ts` carica le ultime LLM activity per file e ricostruisce i pannelli del workspace.
- File-level chat (`chat.functions.ts`) con BYOK + cronologia.

## Cosa cambia / si aggiunge

### A. Storico — livello FILE (multi-run)
- Nuovo pannello "History" nel workspace file (`projects.$projectId.repos.$repoId.tsx`) che lista **tutte** le esecuzioni LLM persistite (non solo l'ultima per kind), raggruppate per kind con timestamp, proficiency/tone usato, provider/model.
- Click su una entry → ricarica quel risultato nel pannello corrispondente (read-only "snapshot" con badge "snapshot del DD/MM").
- Backend: estende `listFileAnalysisHistory` per restituire più di una riga per kind (rimuove il dedup implicito che fa `buildWorkspaceHistoryDrafts`).

### B. Storico — livello REPO
- Nuova route `projects.$projectId.repos.$repoId.history.tsx`: timeline cronologica di tutte le activity LLM del repo, filtrabile per file, per kind, per data.
- Server fn `listRepositoryAnalysisHistory({ repository_id, limit, cursor, kind?, file_id? })` con paginazione cursor su `created_at`.
- Link dalla timeline → workspace file con la specifica entry preselezionata (`?activity=<id>`).

### C. Storico — livello ACCOUNT
- Nuova route `_authenticated/history.tsx`: timeline globale dell'utente trasversale a tutti i progetti.
- Server fn `listAccountAnalysisHistory({ limit, cursor, project_id?, kind? })`.
- Voce di menu "History" nell'AppShell.

### D. Nuova chat — scope CARTELLA
- Nuova entità `folder_chat_sessions` (per cartella di un repo) + riuso `analysis_chat_messages` con FK opzionale a `folder_chat_sessions`.
- UI: nel pannello `FolderAnalysisPanel` aggiunta una tab "Chat folder" attivabile dopo aver selezionato una cartella nel `FileTree`.
- Contesto inviato al modello = lo stesso bundle di file usato da `folder-analysis` (path + lingua + snippet troncato per ciascun file della folder), limitato per token; più la cronologia chat della session.
- BYOK: stessa logica della chat file (`assertByokAckAccepted` + `user_ai_credentials` + `callCloudProvider`).
- Salvataggio: ogni turno scrive su `analysis_chat_messages` **e** una entry `analysis_activities` con `activity_kind = "llm_explanation"`, `result_metadata.source = "folder_chat"`, così emerge anche negli storici B e C.

### E. Tone of voice
- Il selettore `proficiency` + `explanation_type` già nel workspace diventa una **preferenza utente persistente** (tabella `profiles`: nuove colonne `preferred_proficiency`, `preferred_explanation_type`, `preferred_language`).
- Server fn `getUserPreferences` / `updateUserPreferences` (con `requireSupabaseAuth`).
- All'avvio workspace + apertura folder chat: hydration dalla preferenza utente. L'utente può sovrascrivere localmente per la sessione.
- I prompt LLM (`buildPrompt`, nuovo `buildFolderChatPrompt`) ricevono `proficiency` + `explanationType` + `language` e li scrivono in `result_metadata` per replay storico.

### F. Regola BYOK ribadita
- Le analisi statiche (`source-static`, `static-malware`, `static-scan`, `static-verbalize`) restano disponibili senza credenziali e vengono comunque persistite in `analysis_activities` (kind `static_*`) per comparire negli storici.
- Tutte le funzioni `llm_*` e la nuova folder chat passano da `assertByokAckAccepted` → no BYOK = errore con messaggio "configura una credenziale AI".

## Migrazioni DB

```sql
-- 1) preferenze utente
ALTER TABLE public.profiles
  ADD COLUMN preferred_proficiency text,
  ADD COLUMN preferred_explanation_type text,
  ADD COLUMN preferred_language text;

-- 2) sessioni chat folder
CREATE TABLE public.folder_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  project_id uuid,
  repository_id uuid NOT NULL,
  folder_path text NOT NULL,
  title text NOT NULL,
  provider text, model text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folder_chat_sessions TO authenticated;
GRANT ALL ON public.folder_chat_sessions TO service_role;
ALTER TABLE public.folder_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_rw" ON public.folder_chat_sessions
  FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- 3) collegare i messaggi alla folder session (in alternativa: nuova tabella dedicata)
ALTER TABLE public.analysis_chat_messages
  ADD COLUMN folder_session_id uuid REFERENCES public.folder_chat_sessions(id) ON DELETE CASCADE;

-- 4) indici per timeline
CREATE INDEX ON public.analysis_activities (owner_id, created_at DESC);
CREATE INDEX ON public.analysis_activities (repository_id, created_at DESC);
```

## Nuovi/Modificati file

- `src/lib/analysis-history.functions.ts` → +`listRepositoryAnalysisHistory`, `listAccountAnalysisHistory`, esteso `listFileAnalysisHistory` (no dedup).
- `src/lib/folder-chat.functions.ts` (nuovo) → `listFolderChatSession`, `sendFolderChatMessage`, `saveLocalFolderChatTurn`.
- `src/lib/folder-chat-prompt.ts` (nuovo) → `buildFolderChatPrompt(folderPath, files[], previousMessages, question, proficiency, explanationType, language)`.
- `src/lib/user-preferences.functions.ts` (nuovo) → `getUserPreferences`, `updateUserPreferences`.
- `src/components/FolderAnalysisPanel.tsx` → aggiunta tab "Chat folder".
- `src/components/HistoryTimeline.tsx` (nuovo) → componente riusato da route repo e account.
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.history.tsx` (nuovo).
- `src/routes/_authenticated/history.tsx` (nuovo) + voce nell'`AppShell`.
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` → tab "History" file-level + hydration delle preferenze utente.
- i18n: aggiunte chiavi `workspace.history.*`, `workspace.folderChat.*` in `en/it/zh`.

## Test

- Unit: estensione `analysis-history.test.ts` (multi-run), nuovo `folder-chat-prompt.test.ts`, nuovo `user-preferences.test.ts`.
- Server fn smoke con mocked Supabase per `listRepositoryAnalysisHistory` e `sendFolderChatMessage` (riusa pattern di `chat.functions`).

## Fuori scope

- Embeddings / RAG su intero repo (l'utente ha scelto "Cartella selezionata").
- Streaming token-by-token (la chat file attuale è request/response, manteniamo lo stesso pattern per coerenza).
- Esportazioni cronologia (può essere un follow-up).
