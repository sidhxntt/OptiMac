import os from "os";
import { execSync } from "child_process";
import chalkAnimation from "chalk-animation";

// Function to check if Node.js is installed
function isNodeInstalled(): boolean {
  try {
    execSync("node --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Function to display a random ASCII animation
async function showRandomAnimation(message: string): Promise<void> {
  const animation = chalkAnimation.karaoke(message);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  animation.stop();
}

export { isNodeInstalled, showRandomAnimation };
