import { exec } from "node:child_process";
import { promisify } from "node:util";
const execAsync = promisify(exec);

export async function getDiskName(): Promise<string> {
  try {
    const { stdout } = await execAsync("diskutil info /");
    const match = stdout.match(/Volume Name:\s+(.*)/);
    return match?.[1]?.trim() || "Macintosh HD";
  } catch {
    return "Unknown";
  }
}
