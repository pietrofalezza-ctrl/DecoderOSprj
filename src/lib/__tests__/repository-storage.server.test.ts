import { describe, expect, it, vi } from "vitest";

import { cleanupFailedRepositoryIngest } from "../repository-storage.server";

function makeDeleteChain() {
  const chain = {
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
  };
  return chain;
}

describe("cleanupFailedRepositoryIngest", () => {
  it("removes uploaded objects and repository rows after a failed ingest", async () => {
    const filesChain = makeDeleteChain();
    const reposChain = makeDeleteChain();
    const remove = vi.fn(async () => ({ error: null }));
    const supabaseAdmin = {
      storage: {
        from: vi.fn(() => ({ remove })),
      },
      from: vi.fn((table: string) => {
        if (table === "files") return filesChain;
        if (table === "repositories") return reposChain;
        throw new Error(`unexpected table ${table}`);
      }),
    };

    await cleanupFailedRepositoryIngest(supabaseAdmin, {
      ownerId: "user-1",
      repositoryId: "repo-1",
      uploadedStoragePaths: [
        "user-1/repo-1/src/index.ts",
        "user-1/repo-1/src/index.ts",
        "user-1/repo-1/README.md",
      ],
    });

    expect(supabaseAdmin.storage.from).toHaveBeenCalledWith("repositories");
    expect(remove).toHaveBeenCalledWith(["user-1/repo-1/src/index.ts", "user-1/repo-1/README.md"]);
    expect(supabaseAdmin.from).toHaveBeenCalledWith("files");
    expect(supabaseAdmin.from).toHaveBeenCalledWith("repositories");
    expect(filesChain.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(filesChain.eq).toHaveBeenCalledWith("repository_id", "repo-1");
    expect(reposChain.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(reposChain.eq).toHaveBeenCalledWith("id", "repo-1");
  });
});
