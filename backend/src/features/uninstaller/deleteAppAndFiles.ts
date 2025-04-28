import chalk from "chalk";
import { log } from "@clack/prompts";
import { deleteWithPrivileges } from "./deleteWithPrivileges";
import type { RelatedFile } from './types';

export async function deleteAppAndFiles(
  appPath: string,
  relatedFiles: RelatedFile[]
): Promise<boolean> {
  try {
    // Delete main application
    const appDeleted = await deleteWithPrivileges(appPath, true);
    if (!appDeleted) {
      log.error("Deletion failed");
      return false;
    }

    // Delete related files
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
