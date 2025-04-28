#!/usr/bin/env node
import { spinner } from '@clack/prompts';
import chalk from 'chalk';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
export async function runCommand(command: string, actionName: string) {
    const s = spinner();
    s.start(`Running ${actionName}`);
    try {
      const { stdout, stderr } = await execAsync(command);
      s.stop(`${actionName} completed`);
      if (stderr && !stderr.includes('Operation not permitted')) {
        console.log(chalk.yellow(`Note: ${stderr}`));
      }
      return stdout;
    } catch (error: any) {
      s.stop(`${actionName} failed`);
      console.error(chalk.red(`Error during ${actionName}: ${error.message}`));
      return null;
    }
  }