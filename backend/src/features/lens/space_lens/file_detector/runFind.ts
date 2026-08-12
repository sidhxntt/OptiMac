import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Runs `find` in argv form so directory names are never parsed by a shell.
 * `find` exits non-zero when it hits unreadable directories but still prints
 * usable results, so partial stdout is kept in that case.
 */
export async function runFind(args: string[]): Promise<string[]> {
  let stdout = "";

  try {
    ({ stdout } = await execFileAsync("find", args, {
      maxBuffer: 32 * 1024 * 1024,
    }));
  } catch (error) {
    stdout = (error as { stdout?: string }).stdout ?? "";
  }

  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
