-- Atomic increment for wish views
CREATE OR REPLACE FUNCTION public.increment_wish_view(wish_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.wishes
  SET views = COALESCE(views, 0) + 1
  WHERE id = wish_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_wish_view(uuid) TO authenticated, anon;

-- Ensure required tables for Admin Features exist (re-running to ensure schema consistency)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    billing_period TEXT NOT NULL DEFAULT 'monthly',
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(12,2) NOT NULL,
    minimum_amount DECIMAL(12,2) DEFAULT 0,
    maximum_discount DECIMAL(12,2),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS and GRANTS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.website_settings TO anon, authenticated;
GRANT ALL ON public.website_settings TO authenticated;
GRANT ALL ON public.website_settings TO service_role;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage plans') THEN
        CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can view active plans') THEN
        CREATE POLICY "Public can view active plans" ON public.plans FOR SELECT TO anon, authenticated USING (is_active = true AND is_visible = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage coupons') THEN
        CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage website settings') THEN
        CREATE POLICY "Admins can manage website settings" ON public.website_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can view website settings') THEN
        CREATE POLICY "Public can view website settings" ON public.website_settings FOR SELECT TO anon, authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage system settings') THEN
        CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage ai settings') THEN
        CREATE POLICY "Admins can manage ai settings" ON public.ai_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;