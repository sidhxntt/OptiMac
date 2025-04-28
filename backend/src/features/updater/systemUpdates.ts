import { openSystemUpdates } from "./openSystemUpdates";
import { parseSystemUpdates } from "./output_parsing";
import { confirm, spinner, log } from "@clack/prompts";
import chalk from "chalk";
import { execa } from "execa";

export async function SystemUpdates() {
  const systemUpdatesSpin = spinner();
  systemUpdatesSpin.start("Checking for macOS system updates...");

  try {
    const { stdout: softwareUpdateOutput } = await execa("softwareupdate", [
      "--list",
    ]);
    systemUpdatesSpin.stop("Check completed");

    const systemUpdates = parseSystemUpdates(softwareUpdateOutput);

    if (systemUpdates.length === 0) {
      log.success(chalk.green("✓ No macOS system updates available."));
    } else {
      log.info(chalk.yellow(`Found ${systemUpdates.length} system updates:`));

      systemUpdates.forEach((update: any) => {
        log.message(
          `• ${chalk.cyan(update.name)} - ${
            update.version || "No version info"
          }`
        );
        if (update.description) {
          log.message(`  ${chalk.dim(update.description)}`);
        }
        if (update.size) {
          log.message(`  ${chalk.dim(`Size: ${update.size}`)}`);
        }
        if (update.recommended) {
          log.message(`  ${chalk.yellow("⭐ Recommended update")}`);
        }
      });

      const shouldOpenSystemUpdates = await confirm({
        message: "Open System Settings to install these updates?",
      });

      if (shouldOpenSystemUpdates) {
        try {
          await openSystemUpdates();
          log.success(chalk.green("✓ Opened System Settings for updates."));
        } catch (error: any) {
          log.error(
            chalk.red(`Failed to open System Settings: ${error.message}`)
          );
        }
      }
    }
  } catch (error: any) {
    systemUpdatesSpin.stop("Failed to check for updates");
    log.error(
      chalk.red(`Failed to check for system updates: ${error.message}`)
    );
  }
}
