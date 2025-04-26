// import { AppInfo, RelatedFile } from "./types";
import { note } from '@clack/prompts';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { AppInfo, RelatedFile } from './types';
const applicationsDir = '/Applications';


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
  
export async function getAppSize(appPath: string): Promise<number> {
    try {
      const stats = await fs.stat(appPath);
      return stats.size;
    } catch {
      return 0;
    }
  }
  
export async function getAppRelatedFiles(appName: string): Promise<RelatedFile[]> {
    const userLibrary = path.join(os.homedir(), 'Library');
    const systemLibrary = '/Library';
    const appRelatedFiles: RelatedFile[] = [];
  
    const relatedPaths = [
      // User files
      path.join(userLibrary, 'Preferences', `com.${appName}.plist`),
      path.join(userLibrary, 'Preferences', `${appName}.plist`),
      path.join(userLibrary, 'Application Support', appName),
      path.join(userLibrary, 'Caches', appName),
      path.join(userLibrary, 'Caches', `com.${appName}`),
      path.join(userLibrary, 'Logs', appName),
      path.join(userLibrary, 'Saved Application State', `com.${appName}.savedState`),
      path.join(userLibrary, 'Containers', `com.${appName}`),
      path.join(userLibrary, 'Group Containers', `com.${appName}`),
      
      // System files
      path.join(systemLibrary, 'Preferences', `com.${appName}.plist`),
      path.join(systemLibrary, 'Application Support', appName),
      path.join(systemLibrary, 'Caches', appName),
      path.join('/var/db/receipts', `com.${appName}.*`),
    ];
  
    for (const relatedPath of relatedPaths) {
      try {
        const stats = await fs.stat(relatedPath);
        appRelatedFiles.push({
          path: relatedPath,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size
        });
      } catch {
        continue;
      }
    }
  
    return appRelatedFiles;
  }
  