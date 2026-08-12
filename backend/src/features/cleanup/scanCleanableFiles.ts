import { promises as fs } from "node:fs";
import path from "node:path";

export type CleanCandidate = {
  path: string;
  size: number;
};

export type ScanResult = {
  candidates: CleanCandidate[];
  totalBytes: number;
  /** Directories that could not be read (TCC / permissions). */
  unreadable: string[];
};

/**
 * Files that must never be deleted, whatever the allowlist says. Checked first.
 * The sqlite side-car files matter especially: removing a `-wal` or `-shm`
 * while keeping the database corrupts a live database.
 */
const NEVER_DELETE = [
  /\.plist$/i,
  /^com\.apple\./i,
  /\.(db|sqlite|sqlite3)$/i,
  /\.(sqlite|sqlite3|db)?-(wal|shm)$/i,
  /-(wal|shm)$/i,
  /\.(sqlite|sqlite3|db)-journal$/i,
  /-journal$/i,
  /\.lock$/i,
];

/** Path segments whose whole subtree is off limits. */
const NEVER_DELETE_DIRS = ["Metadata", "com.apple.Safari", "Backups"];

/**
 * Allowlist of deletable cache/log artifacts. Anything not matched here is
 * kept - a denylist cannot be made safe for a directory tree we do not own.
 */
const DELETABLE = [
  /\.log$/i,
  /\.log\.\d+$/i, // rotated logs: foo.log.1
  /\.log\.\d+\.(gz|bz2|zip)$/i, // compressed rotations
  /\.\d+\.log$/i, // foo.0.log
  /\.log\.(gz|bz2|zip)$/i,
  /\.cache$/i,
  /\.tmp$/i,
  /\.temp$/i,
  /\.crash$/i,
  /\.diag$/i,
  /\.download$/i,
  /\.part$/i,
  /\.partial$/i,
  /\.old$/i,
  /^\.DS_Store$/,
];

export function isDeletable(fileName: string): boolean {
  if (NEVER_DELETE.some((pattern) => pattern.test(fileName))) return false;
  return DELETABLE.some((pattern) => pattern.test(fileName));
}

/**
 * Walks `directory` and returns every file that the allowlist marks as a
 * disposable cache/log artifact, together with its size. Symlinks are never
 * followed and never returned.
 */
export async function scanCleanableFiles(
  directory: string
): Promise<ScanResult> {
  const candidates: CleanCandidate[] = [];
  const unreadable: string[] = [];
  let totalBytes = 0;

  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      unreadable.push(current);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isSymbolicLink()) continue;

      if (entry.isDirectory()) {
        if (NEVER_DELETE_DIRS.includes(entry.name)) continue;
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!isDeletable(entry.name)) continue;

      try {
        const stats = await fs.lstat(fullPath);
        candidates.push({ path: fullPath, size: stats.size });
        totalBytes += stats.size;
      } catch {
        // File vanished between readdir and lstat - nothing to clean.
      }
    }
  }

  await walk(directory);

  return { candidates, totalBytes, unreadable };
}
