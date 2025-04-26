import { getMacOSVersion, execAsync } from "./utils";

export async function openSystemUpdates() {
  const version = await getMacOSVersion();

  if (!version) {
    throw new Error("Could not determine macOS version");
  }

  const majorVersion = parseInt(version.split(".")[0]);

  if (majorVersion >= 13) {
    // Ventura (13) and newer - System Settings
    await execAsync(
      'open "x-apple.systempreferences:com.apple.preferences.softwareupdate"'
    );
  } else if (majorVersion >= 11) {
    // Big Sur (11) and Monterey (12) - System Preferences
    await execAsync(
      'open "x-apple.systempreferences:com.apple.preferences.softwareupdate"'
    );
  } else {
    // Older versions - System Preferences
    await execAsync(
      "open /System/Library/PreferencePanes/SoftwareUpdate.prefPane"
    );
  }
}
