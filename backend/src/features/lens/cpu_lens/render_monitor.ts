import getProgressBar from "./bar.js";
import { getCpuUsage } from "./CPU_usage.js";
import Table from 'cli-table3';
import chalk from 'chalk';

export function renderMonitor() {
    const cpuUsage = getCpuUsage();
    
    // Create CPU table
    const cpuTable = new Table({
      head: [chalk.magenta.bold("CPU Core"), chalk.magenta.bold("Usage")],
      style: { head: [], border: [] },
    });
  
    // Add overall average CPU usage
    const avgUsage = cpuUsage.reduce((sum, core) => sum + parseFloat(core.usage), 0) / cpuUsage.length;
    cpuTable.push([chalk.magenta("Overall"), getProgressBar(avgUsage)]);
    
    // Add individual core usage
    cpuUsage.forEach(core => {
      cpuTable.push([
        chalk.magenta(core.core), 
        getProgressBar(parseFloat(core.usage))
      ]);
    });
  
    return cpuTable.toString();
  }