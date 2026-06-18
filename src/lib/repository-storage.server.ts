// Use a permissive structural type: the real SupabaseClient has deeply-nested
// generics that don't structurally satisfy a hand-written narrow interface.
type RepositoryStorageAdmin = {
  storage: {
    listBuckets: () => Promise<{
      data: Array<{ name: string }> | null;
      error: unknown;
    }>;
    from: (bucket: string) => {
      remove: (paths: string[]) => Promise<unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export async function ensureRepositoryStorageBucket(
  supabaseAdmin: RepositoryStorageAdmin,
): Promise<void> {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;

  if (!data?.some((bucket: { name: string }) => bucket.name === "repositories")) {
    throw new Error("repository_storage_bucket_missing");
  }
}

export async function cleanupFailedRepositoryIngest(
  supabaseAdmin: RepositoryStorageAdmin,
  input: {
    ownerId: string;
    repositoryId: string;
    uploadedStoragePaths: string[];
  },
): Promise<void> {
  const storagePaths = Array.from(new Set(input.uploadedStoragePaths.filter(Boolean)));

  try {
    if (storagePaths.length > 0) {
      await supabaseAdmin.storage.from("repositories").remove(storagePaths);
    }
  } catch {
    // Best-effort cleanup: preserve the original ingest error.
  }

  try {
    await supabaseAdmin
      .from("files")
      .delete()
      .eq("owner_id", input.ownerId)
      .eq("repository_id", input.repositoryId);
  } catch {
    // Best-effort cleanup: preserve the original ingest error.
  }

  try {
    await supabaseAdmin
      .from("repositories")
      .delete()
      .eq("owner_id", input.ownerId)
      .eq("id", input.repositoryId);
  } catch {
    // Best-effort cleanup: preserve the original ingest error.
  }
}
