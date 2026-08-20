-- 1. Create plans table
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    billing_period TEXT NOT NULL DEFAULT 'monthly',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create coupons table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    minimum_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    maximum_discount DECIMAL(10, 2),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Extend comments table
ALTER TABLE public.comments ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'approved'; -- 'pending', 'approved', 'rejected'
ALTER TABLE public.comments ADD COLUMN is_spam BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.comments ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.comments ADD COLUMN moderated_by UUID REFERENCES auth.users(id);

-- 4. Create website_settings table
CREATE TABLE public.website_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create system_settings table
CREATE TABLE public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create ai_settings table
CREATE TABLE public.ai_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Grants
GRANT SELECT ON public.plans TO authenticated, anon;
GRANT ALL ON public.plans TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.plans TO authenticated;

GRANT SELECT ON public.coupons TO authenticated, anon;
GRANT ALL ON public.coupons TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;

GRANT SELECT ON public.website_settings TO authenticated, anon;
GRANT ALL ON public.website_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.website_settings TO authenticated;

GRANT SELECT ON public.system_settings TO authenticated, anon;
GRANT ALL ON public.system_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.system_settings TO authenticated;

GRANT SELECT ON public.ai_settings TO authenticated, anon;
GRANT ALL ON public.ai_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;

-- 8. RLS Policies
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for plans" ON public.plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public check coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (is_active = true);

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for website_settings" ON public.website_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage website_settings" ON public.website_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for system_settings" ON public.system_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage system_settings" ON public.system_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for ai_settings" ON public.ai_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage ai_settings" ON public.ai_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update comments policies to include admin management
CREATE POLICY "Admins can manage comments" ON public.comments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Seed some initial data
INSERT INTO public.website_settings (key, value) VALUES ('general', '{"site_name": "WishFly", "tagline": "Personalized Greeting Experiences"}');
INSERT INTO public.system_settings (key, value) VALUES ('features', '{"registration_enabled": true, "comments_enabled": true}');
INSERT INTO public.ai_settings (key, value) VALUES ('config', '{"enabled": true, "default_provider": "openai"}');

INSERT INTO public.plans (name, slug, price, currency, billing_period, features) VALUES 
('Basic', 'basic', 0.00, 'INR', 'monthly', '["Limited wishes", "Basic templates"]'),
('Premium', 'premium', 499.00, 'INR', 'monthly', '["Unlimited wishes", "All templates", "AI Generation"]');
