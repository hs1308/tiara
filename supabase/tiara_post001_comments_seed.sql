-- =============================================================
-- Tiara: Post-001 seed comments (50 comments) + AI summary
-- Fix Squalane product image URL
-- Run in Supabase SQL Editor
-- =============================================================

-- Fix Squalane lip balm broken image
UPDATE tiara_products
SET "heroImage" = 'https://images.unsplash.com/photo-1556228578-dd6c7935df10?auto=format&fit=crop&w=900&q=80'
WHERE id = 'product-ordinary-lip-balm';

-- AI Summary pinned comment (id starts with 'ai-' to identify it)
INSERT INTO tiara_comments (id, "postId", "authorId", body, upvotes, "parentId", "createdAt")
VALUES (
  'ai-summary-post-001',
  'post-001',
  'user-tiara-naina',
  'AI_SUMMARY: • Dot & Key Watermelon Sunscreen SPF 50 consistently praised for not pilling over moisturiser in Mumbai humidity • Works well for combination and oily skin types — multiple users confirm no midday shine breakthrough • Layers cleanly under tinted moisturiser and makeup without white cast • Most users note it stays comfortable for 6+ hours in hot and humid conditions • A few dry-skin users recommend a richer moisturiser underneath for all-day comfort',
  47,
  null,
  '2026-04-27T11:23:00.000Z'
);

-- 50 threaded comments
INSERT INTO tiara_comments (id, "postId", "authorId", body, upvotes, "parentId", "createdAt") VALUES
('c001-p001', 'post-001', 'user-tiara-naina', 'This is actually the sunscreen that converted me from skin-skip-sunscreen to daily SPF. The texture is unlike anything else in this price range.', 38, null, '2026-04-27T11:30:00.000Z'),
('c002-p001', 'post-001', 'user-tiara-aanya', 'Seconding this. It is one of the few formulas that stays comfortable under a tinted moisturiser in humid weather.', 42, null, '2026-04-27T12:05:00.000Z'),
('c003-p001', 'post-001', 'user-tiara-rhea', 'Does it leave any cast on NC40+ skin? That is my main worry with gel sunscreens.', 14, 'c001-p001', '2026-04-27T12:15:00.000Z'),
('c004-p001', 'post-001', 'user-tiara-naina', 'No cast at all on my dusky skin. It absorbs completely in about 30 seconds. I was shocked honestly.', 29, 'c003-p001', '2026-04-27T12:22:00.000Z'),
('c005-p001', 'post-001', 'user-tiara-aanya', 'My only note is reapplication — it reapplies over makeup surprisingly well. Better than most I have tried.', 18, 'c002-p001', '2026-04-27T12:31:00.000Z'),
('c006-p001', 'post-001', 'user-tiara-rhea', 'I switched from Bioderma to this and honestly the texture is miles better for Indian summer conditions.', 22, null, '2026-04-27T12:45:00.000Z'),
('c007-p001', 'post-001', 'user-tiara-naina', 'The watermelon extract is doing something for my skin barrier too. It is not just a marketing claim.', 17, 'c006-p001', '2026-04-27T12:58:00.000Z'),
('c008-p001', 'post-001', 'user-tiara-aanya', 'Is this safe for acne-prone skin? I break out from a lot of sunscreens.', 11, null, '2026-04-27T13:10:00.000Z'),
('c009-p001', 'post-001', 'user-tiara-rhea', 'I have acne-prone combination skin and it has been completely fine. No purging, no milia. Been using it 4 months.', 31, 'c008-p001', '2026-04-27T13:18:00.000Z'),
('c010-p001', 'post-001', 'user-tiara-naina', 'Agreed. The niacinamide in the formula probably helps with the acne side actually.', 24, 'c009-p001', '2026-04-27T13:25:00.000Z'),
('c011-p001', 'post-001', 'user-tiara-aanya', 'What about for dry skin though? I find gel sunscreens always feel tight on me by afternoon.', 9, null, '2026-04-27T13:40:00.000Z'),
('c012-p001', 'post-001', 'user-tiara-rhea', 'If your skin is very dry you might still want a richer moisturiser underneath, but for oily-combination this texture is lovely.', 26, 'c011-p001', '2026-04-27T13:55:00.000Z'),
('c013-p001', 'post-001', 'user-tiara-naina', 'For dry skin I would honestly layer a few drops of face oil before this. Makes a big difference.', 19, 'c012-p001', '2026-04-27T14:02:00.000Z'),
('c014-p001', 'post-001', 'user-tiara-aanya', 'The pump packaging is also really practical. No mess, no product wastage.', 13, null, '2026-04-27T14:15:00.000Z'),
('c015-p001', 'post-001', 'user-tiara-rhea', 'Dot & Key really nailed this one. Their other products are hit and miss but this is consistently good.', 21, null, '2026-04-27T14:30:00.000Z'),
('c016-p001', 'post-001', 'user-tiara-naina', 'The SPF 50 PA+++ rating actually holds up in practice. I tested it over a two hour beach walk with no burn.', 35, 'c015-p001', '2026-04-27T14:45:00.000Z'),
('c017-p001', 'post-001', 'user-tiara-aanya', 'For outdoor use does it need reapplication every two hours like most sunscreens?', 8, 'c016-p001', '2026-04-27T14:52:00.000Z'),
('c018-p001', 'post-001', 'user-tiara-rhea', 'Yes any sunscreen needs reapplication every 2 hours outdoors. This one reapplies over makeup really well though.', 27, 'c017-p001', '2026-04-27T15:00:00.000Z'),
('c019-p001', 'post-001', 'user-tiara-naina', 'I use a setting spray between sunscreen reapplication when I have full makeup on. Works perfectly.', 15, 'c018-p001', '2026-04-27T15:08:00.000Z'),
('c020-p001', 'post-001', 'user-tiara-aanya', 'The scent is very light too. I cannot stand heavy fragrance in sunscreens.', 12, null, '2026-04-27T15:20:00.000Z'),
('c021-p001', 'post-001', 'user-tiara-rhea', 'Minimal scent, yes. Gone within a minute of application. Perfect for fragrance-sensitive people.', 9, 'c020-p001', '2026-04-27T15:28:00.000Z'),
('c022-p001', 'post-001', 'user-tiara-naina', 'Has anyone compared this with the Minimalist Sunscreen? Trying to decide between the two.', 14, null, '2026-04-27T15:45:00.000Z'),
('c023-p001', 'post-001', 'user-tiara-aanya', 'Minimalist is more matte, this is more dewy. If you want a natural skin look, Dot & Key wins.', 28, 'c022-p001', '2026-04-27T15:52:00.000Z'),
('c024-p001', 'post-001', 'user-tiara-rhea', 'For oily skin I slightly prefer Minimalist finish but for normal-combination skin this is definitely better overall.', 22, 'c023-p001', '2026-04-27T16:00:00.000Z'),
('c025-p001', 'post-001', 'user-tiara-naina', 'Texture difference is noticeable. Minimalist is more watery, this feels more like a light moisturiser.', 16, 'c024-p001', '2026-04-27T16:08:00.000Z'),
('c026-p001', 'post-001', 'user-tiara-aanya', 'How does it perform in Chennai weather? That is a much harsher test than Mumbai.', 11, null, '2026-04-27T16:25:00.000Z'),
('c027-p001', 'post-001', 'user-tiara-rhea', 'I am in Chennai and it holds up well. The gel base means it does not feel suffocating in 40 degree heat.', 33, 'c026-p001', '2026-04-27T16:32:00.000Z'),
('c028-p001', 'post-001', 'user-tiara-naina', 'Same experience in Hyderabad summers. No meltdown by noon.', 19, 'c027-p001', '2026-04-27T16:40:00.000Z'),
('c029-p001', 'post-001', 'user-tiara-aanya', 'What is the best way to layer this with niacinamide serum?', 7, null, '2026-04-27T16:55:00.000Z'),
('c030-p001', 'post-001', 'user-tiara-rhea', 'Niacinamide → moisturiser → wait 2 minutes → this sunscreen. Never mix them in the same layer.', 31, 'c029-p001', '2026-04-27T17:02:00.000Z'),
('c031-p001', 'post-001', 'user-tiara-naina', 'This is correct. Layering order matters a lot with gel sunscreens especially.', 14, 'c030-p001', '2026-04-27T17:10:00.000Z'),
('c032-p001', 'post-001', 'user-tiara-aanya', 'Ordered this three times now. The 50ml lasts me exactly one month with twice daily use.', 25, null, '2026-04-27T17:25:00.000Z'),
('c033-p001', 'post-001', 'user-tiara-rhea', 'That matches my experience. About 4 weeks for a tube. Cost per month is really reasonable.', 18, 'c032-p001', '2026-04-27T17:32:00.000Z'),
('c034-p001', 'post-001', 'user-tiara-naina', 'They have a 100ml version too that I switched to. Even better value.', 22, 'c033-p001', '2026-04-27T17:40:00.000Z'),
('c035-p001', 'post-001', 'user-tiara-aanya', 'Is the formula exactly the same in 100ml? Sometimes brands change the formulation in larger sizes.', 9, 'c034-p001', '2026-04-27T17:48:00.000Z'),
('c036-p001', 'post-001', 'user-tiara-rhea', 'Yes same formula, just larger packaging with a slightly different pump design.', 11, 'c035-p001', '2026-04-27T17:55:00.000Z'),
('c037-p001', 'post-001', 'user-tiara-naina', 'This is the first sunscreen that works with my retinol routine without irritation. Worth calling that out.', 29, null, '2026-04-27T18:10:00.000Z'),
('c038-p001', 'post-001', 'user-tiara-aanya', 'Can you use this the morning after a retinol night? I am always nervous about that combo.', 8, 'c037-p001', '2026-04-27T18:18:00.000Z'),
('c039-p001', 'post-001', 'user-tiara-rhea', 'Yes that is exactly when you need SPF the most. Retinol increases sun sensitivity so morning sunscreen is non-negotiable.', 34, 'c038-p001', '2026-04-27T18:25:00.000Z'),
('c040-p001', 'post-001', 'user-tiara-naina', 'This works perfectly in that context. No stinging, no redness, just smooth application.', 17, 'c039-p001', '2026-04-27T18:32:00.000Z'),
('c041-p001', 'post-001', 'user-tiara-aanya', 'The hyaluronic acid in the formula keeps it from feeling drying despite the SPF chemicals.', 21, null, '2026-04-27T18:50:00.000Z'),
('c042-p001', 'post-001', 'user-tiara-rhea', 'Great point. Most chemical sunscreens have a drying alcohol base. This one is the exception.', 16, 'c041-p001', '2026-04-27T18:58:00.000Z'),
('c043-p001', 'post-001', 'user-tiara-naina', 'Is this available in physical stores or only online?', 6, null, '2026-04-27T19:15:00.000Z'),
('c044-p001', 'post-001', 'user-tiara-aanya', 'Available on Nykaa, Amazon and their own website. Not sure about offline retail.', 8, 'c043-p001', '2026-04-27T19:22:00.000Z'),
('c045-p001', 'post-001', 'user-tiara-rhea', 'I have seen it at Reliance Smart stores in Bangalore. So yes some offline presence.', 12, 'c044-p001', '2026-04-27T19:30:00.000Z'),
('c046-p001', 'post-001', 'user-tiara-naina', 'The dewy finish is actually a selling point for me. My skin looks alive not matte.', 23, null, '2026-04-27T19:45:00.000Z'),
('c047-p001', 'post-001', 'user-tiara-aanya', 'Same. I stopped using setting powder after switching to this because the finish looks so natural.', 19, 'c046-p001', '2026-04-27T19:52:00.000Z'),
('c048-p001', 'post-001', 'user-tiara-rhea', 'That combo works beautifully — dewy base, no powder, looks like glass skin by end of morning.', 27, 'c047-p001', '2026-04-27T20:00:00.000Z'),
('c049-p001', 'post-001', 'user-tiara-naina', 'I have gifted this to three friends now. All three kept buying it. Best recommendation track record I have.', 36, null, '2026-04-27T20:15:00.000Z'),
('c050-p001', 'post-001', 'user-tiara-aanya', 'This thread convinced me to try it after months of using Bioré UV. Ordering today.', 28, null, '2026-04-27T20:30:00.000Z');

-- Update comment count for post-001
UPDATE tiara_posts SET "commentCount" = 52 WHERE id = 'post-001';

-- Verify
SELECT COUNT(*) as comment_count FROM tiara_comments WHERE "postId" = 'post-001';
