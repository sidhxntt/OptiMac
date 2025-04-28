import { confirm, note } from "@clack/prompts";
import chalk from "chalk";
import { safeClean } from "./safeClean";
import { runCommand } from "./runCommand";

export async function clearSystemJunk(HOME: string, BACKUP_DIR: string) {
  // User-level cache (relatively safe)
  await safeClean(`${HOME}/Library/Caches`, "user caches", BACKUP_DIR);

  // Application crash reports and saved states (relatively safe)
  await safeClean(
    `${HOME}/Library/Application Support/CrashReporter`,
    "crash reports",
    BACKUP_DIR
  );
  await safeClean(
    `${HOME}/Library/Saved Application State`,
    "saved application states",
    BACKUP_DIR
  );

  // User logs (relatively safe)
  await safeClean(`${HOME}/Library/Logs`, "user logs", BACKUP_DIR);

  // Only clear specific safe system cache directories with user confirmation
  const systemConfirmed = await confirm({
    message:
      "Do you want to clean system-level caches? (Requires admin access and carries more risk)",
  });

  if (systemConfirmed) {
    // System caches (higher risk) - use safer approach
    await runCommand(
      `sudo find "/Library/Caches" -type f -user $(whoami) -print0 | xargs -0 sudo rm -f 2>/dev/null || true`,
      "Cleaning accessible system caches"
    );

    note(
      chalk.yellow(
        "System-level caches in /System/Library/Caches were NOT touched for safety reasons."
      ),
      "Safety Notice"
    );
  }
}
