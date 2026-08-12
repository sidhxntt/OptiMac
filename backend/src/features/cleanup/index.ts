import {
  intro,
  outro,
  select,
  confirm,
  isCancel,
  note,
  cancel,
} from "@clack/prompts";
import chalk from "chalk";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { clearSystemJunk } from "./clearSystemJunk.js";
import { emptyTrash } from "./emptyTrash.js";

const HOME = homedir();
const BACKUP_DIR = path.join(
  HOME,
  ".cleaner_backups",
  new Date().toISOString().replace(/:/g, "-")
);

// Main function
export async function cleaner() {
  intro(chalk.blue.bold("macOS Cleaner Utility (Enhanced Safety)"));

  const options = [
    { value: "junk", label: "Safely Clear User Caches" },
    { value: "dry-run", label: "Preview Only (dry run, deletes nothing)" },
    { value: "trash", label: "Empty Trash Bins" },
    { value: "both", label: "Clear Both Caches & Trash" },
    { value: "exit", label: "Exit Cleaner" },
  ];

  const choice = await select({
    message: "Select cleaning options:",
    options,
  });

  // Ctrl+C returns a cancel Symbol, not null.
  if (isCancel(choice) || choice === "exit") {
    cancel("Operation cancelled");
    return outro("Goodbye! 👋");
  }

  const dryRun = choice === "dry-run";
  const cleansJunk = choice === "junk" || choice === "both" || dryRun;
  const emptiesTrash = choice === "trash" || choice === "both";

  // Confirmation before proceeding. Each directory is confirmed individually
  // later on; this is only the overall go-ahead.
  const confirmed = await confirm({
    message: dryRun
      ? "Preview which cache files would be removed? Nothing will be deleted."
      : `This will ${
          choice === "both"
            ? "clear user caches AND empty trash bins"
            : choice === "junk"
            ? "clear user cache files"
            : "empty the trash"
        }. You will be asked about each location. Continue?`,
  });

  if (isCancel(confirmed) || !confirmed) {
    cancel("Operation cancelled");
    return outro("No changes were made.");
  }

  // Create backup directory
  if (cleansJunk && !dryRun) {
    note(
      chalk.blue(
        `Important configuration files will be backed up to ${BACKUP_DIR}`
      ),
      "Backup Information"
    );

    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  try {
    if (cleansJunk) {
      await clearSystemJunk(HOME, BACKUP_DIR, dryRun);
    }

    if (emptiesTrash) {
      await emptyTrash(HOME);
    }

    note(
      chalk.green(dryRun ? "✔ Dry run complete." : "✔ Cleaning completed."),
      "Status"
    );

    if (cleansJunk && !dryRun && existsSync(BACKUP_DIR)) {
      note(
        chalk.green(`Configuration backups are stored in ${BACKUP_DIR}`),
        "Backup Location"
      );
    }
  } catch (error: any) {
    note(chalk.red(`✖ Error during cleaning: ${error.message}`), "Error");
  }

  outro(chalk.blue("Done! Your Mac should be cleaner now. ✨"));
}

