import { spinner, note } from "@clack/prompts";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { runCommand } from "./runCommand";
const execAsync = promisify(exec);

export async function emptyTrash(HOME: string) {
  const s = spinner();
  s.start("Emptying trash");

  // First try the standard Finder method
  try {
    await execAsync(
      "osascript -e 'tell application \"Finder\" to empty trash'"
    );
    s.stop("Trash emptied successfully");
  } catch (error) {
    s.stop("Standard trash emptying failed, trying alternative method");

    // If the Finder method fails, use a direct approach
    const trashPaths = [
      `${HOME}/.Trash`, // User trash
    ];

    // Get list of mounted volumes for external trash bins
    try {
      const { stdout: volumes } = await execAsync(
        "ls -d /Volumes/*/ 2>/dev/null"
      );
      const volumeList = volumes.split("\n").filter(Boolean);

      for (const volume of volumeList) {
        const trashPath = `${volume.trim()}/.Trashes`;
        if (existsSync(trashPath)) {
          trashPaths.push(trashPath);
        }
      }
    } catch (err) {
      // Ignore volume listing errors
    }

    // Process each trash path
    for (const trashPath of trashPaths) {
      if (!existsSync(trashPath)) continue;

      // List all files in trash
      try {
        // First try to remove write protection from files
        await runCommand(
          `find "${trashPath}" -type f -exec chmod -f u+w {} \\; 2>/dev/null || true`,
          "Removing write protection"
        );

        // Delete files first
        await runCommand(
          `find "${trashPath}" -type f -delete 2>/dev/null || true`,
          `Removing files from ${trashPath}`
        );

        // Delete directories from deepest level
        await runCommand(
          `find "${trashPath}" -depth -type d -empty -delete 2>/dev/null || true`,
          `Removing directories from ${trashPath}`
        );
      } catch (err) {
        note(
          chalk.yellow(`Some items in ${trashPath} could not be deleted`),
          "Warning"
        );
      }
    }

    note(
      chalk.green("Trash emptying completed with alternative method"),
      "Status"
    );
  }
}
