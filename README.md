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

Open a browser-based WYSIWYG editor with **Smart Commerce branding** (built with **Tailwind CSS**):

```bash
npx @p5hema2/claude-code-cli-statusline --configure
```

The GUI features:
- **Drag & drop** widgets to arrange your layout
- **Multi-row support** for complex statuslines
- **Live preview** with different terminal themes
- **N/A state toggles** to preview various widget states
- **Modern responsive UI** with Smart Commerce design system
- **Light theme** optimized for readability and accessibility (WCAG 2.0 AA)

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

## Configuration API Reference

The configuration GUI communicates with a built-in REST API. These endpoints can also be accessed programmatically.

### GET /api/settings

Retrieve current statusline settings.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [
      { "widgets": ["directory", "gitBranch", "model"] }
    ],
    "separator": "|",
    "cacheTtl": 60000
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/settings
```

### PUT /api/settings

Update statusline settings.

**Request Body:**
```json
{
  "rows": [
    { "widgets": ["directory", "gitBranch"] }
  ],
  "separator": " | ",
  "cacheTtl": 120000
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rows": [{ "widgets": ["directory", "gitBranch"] }],
    "separator": " | ",
    "cacheTtl": 120000
  }
}
```

**Error Response:** `400 Bad Request` (invalid schema)
```json
{
  "success": false,
  "error": "Invalid settings format"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"rows":[{"widgets":["directory","gitBranch"]}]}'
```

### POST /api/preview

Generate statusline preview HTML.

**Request Body:**
```json
{
  "settings": {
    "rows": [{ "widgets": ["directory", "gitBranch"] }]
  },
  "terminalWidth": 80,
  "widgetStates": {
    "git": { "enabled": true, "dirty": true }
  },
  "terminalPalette": "dracula"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "htmlRows": ["<pre>...</pre>"]
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/preview \
  -H "Content-Type: application/json" \
  -d '{"settings":{"rows":[{"widgets":["directory","gitBranch"]}]},"terminalWidth":80}'
```

### GET /api/widgets

Retrieve widget metadata and schemas.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "directory",
        "name": "Directory",
        "description": "Current working directory (fish-style)",
        "category": "location",
        "previewStates": []
      }
    ],
    "categories": [
      {
        "id": "location",
        "name": "location",
        "widgets": ["directory"]
      }
    ],
    "widgetSchemas": []
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/widgets
```

### Error Handling

All endpoints return consistent error format:

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/p5hema2/claude-code-cli-statusline.git
cd claude-code-cli-statusline

# Install dependencies
npm install
```

### Build

```bash
npm run build              # Full build (TypeScript + GUI + CSS)
npm run build:production   # Production build with minified CSS
npm run build:css          # Build Tailwind CSS
```

### Development Workflow

```bash
# GUI Development (with live reload)
npm run dev:configure      # Start config GUI with live console output (--raw flag)
npm run dev:css            # Watch Tailwind CSS (auto-rebuild on changes)

# CLI Development
npm run dev                # Watch mode for CLI
cat scripts/payload.example.json | npm start  # Test with example payload
```

**Live Development Features:**
- Cache-Control headers prevent browser caching (changes appear immediately)
- Server displays URL and file watcher status on startup
- File changes trigger automatic browser reload (no manual refresh needed)
- Console output shows real-time feedback from all processes

### Testing

```bash
npm test                   # Run all tests (unit + E2E)
npm run test:vitest        # Run unit tests only
npm run test:e2e           # Run E2E tests (exits cleanly, no auto-open report)
npm run test:e2e:report    # View last E2E test report
npm run lint               # Run all linters (ESLint + Sheriff)
```

### Architecture

See [TECH_STACK.md](TECH_STACK.md) for detailed architecture documentation:
- Widget registry pattern
- Config schema validation
- Module boundaries (Sheriff)
- FORCE_COLOR bootstrap pattern

### Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for full version history.

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

---

## Developed by Smart Commerce SE

<div align="center">
  <img src="docs/smart-commerce-logo.svg" alt="Smart Commerce SE" width="200">
  <p><em>This tool was developed by <a href="https://www.smartcommerce.de/en/">Smart Commerce SE</a> — enterprise eCommerce solutions and digital commerce.</em></p>

  **Technology Stack & Services:**
  Intershop • Shopware • commercetools • Spryker • Emporix • Digital Strategy • Cloud Operations • PIM • AI Solutions

  **Partner:** <a href="https://www.deepr.agency/">deepr agency</a> — Full-service digital partner for branding, web development, and online marketing

  <p><a href="https://www.smartcommerce.de/en/contact/">Get in touch</a></p>
</div>
