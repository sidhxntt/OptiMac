#!/usr/bin/env node

import { intro, outro } from "@clack/prompts";
import chalk from "chalk";
import { SystemUpdates } from "./systemUpdates";
import { OpenAppStore } from "./appStoreUpdates";
import { HomeBrew } from "./homebrewUpdates";

// Main function
export async function updater() {
  intro(chalk.bold.blue("macOS Update Checker"));

  await SystemUpdates();
  await OpenAppStore();
  await HomeBrew();

  outro(chalk.bold.green("All update checks completed!"));
}

