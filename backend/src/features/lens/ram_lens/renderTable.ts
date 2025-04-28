import { getProgressBar } from "./getProgressBar";
import { getRamSpecs } from "./getRamSpecs";
import Table from "cli-table3";
import chalk from "chalk";

export const renderTable = () => {
  const ramSpecs = getRamSpecs();

  const ramTable = new Table({
    head: [chalk.cyan.bold("RAM Specification"), chalk.cyan.bold("Value")],
    style: { head: [], border: [] },
  });

  ramTable.push(
    [chalk.cyan("Total RAM"), chalk.white(ramSpecs.total)],
    [chalk.cyan("Free RAM"), chalk.white(ramSpecs.free)],
    [chalk.cyan("Usage"), getProgressBar(parseFloat(ramSpecs.percentage))]
  );

  return ramTable.toString();
};
