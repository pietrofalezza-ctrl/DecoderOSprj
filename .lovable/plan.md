## Plan: Finish activating the email queue

The email tables, queues, and `/lovable/email/queue/process` route are already in place from the previous turn. What's still pending is the pg_cron job that calls the queue processor every 5 seconds — it didn't activate because the preview build needed to redeploy first.

### Steps
1. Call `email_domain--setup_email_infra` again. This is idempotent and will:
   - Re-verify pgmq queues (`auth_emails`, `transactional_emails`) and DLQs
   - Refresh the `email_queue_service_role_key` Vault secret
   - (Re)create the `process-email-queue` pg_cron job pointing at `/lovable/email/queue/process`
2. Verify the cron job exists with a quick `SELECT * FROM cron.job WHERE jobname LIKE '%email%'`.
3. Confirm nothing else is needed for `notify.decoderead.dev` — domain status was already active in the previous turn.

No code or schema changes. No new migrations. Only the setup tool + a read-only check.
