#!/usr/bin/env node
import * as p from "@clack/prompts";
import { isCancel } from "@clack/prompts";
import chalk from 'chalk';
import { updater } from "./features/updater/index.js";
import { uninstaller } from "./features/uninstaller/index.js";
import { ram_lens } from "./features/lens/ram_lens/index.js";
import { space_lens } from "./features/lens/space_lens/index.js";
import { cleaner } from "./features/cleanup/index.js";
import { CPU_lens } from "./features/lens/cpu_lens/index.js";

async function showMainMenu() {
    while (true) {
        p.intro(chalk.blue.bold("OptiMac - Your Mac Maintenance Tool"));

        const options_menu = await p.select({
            message: 'Choose an option:',
            options: [
                { value: 'update', label: 'Updater', hint: 'Update apps & system' },
                { value: 'uninstaller', label: 'Uninstaller', hint: 'Remove apps completely' },
                { value: 'ram', label: 'RAM Lens', hint: 'Monitor memory usage' },
                { value: 'hdd', label: 'Space Lens', hint: 'Analyze disk space' },
                { value: 'cpu', label: 'CPU Lens', hint: 'See CPU Utilization' },
                { value: 'cleaner', label: 'Cleaner', hint: 'Remove system junk' },
                { value: 'exit', label: 'Exit', hint: 'Quit the application' },
            ],
        });

        // Ctrl+C returns a cancel Symbol, which matches none of the string
        // cases below - it must never fall through to a destructive action.
        if (isCancel(options_menu)) {
            p.cancel('Operation cancelled');
            process.exit(0);
        }

        if (options_menu === 'exit') {
            p.outro(chalk.green('Goodbye! 👋'));
            process.exit(0);
        }

        try {
            if (options_menu === 'update') {
                await updater();
            } 
            else if (options_menu === 'uninstaller') {
                await uninstaller();
            } 
            else if (options_menu === 'ram') {
                await ram_lens();
                break
            } 
            else if (options_menu === 'hdd') {
                await space_lens();
            } 
            else if (options_menu === 'cpu') {
                await CPU_lens();
                break
            } 
            else if (options_menu === 'cleaner') {
                await cleaner();
            }
            else {
                // Unknown option: do nothing rather than guessing.
            }

            // After completing any action, ask if user wants to continue
            const continueUsing = await p.confirm({
                message: 'Would you like to perform another action?',
            });

            if (isCancel(continueUsing)) {
                p.cancel('Operation cancelled');
                process.exit(0);
            }

            if (!continueUsing) {
                p.outro(chalk.green('Goodbye! 👋'));
                process.exit(0);
            }

        } catch (error: any) {
            p.log.error(chalk.red(`Error: ${error.message}`));
            const tryAgain = await p.confirm({
                message: 'Would you like to try again?',
            });

            if (isCancel(tryAgain)) {
                p.cancel('Operation cancelled');
                process.exit(0);
            }

            if (!tryAgain) {
                p.outro(chalk.green('Goodbye! 👋'));
                process.exit(0);
            }
        }
    }
}

async function main() {
    await showMainMenu();
}

(async () => {
    await main();
})();