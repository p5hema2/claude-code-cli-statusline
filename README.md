# @p5hema2/claude-code-cli-statusline

A customizable statusline for Claude Code CLI with **OAuth usage metrics**.

[![npm version](https://badge.fury.io/js/%40p5hema2%2Fclaude-code-cli-statusline.svg)](https://www.npmjs.com/package/@p5hema2/claude-code-cli-statusline)
[![CI](https://github.com/p5hema2/claude-code-cli-statusline/actions/workflows/ci.yml/badge.svg)](https://github.com/p5hema2/claude-code-cli-statusline/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

### Location & Environment
- 📁 **Directory** - Fish-shell style shortened path
- 🌿 **Git Branch** - Current branch with status indicators (`*+?↑↓`)
- 📝 **Git Changes** - Lines added/removed in session
- 🔀 **Git Worktree** - Current worktree name
- 🤖 **Model** - Current Claude model name
- 🎨 **Output Style** - Current output style indicator
- ⌨️ **Vim Mode** - Current vim mode with color coding
- 📌 **Version** - CLI version number
- 🆔 **Session ID** - Current session identifier

### Token Metrics (Tier 2: Transcript-Hydrated)
- 🔢 **Tokens (Input)** - Input tokens consumed
- 📤 **Tokens (Output)** - Output tokens generated
- 💾 **Tokens (Cached)** - Cached tokens (write + read)
- 📖 **Tokens (Cache Read)** - Cache read tokens only
- 🔢 **Tokens (Total)** - Total token count
- 🔄 **Turn Count** - Number of conversation turns

### OAuth Usage Limits
- ⏱️ **Session Usage** - 5-hour rolling session limit
- 📅 **Weekly Usage** - 7-day all models usage
- 🎯 **Weekly Sonnet** - 7-day Sonnet-specific usage
- 🔷 **Weekly Opus** - 7-day Opus-specific usage
- 📱 **Weekly OAuth Apps** - 7-day OAuth apps usage
- 👥 **Weekly Cowork** - 7-day Cowork feature usage
- 💳 **Extra Usage** - Overuse credits tracking (Max plan)

### Context & Performance
- 📊 **Context Usage** - Context window utilization bar
- ⚠️ **Context Threshold** - Warning when >200K tokens
- ⏲️ **API Duration** - Total API response time
- 💰 **Session Cost** - Session cost in USD
- ⏰ **Session Clock** - Elapsed session time
- 📅 **Usage Age** - Time since last usage query

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

Create `~/.claude/statusline-settings.json`:

```json
{
  "cacheTtl": 60000,
  "rows": [
    [
      { "widget": "directory", "color": "blue" },
      { "widget": "separator" },
      { "widget": "gitBranch" },
      { "widget": "separator" },
      { "widget": "model" }
    ],
    [
      { "widget": "contextUsage" },
      { "widget": "separator" },
      { "widget": "sessionUsage" },
      { "widget": "separator" },
      { "widget": "weeklyUsage" }
    ]
  ]
}
```

**Configuration Options:**
- `cacheTtl` - OAuth cache duration in milliseconds (default: 60000 = 5 minutes)
- `rows` - Array of widget rows, each row is an array of widget configs
- Widget configs support `widget`, `color`, and `options` properties
- Use the GUI (`--configure`) for easier configuration with live preview

### Available Widgets

**Location & Environment:**
- `directory` - Current working directory (fish-style)
- `gitBranch` - Git branch with status indicators
- `gitChanges` - Git diff statistics
- `gitWorktree` - Current worktree name
- `model` - Claude model name
- `outputStyle` - Output style indicator
- `vimMode` - Vim mode with color coding
- `version` - CLI version number
- `sessionId` - Session identifier
- `separator` - Visual separator
- `text` - Custom static text

**Token Metrics (Tier 2):**
- `tokensInput` - Input tokens consumed
- `tokensOutput` - Output tokens generated
- `tokensCached` - Cached tokens (combined)
- `tokensCacheRead` - Cache read tokens only
- `tokensTotal` - Total token count
- `turnCount` - Conversation turns

**OAuth Usage (Tier 1):**
- `sessionUsage` - 5-hour rolling limit
- `weeklyUsage` - 7-day all models
- `weeklySonnet` - 7-day Sonnet limit
- `weeklyOpus` - 7-day Opus limit
- `weeklyOAuthApps` - 7-day OAuth apps
- `weeklyCowork` - 7-day Cowork feature
- `extraUsage` - Overuse credits (Max plan)

**Context & Performance:**
- `contextUsage` - Context window bar
- `contextThreshold` - Warning when >200K
- `apiDuration` - API response time
- `sessionCost` - Session cost (USD)
- `sessionClock` - Elapsed time
- `usageAge` - Query age

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
