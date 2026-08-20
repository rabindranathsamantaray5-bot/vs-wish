-- Ensure comments table has correct permissions for anon
GRANT SELECT, INSERT ON public.comments TO anon;
GRANT SELECT, INSERT ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;

-- Re-verify RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Re-create policies to be absolutely sure
DROP POLICY IF EXISTS "Comments are viewable by everyone who can see the wish" ON public.comments;
CREATE POLICY "Comments are viewable by everyone who can see the wish"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.wishes w WHERE w.id = wish_id));

DROP POLICY IF EXISTS "Anyone can post a comment to a wish they can see" ON public.comments;
CREATE POLICY "Anyone can post a comment to a wish they can see"
  ON public.comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.wishes w WHERE w.id = wish_id));
