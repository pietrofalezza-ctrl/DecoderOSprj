import { describe, expect, it, vi } from "vitest";

import { runStaticScanForRepository } from "../static-scan-queue.server";

function makeUpdateChain(updates: unknown[]) {
  const chain = {
    eq: vi.fn(() => chain),
  };
  return {
    update: vi.fn((payload: unknown) => {
      updates.push(payload);
      return chain;
    }),
    chain,
  };
}

describe("runStaticScanForRepository", () => {
  it("uses the authenticated client storage when no admin client is provided", async () => {
    const updates: unknown[] = [];
    const filesUpdate = makeUpdateChain(updates);
    const download = vi.fn(async () => ({
      data: new Blob(["const value = 1;\n"], { type: "text/plain" }),
      error: null,
    }));
    const insert = vi.fn(async () => ({ error: null }));

    const supabase = {
      storage: {
        from: vi.fn(() => ({ download })),
      },
      from: vi.fn((table: string) => {
        if (table === "repositories") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: { project_id: "project-1" },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === "files") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(async () => ({
                  data: [
                    {
                      id: "file-1",
                      path: "src/index.ts",
                      owner_id: "user-1",
                      repository_id: "repo-1",
                      storage_path: "user-1/repo-1/src/index.ts",
                    },
                  ],
                  error: null,
                })),
              })),
            })),
            update: filesUpdate.update,
          };
        }
        if (table === "analysis_activities") {
          return { insert };
        }
        throw new Error(`unexpected table ${table}`);
      }),
    };

    await runStaticScanForRepository({
      // The runtime Supabase client carries the user's auth token, so storage
      // access remains constrained by storage.objects RLS policies.
      supabase: supabase as never,
      repositoryId: "repo-1",
    });

    expect(supabase.storage.from).toHaveBeenCalledWith("repositories");
    expect(download).toHaveBeenCalledWith("user-1/repo-1/src/index.ts");
    expect(updates).toContainEqual(
      expect.objectContaining({
        static_scan_status: "safe",
        static_last_error: null,
      }),
    );
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ activity_kind: "static_scan" }));
  });
});
