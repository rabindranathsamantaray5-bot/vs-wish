-- 1. Performance: Add recommended indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_wishes_slug ON public.wishes(slug);
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON public.wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_wishes_template_id ON public.wishes(template_id);
CREATE INDEX IF NOT EXISTS idx_wish_photos_wish_id ON public.wish_photos(wish_id);
CREATE INDEX IF NOT EXISTS idx_comments_wish_id ON public.comments(wish_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 2. Security: Ensure handle_new_user is robust against missing metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Default 'user' role assignment if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

-- 3. Security: Restricted permissions for has_role (re-enforce)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
