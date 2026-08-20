
-- Phase 2: Atomic Wish View Counter RPC
CREATE OR REPLACE FUNCTION public.increment_wish_view(wish_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE wishes
    SET views = COALESCE(views, 0) + 1
    WHERE id = wish_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_wish_view(UUID) TO authenticated, anon;
