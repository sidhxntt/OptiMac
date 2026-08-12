import { confirm, isCancel, log, password } from "@clack/prompts";
import chalk from "chalk";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { assertSafePath } from "./assertSafePath.js";

type SudoResult = { ok: boolean; stderr: string };

/**
 * Runs `sudo -S rm ...` in argv form. No shell is involved, so neither the
 * password nor the target path can be interpreted as shell syntax, and the
 * password never appears in the process table.
 */
function runSudoRemove(
  targetPath: string,
  isDirectory: boolean,
  sudoPassword: string
): Promise<SudoResult> {
  return new Promise((resolve) => {
    const child = spawn(
      "sudo",
      ["-S", "rm", isDirectory ? "-rf" : "-f", targetPath],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => resolve({ ok: false, stderr: error.message }));
    child.on("close", (code) => resolve({ ok: code === 0, stderr }));

    child.stdin.write(sudoPassword + "\n");
    child.stdin.end();
  });
}

/** Drops the cached sudo credential so it cannot be reused later. */
function invalidateSudoCredentials(): Promise<void> {
  return new Promise((resolve) => {
    const child = spawn("sudo", ["-k"], { stdio: "ignore" });
    child.on("error", () => resolve());
    child.on("close", () => resolve());
  });
}

/** sudo writes its own password prompt to stderr; that is not a failure. */
function cleanSudoStderr(stderr: string): string {
  return stderr
    .split("\n")
    .filter((line) => line.trim() && !/^Password:/i.test(line.trim()))
    .join("\n")
    .trim();
}

export async function deleteWithPrivileges(
  targetPath: string,
  isDirectory: boolean
): Promise<boolean> {
  // Never touch anything outside the allowed roots, privileged or not.
  let safePath: string;
  try {
    safePath = await assertSafePath(targetPath);
  } catch (error) {
    log.error(
      chalk.red(
        `❌ ${error instanceof Error ? error.message : String(error)}`
      )
    );
    return false;
  }

  try {
    // First try without sudo
    if (isDirectory) {
      await fs.rm(safePath, { recursive: true, force: true });
    } else {
      await fs.unlink(safePath);
    }
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    const message = error instanceof Error ? error.message : String(error);

    // macOS reports EPERM (not EACCES) for SIP-protected, `uchg`-flagged and
    // entitlement-restricted paths.
    if (code !== "EACCES" && code !== "EPERM") {
      log.error(
        chalk.red(
          `❌ Could not delete ${safePath} (${code ?? "unknown error"}): ${message}`
        )
      );
      return false;
    }

    const useSudo = await confirm({
      message: `Permission denied for ${safePath} (${code}). Use sudo?`,
      initialValue: true,
    });

    if (isCancel(useSudo) || !useSudo) {
      return false;
    }

    const sudoPassword = await password({
      message: "Enter your sudo password:",
      mask: "*",
      validate: (value) => {
        if (value.length === 0) return "Password cannot be empty!";
      },
    });

    if (isCancel(sudoPassword)) {
      return false;
    }

    try {
      const result = await runSudoRemove(safePath, isDirectory, sudoPassword);
      if (!result.ok) {
        const details = cleanSudoStderr(result.stderr);
        log.error(
          chalk.red(
            `❌ Failed to delete ${safePath} as root${
              details ? `: ${details}` : "."
            }`
          )
        );
        if (code === "EPERM") {
          log.message(
            chalk.yellow(
              "This path may be protected by SIP or flagged immutable; even root cannot remove it."
            )
          );
        }
      }
      return result.ok;
    } finally {
      await invalidateSudoCredentials();
    }
  }
}
