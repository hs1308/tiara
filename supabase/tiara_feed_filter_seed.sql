-- =============================================================
-- Tiara: Feed Filter Dummy Data
-- Run this in Supabase SQL Editor to populate posts that cover
-- all the filter dimensions (category, product type, brand,
-- concern, weather) so every dropdown shows real results.
-- =============================================================

-- ── Extra posts covering all filter dimensions ──

INSERT INTO tiara_posts (id, "authorId", "productId", brand, type, title, description, image, tags, upvotes, "commentCount", "createdAt")
VALUES

-- SKINCARE + MOISTURISER + DRY SKIN + COLD
('post-f-001', 'user-tiara-naina', NULL, NULL, 'Rec Request',
 'Best moisturiser for dry skin in Delhi winter?',
 'My skin gets extremely tight and flaky from October to February. Looking for a rich moisturiser that actually stays through the day without feeling greasy. Budget around ₹800.',
 NULL,
 ARRAY['Dry skin', 'Moisturiser', 'Cold weather', 'Delhi', 'Skincare'],
 94, 21, '2026-04-25T09:00:00.000Z'),

-- SKINCARE + TONER + OILY SKIN + HUMID
('post-f-002', 'user-tiara-rhea', 'product-minimalist-serum', 'Minimalist', 'Product Talk',
 'Minimalist niacinamide toner is doing something right for oily skin in Mumbai',
 'Three weeks in and my midday shine is noticeably less. Pores look tighter too. The texture is very watery so it absorbs fast — perfect for layering before sunscreen in humid weather.',
 NULL,
 ARRAY['Oily skin', 'Toner', 'Niacinamide', 'Mumbai humidity', 'Skincare'],
 112, 17, '2026-04-26T11:30:00.000Z'),

-- MAKEUP + FOUNDATION + SUNNY
('post-f-003', 'user-tiara-aanya', NULL, 'Kay Beauty', 'Rec Request',
 'Foundation that does not oxidise in Chennai summer heat?',
 'Every foundation I try looks two shades darker by noon. Chennai heat is brutal. Need something with good staying power that won''t turn orange on NC30-ish skin.',
 NULL,
 ARRAY['Foundation', 'Sunny', 'Chennai', 'Oxidation', 'Makeup'],
 78, 14, '2026-04-27T07:45:00.000Z'),

-- MAKEUP + CONCEALER + DARK CIRCLES
('post-f-004', 'user-tiara-naina', 'product-kay-beauty-concealer', 'Kay Beauty', 'Product Talk',
 'Kay Beauty concealer is the best for dark circles on Indian skin tones',
 'Finally found a concealer that doesn''t look ashy on my light-medium skin. The peach undertone corrects dark circles without needing a separate colour corrector. Buildable coverage that doesn''t crease.',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
 ARRAY['Dark circles', 'Concealer', 'Makeup', 'Indian skin tone'],
 143, 28, '2026-04-27T14:20:00.000Z'),

-- HAIRCARE + HAIR MASK + FRIZZ + RAINY
('post-f-005', 'user-tiara-rhea', 'product-anomaly-mask', 'Anomaly', 'Routine Check',
 'Monsoon hair routine that actually controls frizz — sharing what works for me',
 'Pre-shampoo oil + Anomaly bonding mask every Sunday. Mid-week I use a light leave-in. My 2B waves have never been this manageable in the rainy season. Sharing in case it helps anyone.',
 NULL,
 ARRAY['Haircare', 'Hair mask', 'Frizz', 'Rainy', 'Monsoon', 'Wavy hair'],
 167, 33, '2026-04-26T08:15:00.000Z'),

-- HAIRCARE + HAIR FALL + COLD
('post-f-006', 'user-tiara-aanya', NULL, NULL, 'Skin & Hair Help',
 'Severe hair fall every winter — is this normal or is something wrong?',
 'Every year around November my hair fall spikes dramatically. I''ve ruled out thyroid. Could it be the cold weather affecting scalp circulation? Looking for targeted hair fall solutions.',
 NULL,
 ARRAY['Haircare', 'Hair fall', 'Cold weather', 'Winter', 'Scalp care'],
 89, 19, '2026-04-28T04:30:00.000Z'),

-- LIP CARE + LIP BALM + DRY SKIN
('post-f-007', 'user-tiara-naina', 'product-ordinary-lip-balm', 'The Ordinary', 'Product Talk',
 'The Ordinary lip balm is the only one that actually fixes dry lips overnight',
 'I''ve tried every drugstore lip balm and they all just sit on top. This one actually absorbs and my lips feel genuinely soft by morning. The squalane makes a real difference for dry skin types.',
 NULL,
 ARRAY['Lip care', 'Lip balm', 'Dry lips', 'The Ordinary'],
 91, 11, '2026-04-25T20:00:00.000Z'),

-- SKINCARE + SUNSCREEN + OILY SKIN + SUNNY
('post-f-008', 'user-tiara-rhea', 'product-dot-key-sunscreen', 'Dot & Key', 'Product Talk',
 'Sunscreen review for oily skin after 3 months of testing across seasons',
 'Tested the Dot & Key watermelon sunscreen through Mumbai summer and now monsoon. No pilling, no white cast, doesn''t make oily skin look like a frying pan. Reapplication mid-day is easy.',
 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
 ARRAY['Sunscreen', 'Oily skin', 'Sunny', 'Dot & Key', 'Skincare', 'Mumbai humidity'],
 201, 44, '2026-04-24T16:00:00.000Z'),

-- SKINCARE + SERUM + PIGMENTATION + ACNE
('post-f-009', 'user-tiara-aanya', 'product-minimalist-serum', 'Minimalist', 'Routine Check',
 'PM routine for acne marks and pigmentation — six week update',
 'Niacinamide 10% in the morning and a low-dose retinol at night. My old acne marks have faded about 40% in six weeks. Patience is everything with these actives.',
 NULL,
 ARRAY['Skincare', 'Serum', 'Acne', 'Pigmentation', 'Routine check'],
 134, 26, '2026-04-23T12:00:00.000Z'),

-- FRAGRANCE + PERFUME MIST + SUNNY
('post-f-010', 'user-tiara-naina', 'product-sdj-mist', 'Sol de Janeiro', 'Product Talk',
 'Sol de Janeiro body mist is summer-appropriate and gets the most compliments',
 'The scent is warm but not heavy — perfect for the beach or an outdoor brunch. Lasts about 4–5 hours on skin. Layer it over a fragrance-free lotion for better longevity.',
 NULL,
 ARRAY['Fragrance', 'Perfume mist', 'Sunny', 'Summer', 'Sol de Janeiro'],
 118, 22, '2026-04-27T18:00:00.000Z'),

-- SKINCARE + FACE MASK + SENSITIVE SKIN
('post-f-011', 'user-tiara-rhea', NULL, NULL, 'Rec Request',
 'Calming face mask for sensitive redness-prone skin — suggestions?',
 'Every clay mask breaks me out. Every peel stings. Looking for a calming wash-off mask that soothes redness without stripping. Ingredients that work for me: centella, oat, ceramides.',
 NULL,
 ARRAY['Skincare', 'Face mask', 'Sensitive skin', 'Redness', 'Centella'],
 76, 18, '2026-04-28T03:00:00.000Z'),

-- MAKEUP + NAIL POLISH + LOOK & FEEL
('post-f-012', 'user-tiara-aanya', NULL, NULL, 'Look & Feel',
 'Nail polish colours that look good on dusky Indian skin tones',
 'Nudes that actually show up (not disappear), deep berries, terracotta, and warm oranges are the ones that consistently work on my NC40 hands. Sharing some recent favourites.',
 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
 ARRAY['Nailcare', 'Nail polish', 'Indian skin tone', 'Makeup'],
 195, 37, '2026-04-26T20:00:00.000Z');


-- ── Make sure user-tiara-aanya maps to the demo user ──
-- (The demo user ID is user-tiara-aanya in the app)

UPDATE tiara_posts
SET "authorId" = 'user-tiara-aanya'
WHERE "authorId" = 'user-tiara-aanya';
-- (no-op, just confirming mapping)


-- ── Verify inserts ──
SELECT id, type, title, tags, "createdAt"
FROM tiara_posts
ORDER BY "createdAt" DESC
LIMIT 25;
