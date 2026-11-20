-- Additive migration for a NEW isolated V0.6 test database only.
-- No destructive statements. Apply manually after review; do not run against production.
CREATE TABLE IF NOT EXISTS farm_states (
  id varchar(100) PRIMARY KEY,
  owner_id varchar(100) NOT NULL,
  farm_json jsonb NOT NULL,
  progression_json jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS farm_states_owner_idx ON farm_states(owner_id);
CREATE TABLE IF NOT EXISTS farm_requests (
  farm_id varchar(100) NOT NULL REFERENCES farm_states(id),
  request_id varchar(100) NOT NULL,
  response_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(farm_id, request_id)
);
