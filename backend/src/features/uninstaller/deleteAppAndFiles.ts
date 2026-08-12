import chalk from "chalk";
import { log } from "@clack/prompts";
import { deleteWithPrivileges } from "./deleteWithPrivileges.js";
import type { RelatedFile } from './types.js';

export async function deleteAppAndFiles(
  appPath: string,
  relatedFiles: RelatedFile[]
): Promise<boolean> {
  try {
    // Related files first, bundle last: if something fails part-way through,
    // the app is still installed rather than gone with its leftovers behind.
    let successCount = 0;
    for (const file of relatedFiles) {
      const fileDeleted = await deleteWithPrivileges(
        file.path,
        file.type === "directory"
      );
      if (fileDeleted) successCount++;
    }

    log.message(
      chalk.green(
        `Deleted ${successCount}/${relatedFiles.length} related files`
      )
    );

    // Delete main application
    const appDeleted = await deleteWithPrivileges(appPath, true);
    if (!appDeleted) {
      log.error(`Could not remove the application bundle at ${appPath}`);
      return false;
    }

    return true;
  } catch (error) {
    log.error(
      chalk.red(
        `Failed to delete ${appPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
    return false;
  }
}
