CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified_at INTEGER,
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  trading_since TEXT,
  operating_notes TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS business_members (
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  PRIMARY KEY (business_id, user_id)
);

CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('sale','expense','stock_purchase','stock_count','loss')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER,
  description TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  source_channel TEXT NOT NULL DEFAULT 'web'
    CHECK (source_channel IN ('web','telegram','whatsapp','csv','demo')),
  status TEXT NOT NULL DEFAULT 'saved'
    CHECK (status IN ('received','processing','awaiting_confirmation','saved','reconciled','requires_attention','failed')),
  idempotency_key TEXT,
  evidence_tier TEXT NOT NULL DEFAULT 'reported'
    CHECK (evidence_tier IN ('reported','document_supported','counter_signed')),
  prev_hash TEXT NOT NULL,
  canonical_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (business_id, seq)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_records_idem
  ON records (business_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_records_business_kind
  ON records (business_id, kind, occurred_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  business_id TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  created_at INTEGER NOT NULL
);