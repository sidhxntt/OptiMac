import { renderTable } from "./renderTable";
import readline from 'readline';
import {outro} from '@clack/prompts';
import chalk from 'chalk';

export function dsiplay() {
  let tableOutput = renderTable();
  console.log(tableOutput);
  console.log(chalk.gray("\nPress Ctrl+C to exit.\n"));

  const lines = tableOutput.split("\n").length + 3; // 3 extra for title and footer

  const interval = setInterval(() => {
    readline.moveCursor(process.stdout, 0, -lines);
    readline.clearScreenDown(process.stdout);

    tableOutput = renderTable();
    console.log(tableOutput);
    console.log(chalk.gray("\nPress Ctrl+C to exit.\n"));
  }, 1000);

  process.on("SIGINT", () => {
    clearInterval(interval);
    outro(chalk.blue.bold("\nExiting Real-Time RAM Monitor. Goodbye! 👋"));
    process.exit(0);
  });
}
