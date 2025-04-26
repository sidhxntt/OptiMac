import { confirm, spinner, log } from "@clack/prompts";
import chalk from "chalk";
import { execa } from "execa";
import { parseBrewUpdates } from "./output_parsing";
import { commandExists } from "./utils";

export async function HomeBrew() {
  const hasBrew = await commandExists("brew");

  if (hasBrew) {
    const brewUpdatesSpin = spinner();
    brewUpdatesSpin.start("Checking for Homebrew updates...");

    try {
      // Update Homebrew formulae
      await execa("brew", ["update"]);
      const { stdout: brewOutdatedOutput } = await execa("brew", ["outdated"]);
      const { stdout: brewCaskOutdatedOutput } = await execa("brew", [
        "outdated",
        "--cask",
      ]);

      brewUpdatesSpin.stop("Check completed");

      const hasFormulaUpdates =
        brewOutdatedOutput && brewOutdatedOutput.trim() !== "";
      const hasCaskUpdates =
        brewCaskOutdatedOutput && brewCaskOutdatedOutput.trim() !== "";

      if (!hasFormulaUpdates && !hasCaskUpdates) {
        log.success(
          chalk.green("✓ No Homebrew package or application updates available.")
        );
      } else {
        // Handle formula updates (command line tools)
        if (hasFormulaUpdates) {
          const brewUpdates = parseBrewUpdates(brewOutdatedOutput);

          log.info(
            chalk.yellow(
              `Found ${brewUpdates.length} Homebrew package updates:`
            )
          );

          brewUpdates.forEach((pkg) => {
            log.message(
              `• ${chalk.cyan(pkg.name)} (${pkg.currentVersion} → ${
                pkg.newVersion
              })`
            );
          });

          const shouldInstallBrewUpdates = await confirm({
            message: "Do you want to install Homebrew package updates?",
          });

          if (shouldInstallBrewUpdates) {
            const installSpin = spinner();
            installSpin.start("Installing Homebrew package updates...");

            try {
              await execa("brew", ["upgrade"]);
              installSpin.stop("Installation completed");
              log.success(
                chalk.green(
                  "✓ Homebrew package updates installed successfully."
                )
              );
            } catch (error: any) {
              installSpin.stop("Installation failed");
              log.error(
                chalk.red(
                  `Failed to install Homebrew package updates: ${error.message}`
                )
              );
            }
          }
        }

        // Handle cask updates (GUI applications)
        if (hasCaskUpdates) {
          const caskUpdates = parseBrewUpdates(brewCaskOutdatedOutput);

          log.info(
            chalk.yellow(
              `Found ${caskUpdates.length} Homebrew application (cask) updates:`
            )
          );

          caskUpdates.forEach((app) => {
            log.message(
              `• ${chalk.cyan(app.name)} (${app.currentVersion} → ${
                app.newVersion
              })`
            );
          });

          const shouldInstallCaskUpdates = await confirm({
            message: "Do you want to install application (cask) updates?",
          });

          if (shouldInstallCaskUpdates) {
            const installSpin = spinner();
            installSpin.start("Installing application updates...");

            try {
              await execa("brew", ["upgrade", "--cask"]);
              installSpin.stop("Installation completed");
              log.success(
                chalk.green("✓ Application updates installed successfully.")
              );
            } catch (error: any) {
              installSpin.stop("Installation failed");
              log.error(
                chalk.red(
                  `Failed to install application updates: ${error.message}`
                )
              );
            }
          }
        }
      }
    } catch (error: any) {
      brewUpdatesSpin.stop("Failed to check for Homebrew updates");
      log.warning(
        chalk.yellow(`Failed to check for Homebrew updates: ${error.message}`)
      );
    }
  }
}
