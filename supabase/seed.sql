-- supabase/seed.sql
-- Seed data for local development
-- Run with: npx supabase db reset (applies migrations + seed)

-- ============================================
-- 1. Users
-- ============================================
-- IMPORTANT: clerk_id must match your actual Clerk test user
-- After first login, update this value or use Supabase Studio
INSERT INTO public.users (clerk_id, email, tier, inbox_address)
VALUES
  ('user_test_001', 'test@example.com', 'free', gen_random_uuid() || '@mail.briefly.app'),
  ('user_test_002', 'pro@example.com', 'paid', gen_random_uuid() || '@mail.briefly.app')
ON CONFLICT (clerk_id) DO NOTHING;

-- ============================================
-- 2. Raw emails (needed as FK for summaries)
-- ============================================
INSERT INTO public.raw_emails (id, user_id, sender_email, subject, content_text, received_at, processed_at)
VALUES
  -- User 1 (free) — 5 emails
  ('a0000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'newsletter@techcrunch.com', 'TechCrunch Daily: AI startups raise record funding',
   'Full email content here...', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '55 minutes'),

  ('a0000001-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'digest@morningbrew.com', 'Morning Brew: Markets rally on rate cut hopes',
   'Full email content here...', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 50 minutes'),

  ('a0000001-0000-0000-0000-000000000003',
   (SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'hello@tldr.tech', 'TLDR: GitHub Copilot gets major update',
   'Full email content here...', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours'),

  ('a0000001-0000-0000-0000-000000000004',
   (SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'team@hackernewsletter.com', 'Hacker Newsletter #642: Rust in production',
   'Full email content here...', NOW() - INTERVAL '2 days', NOW() - INTERVAL '47 hours'),

  ('a0000001-0000-0000-0000-000000000005',
   (SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'weekly@densediscovery.com', 'Dense Discovery #280: Design tools roundup',
   'Full email content here...', NOW() - INTERVAL '3 days', NOW() - INTERVAL '71 hours'),

  -- User 2 (paid) — 3 emails
  ('a0000002-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE clerk_id = 'user_test_002'),
   'newsletter@stratechery.com', 'Stratechery: Apple Vision Pro one year later',
   'Full email content here...', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes'),

  ('a0000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE clerk_id = 'user_test_002'),
   'digest@thehustle.co', 'The Hustle: Why SaaS valuations are bouncing back',
   'Full email content here...', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 50 minutes'),

  ('a0000002-0000-0000-0000-000000000003',
   (SELECT id FROM users WHERE clerk_id = 'user_test_002'),
   'hello@bytebytego.com', 'ByteByteGo: System design — Rate limiter deep dive',
   'Full email content here...', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours')
;

-- ============================================
-- 3. Summaries — mix of providers, tiers, read/unread
-- ============================================
INSERT INTO public.summaries (user_id, raw_email_id, title, key_points, source_url, llm_tier, llm_provider, tokens_input, tokens_output, generated_at, read_at)
VALUES
  -- User 1 — basic tier (OpenAI), mix of read/unread
  ((SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'a0000001-0000-0000-0000-000000000001',
   'Record AI Funding Round in Q1 2026',
   ARRAY[
     'AI startups raised $28B globally in Q1 2026, surpassing the previous record',
     'Anthropic and OpenAI competitors lead the charge with multi-billion rounds',
     'Enterprise AI adoption is the primary driver, not consumer products',
     'European AI startups saw 3x growth compared to last year'
   ],
   'https://techcrunch.com/2026/03/21/ai-funding',
   'basic', 'openai', 1200, 180,
   NOW() - INTERVAL '55 minutes', NULL),

  ((SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'a0000001-0000-0000-0000-000000000002',
   'Markets Rally as Fed Signals Rate Cuts',
   ARRAY[
     'S&P 500 gained 2.1% on dovish Fed commentary suggesting summer rate cuts',
     'Treasury yields dropped to 3.8%, lowest since 2024',
     'Tech stocks led the rally with NASDAQ up 2.8%'
   ],
   NULL,
   'basic', 'openai', 950, 120,
   NOW() - INTERVAL '2 hours 50 minutes', NOW() - INTERVAL '2 hours'),

  ((SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'a0000001-0000-0000-0000-000000000003',
   'GitHub Copilot Workspace: Full Repo Understanding',
   ARRAY[
     'Copilot can now reason across entire repositories, not just open files',
     'New "plan mode" generates multi-file implementation plans before coding',
     'Performance benchmarks show 40% improvement in code suggestion accuracy',
     'Free tier now includes 2000 completions/month, up from 500'
   ],
   'https://github.blog/copilot-workspace',
   'basic', 'groq', 1400, 200,
   NOW() - INTERVAL '23 hours', NOW() - INTERVAL '20 hours'),

  ((SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'a0000001-0000-0000-0000-000000000004',
   'Rust Adoption in Production: Industry Survey Results',
   ARRAY[
     '62% of surveyed companies now use Rust in at least one production service',
     'Memory safety and performance are the top reasons for adoption',
     'AWS, Google, and Microsoft are the largest contributors to the Rust ecosystem',
     'The learning curve remains the biggest barrier, with average onboarding taking 3 months'
   ],
   'https://blog.rust-lang.org/survey-2026',
   'basic', 'openai', 1100, 190,
   NOW() - INTERVAL '47 hours', NULL),

  ((SELECT id FROM users WHERE clerk_id = 'user_test_001'),
   'a0000001-0000-0000-0000-000000000005',
   'Design Tools in 2026: Figma vs. the New Wave',
   ARRAY[
     'Figma maintains 68% market share but new AI-native tools are gaining traction',
     'Galileo AI and Relume now generate production-ready components from prompts',
     'Design systems are shifting toward token-based architectures for better dev handoff'
   ],
   NULL,
   'basic', 'groq', 800, 140,
   NOW() - INTERVAL '71 hours', NOW() - INTERVAL '60 hours'),

  -- User 2 — premium tier (Groq primary), all unread
  ((SELECT id FROM users WHERE clerk_id = 'user_test_002'),
   'a0000002-0000-0000-0000-000000000001',
   'Apple Vision Pro: Lessons From Year One',
   ARRAY[
     'Sales reached 1.2M units, below Apple targets but above analyst expectations',
     'Enterprise use cases (training, design review) drove 60% of sales',
     'visionOS 3.0 introduced shared spaces, boosting collaborative use cases',
     'Developer ecosystem grew to 12,000 spatial apps',
     'Apple is reportedly working on a lighter, cheaper model for late 2026'
   ],
   'https://stratechery.com/apple-vision-pro-year-one',
   'premium', 'groq', 2200, 350,
   NOW() - INTERVAL '1 hour 50 minutes', NULL),

  ((SELECT id FROM users WHERE clerk_id = 'user_test_002'),
   'a0000002-0000-0000-0000-000000000002',
   'SaaS Valuations: The Recovery is Real',
   ARRAY[
     'Median SaaS revenue multiple recovered to 8.2x, up from 5.1x low in 2023',
     'AI-integrated SaaS companies command a 40% premium over traditional SaaS',
     'Net revenue retention above 120% is now the top metric investors watch',
     'IPO window reopening with 3 major SaaS IPOs planned for Q2 2026'
   ],
   'https://thehustle.co/saas-valuations-2026',
   'premium', 'groq', 1800, 280,
   NOW() - INTERVAL '4 hours 50 minutes', NULL),

  ((SELECT id FROM users WHERE clerk_id = 'user_test_002'),
   'a0000002-0000-0000-0000-000000000003',
   'System Design: Building a Distributed Rate Limiter',
   ARRAY[
     'Token bucket and sliding window are the two most practical algorithms for distributed systems',
     'Redis with Lua scripts provides atomic rate limiting with sub-millisecond latency',
     'Consistent hashing helps distribute rate limit counters across nodes',
     'Client-side rate limiting should complement server-side, never replace it'
   ],
   'https://bytebytego.com/rate-limiter',
   'premium', 'openai', 2500, 320,
   NOW() - INTERVAL '23 hours', NULL)
;
