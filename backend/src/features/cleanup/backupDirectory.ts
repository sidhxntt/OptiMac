import { spinner, log } from "@clack/prompts";
import chalk from "chalk";
import { promises as fs } from "node:fs";
import path from "node:path";

const MAX_BACKUP_FILE_SIZE = 100_000;
const BACKUP_EXTENSIONS = [".plist", ".conf"];

export type BackupResult = {
  /** Number of files actually copied into the backup directory. */
  copied: number;
  /** Files that matched but could not be read (permissions, TCC). */
  skipped: number;
};

/**
 * Copies the small config files under `sourceDir` into `BACKUP_DIR/label`,
 * mirroring the original directory layout.
 *
 * Done entirely in Node: the previous `cp --parents` pipeline was GNU-only and
 * always failed on macOS while still reporting success.
 *
 * Throws if the backup as a whole could not be performed. Individual
 * unreadable files are counted as skipped rather than aborting the run.
 */
export async function backupDirectory(
  sourceDir: string,
  label: string,
  BACKUP_DIR: string
): Promise<BackupResult> {
  try {
    await fs.access(sourceDir);
  } catch {
    return { copied: 0, skipped: 0 };
  }

  const backupSubDir = path.join(BACKUP_DIR, label);
  await fs.mkdir(backupSubDir, { recursive: true });

  const s = spinner();
  s.start(`Backing up important files from ${label}`);

  let copied = 0;
  let skipped = 0;

  // Explicit walk rather than `readdir({ recursive: true })`, which needs
  // Node >= 20.1 while this package supports Node >= 18.15.
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(current, entry.name);

      if (entry.isSymbolicLink()) continue;

      if (entry.isDirectory()) {
        try {
          await walk(sourcePath);
        } catch {
          skipped++;
        }
        continue;
      }

      if (!entry.isFile()) continue;
      if (!BACKUP_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
        continue;
      }

      try {
        const stats = await fs.lstat(sourcePath);
        if (stats.size >= MAX_BACKUP_FILE_SIZE) continue;

        const destination = path.join(
          backupSubDir,
          path.relative(sourceDir, sourcePath)
        );
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.copyFile(sourcePath, destination);
        copied++;
      } catch {
        skipped++;
      }
    }
  }

  try {
    await walk(sourceDir);
  } catch (error) {
    s.stop(`${label} backup failed`);
    throw new Error(
      `Could not back up ${label} from ${sourceDir}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  s.stop(`${label} backup completed (${copied} file${copied === 1 ? "" : "s"} copied)`);

  if (skipped > 0) {
    log.warn(
      chalk.yellow(
        `${skipped} config file${
          skipped === 1 ? "" : "s"
        } in ${label} could not be read and were not backed up.`
      )
    );
  }

  return { copied, skipped };
}
