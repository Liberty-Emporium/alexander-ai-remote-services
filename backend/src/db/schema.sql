-- ============================================================
-- Alexander AI Solutions — Remote Computer Repair Platform
-- PostgreSQL Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   TEXT         NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(30),
  avatar_url      TEXT,
  stripe_customer_id VARCHAR(100),
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Technicians ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS technicians (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           VARCHAR(255) NOT NULL,
  email               VARCHAR(255) UNIQUE,
  specialties         TEXT[]       NOT NULL DEFAULT '{}',
  rating              NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  hourly_rate         NUMERIC(8,2) NOT NULL DEFAULT 75.00,
  bio                 TEXT,
  avatar_url          TEXT,
  is_available        BOOLEAN      NOT NULL DEFAULT true,
  response_time_min   INTEGER      NOT NULL DEFAULT 15,
  total_sessions      INTEGER      NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed some technicians
INSERT INTO technicians (id, full_name, email, specialties, rating, hourly_rate, bio, is_available, response_time_min)
VALUES
  (uuid_generate_v4(), 'Marcus Rivera',  'marcus@alexander-ai.com', ARRAY['hardware','motherboard','GPU','CPU'], 4.9, 85.00, 'Senior hardware specialist with 15 years of experience in desktop and laptop repair.', true, 10),
  (uuid_generate_v4(), 'Priya Nair',     'priya@alexander-ai.com',  ARRAY['software','OS','malware removal','drivers'], 4.8, 75.00, 'Software and OS expert. Specializes in Windows/Linux troubleshooting and malware remediation.', true, 5),
  (uuid_generate_v4(), 'Jordan Kim',     'jordan@alexander-ai.com', ARRAY['data recovery','storage','SSD','HDD'], 4.7, 95.00, 'Data recovery and storage specialist. Recovers data from failed drives and SSDs.', true, 15)
ON CONFLICT DO NOTHING;

-- ── Jobs ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description     TEXT         NOT NULL,
  device_type     VARCHAR(50),   -- 'desktop' | 'laptop' | 'unknown'
  device_brand    VARCHAR(100),
  image_url       TEXT,
  diagnosis       JSONB,         -- Full AI diagnosis object
  status          VARCHAR(30)  NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','in_progress','completed','cancelled')),
  technician_id   UUID         REFERENCES technicians(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id    ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- ── Sessions (remote tech sessions) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id   UUID         NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  job_id          UUID         REFERENCES jobs(id) ON DELETE SET NULL,
  scheduled_at    TIMESTAMPTZ  NOT NULL,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  duration_min    INTEGER,
  meeting_link    TEXT,
  notes           TEXT,
  status          VARCHAR(30)  NOT NULL DEFAULT 'scheduled'
                                 CHECK (status IN ('scheduled','in_progress','completed','cancelled','no_show')),
  amount_charged  NUMERIC(8,2),
  stripe_payment_id VARCHAR(100),
  rating          SMALLINT     CHECK (rating >= 1 AND rating <= 5),
  feedback        TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_technician_id ON sessions(technician_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at  ON sessions(scheduled_at);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','jobs','technicians','sessions'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s; '
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s '
      'FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      t, t, t, t
    );
  END LOOP;
END;
$$;
