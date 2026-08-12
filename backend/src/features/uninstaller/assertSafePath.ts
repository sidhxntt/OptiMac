import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * The only locations the uninstaller is ever allowed to delete inside.
 * Anything that resolves outside of these is rejected before a privileged
 * delete is attempted, so a hostile bundle name (or a symlink planted inside
 * /Applications) cannot be used to point `rm` somewhere else.
 */
const ALLOWED_ROOTS = [
  "/Applications",
  path.join(os.homedir(), "Library"),
  "/Library",
  // macOS package receipts, so `com.<bundleid>.bom` / `.plist` can be removed.
  "/var/db/receipts",
];

async function resolveRoot(root: string): Promise<string> {
  try {
    // /var and /tmp are symlinks into /private on macOS, so the roots have to
    // be resolved the same way the target is.
    return await fs.realpath(root);
  } catch {
    return path.resolve(root);
  }
}

/**
 * Resolves `targetPath` (following symlinks) and asserts that it lives strictly
 * inside one of the allowed roots. Returns the resolved path so callers delete
 * exactly what was validated. Throws with a clear message otherwise.
 */
export async function assertSafePath(targetPath: string): Promise<string> {
  const absolute = path.resolve(targetPath);

  let resolved: string;
  try {
    resolved = await fs.realpath(absolute);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    // Dangling symlink or already gone: validate the real parent instead.
    const parent = await fs.realpath(path.dirname(absolute));
    resolved = path.join(parent, path.basename(absolute));
  }

  const roots = await Promise.all(ALLOWED_ROOTS.map(resolveRoot));
  // Note the trailing separator: a root itself is never deletable, only things
  // strictly beneath it.
  const isAllowed = roots.some((root) => resolved.startsWith(root + path.sep));

  if (!isAllowed) {
    throw new Error(
      `Refusing to delete "${targetPath}": it resolves to "${resolved}", ` +
        `which is outside the allowed locations (${ALLOWED_ROOTS.join(", ")}).`
    );
  }

  return resolved;
}
