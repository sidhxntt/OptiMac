import os from 'os';
import { formatBytes } from './formatBytes';

// Function to get RAM specifications
export function getRamSpecs() {
  const totalRam = os.totalmem();
  const freeRam = os.freemem();
  const usedRam = totalRam - freeRam;
  const usagePercentage = (usedRam / totalRam * 100).toFixed(2);
  
  return {
    total: formatBytes(totalRam),
    free: formatBytes(freeRam),
    used: formatBytes(usedRam),
    percentage: usagePercentage
  };
}