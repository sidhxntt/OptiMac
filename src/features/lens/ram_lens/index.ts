#!/usr/bin/env node

import chalk from 'chalk';
import { intro,} from '@clack/prompts';
import { dsiplay } from './display';

export async function ram_lens() {
  intro(chalk.blue.bold('RAM Monitor'));
  await dsiplay()
}

