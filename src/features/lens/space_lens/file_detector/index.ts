#!/usr/bin/env node
import { intro, outro, note } from "@clack/prompts";
import chalk from "chalk";
import { homedir } from "node:os";
import { getSearchDirectories } from "./getSearchDirectories";
import { findLargeFiles } from "./findlargeFiles";
import { findOldFiles } from "./findOldFiles";
import { displayResults } from "./displayResults";

const HOME = homedir();

// Main function
export async function file_detector() {
  intro(chalk.blue.bold("📊 File System Analyzer"));

  note(
    "This tool will search for large files (>500MB) and files older than 3 months on your system.",
    "Scanning Information"
  );

  // Allow user to select which directories to scan
  const directories = getSearchDirectories(HOME);

  console.log(chalk.yellow("The following directories will be scanned:"));
  directories.forEach((dir) => {
    console.log(chalk.dim(`- ${dir.replace(HOME, "~")}`));
  });
  console.log("");

  try {
    // Find files in parallel for better performance
    const [largeFiles, oldFiles] = await Promise.all([
      findLargeFiles(HOME),
      findOldFiles(HOME),
    ]);

    if (largeFiles.length === 0 && oldFiles.length === 0) {
      note(
        chalk.yellow("No large or old files found matching the criteria."),
        "Results"
      );
    } else {
      displayResults(largeFiles, oldFiles, HOME);
    }

    const totalLargeFiles = largeFiles.length;
    const totalOldFiles = oldFiles.length;

    note(
      `Found ${chalk.green(totalLargeFiles)} large files and ${chalk.green(
        totalOldFiles
      )} old files.`,
      "Summary"
    );
  } catch (error: any) {
    note(chalk.red(`Error during file scanning: ${error.message}`), "Error");
  }

  outro(
    chalk.blue(
      "Scan complete! You can now review the large and old files on your system. ✨"
    )
  );
}

