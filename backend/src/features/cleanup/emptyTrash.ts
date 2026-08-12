import { confirm, isCancel, note, log } from "@clack/prompts";
import chalk from "chalk";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { runCommand } from "./runCommand.js";

/**
 * Removes everything directly inside ~/.Trash. Node only - no shell, no
 * `find -delete`, and never any volume other than the user's own trash.
 */
async function purgeUserTrash(trashPath: string) {
  const entries = await fs.readdir(trashPath, { withFileTypes: true });
  let removed = 0;
  let failed = 0;

  for (const entry of entries) {
    const target = path.join(trashPath, entry.name);
    try {
      await fs.rm(target, { recursive: true, force: true });
      removed++;
    } catch {
      failed++;
    }
  }

  note(
    chalk.green(
      `Removed ${removed} item(s) from ${trashPath}.` +
        (failed > 0 ? ` ${failed} item(s) could not be removed.` : "")
    ),
    "Trash"
  );
}

export async function emptyTrash(HOME: string) {
  // Finder is the only mechanism used by default: it handles every mounted
  // volume correctly, respects permissions, and never touches other users'
  // .Trashes directories.
  try {
    await runCommand(
      "osascript -e 'tell application \"Finder\" to empty trash'",
      "Emptying trash via Finder"
    );
    note(chalk.green("Trash emptied successfully."), "Status");
    return;
  } catch (error) {
    log.warn(
      chalk.yellow(
        `Finder could not empty the trash: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
  }

  const trashPath = path.join(HOME, ".Trash");
  if (!existsSync(trashPath)) {
    note(chalk.yellow("No user trash directory found."), "Status");
    return;
  }

  // Explicit, separate opt-in for the fallback. Scoped to ~/.Trash only:
  // /Volumes/*/.Trashes may live on network shares, Time Machine disks or
  // belong to other users.
  const fallback = await confirm({
    message: `Delete the contents of ${trashPath} directly? Other volumes' trash will not be touched.`,
    initialValue: false,
  });

  if (isCancel(fallback) || !fallback) {
    note(chalk.yellow("Trash was left untouched."), "Status");
    return;
  }

  try {
    await purgeUserTrash(trashPath);
  } catch (error) {
    note(
      chalk.red(
        `Could not empty ${trashPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      ),
      "Error"
    );
  }
}
