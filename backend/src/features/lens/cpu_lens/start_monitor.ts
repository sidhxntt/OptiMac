import readline from 'readline';
import chalk from 'chalk';
import { renderMonitor } from './render_monitor';

export default function startMonitor() {
    console.log(chalk.blue.bold('CPU Monitor'));
    console.log(chalk.gray("\nPress Ctrl+C to exit.\n"));
  
    // Initial render
    let output = renderMonitor();
    console.log(output);
  
    const lines = output.split("\n").length + 3; // Extra lines for title and footer
  
    // Update data every second
    const interval = setInterval(() => {
      readline.moveCursor(process.stdout, 0, -lines);
      readline.clearScreenDown(process.stdout);
  
      output = renderMonitor();
      console.log(output);
      console.log(chalk.gray("\nPress Ctrl+C to exit.\n"));
    }, 1000);
  
    // Handle exit
    process.on("SIGINT", () => {
      clearInterval(interval);
      console.log(chalk.blue.bold("\nExiting CPU Monitor. Goodbye! 👋"));
      process.exit(0);
    });
  }
  