import { spinner } from '@clack/prompts';
import chalk from 'chalk';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Runs a fixed command string and reports real failures. Callers must pass a
 * literal command - never interpolate user or filesystem data into it.
 */
export async function runCommand(command: string, actionName: string) {
  const s = spinner();
  s.start(`Running ${actionName}`);
  try {
    const { stdout, stderr } = await execAsync(command);
    s.stop(`${actionName} completed`);
    if (stderr.trim()) {
      console.log(chalk.yellow(`Note: ${stderr.trim()}`));
      if (stderr.includes('Operation not permitted')) {
        console.log(
          chalk.yellow(
            'Hint: macOS denied access. Grant your terminal Full Disk Access in System Settings > Privacy & Security.'
          )
        );
      }
    }
    return stdout;
  } catch (error: any) {
    s.stop(`${actionName} failed`);
    if (String(error?.stderr ?? '').includes('Operation not permitted')) {
      console.error(
        chalk.yellow(
          'Hint: macOS denied access. Grant your terminal Full Disk Access in System Settings > Privacy & Security.'
        )
      );
    }
    // Surface the failure instead of swallowing it.
    throw new Error(`${actionName} failed: ${error?.stderr?.trim() || error?.message || String(error)}`);
  }
}
