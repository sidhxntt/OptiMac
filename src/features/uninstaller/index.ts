#!/usr/bin/env node

import { intro, outro, note } from "@clack/prompts";
import chalk from "chalk";
import { getApplications } from "./getApplicationDetails";
import { display } from "./display";

export async function uninstaller() {
  intro(chalk.bold(chalk.cyan("macOS App Uninstaller")));

  const apps = await getApplications();
  if (apps.length === 0) {
    note("No apps found in /Applications.", "Info");
    outro("Nothing to uninstall");
    return;
  }
  await display(apps);

  outro(chalk.bold(chalk.green("✨ Uninstallation complete!")));
}
