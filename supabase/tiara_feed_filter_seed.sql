-- =============================================================
-- Tiara: Feed Filter Dummy Data
-- Run this in Supabase SQL Editor
-- =============================================================

INSERT INTO tiara_posts (id, "authorId", "productId", brand, type, title, description, image, tags, upvotes, "commentCount", "createdAt")
VALUES

('post-f-001', 'user-tiara-naina', NULL, NULL, 'Rec Request',
 'Best moisturiser for dry skin in Delhi winter?',
 'My skin gets extremely tight and flaky from October to February. Looking for a rich moisturiser that actually stays through the day without feeling greasy. Budget around ₹800.',
 NULL,
 '["Dry skin", "Moisturiser", "Cold weather", "Delhi", "Skincare"]'::jsonb,
 94, 21, '2026-04-25T09:00:00.000Z'),

('post-f-002', 'user-tiara-rhea', 'product-minimalist-serum', 'Minimalist', 'Product Talk',
 'Minimalist niacinamide toner is doing something right for oily skin in Mumbai',
 'Three weeks in and my midday shine is noticeably less. Pores look tighter too. The texture is very watery so it absorbs fast — perfect for layering before sunscreen in humid weather.',
 NULL,
 '["Oily skin", "Toner", "Niacinamide", "Mumbai humidity", "Skincare"]'::jsonb,
 112, 17, '2026-04-26T11:30:00.000Z'),

('post-f-003', 'user-tiara-aanya', NULL, 'Kay Beauty', 'Rec Request',
 'Foundation that does not oxidise in Chennai summer heat?',
 'Every foundation I try looks two shades darker by noon. Chennai heat is brutal. Need something with good staying power that won''t turn orange on NC30-ish skin.',
 NULL,
 '["Foundation", "Sunny", "Chennai", "Oxidation", "Makeup"]'::jsonb,
 78, 14, '2026-04-27T07:45:00.000Z'),

('post-f-004', 'user-tiara-naina', 'product-kay-beauty-concealer', 'Kay Beauty', 'Product Talk',
 'Kay Beauty concealer is the best for dark circles on Indian skin tones',
 'Finally found a concealer that doesn''t look ashy on my light-medium skin. The peach undertone corrects dark circles without needing a separate colour corrector.',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
 '["Dark circles", "Concealer", "Makeup", "Indian skin tone"]'::jsonb,
 143, 28, '2026-04-27T14:20:00.000Z'),

('post-f-005', 'user-tiara-rhea', 'product-anomaly-mask', 'Anomaly', 'Routine Check',
 'Monsoon hair routine that actually controls frizz — sharing what works for me',
 'Pre-shampoo oil + Anomaly bonding mask every Sunday. Mid-week I use a light leave-in. My 2B waves have never been this manageable in the rainy season.',
 NULL,
 '["Haircare", "Hair mask", "Frizz", "Rainy", "Monsoon", "Wavy hair"]'::jsonb,
 167, 33, '2026-04-26T08:15:00.000Z'),

('post-f-006', 'user-tiara-aanya', NULL, NULL, 'Skin & Hair Help',
 'Severe hair fall every winter — is this normal or is something wrong?',
 'Every year around November my hair fall spikes dramatically. I''ve ruled out thyroid. Could it be the cold weather affecting scalp circulation?',
 NULL,
 '["Haircare", "Hair fall", "Cold weather", "Winter", "Scalp care"]'::jsonb,
 89, 19, '2026-04-28T04:30:00.000Z'),

('post-f-007', 'user-tiara-naina', 'product-ordinary-lip-balm', 'The Ordinary', 'Product Talk',
 'The Ordinary lip balm is the only one that actually fixes dry lips overnight',
 'I''ve tried every drugstore lip balm and they all just sit on top. This one actually absorbs and my lips feel genuinely soft by morning.',
 NULL,
 '["Lip care", "Lip balm", "Dry lips", "The Ordinary"]'::jsonb,
 91, 11, '2026-04-25T20:00:00.000Z'),

('post-f-008', 'user-tiara-rhea', 'product-dot-key-sunscreen', 'Dot & Key', 'Product Talk',
 'Sunscreen review for oily skin after 3 months of testing across seasons',
 'Tested the Dot & Key watermelon sunscreen through Mumbai summer and now monsoon. No pilling, no white cast, doesn''t make oily skin look like a frying pan.',
 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
 '["Sunscreen", "Oily skin", "Sunny", "Dot & Key", "Skincare", "Mumbai humidity"]'::jsonb,
 201, 44, '2026-04-24T16:00:00.000Z'),

('post-f-009', 'user-tiara-aanya', 'product-minimalist-serum', 'Minimalist', 'Routine Check',
 'PM routine for acne marks and pigmentation — six week update',
 'Niacinamide 10% in the morning and a low-dose retinol at night. My old acne marks have faded about 40% in six weeks.',
 NULL,
 '["Skincare", "Serum", "Acne", "Pigmentation", "Routine check"]'::jsonb,
 134, 26, '2026-04-23T12:00:00.000Z'),

('post-f-010', 'user-tiara-naina', 'product-sdj-mist', 'Sol de Janeiro', 'Product Talk',
 'Sol de Janeiro body mist is summer-appropriate and gets the most compliments',
 'The scent is warm but not heavy — perfect for the beach or an outdoor brunch. Lasts about 4–5 hours on skin.',
 NULL,
 '["Fragrance", "Perfume mist", "Sunny", "Summer", "Sol de Janeiro"]'::jsonb,
 118, 22, '2026-04-27T18:00:00.000Z'),

('post-f-011', 'user-tiara-rhea', NULL, NULL, 'Rec Request',
 'Calming face mask for sensitive redness-prone skin — suggestions?',
 'Every clay mask breaks me out. Every peel stings. Looking for a calming wash-off mask that soothes redness without stripping.',
 NULL,
 '["Skincare", "Face mask", "Sensitive skin", "Redness", "Centella"]'::jsonb,
 76, 18, '2026-04-28T03:00:00.000Z'),

('post-f-012', 'user-tiara-aanya', NULL, NULL, 'Look & Feel',
 'Nail polish colours that look good on dusky Indian skin tones',
 'Nudes that actually show up, deep berries, terracotta, and warm oranges are the ones that consistently work on my NC40 hands.',
 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
 '["Nailcare", "Nail polish", "Indian skin tone", "Makeup"]'::jsonb,
 195, 37, '2026-04-26T20:00:00.000Z');

-- Verify
SELECT id, type, title, tags FROM tiara_posts ORDER BY "createdAt" DESC LIMIT 20;
