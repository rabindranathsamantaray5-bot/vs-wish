
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wishes' AND column_name='password_hash') THEN
        ALTER TABLE public.wishes ADD COLUMN password_hash TEXT;
    END IF;
END $$;

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for ai_settings" ON public.ai_settings;
CREATE POLICY "Public read access for limited ai_settings" ON public.ai_settings 
FOR SELECT TO anon, authenticated 
USING (key NOT IN ('api_key', 'secret_key', 'provider_token'));

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for system_settings" ON public.system_settings;
CREATE POLICY "Public read access for system_settings" ON public.system_settings 
FOR SELECT TO anon, authenticated 
USING (key NOT IN ('smtp_password', 'db_password', 'internal_secret'));

GRANT SELECT ON public.media_library TO authenticated, anon;
GRANT ALL ON public.media_library TO service_role;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for comments" ON public.comments;
CREATE POLICY "Public read access for approved comments" ON public.comments 
FOR SELECT TO anon, authenticated 
USING (moderation_status = 'approved');

CREATE POLICY "Wish owners can see all comments" ON public.comments
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.wishes 
        WHERE wishes.id = comments.wish_id 
        AND wishes.user_id = auth.uid()
    )
);
