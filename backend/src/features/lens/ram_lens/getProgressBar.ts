import chalk from 'chalk';

// Function to format progress bar
export function getProgressBar(percentage : number) {
    const width = 30;
    const completed = Math.round(width * (percentage / 100));
    const remaining = width - completed;
    
    const filledBar = '█'.repeat(completed);
    const emptyBar = '░'.repeat(remaining);
    
    if (percentage > 80) {
      return chalk.red(`${filledBar}${emptyBar} ${percentage}%`);
    } else if (percentage > 60) {
      return chalk.yellow(`${filledBar}${emptyBar} ${percentage}%`);
    } else {
      return chalk.green(`${filledBar}${emptyBar} ${percentage}%`);
    }
  }