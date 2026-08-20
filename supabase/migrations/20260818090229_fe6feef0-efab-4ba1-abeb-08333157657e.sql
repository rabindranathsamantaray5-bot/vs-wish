-- Seed Categories
INSERT INTO public.categories (name, img, bg, "order", active) VALUES
('Birthday', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Birthday%20cake/3D/birthday_cake_3d.png', 'from-purple-100 to-pink-100', 1, true),
('Anniversary', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Ring/3D/ring_3d.png', 'from-amber-100 to-orange-100', 2, true),
('Wedding', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wedding/3D/wedding_3d.png', 'from-rose-100 to-pink-100', 3, true),
('Love', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkling%20heart/3D/sparkling_heart_3d.png', 'from-pink-100 to-rose-100', 4, true),
('Baby Shower', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Baby/3D/baby_3d.png', 'from-sky-100 to-blue-100', 5, true),
('Festivals', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Fireworks/3D/fireworks_3d.png', 'from-fuchsia-100 to-purple-100', 6, true),
('Invitations', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Love%20letter/3D/love_letter_3d.png', 'from-indigo-100 to-violet-100', 7, true),
('Independence', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Flag%20india/3D/flag_india_3d.png', 'from-orange-100 to-green-100', 8, true),
('Diwali', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Diya%20lamp/3D/diya_lamp_3d.png', 'from-amber-100 to-orange-100', 9, true),
('Christmas', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Christmas%20tree/3D/christmas_tree_3d.png', 'from-emerald-100 to-green-100', 10, true),
('New Year', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Party%20popper/3D/party_popper_3d.png', 'from-violet-100 to-purple-100', 11, true),
('More', 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png', 'from-slate-100 to-gray-100', 12, true);

-- Seed Templates (matching category names to category_id)
INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Birthday Celebration', id, 12, 'Popular', 'Happy Birthday', 'For your loved one', 'https://images.pexels.com/photos/15211704/pexels-photo-15211704.jpeg?auto=compress&cs=tinysrgb&w=500', 199, 0, false, 1, true FROM public.categories WHERE name = 'Birthday';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Wedding Invitation', id, 12, 'Popular', 'Wedding Bells', 'Save the date', 'https://images.pexels.com/photos/32705154/pexels-photo-32705154.jpeg?auto=compress&cs=tinysrgb&w=500', 499, 299, true, 2, true FROM public.categories WHERE name = 'Wedding';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Anniversary Wishes', id, 10, 'New', 'Happy Anniversary', 'Forever together', 'https://images.unsplash.com/photo-1589095181425-c038b3871b6a?w=500&fit=crop', 299, 149, true, 3, true FROM public.categories WHERE name = 'Anniversary';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Independence Day', id, 8, 'Trending', 'Jai Hind', 'Vande Mataram', 'https://images.pexels.com/photos/30649312/pexels-photo-30649312.jpeg?auto=compress&cs=tinysrgb&w=500', 99, 0, false, 4, true FROM public.categories WHERE name = 'Independence';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Christmas Wishes', id, 10, 'New', 'Merry Christmas', 'Ho Ho Ho!', 'https://images.pexels.com/photos/724375/pexels-photo-724375.jpeg?auto=compress&cs=tinysrgb&w=500', 199, 0, false, 5, true FROM public.categories WHERE name = 'Christmas';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Baby Shower', id, 10, 'Popular', 'Baby Shower', 'A little one coming', 'https://images.pexels.com/photos/1682459/pexels-photo-1682459.jpeg?auto=compress&cs=tinysrgb&w=500', 349, 199, true, 6, true FROM public.categories WHERE name = 'Baby Shower';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'New Year 2026', id, 8, '', 'Happy New Year', 'Cheers to 2026', 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=500&fit=crop', 149, 0, false, 7, true FROM public.categories WHERE name = 'New Year';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Grand Opening', id, 10, 'New', 'Grand Opening', 'Big day!', 'https://images.unsplash.com/photo-1761475456154-6c5373bbd2bb?w=500&fit=crop', 599, 399, true, 8, true FROM public.categories WHERE name = 'More';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Diwali Deepavali', id, 10, 'Trending', 'Shubh Deepavali', 'Festival of Lights', 'https://images.pexels.com/photos/6120451/pexels-photo-6120451.jpeg?auto=compress&cs=tinysrgb&w=500', 249, 99, true, 9, true FROM public.categories WHERE name = 'Diwali';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Festival Wishes', id, 10, 'Popular', 'Happy Festival', 'Celebrate together', 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=500&fit=crop', 199, 0, false, 10, true FROM public.categories WHERE name = 'Festivals';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Love & Romance', id, 10, 'New', 'Forever Yours', 'A love story', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&fit=crop', 349, 199, true, 11, true FROM public.categories WHERE name = 'Love';

INSERT INTO public.templates (title, category_id, pages, badge, label, sub, photo, price, discount_price, is_premium, "order", active)
SELECT 'Golden Invitation', id, 12, 'Popular', 'You are Invited', 'Be our guest', 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=500&fit=crop', 249, 149, true, 12, true FROM public.categories WHERE name = 'Invitations';
