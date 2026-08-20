DO $$
DECLARE
    v_user_id uuid;
    v_template_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    SELECT id INTO v_template_id FROM public.templates LIMIT 1;
    
    IF v_user_id IS NOT NULL AND v_template_id IS NOT NULL THEN
        -- Check if purchases already exist to avoid duplicates
        IF NOT EXISTS (SELECT 1 FROM public.purchases WHERE user_id = v_user_id) THEN
            INSERT INTO public.purchases (user_id, template_id, amount, status, created_at)
            VALUES 
                (v_user_id, v_template_id, 299, 'claimed', NOW() - INTERVAL '2 days'),
                (v_user_id, v_template_id, 499, 'pending_payment', NOW() - INTERVAL '1 hour');
            RAISE NOTICE 'Seeded purchases for user %', v_user_id;
        ELSE
            RAISE NOTICE 'Purchases already exist for user %', v_user_id;
        END IF;
    ELSE
        RAISE NOTICE 'Could not find user or template to seed.';
    END IF;
END $$;