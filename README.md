# @p5hema2/claude-code-cli-statusline

A customizable statusline for Claude Code CLI with **OAuth usage metrics**.

[![npm version](https://badge.fury.io/js/%40p5hema2%2Fclaude-code-cli-statusline.svg)](https://www.npmjs.com/package/@p5hema2/claude-code-cli-statusline)
[![CI](https://github.com/p5hema2/claude-code-cli-statusline/actions/workflows/ci.yml/badge.svg)](https://github.com/p5hema2/claude-code-cli-statusline/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📁 **Directory** - Fish-shell style shortened path
- 🌿 **Git Branch** - Current branch with status indicators (`*+?↑↓`)
- 🤖 **Model** - Current Claude model name
- 📊 **Context Usage** - Context window utilization bar
- ⏱️ **5-Hour Session** - OAuth API usage (rolling session limit)
- 📅 **7-Day Usage** - OAuth API usage (weekly all models)
- 🎯 **7-Day Sonnet** - OAuth API usage (weekly Sonnet-specific)
- 🎨 **Output Style** - Current output style indicator
- ⌨️ **Vim Mode** - Current vim mode with color coding

## Unique Feature: OAuth Usage Metrics

Unlike other statuslines, this tool integrates with Claude Code's OAuth API to show your **real usage limits**:

- **5-hour session**: Rolling usage within the current session window
- **7-day total**: Weekly usage across all models
- **7-day Sonnet**: Weekly Sonnet-specific usage

This helps you manage your API usage and avoid hitting rate limits.

## Installation

### Run without installation (recommended)

```bash
npx @p5hema2/claude-code-cli-statusline@latest
```

### Global installation

```bash
npm install -g @p5hema2/claude-code-cli-statusline
```

## Claude Code Integration

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "statusline": {
    "command": "npx @p5hema2/claude-code-cli-statusline@latest"
  }
}
```

## Configuration

### Visual Configuration GUI

Open a browser-based WYSIWYG editor to configure your statusline:

```bash
npx @p5hema2/claude-code-cli-statusline --configure
```

The GUI allows you to:
- **Drag & drop** widgets to arrange your layout
- **Multi-row support** for complex statuslines
- **Live preview** with different terminal themes
- **N/A state toggles** to preview various widget states

### Manual Configuration

Create `~/.claude/statusline-settings.json` to customize:

```json
{
  "widgets": {
    "directory": { "enabled": true },
    "gitBranch": { "enabled": true },
    "model": { "enabled": true },
    "contextUsage": { "enabled": true },
    "sessionUsage": { "enabled": true },
    "weeklyUsage": { "enabled": true },
    "weeklySonnet": { "enabled": false },
    "outputStyle": { "enabled": true },
    "vimMode": { "enabled": true }
  },
  "separator": "|",
  "cacheTtl": 60000
}
```

### Multi-Row Layout

Configure multiple rows using the `rows` option:

```json
{
  "rows": [
    { "widgets": ["directory", "gitBranch", "model"] },
    { "widgets": ["contextUsage", "sessionUsage", "weeklyUsage", "vimMode"] }
  ]
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `widgets.<name>.enabled` | boolean | true | Enable/disable specific widget |
| `separator` | string | `\|` | Character between widgets |
| `cacheTtl` | number | 60000 | Cache TTL in ms (5 min) |
| `rows` | array | - | Multi-row layout configuration |

### Available Widgets

| Widget | Description |
|--------|-------------|
| `directory` | Current working directory (fish-style) |
| `gitBranch` | Git branch with status indicators |
| `model` | Claude model name |
| `contextUsage` | Context window usage bar |
| `sessionUsage` | 5-hour session usage (OAuth) |
| `weeklyUsage` | 7-day all models usage (OAuth) |
| `weeklySonnet` | 7-day Sonnet usage (OAuth) |
| `outputStyle` | Output style name |
| `vimMode` | Vim mode indicator |

## Development

```bash
# Clone the repository
git clone https://github.com/p5hema2/claude-code-cli-statusline.git
cd claude-code-cli-statusline

# Install dependencies
npm install

# Build
npm run build              # Full build (TypeScript + GUI + CSS)
npm run build:production   # Production build with minified CSS

# Build CSS separately
npm run build:css          # Build Tailwind CSS
npm run dev:css            # Watch Tailwind CSS (auto-rebuild on changes)

# Development server
npm run dev:configure      # Run config GUI with live CSS rebuilding

# Test with example payload
cat scripts/payload.example.json | npm start

# Run tests
npm test
npm run test:e2e           # Run E2E tests

# Lint
npm run lint
npm run lint:all           # ESLint + Sheriff
```

## How It Works

1. Claude Code pipes status JSON to stdin
2. The statusline parses and validates the input
3. OAuth usage data is fetched (cached for 5 minutes)
4. Widgets render their respective data
5. Output is printed to stdout

## Requirements

- Node.js >= 18.0.0
- Claude Code CLI (for full functionality)

## License

MIT © Martin Heß
