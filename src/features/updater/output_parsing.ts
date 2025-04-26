// Define interfaces for your update objects
interface SystemUpdate {
  name: string;
  recommended: boolean;
  version?: string;
  size?: string;
  description?: string;
}

export function parseSystemUpdates(output: string) {
  const updates: SystemUpdate[] = [];
  const lines = output.split("\n");

  let currentUpdate: SystemUpdate | null = null;

  for (const line of lines) {
    // Start of a new update
    if (line.includes("Software Update found")) {
      // Skip this line, it's just a header
      continue;
    }

    const titleMatch = line.match(/^\s*\*\s+(.*?)(?: \(.*\))?$/);
    if (titleMatch) {
      if (currentUpdate) {
        updates.push(currentUpdate);
      }
      currentUpdate = {
        name: titleMatch[1].trim(),
        recommended: line.includes("recommended"),
      };
      continue;
    }

    if (currentUpdate) {
      // Version information
      const versionMatch = line.match(/Version: (.*?)(?:,|$)/);
      if (versionMatch) {
        currentUpdate.version = versionMatch[1].trim();
      }

      // Size information
      const sizeMatch = line.match(/Size: (.*?)(?:,|$)/);
      if (sizeMatch) {
        currentUpdate.size = sizeMatch[1].trim();
      }

      // Description
      if (
        line.trim() &&
        !line.includes("Version:") &&
        !line.includes("Size:")
      ) {
        currentUpdate.description = 
          (currentUpdate.description || "") + line.trim();
      }
    }
  }

  if (currentUpdate) {
    updates.push(currentUpdate);
  }

  return updates;
}

// Similarly for brew updates
interface BrewUpdate {
  name: string;
  currentVersion: string;
  newVersion: string;
}

export function parseBrewUpdates(output: string) {
  const updates: BrewUpdate[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3) {
      updates.push({
        name: parts[0],
        currentVersion: parts[1],
        newVersion: parts[2],
      });
    }
  }

  return updates;
}