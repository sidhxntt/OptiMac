// Create a directory list that's more likely to succeed
import fs from 'node:fs';
import path from 'node:path';

export function getSearchDirectories(HOME: string) {
  const commonDirs = [
    'Documents',
    'Downloads',
    'Desktop',
    'Movies',
    'Music',
    'Pictures',
    'Projects',
    'Development'
  ];
  
  return commonDirs
    .map(dir => path.join(HOME, dir))
    .filter(dir => fs.existsSync(dir));
}