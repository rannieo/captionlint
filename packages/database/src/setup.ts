/**
 * Direct SQL setup script — bypasses drizzle-kit.
 * Run with: tsx packages/database/src/setup.ts
 */
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/captionlint';
const sql = postgres(url, { max: 1 });

await sql.begin(async (sql) => {
  // ── better-auth core tables ────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id               text        PRIMARY KEY,
      name             text        NOT NULL,
      email            text        NOT NULL UNIQUE,
      email_verified   boolean     NOT NULL DEFAULT false,
      image            text,
      created_at       timestamptz NOT NULL DEFAULT now(),
      updated_at       timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS session (
      id           text        PRIMARY KEY,
      expires_at   timestamptz NOT NULL,
      token        text        NOT NULL UNIQUE,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now(),
      ip_address   text,
      user_agent   text,
      user_id      text        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS account (
      id                        text        PRIMARY KEY,
      account_id                text        NOT NULL,
      provider_id               text        NOT NULL,
      user_id                   text        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      access_token              text,
      refresh_token             text,
      id_token                  text,
      access_token_expires_at   timestamptz,
      refresh_token_expires_at  timestamptz,
      scope                     text,
      password                  text,
      created_at                timestamptz NOT NULL DEFAULT now(),
      updated_at                timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS verification (
      id           text        PRIMARY KEY,
      identifier   text        NOT NULL,
      value        text        NOT NULL,
      expires_at   timestamptz NOT NULL,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now()
    )`;

  // ── better-auth organization plugin tables ─────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS organization (
      id         text        PRIMARY KEY,
      name       text        NOT NULL,
      slug       text        UNIQUE,
      logo       text,
      metadata   text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS member (
      id              text        PRIMARY KEY,
      organization_id text        NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
      user_id         text        NOT NULL REFERENCES "user"(id)         ON DELETE CASCADE,
      role            text        NOT NULL,
      created_at      timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS invitation (
      id              text        PRIMARY KEY,
      organization_id text        NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
      email           text        NOT NULL,
      role            text,
      status          text        NOT NULL,
      expires_at      timestamptz NOT NULL,
      inviter_id      text        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      created_at      timestamptz NOT NULL DEFAULT now()
    )`;

  // ── app tables ─────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS vocabulary_terms (
      id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id text        NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
      term            varchar(255) NOT NULL,
      case_sensitive  boolean     NOT NULL DEFAULT false,
      created_at      timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE INDEX IF NOT EXISTS vocabulary_org_term_idx
      ON vocabulary_terms (organization_id, term)`;

  await sql`
    CREATE TABLE IF NOT EXISTS lint_runs (
      id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id        uuid,
      organization_id text        NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
      user_id         text        NOT NULL REFERENCES "user"(id)         ON DELETE CASCADE,
      filename        varchar(255) NOT NULL,
      format          varchar(10)  NOT NULL,
      preset_id       varchar(50)  NOT NULL,
      engine_version  varchar(20)  NOT NULL,
      status          varchar(10)  NOT NULL DEFAULT 'QUEUED',
      summary         jsonb       NOT NULL,
      cues            jsonb       NOT NULL,
      export_content  text,
      created_at      timestamptz NOT NULL DEFAULT now(),
      finished_at     timestamptz
    )`;

  await sql`
    CREATE INDEX IF NOT EXISTS lint_runs_org_idx        ON lint_runs (organization_id)`;
  await sql`
    CREATE INDEX IF NOT EXISTS lint_runs_created_at_idx ON lint_runs (created_at)`;

  await sql`
    CREATE TABLE IF NOT EXISTS findings (
      id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
      lint_run_id  uuid         NOT NULL REFERENCES lint_runs(id) ON DELETE CASCADE,
      rule_code    varchar(50)  NOT NULL,
      category     varchar(20)  NOT NULL,
      severity     varchar(10)  NOT NULL,
      cue_index    integer,
      start_ms     integer,
      end_ms       integer,
      message      varchar(500) NOT NULL,
      details      jsonb,
      suggested_fix jsonb
    )`;

  await sql`
    CREATE INDEX IF NOT EXISTS findings_run_idx ON findings (lint_run_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS assets (
      id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id text         NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
      user_id         text         NOT NULL REFERENCES "user"(id)         ON DELETE CASCADE,
      filename        varchar(255) NOT NULL,
      format          varchar(10)  NOT NULL,
      content         text         NOT NULL,
      checksum        varchar(64)  NOT NULL,
      duration_ms     integer,
      created_at      timestamptz  NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE INDEX IF NOT EXISTS assets_org_idx ON assets (organization_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS exports (
      id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      lint_run_id  uuid        NOT NULL REFERENCES lint_runs(id) ON DELETE CASCADE,
      format       varchar(10) NOT NULL,
      content      text        NOT NULL,
      created_at   timestamptz NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE INDEX IF NOT EXISTS exports_run_idx ON exports (lint_run_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS history_items (
      id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id text         NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
      asset_id        uuid                  REFERENCES assets(id)       ON DELETE SET NULL,
      lint_run_id     uuid         NOT NULL REFERENCES lint_runs(id)    ON DELETE CASCADE,
      export_id       uuid                  REFERENCES exports(id)      ON DELETE SET NULL,
      filename        varchar(255) NOT NULL,
      preset          varchar(50)  NOT NULL,
      summary         jsonb        NOT NULL,
      created_at      timestamptz  NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE INDEX IF NOT EXISTS history_items_org_idx        ON history_items (organization_id)`;
  await sql`
    CREATE INDEX IF NOT EXISTS history_items_created_at_idx ON history_items (created_at)`;
});

console.log('✓ All tables created successfully');
await sql.end();
