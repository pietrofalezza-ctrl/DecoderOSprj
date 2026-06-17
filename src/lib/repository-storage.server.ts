export async function ensureRepositoryStorageBucket(supabaseAdmin: any): Promise<void> {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;

  if (!data?.some((bucket: { name: string }) => bucket.name === "repositories")) {
    throw new Error("repository_storage_bucket_missing");
  }
}
