import {
  multiselect,
  confirm,
  isCancel,
  log,
  note,
  cancel,
} from "@clack/prompts";
import { formatBytes } from "./formatBytes";
import { getAppRelatedFiles, getAppSize } from "./getApplicationDetails";
import chalk from "chalk";
import { deleteAppAndFiles } from "./deleteAppAndFiles";
import type { AppInfo } from './types';


export async function display(apps: AppInfo[]) {
  const selectedApps = await multiselect({
    message: "Select apps to uninstall (space to select, enter to confirm):",
    options: await Promise.all(
      apps.map(async (app) => ({
        value: app,
        label: `${app.name} - ${formatBytes(await getAppSize(app.path))}`,
        hint: app.path,
      }))
    ),
    required: true,
  });

  if (isCancel(selectedApps)) {
    cancel("Operation cancelled");
    return;
  }

  for (const app of selectedApps) {
    const appName = app.name.replace(".app", "");
    const relatedFiles = await getAppRelatedFiles(appName);

    log.step(`\nUninstalling ${chalk.bold(app.name)}`);
    log.message(`Location: ${chalk.dim(app.path)}`);

    if (relatedFiles.length > 0) {
      note(`Found ${relatedFiles.length} related files:`, "Related Files");
      let totalSize = 0;
      for (const file of relatedFiles) {
        totalSize += file.size;
        log.message(`- ${file.path} (${file.type}, ${formatBytes(file.size)})`);
      }
      log.message(
        `Total additional space to free: ${chalk.bold(formatBytes(totalSize))}`
      );
    } else {
      note("No related files found.", "Info");
    }

    const shouldDelete = await confirm({
      message: `Uninstall ${app.name} and delete ${relatedFiles.length} related files?`,
      initialValue: false,
    });

    if (isCancel(shouldDelete) || !shouldDelete) {
      cancel(`Skipping uninstallation of ${app.name}`);
      continue;
    }

    const success = await deleteAppAndFiles(app.path, relatedFiles);
    if (success) {
      note(`✅ Successfully uninstalled ${app.name}`, "Success");
    } else {
      note(`⚠️ Partial uninstallation of ${app.name}`, "Warning");
    }
  }
}
