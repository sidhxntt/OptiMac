import { spinner } from "@clack/prompts";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { runCommand } from "./runCommand";

export async function backupDirectory(
  sourceDir: string,
  label: string,
  BACKUP_DIR: string
) {
  if (!existsSync(sourceDir)) return;

  // Create backup directory structure
  const backupSubDir = path.join(BACKUP_DIR, label);
  if (!existsSync(backupSubDir)) {
    mkdirSync(backupSubDir, { recursive: true });
  }

  const s = spinner();
  s.start(`Backing up important files from ${label}`);

  // Only backup small config files, not large cache files
  await runCommand(
    `find "${sourceDir}" -type f -size -100k -name "*.plist" -o -name "*.conf" | xargs -I {} cp --parents {} "${backupSubDir}" 2>/dev/null || true`,
    `Backing up ${label} config files`
  );

  s.stop(`${label} backup completed`);
}
