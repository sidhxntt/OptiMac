import chalk from "chalk";
import Table from "cli-table3";

export function displayResults(largeFiles: any, oldFiles: any, HOME: string) {
  // Table for large files
  const largeFilesTable = new Table({
    head: [chalk.blue("Path"), chalk.blue("Size"), chalk.blue("Last Modified")],
    colWidths: [60, 15, 20],
  });

  largeFiles.forEach((file: any) => {
    largeFilesTable.push([
      chalk.yellow(file.path.replace(HOME, "~")),
      chalk.green(file.sizeFormatted),
      file.modifiedFormatted,
    ]);
  });

  // Table for old files
  const oldFilesTable = new Table({
    head: [
      chalk.blue("Path"),
      chalk.blue("Size"),
      chalk.blue("Last Modified"),
      chalk.blue("Age"),
    ],
    colWidths: [50, 15, 20, 15],
  });

  oldFiles.forEach((file: any) => {
    oldFilesTable.push([
      chalk.yellow(file.path.replace(HOME, "~")),
      chalk.green(file.sizeFormatted),
      file.modifiedFormatted,
      chalk.red(file.ageFormatted),
    ]);
  });

  // Display tables
  console.log(chalk.bold.green("\n🐘 Large Files (>500MB)"));
  console.log(largeFilesTable.toString());

  console.log(chalk.bold.green("\n🕰️  Old Files (>3 months, >50MB)"));
  console.log(oldFilesTable.toString());
}
