import { exec, execFile } from "child_process";
import { promisify } from "util";

export const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

// Check if a command exists (argv form, so the name is never shell-parsed)
export async function commandExists(command: string) {
  try {
    await execFileAsync("which", [command]);
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
