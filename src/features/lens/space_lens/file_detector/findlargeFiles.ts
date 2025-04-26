import { spinner } from "@clack/prompts";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import { formatSize, formatDate } from "./formatter";
import { getSearchDirectories } from "./getSearchDirectories";

const execAsync = promisify(exec);

export async function findLargeFiles(HOME: string) {
  const s = spinner();
  s.start("Looking for large files (>500MB)...");

  try {
    const searchDirs = getSearchDirectories(HOME);
    const largeFiles = [];

    // Process each directory separately to avoid permission errors
    for (const dir of searchDirs) {
      try {
        const { stdout } = await execAsync(
          `find "${dir}" -type f -size +500M -not -path "*/\\.*" -not -path "*/node_modules/*" 2>/dev/null`
        );

        const files = stdout
          .trim()
          .split("\n")
          .filter((file) => file);

        for (const filePath of files) {
          try {
            const stats = fs.statSync(filePath);
            largeFiles.push({
              path: filePath,
              size: stats.size, // Store raw size for sorting
              sizeFormatted: formatSize(stats.size),
              modified: stats.mtime,
              modifiedFormatted: formatDate(stats.mtime),
            });
          } catch (err) {
            // Skip files we can't access
            continue;
          }
        }
      } catch (err) {
        // Skip directories we can't access
        continue;
      }
    }

    // Sort by size (largest first)
    largeFiles.sort((a, b) => b.size - a.size);

    s.stop(`Found ${largeFiles.length} large files`);
    return largeFiles;
  } catch (error: any) {
    s.stop("Error finding large files");
    console.error(chalk.red(`Error: ${error.message}`));
    return [];
  }
}
