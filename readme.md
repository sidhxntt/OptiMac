# OptiMac

A comprehensive macOS system maintenance and optimization CLI tool that provides system monitoring, cleaning, updating, and application management capabilities.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![macOS](https://img.shields.io/badge/mac%20os-000000?style=flat&logo=macos&logoColor=F0F0F0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **System Updates**: Check and manage macOS system updates, App Store updates, and Homebrew packages
- **Application Uninstaller**: Completely remove applications and their associated files with cleanup
- **System Monitoring**: 
  - Real-time RAM usage monitoring with visual progress bars
  - Live CPU utilization tracking per core
  - Comprehensive disk space analysis with large file detection
- **System Cleanup**: Safely clean user caches, logs, temporary files, and empty trash
- **Interactive CLI**: Beautiful terminal interface with prompts and progress indicators
- **Safety Features**: Automatic backups of important configuration files during cleanup operations

## Prerequisites

- macOS (Intel or Apple Silicon)
- Node.js 14 or higher
- Terminal/Command Line access

## Installation

### Global Installation (Recommended)

```bash
npm install -g optimac
```

### From Source

```bash
git clone <repository-url>
cd backend
npm install
npm run build
npm link
```

## Usage

### Launch the Interactive Menu

```bash
optimac
```

### Main Menu Options

The tool provides an interactive menu with the following options:

1. **Updater** - Check and install system, App Store, and Homebrew updates
2. **Uninstaller** - Remove applications and their associated files
3. **RAM Lens** - Monitor real-time memory usage
4. **Space Lens** - Analyze disk space and find large/old files
5. **CPU Lens** - Monitor CPU utilization by core
6. **Cleaner** - Remove system junk and temporary files

### Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm run prod
```

## CLI Reference

### Updater Module
- Checks macOS system updates via `softwareupdate`
- Opens App Store for manual update checking
- Manages Homebrew formula and cask updates
- Provides detailed update information including versions and sizes

### Uninstaller Module
- Scans `/Applications` directory for installed apps
- Identifies related files in `~/Library` and `/Library`
- Calculates total space that will be freed
- Safely removes apps with privilege escalation when needed

### System Monitoring
- **RAM Lens**: Real-time memory monitoring with color-coded usage bars
- **CPU Lens**: Per-core CPU utilization with visual indicators
- **Space Lens**: Disk space analysis with file detection for items >500MB or >3 months old

### Cleanup Module
- Safely cleans user-level caches (`~/Library/Caches`)
- Removes crash reports and saved application states
- Clears user logs with automatic backup of important config files
- Empties trash including external volume trash bins

## Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Main entry point and menu system
│   ├── utils/
│   │   └── user_touch.ts          # Node.js detection and animations
│   └── features/
│       ├── updater/               # System update management
│       │   ├── index.ts          # Main updater orchestration
│       │   ├── systemUpdates.ts  # macOS system updates
│       │   ├── appStoreUpdates.ts # App Store integration
│       │   ├── homebrewUpdates.ts # Homebrew package management
│       │   └── output_parsing.ts  # Parse update command outputs
│       ├── uninstaller/           # Application removal
│       │   ├── index.ts          # Uninstaller main logic
│       │   ├── getApplicationDetails.ts # App discovery and analysis
│       │   ├── deleteAppAndFiles.ts # Deletion with cleanup
│       │   └── types.ts          # Type definitions
│       ├── lens/                  # System monitoring tools
│       │   ├── ram_lens/         # Memory monitoring
│       │   ├── cpu_lens/         # CPU monitoring  
│       │   └── space_lens/       # Disk space analysis
│       │       └── file_detector/ # Large/old file detection
│       └── cleanup/               # System cleaning
│           ├── index.ts          # Cleanup orchestration
│           ├── safeClean.ts      # Safe cleaning with exclusions
│           ├── clearSystemJunk.ts # System-level cleaning
│           └── emptyTrash.ts     # Trash management
├── package.json                   # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript configuration
└── dist/                         # Compiled JavaScript output
```

## Configuration

The tool uses the following system paths and configurations:

- **Applications Directory**: `/Applications`
- **User Library**: `~/Library/`
- **System Library**: `/Library/`
- **Backup Directory**: `~/.cleaner_backups/[timestamp]`
- **Search Directories**: `Documents`, `Downloads`, `Desktop`, `Movies`, `Music`, `Pictures`

## Development

### Build System
```bash
npm run build    # Compile TypeScript to dist/
npm run dev      # Run with ts-node for development
npm run prod     # Run compiled version
```

### Dependencies
- **@clack/prompts**: Interactive CLI prompts
- **chalk**: Terminal colors and styling
- **cli-table3**: ASCII table formatting
- **execa**: Process execution
- **commander**: Command line parsing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly on macOS
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Test all features on both Intel and Apple Silicon Macs
- Ensure proper error handling for system operations
- Maintain backward compatibility with older macOS versions
- Add appropriate safety checks for destructive operations

## Safety Notes

- The cleanup module creates automatic backups of configuration files
- System-level operations require user confirmation and sudo privileges
- All destructive operations include confirmation prompts
- Large file detection excludes system directories and hidden files
- Homebrew operations are limited to user-installed packages
