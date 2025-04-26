import * as p from "@clack/prompts";
import chalk from 'chalk';
import { isNodeInstalled } from "./utils/user_touch";
import { updater } from "./features/updater/index";
import { uninstaller } from "./features/uninstaller/index";
import { ram_lens } from "./features/lens/ram_lens/index";
import { space_lens } from "./features/lens/space_lens/index";
import { cleaner } from "./features/cleanup/index";

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
                { value: 'cleaner', label: 'Cleaner', hint: 'Remove system junk' },
                { value: 'exit', label: 'Exit', hint: 'Quit the application' },
            ],
        });

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
            else {
                await cleaner();
            }

            // After completing any action, ask if user wants to continue
            const continueUsing = await p.confirm({
                message: 'Would you like to perform another action?',
            });

            if (!continueUsing) {
                p.outro(chalk.green('Goodbye! 👋'));
                process.exit(0);
            }

        } catch (error: any) {
            p.log.error(chalk.red(`Error: ${error.message}`));
            const tryAgain = await p.confirm({
                message: 'Would you like to try again?',
            });

            if (!tryAgain) {
                p.outro(chalk.green('Goodbye! 👋'));
                process.exit(0);
            }
        }
    }
}

async function main() {
    if (!isNodeInstalled()) {
        p.log.error(chalk.red("❌ Node.js required. Please install it first."));
        process.exit(1);
    }

    await showMainMenu();
}

(async () => {
    await main();
})();