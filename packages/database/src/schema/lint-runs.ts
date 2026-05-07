import { pgTable, varchar, timestamp, uuid, integer, jsonb, index, text } from 'drizzle-orm/pg-core';
import { organization, user } from './auth';

export const lintRuns = pgTable('lint_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  format: varchar('format', { enum: ['SRT', 'VTT'] }).notNull(),
  presetId: varchar('preset_id', { length: 50 }).notNull(),
  engineVersion: varchar('engine_version', { length: 20 }).notNull(),
  status: varchar('status', { enum: ['QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'ERROR'] })
    .default('QUEUED')
    .notNull(),
  summary: jsonb('summary')
    .$type<{ pass: number; warn: number; error: number; total: number }>()
    .notNull(),
  cues: jsonb('cues')
    .$type<
      Array<{
        index: number;
        startMs: number;
        endMs: number;
        text: string;
        lines: string[];
      }>
    >()
    .notNull(),
  exportContent: text('export_content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
}, (table) => ({
  orgIdx: index('lint_runs_org_idx').on(table.organizationId),
  createdAtIdx: index('lint_runs_created_at_idx').on(table.createdAt),
}));

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  lintRunId: uuid('lint_run_id')
    .references(() => lintRuns.id, { onDelete: 'cascade' })
    .notNull(),
  ruleCode: varchar('rule_code', { length: 50 }).notNull(),
  category: varchar('category', { length: 20 }).notNull(),
  severity: varchar('severity', { enum: ['PASS', 'WARN', 'ERROR'] }).notNull(),
  cueIndex: integer('cue_index'),
  startMs: integer('start_ms'),
  endMs: integer('end_ms'),
  message: varchar('message', { length: 500 }).notNull(),
  details: jsonb('details'),
  suggestedFix: jsonb('suggested_fix'),
}, (table) => ({
  runIdx: index('findings_run_idx').on(table.lintRunId),
}));
