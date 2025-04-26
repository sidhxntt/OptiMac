import { intro } from "@clack/prompts";
import chalk from "chalk";
import { checkDiskSpace } from "./checkDiskSpace";

export async function space_lens(): Promise<void> {
  intro(chalk.cyanBright("System-Wide Disk Space Analyzer (macOS)"));

  await checkDiskSpace();
}
