#!/usr/bin/env node
import { intro, outro, select, confirm, note, cancel } from "@clack/prompts";
import chalk from "chalk";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { clearSystemJunk } from "./clearSystemJunk";
import { emptyTrash } from "./emptyTrash";

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
    { value: "junk", label: "Safely Clear User Caches & Logs" },
    { value: "trash", label: "Empty Trash Bins" },
    { value: "both", label: "Clear Both Caches & Trash" },
    { value: "exit", label: "Exit Cleaner" },
  ];

  const choice = await select({
    message: "Select cleaning options:",
    options,
  });

  if (choice === "exit" || choice === null) {
    cancel("Operation cancelled");
    return outro("Goodbye! 👋");
  }

  // Confirmation before proceeding
  const confirmed = await confirm({
    message: `This will ${
      choice === "both"
        ? "clear user caches/logs AND empty trash bins"
        : choice === "junk"
        ? "clear user cache and log files"
        : "empty all trash bins"
    }. Continue?`,
  });

  if (!confirmed) {
    cancel("Operation cancelled");
    return outro("No changes were made.");
  }

  // Create backup directory
  if (choice === "junk" || choice === "both") {
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
    if (choice === "junk" || choice === "both") {
      await clearSystemJunk(HOME, BACKUP_DIR);
    }

    if (choice === "trash" || choice === "both") {
      await emptyTrash(HOME);
    }

    note(chalk.green("✔ Cleaning completed successfully!"), "Status");

    if (choice === "junk" || choice === "both") {
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

