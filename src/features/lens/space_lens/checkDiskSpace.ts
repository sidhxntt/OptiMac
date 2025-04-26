import { getDiskName } from "./diskname";
import { formatBytes } from "./formatBytes";
import { outro, note, confirm, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import { file_detector } from "./file_detector/index";

export async function checkDiskSpace(){
    try {
        const rootPath = '/';
        const diskName = await getDiskName();
    
        const stats = await fs.statfs(rootPath);
        const totalBytes = stats.blocks * stats.bsize;
        const freeBytes = stats.bfree * stats.bsize;
        const usedBytes = totalBytes - freeBytes;
        const usedPercentage = ((usedBytes / totalBytes) * 100).toFixed(1);
    
        note(
          `${chalk.bold('💾 Disk Name')}: ${chalk.whiteBright(diskName)}\n` +
          `${chalk.blueBright('Total Space')}: ${formatBytes(totalBytes)}\n` +
          `${chalk.yellow('Used Space')}: ${formatBytes(usedBytes)} (${usedPercentage}%)\n` +
          `${chalk.green('Free Space')}: ${formatBytes(freeBytes)}`,
          chalk.magentaBright('Disk Space Summary')
        );
    
        if (freeBytes < 10 * 1024 * 1024 * 1024) {
          note(chalk.redBright('⚠️ Less than 10GB free! Consider cleaning up.'), chalk.red('Warning'));
        }
    
        // Ask user if they want to scan for large files
        const shouldScan = await confirm({
          message: 'Proceed with Deep Scanning?',
          initialValue: false
        });
    
        if (isCancel(shouldScan)) {
          outro(chalk.yellow('Operation cancelled'));
          process.exit(0);
        }
    
        if (shouldScan) {
          await file_detector()
        } 
    
        outro(chalk.greenBright('✅ Done!'));
      } catch (err: any) {
        note(chalk.red(`❌ ${err.message}`), chalk.redBright('Error'));
        outro(chalk.red('Operation failed'));
        process.exit(1);
      }
}