import os from 'os';

export function getCpuUsage() {
  // Get CPU information
  const cpus = os.cpus();
  const numCpus = cpus.length;

  // Calculate CPU usage for each core
  return cpus.map((cpu, i) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const idle = cpu.times.idle;
    
    // Calculate usage percentage
    const usage = 100 - (idle / total * 100);
    return {
      core: `Core ${i}`,
      usage: usage.toFixed(2)
    };
  });
}