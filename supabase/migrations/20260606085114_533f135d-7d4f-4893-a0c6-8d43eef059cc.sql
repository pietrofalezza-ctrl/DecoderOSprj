
CREATE POLICY "repo own read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'repositories' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "repo own write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'repositories' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "repo own delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'repositories' AND auth.uid()::text = (storage.foldername(name))[1]);
