import { useEffect } from "react";
import { Terminal } from "primereact/terminal";
import { TerminalService } from "primereact/terminalservice";

export default function TerminalDemo() {
  const commandHandler = (text: string) => {
    let response;
    let argsIndex = text.indexOf(" ");
    let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;
    let args = argsIndex !== -1 ? text.substring(argsIndex + 1) : "";

    switch (command) {
      // Basic Unix commands
      case "whoami":
        response = "optimac-user";
        break;

      case "npx":
        response = "Run it in your own mac terminal";
        break;

      case "pwd":
        response = "/Users/optimac-user/Desktop";
        break;

      case "ls":
        response = "Applications  Documents  Downloads  optimac.app  README.md";
        break;

      case "cd":
        response = "Directory changed (simulated)";
        break;

      case "mkdir":
        response = `Created directory: ${args || "new-folder"} (simulated)`;
        break;

      case "touch":
        response = `Created file: ${args || "newfile.txt"} (simulated)`;
        break;

      case "rm":
        response = `Removed: ${args || "file"} (simulated)`;
        break;

      case "echo":
        response = args || "";
        break;

      // Standard commands
      case "date":
        response = "Today is " + new Date().toDateString();
        break;

      case "greet":
        response = "Hola " + args + "!";
        break;

      case "help":
        response = `Available commands:
- features
- updater
- uninstaller 
- space
- ram
- cleaner`;
        break;

      // Optimac features
      case "features":
        response =
          "✨ Optimac: Updater, Uninstaller, Space & RAM lens, and Cleaner - your all-in-one Mac optimizer!";
        break;

      case "updater":
        response =
          "🚀 Keep all apps, system & homebrew packages up-to-date automatically!";
        break;

      case "uninstaller":
        response =
          "🧹 Remove apps completely with no leftover files - free up space instantly!";
        break;

      case "space":
        response =
          "🔍 Find & delete large, old files with one click to reclaim storage!";
        break;

      case "ram":
        response =
          "⚡ Monitor RAM usage in real-time and free up memory for better performance!";
        break;

      case "cleaner":
        response =
          "✨ Remove system junk and empty trash to boost speed and performance!";
        break;

      case "clear":
        response = null;
        break;

      case "know":
        response =
          "✨ Optimac: Updater, Uninstaller, Space & RAM lens, and Cleaner - your all-in-one Mac optimizer!";
        break;

      default:
        response =
          "Unknown command: " +
          command +
          '\nType "help" to see available commands.';
        break;
    }

    if (response) TerminalService.emit("response", response);
    else TerminalService.emit("clear");
  };

  useEffect(() => {
    TerminalService.on("command", commandHandler);
    TerminalService.emit(
      "response",
      'Welcome to Optimac Terminal! Type "help" to see available commands.'
    );

    return () => {
      TerminalService.off("command", commandHandler);
    };
  }, []);

  return (
    <div className="card terminal-demo p-terminal-content">
      <div className="relative">
        {/* Mac-style buttons bar */}
        <div className="absolute flex items-center gap-2 px-3 py-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <Terminal
          className="border rounded-2xl p-4 pt-10"
          welcomeMessage="Optimac Terminal v1.0.0"
          prompt="macOS $"
          pt={{
            root: { className: "bg-gray-900 text-yellow-500 border-round " },
            prompt: { className: "text-gray-400 mr-2 text-blue-300" },
            command: { className: "text-primary-300 text-green-500" },
            response: { className: "text-primary-300" },
          }}
        />
      </div>
    </div>
  );
}
