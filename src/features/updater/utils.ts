import { exec } from "child_process";
import { promisify } from "util";

export const execAsync = promisify(exec);

// Check if a command exists
export async function commandExists(command: string) {
  try {
    await execAsync(`which ${command}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Get macOS version
export async function getMacOSVersion() {
  try {
    const { stdout } = await execAsync("sw_vers -productVersion");
    return stdout.trim();
  } catch (error) {
    return null;
  }
}
