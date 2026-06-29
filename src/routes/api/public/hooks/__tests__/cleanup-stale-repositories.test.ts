import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the admin client so the handler never touches the real database.
const insertedAudits: unknown[] = [];
const mockAdmin = {
  from: (table: string) => {
    if (table === "maintenance_audit_log") {
      return {
        insert: (row: unknown) => {
          insertedAudits.push(row);
          return Promise.resolve({ error: null });
        },
      };
    }
    if (table === "repositories") {
      return {
        select: () => ({
          lt: () => Promise.resolve({ data: [], error: null }),
        }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      };
    }
    return {
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
      delete: () => ({
        in: () => Promise.resolve({ error: null }),
        eq: () => Promise.resolve({ error: null }),
      }),
    };
  },
  storage: {
    from: () => ({ remove: () => Promise.resolve({ error: null }) }),
  },
};

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: mockAdmin,
}));

const TEST_SECRET = "test-secret-value-1234567890";
const WRONG_SECRET = "test-secret-value-WRONG-9876";

async function invoke(authHeader?: string): Promise<Response> {
  const { Route } = await import("../cleanup-stale-repositories");
  const handler = (
    Route.options as unknown as {
      server: { handlers: { POST: (ctx: { request: Request }) => Promise<Response> } };
    }
  ).server.handlers.POST;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (authHeader !== undefined) headers.authorization = authHeader;
  const request = new Request("http://test/api/public/hooks/cleanup-stale-repositories", {
    method: "POST",
    headers,
    body: "{}",
  });
  return handler({ request });
}

describe("cleanup-stale-repositories auth", () => {
  beforeEach(() => {
    insertedAudits.length = 0;
    vi.stubEnv("CLEANUP_CRON_SECRET", TEST_SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without an Authorization header", async () => {
    const res = await invoke();
    expect(res.status).toBe(401);
    expect(insertedAudits).toHaveLength(0);
  });

  it("rejects requests with a wrong bearer token", async () => {
    const res = await invoke(`Bearer ${WRONG_SECRET}`);
    expect(res.status).toBe(401);
  });

  it("rejects requests when the bearer differs in length (no timing leak)", async () => {
    const res = await invoke(`Bearer short`);
    expect(res.status).toBe(401);
  });

  it("rejects when CLEANUP_CRON_SECRET is not configured", async () => {
    vi.stubEnv("CLEANUP_CRON_SECRET", "");
    const res = await invoke(`Bearer ${TEST_SECRET}`);
    expect(res.status).toBe(401);
  });

  it("accepts requests with the correct bearer and writes an audit row", async () => {
    const res = await invoke(`Bearer ${TEST_SECRET}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; request_id: string };
    expect(body.ok).toBe(true);
    expect(body.request_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(insertedAudits).toHaveLength(1);
    expect(insertedAudits[0]).toMatchObject({
      job_name: "cleanup-stale-repositories",
      status: "ok",
      request_id: body.request_id,
    });
  });
});
