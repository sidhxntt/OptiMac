import { confirm, isCancel, log, note } from "@clack/prompts";
import chalk from "chalk";
import { existsSync } from "node:fs";
import { safeClean } from "./safeClean.js";
import { scanCleanableFiles } from "./scanCleanableFiles.js";
import { formatBytes } from "./formatBytes.js";

type Target = {
  directory: string;
  label: string;
};

/**
 * Scans one directory, shows exactly what would be removed, and cleans it only
 * if the user confirms that specific directory.
 */
async function confirmAndClean(
  target: Target,
  BACKUP_DIR: string,
  dryRun: boolean
): Promise<boolean> {
  if (!existsSync(target.directory)) return true;

  const { candidates, totalBytes, unreadable } = await scanCleanableFiles(
    target.directory
  );

  if (unreadable.length > 0) {
    log.warn(
      chalk.yellow(
        `${unreadable.length} folder(s) under ${target.label} could not be read. ` +
          "Grant your terminal Full Disk Access in System Settings > Privacy & Security to include them."
      )
    );
  }

  if (candidates.length === 0) {
    log.message(chalk.dim(`No removable cache/log files found in ${target.label}.`));
    return true;
  }

  const proceed = await confirm({
    message: `Clean ${target.label}? ${candidates.length} file(s), ${formatBytes(
      totalBytes
    )} reclaimable (${target.directory})`,
    initialValue: false,
  });

  if (isCancel(proceed)) return false;
  if (!proceed) {
    log.message(chalk.dim(`Skipped ${target.label}.`));
    return true;
  }

  await safeClean(target.directory, target.label, BACKUP_DIR, {
    dryRun,
    candidates,
  });
  return true;
}

export async function clearSystemJunk(
  HOME: string,
  BACKUP_DIR: string,
  dryRun = false
) {
  const targets: Target[] = [
    { directory: `${HOME}/Library/Caches`, label: "user caches" },
    {
      directory: `${HOME}/Library/Application Support/CrashReporter`,
      label: "crash reports",
    },
    {
      directory: `${HOME}/Library/Saved Application State`,
      label: "saved application states",
    },
  ];

  for (const target of targets) {
    const keepGoing = await confirmAndClean(target, BACKUP_DIR, dryRun);
    if (!keepGoing) {
      note(chalk.yellow("Cleaning cancelled."), "Cancelled");
      return;
    }
  }

  // ~/Library/Logs holds diagnostic data people may still need, so it is not
  // part of the default set - it needs its own opt-in.
  const logsOptIn = await confirm({
    message:
      "Also clean ~/Library/Logs? It contains diagnostic logs you may need for troubleshooting.",
    initialValue: false,
  });

  if (isCancel(logsOptIn)) {
    note(chalk.yellow("Cleaning cancelled."), "Cancelled");
    return;
  }

  if (logsOptIn) {
    const keepGoing = await confirmAndClean(
      { directory: `${HOME}/Library/Logs`, label: "user logs" },
      BACKUP_DIR,
      dryRun
    );
    if (!keepGoing) {
      note(chalk.yellow("Cleaning cancelled."), "Cancelled");
      return;
    }
  }

  note(
    chalk.yellow(
      "System-level caches (/Library/Caches, /System/Library/Caches) were not touched. " +
        "Clearing them needs an interactive root prompt this tool does not run, and the " +
        "previous `sudo find | xargs` step silently failed with \"no tty present\" while " +
        "reporting success. Use Disk Utility or a dedicated tool if you need them cleared."
    ),
    "Safety Notice"
  );
}
