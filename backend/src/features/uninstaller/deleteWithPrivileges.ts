import { confirm, isCancel, log, password } from "@clack/prompts";
import chalk from "chalk";
import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";

async function runSudoCommand(
  command: string,
  sudoPassword: string
): Promise<boolean> {
  try {
    execSync(`echo '${sudoPassword}' | sudo -S ${command}`, { stdio: "pipe" });
    return true;
  } catch (error) {
    log.error(
      chalk.red(
        `❌ Sudo command failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
    return false;
  }
}

export async function deleteWithPrivileges(
  targetPath: string,
  isDirectory: boolean
): Promise<boolean> {
  try {
    // First try without sudo
    if (isDirectory) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("EACCES")) {
      const useSudo = await confirm({
        message: `Permission denied for ${targetPath}. Use sudo?`,
        initialValue: true,
      });

      if (!useSudo || isCancel(useSudo)) {
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

      const command = isDirectory
        ? `rm -rf "${targetPath}"`
        : `rm -f "${targetPath}"`;

      return runSudoCommand(command, sudoPassword);
    }
    return false;
  }
}
