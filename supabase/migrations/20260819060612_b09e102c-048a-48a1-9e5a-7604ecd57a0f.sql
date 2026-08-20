CREATE UNIQUE INDEX IF NOT EXISTS purchases_user_template_completed_idx ON public.purchases (user_id, template_id) WHERE status IN ('completed', 'claimed');
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can manage all purchases" ON public.purchases;
CREATE POLICY "Service role can manage all purchases" ON public.purchases FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;