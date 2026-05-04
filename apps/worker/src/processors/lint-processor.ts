import { Job } from 'bullmq';
import { parseCaptionFile } from '@repo/caption-parser';
import { lintCaptions, applySafeFixes } from '@repo/lint-engine';
import { getCaptionPreset, defaultVocabularyTerms } from '@repo/config';
import { serializeCaptionFile } from '@repo/caption-parser';
import type { LintJobData } from '../queues/lint-queue';
import { db } from '../db';
import { lintRuns, findings } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

export async function lintProcessor(job: Job<LintJobData>): Promise<void> {
  const { runId, content, filename, presetId, vocabularyTerms, format, engineVersion } = job.data;

  console.log(`Processing lint job ${runId} for file ${filename}`);

  // Update status: QUEUED → RUNNING
  await db.update(lintRuns)
    .set({ status: 'RUNNING' })
    .where(eq(lintRuns.id, runId));

  try {
    // Parse captions
    const parseResult = parseCaptionFile(filename, content);

    if (parseResult.warnings.some((w) => w.code === 'UNSUPPORTED_FORMAT')) {
      throw new Error('Unsupported caption format. Please use SRT or VTT.');
    }

    if (parseResult.cues.length === 0) {
      throw new Error('No valid caption cues found.');
    }

    // Get preset
    const preset = getCaptionPreset(presetId);

    // Merge with default vocabulary
    const allVocabulary = [...new Set([...vocabularyTerms, ...defaultVocabularyTerms])];

    // Run lint engine
    const run = lintCaptions(parseResult.cues, {
      runId,
      filename,
      format: parseResult.format,
      preset,
      vocabularyTerms: allVocabulary,
    });

    // Apply safe fixes and generate export content
    const fixedCues = applySafeFixes(run.cues, run.findings);
    const exportContent = serializeCaptionFile(run.format, fixedCues);

    // Save findings and update run status
    await db.transaction(async (tx) => {
      // Update lint run
      await tx.update(lintRuns)
        .set({
          status: run.summary.error > 0 ? 'ERROR' : 'PASSED',
          summary: run.summary,
          finishedAt: new Date(),
          exportContent,
        })
        .where(eq(lintRuns.id, runId));

      // Insert findings
      if (run.findings.length > 0) {
        await tx.insert(findings).values(
          run.findings.map((f) => ({
            lintRunId: runId,
            ruleCode: f.ruleCode,
            category: f.category,
            severity: f.severity,
            cueIndex: f.cueIndex,
            startMs: f.startMs,
            endMs: f.endMs,
            message: f.message,
            details: f.details,
            suggestedFix: f.suggestedFix,
          }))
        );
      }
    });

    console.log(`Lint job ${runId} completed: ${run.summary.pass} pass, ${run.summary.warn} warn, ${run.summary.error} error`);
  } catch (error) {
    console.error(`Lint job ${runId} failed:`, error);

    await db.update(lintRuns)
      .set({
        status: 'FAILED',
        finishedAt: new Date(),
      })
      .where(eq(lintRuns.id, runId));

    throw error;
  }
}
