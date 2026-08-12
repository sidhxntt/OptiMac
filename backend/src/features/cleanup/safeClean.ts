import { log, note } from "@clack/prompts";
import chalk from "chalk";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import { backupDirectory } from "./backupDirectory.js";
import { scanCleanableFiles, type CleanCandidate } from "./scanCleanableFiles.js";
import { formatBytes } from "./formatBytes.js";

export type CleanResult = {
  deleted: number;
  bytes: number;
  failed: number;
  dryRun: boolean;
};

export type SafeCleanOptions = {
  /** Log what would be removed without removing anything. */
  dryRun?: boolean;
  /** Reuse a scan already shown to the user, instead of walking again. */
  candidates?: CleanCandidate[];
};

export async function safeClean(
  directory: string,
  label: string,
  BACKUP_DIR: string,
  options: SafeCleanOptions = {}
): Promise<CleanResult> {
  const { dryRun = false } = options;
  const empty: CleanResult = { deleted: 0, bytes: 0, failed: 0, dryRun };

  if (!existsSync(directory)) return empty;

  // Back up the small config files first. If that genuinely fails we must not
  // delete anything - the previous version claimed a backup that never existed.
  if (!dryRun) {
    try {
      await backupDirectory(directory, label, BACKUP_DIR);
    } catch (error) {
      note(
        chalk.red(
          `Backup of ${label} failed, so nothing was deleted: ${
            error instanceof Error ? error.message : String(error)
          }`
        ),
        "Clean aborted"
      );
      return empty;
    }
  }

  const candidates =
    options.candidates ?? (await scanCleanableFiles(directory)).candidates;

  if (candidates.length === 0) {
    log.message(chalk.dim(`Nothing to clean in ${label}.`));
    return empty;
  }

  if (dryRun) {
    let bytes = 0;
    for (const candidate of candidates) {
      bytes += candidate.size;
      log.message(
        chalk.dim(`[dry run] would delete ${candidate.path} (${formatBytes(candidate.size)})`)
      );
    }
    note(
      chalk.blue(
        `[dry run] ${candidates.length} file(s), ${formatBytes(bytes)} would be freed from ${label}.`
      ),
      "Dry run"
    );
    return { deleted: candidates.length, bytes, failed: 0, dryRun: true };
  }

  let deleted = 0;
  let bytes = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      await fs.unlink(candidate.path);
      deleted++;
      bytes += candidate.size;
    } catch {
      failed++;
    }
  }

  note(
    chalk.green(
      `${label}: removed ${deleted} file(s), freed ${formatBytes(bytes)}.` +
        (failed > 0 ? ` ${failed} file(s) could not be removed.` : "")
    ),
    "Cleaned"
  );

  return { deleted, bytes, failed, dryRun: false };
}
