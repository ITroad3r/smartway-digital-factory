
-- Lock down SECURITY DEFINER functions: revoke from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is used inside RLS policies; policies run as the invoker but PostgREST-side calls should be blocked. Keep executable to authenticated for policy references, but revoke from anon and public.

-- Prevent listing of blog-images bucket: drop broad SELECT policy.
-- The bucket is public, so files remain accessible by direct URL via the storage CDN,
-- but the Storage API list endpoint will no longer return the file catalog to anonymous clients.
DROP POLICY IF EXISTS "Blog images public read" ON storage.objects;
CREATE POLICY "Admins can list blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(), 'admin'));
