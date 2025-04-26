import { confirm, log } from "@clack/prompts";
import chalk from "chalk";
import { execAsync } from "./utils";

export async function OpenAppStore() {
  const shouldOpenAppStore = await confirm({
    message: "Open Mac App Store to check for updates?",
  });

  if (shouldOpenAppStore) {
    try {
      await execAsync('open -a "App Store"');
      log.success(chalk.green("✓ Opened App Store application."));
      log.info(chalk.blue("Please check for updates in the Updates tab."));
    } catch (error: any) {
      log.error(chalk.red(`Failed to open App Store: ${error.message}`));
    }
  }
}
