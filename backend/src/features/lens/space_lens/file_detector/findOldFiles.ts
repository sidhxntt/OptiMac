import { getSearchDirectories } from "./getSearchDirectories";
import { spinner } from "@clack/prompts";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import { formatSize, formatDate } from "./formatter";
const execAsync = promisify(exec);

export async function findOldFiles(HOME: string) {
  const s = spinner();
  s.start("Scanning...");

  try {
    const searchDirs = getSearchDirectories(HOME);
    const oldFiles = [];

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Process each directory separately
    for (const dir of searchDirs) {
      try {
        const { stdout } = await execAsync(
          `find "${dir}" -type f -not -path "*/\\.*" -size +50M 2>/dev/null`
        );

        const files = stdout
          .trim()
          .split("\n")
          .filter((file) => file);

        for (const filePath of files) {
          try {
            const stats = fs.statSync(filePath);

            // Check if file is older than 3 months
            if (stats.mtime < threeMonthsAgo) {
              const ageInDays = Math.floor(
                (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)
              );

              oldFiles.push({
                path: filePath,
                size: stats.size, // Store raw size for sorting
                sizeFormatted: formatSize(stats.size),
                modified: stats.mtime,
                modifiedFormatted: formatDate(stats.mtime),
                age: ageInDays,
                ageFormatted: `${ageInDays} days`,
              });
            }
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

    // Sort by age (oldest first)
    oldFiles.sort((a, b) => b.age - a.age);

    s.stop(`Found ${oldFiles.length} old files`);
    return oldFiles;
  } catch (error: any) {
    s.stop("Error finding old files");
    console.error(chalk.red(`Error: ${error.message}`));
    return [];
  }
}
