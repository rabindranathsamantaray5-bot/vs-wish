-- Add new columns for Storage integration
ALTER TABLE public.media_library 
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS mime_type text;

-- Storage Policies for media-library bucket
-- admins have full access
CREATE POLICY "Admins have full access to media-library"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'media-library' 
  AND (SELECT public.has_role(auth.uid(), 'admin'))
)
WITH CHECK (
  bucket_id = 'media-library' 
  AND (SELECT public.has_role(auth.uid(), 'admin'))
);

-- Public/Authenticated read access (private bucket requires signed URLs or policies)
-- For now, let's allow authenticated users to SELECT if they are logged in.
-- Customer side will use signed URLs if needed, but a policy helps with app-wide access.
CREATE POLICY "Authenticated users can read media-library"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media-library');
