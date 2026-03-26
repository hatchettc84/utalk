-- UtalkWe Listen — Complete Schema
-- Run once in Supabase SQL Editor before any application code runs against the database.

-- ─── updated_at trigger function ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── callers ──────────────────────────────────────────────────────────────────

CREATE TABLE callers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone             TEXT        NOT NULL,
  name              TEXT,
  guidance_type     TEXT        CHECK (guidance_type IN ('faith', 'general', 'both')),
  preferred_voice   TEXT,
  call_count        INTEGER     NOT NULL DEFAULT 0,
  subscription_tier TEXT        NOT NULL DEFAULT 'free'
                                CHECK (subscription_tier IN ('free', 'basic', 'premium', 'vip')),
  stripe_customer_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX callers_phone_idx ON callers (phone);

CREATE TRIGGER update_callers_updated_at
  BEFORE UPDATE ON callers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── call_sessions ────────────────────────────────────────────────────────────
-- action_plan_id FK added after coaching_plans is created (circular reference)

CREATE TABLE call_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id         UUID        NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
  vapi_call_id      TEXT        NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  duration_seconds  INTEGER,
  issue_category    TEXT,
  issue_summary     TEXT,
  full_summary      TEXT,
  caller_mood       TEXT,
  wisdom_used       TEXT[],
  was_crisis        BOOLEAN     NOT NULL DEFAULT FALSE,
  action_plan_id    UUID,       -- FK added below after coaching_plans exists
  follow_up_sent    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX call_sessions_vapi_call_id_idx ON call_sessions (vapi_call_id);
CREATE INDEX call_sessions_caller_id_idx            ON call_sessions (caller_id);
CREATE INDEX call_sessions_started_at_idx           ON call_sessions (started_at DESC);

-- ─── coaching_plans ───────────────────────────────────────────────────────────

CREATE TABLE coaching_plans (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id     UUID        NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
  session_id    UUID        NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  category      TEXT,
  title         TEXT        NOT NULL,
  steps         JSONB       NOT NULL DEFAULT '[]',
  wisdom_anchor TEXT,
  duration_days INTEGER     NOT NULL DEFAULT 7,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX coaching_plans_caller_id_idx  ON coaching_plans (caller_id);
CREATE INDEX coaching_plans_session_id_idx ON coaching_plans (session_id);

-- Resolve circular reference: call_sessions → coaching_plans
ALTER TABLE call_sessions
  ADD CONSTRAINT fk_call_sessions_action_plan
  FOREIGN KEY (action_plan_id) REFERENCES coaching_plans(id) ON DELETE SET NULL;

-- ─── sms_log ──────────────────────────────────────────────────────────────────

CREATE TABLE sms_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id    UUID        NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
  phone        TEXT        NOT NULL,
  message_type TEXT        NOT NULL
                           CHECK (message_type IN ('follow_up', 'daily_wisdom', 'plan_step', 'subscription')),
  body         TEXT        NOT NULL,
  twilio_sid   TEXT,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       TEXT        NOT NULL DEFAULT 'sent'
                           CHECK (status IN ('sent', 'failed', 'pending'))
);

CREATE INDEX sms_log_caller_id_idx ON sms_log (caller_id);
CREATE INDEX sms_log_sent_at_idx   ON sms_log (sent_at DESC);

-- ─── subscriptions ────────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id              UUID        NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT        UNIQUE,
  stripe_customer_id     TEXT,
  tier                   TEXT        NOT NULL DEFAULT 'free'
                                     CHECK (tier IN ('free', 'basic', 'premium', 'vip')),
  status                 TEXT        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX subscriptions_caller_id_idx ON subscriptions (caller_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE callers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions  ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS by default in Supabase; these policies ensure
-- no accidental exposure if the RLS default ever changes.
CREATE POLICY "callers_service_role_all"        ON callers        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "call_sessions_service_role_all"  ON call_sessions  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "coaching_plans_service_role_all" ON coaching_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "sms_log_service_role_all"        ON sms_log        FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "subscriptions_service_role_all"  ON subscriptions  FOR ALL TO service_role USING (true) WITH CHECK (true);
