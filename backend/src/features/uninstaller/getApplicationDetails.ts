import { note } from '@clack/prompts';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { promisify } from 'node:util';
import type { AppInfo, RelatedFile } from './types.js';

const execFileAsync = promisify(execFile);
const applicationsDir = '/Applications';
const receiptsDir = '/var/db/receipts';


export async function getApplications(): Promise<AppInfo[]> {
    try {
      const files = await fs.readdir(applicationsDir);
      return files
        .filter(file => file.endsWith('.app'))
        .map(app => ({
          name: app,
          path: path.join(applicationsDir, app)
        }));
    } catch (error) {
      note(`⚠️ Could not read Applications directory: ${error instanceof Error ? error.message : String(error)}`, 'Error');
      return [];
    }
  }

/**
 * Reads CFBundleIdentifier from <app>/Contents/Info.plist.
 * Uses execFile in argv form, so the path is never parsed by a shell.
 * Returns null when the plist cannot be read or has no identifier.
 */
export async function getBundleIdentifier(appPath: string): Promise<string | null> {
    const plistPath = path.join(appPath, 'Contents', 'Info.plist');
    try {
      const { stdout } = await execFileAsync('plutil', ['-convert', 'json', '-o', '-', plistPath]);
      const parsed = JSON.parse(stdout) as Record<string, unknown>;
      const identifier = parsed.CFBundleIdentifier;
      return typeof identifier === 'string' && identifier.length > 0 ? identifier : null;
    } catch {
      return null;
    }
  }

/**
 * Real on-disk size of a bundle or directory. `fs.stat().size` on a .app only
 * reports the directory inode (a few hundred bytes), which made every figure
 * in the picker meaningless.
 */
export async function getAppSize(targetPath: string): Promise<number> {
    try {
      const stats = await fs.lstat(targetPath);
      if (!stats.isDirectory()) return stats.size;
    } catch {
      return 0;
    }

    try {
      // `du` exits non-zero when some children are unreadable but still prints
      // a usable total, so stdout is read from the error as well.
      const { stdout } = await execFileAsync('du', ['-sk', targetPath]);
      return parseDuKilobytes(stdout);
    } catch (error) {
      const stdout = (error as { stdout?: string }).stdout;
      return stdout ? parseDuKilobytes(stdout) : 0;
    }
  }

function parseDuKilobytes(stdout: string): number {
    const kilobytes = Number.parseInt(stdout.trim().split(/\s+/)[0] ?? '', 10);
    return Number.isFinite(kilobytes) ? kilobytes * 1024 : 0;
  }

/** Package receipts are named `<bundleid>.bom` / `<bundleid>.plist`. */
async function findReceipts(identifier: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(receiptsDir);
      return entries
        .filter(entry => entry.startsWith(`${identifier}.`))
        .map(entry => path.join(receiptsDir, entry));
    } catch {
      return [];
    }
  }

/**
 * Builds the delete set from the bundle identifier (the value macOS actually
 * uses on disk), falling back to the display name only when the plist is
 * unreadable.
 */
export async function getAppRelatedFiles(
    identifier: string,
    displayName: string
  ): Promise<RelatedFile[]> {
    const userLibrary = path.join(os.homedir(), 'Library');
    const systemLibrary = '/Library';
    const appRelatedFiles: RelatedFile[] = [];

    const relatedPaths = [
      // User files
      path.join(userLibrary, 'Preferences', `${identifier}.plist`),
      path.join(userLibrary, 'Preferences', `${displayName}.plist`),
      path.join(userLibrary, 'Application Support', identifier),
      path.join(userLibrary, 'Application Support', displayName),
      path.join(userLibrary, 'Caches', identifier),
      path.join(userLibrary, 'Caches', displayName),
      path.join(userLibrary, 'Logs', identifier),
      path.join(userLibrary, 'Logs', displayName),
      path.join(userLibrary, 'Saved Application State', `${identifier}.savedState`),
      path.join(userLibrary, 'Containers', identifier),
      // `Group Containers` is deliberately excluded: it is shared between an
      // app, its extensions, and other apps from the same vendor.

      // System files
      path.join(systemLibrary, 'Preferences', `${identifier}.plist`),
      path.join(systemLibrary, 'Application Support', displayName),
      path.join(systemLibrary, 'Caches', identifier),

      // Package receipts (a literal `*` never matched here before)
      ...(await findReceipts(identifier)),
    ];

    for (const relatedPath of new Set(relatedPaths)) {
      try {
        const stats = await fs.lstat(relatedPath);
        const isDirectory = stats.isDirectory();
        appRelatedFiles.push({
          path: relatedPath,
          type: isDirectory ? 'directory' : 'file',
          size: isDirectory ? await getAppSize(relatedPath) : stats.size
        });
      } catch {
        continue;
      }
    }

    return appRelatedFiles;
  }
