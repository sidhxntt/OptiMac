import { existsSync } from "node:fs";
import { backupDirectory } from "./backupDirectory";
import { runCommand } from "./runCommand";

export async function safeClean(
  directory: string,
  label: string,
  BACKUP_DIR: string
) {
  if (!existsSync(directory)) return;

  // Create backup of important files
  await backupDirectory(directory, label, BACKUP_DIR);

  // List of exclusion patterns (files to keep)
  const exclusions = [
    "-not -name '*.plist'", // Don't remove property list files
    "-not -name 'com.apple.*'", // Don't remove Apple system files
    "-not -path '*/Metadata/*'", // Don't remove metadata
    "-not -name '*.db'", // Don't remove databases
    "-not -name '*.DB'", // Don't remove databases (uppercase)
    "-not -name '*.sqlite'", // Don't remove SQLite databases
  ].join(" ");

  // Safe deletion command with exclusions
  const cleanCommand = `find "${directory}" -type f ${exclusions} -print0 | xargs -0 file | grep -v "executable" | cut -d: -f1 | xargs -I{} rm -f {} 2>/dev/null || true`;

  await runCommand(cleanCommand, `Safely cleaning ${label}`);
}
