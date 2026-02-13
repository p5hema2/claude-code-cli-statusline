# Claude Code CLI Statusline - Project Instructions

## Project Overview

A customizable statusline for Claude Code CLI with OAuth usage metrics and a browser-based WYSIWYG configuration GUI.

## Git Workflow

### Branch Naming

```
<type>/<TICKET>__<title>
```

- **Type:** `feat`, `fix`, `refactor`, `chore`, etc.
- **Ticket:** Issue number (e.g., `2` for GitHub issue #2)
- **Title:** Lowercase with hyphens

**Examples:**
- `feat/2__configure-gui`
- `fix/15__cache-refresh`

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

<body>

<footer>
```

### Linking Issues (IMPORTANT)

**Do NOT put issue numbers in the commit title.** GitHub automatically appends the PR number on merge, which creates confusion.

**Instead, use closing keywords in the commit body or PR description:**

```
feat(configure): add browser-based WYSIWYG configuration GUI

- Add --configure CLI flag to open browser GUI
- Add config server with REST API
- Implement drag & drop widget placement

Closes #2
```

**Supported closing keywords:**
- `Closes #N` / `Close #N` / `Closed #N`
- `Fixes #N` / `Fix #N` / `Fixed #N`
- `Resolves #N` / `Resolve #N` / `Resolved #N`

This approach:
1. Auto-closes the issue when the PR merges
2. Creates a clear linked issue relationship in GitHub's UI
3. Avoids duplicate `(#2) (#4)` in the final commit title

### PR Workflow

When creating PRs:
1. Keep PR title clean (no issue number)
2. Add `Closes #N` in the PR description
3. GitHub will auto-link and auto-close the issue on merge

## Architecture Reference

For detailed architecture documentation, see [TECH_STACK.md](TECH_STACK.md):
- Runtime & dependencies
- Architectural patterns (FORCE_COLOR, Widget Registry, Deferred Cache Refresh)
- Module boundaries (Sheriff)
- Build process & testing strategy

## Folder Structure & Coding Standards

### Directory Organization

#### Widget Structure
Each widget has its own folder with tests and configuration:
```
src/widgets/
├── shared/               # Shared utilities for all widgets
│   ├── widget.helper.ts
│   └── widget.helper.spec.ts
├── {widget-name}/        # Per-widget folder
│   ├── {widget-name}.widget.ts      # Implementation
│   ├── {widget-name}.widget.spec.ts # Tests
│   └── index.ts          # Exports
```

**Adding a new widget:**
1. Create folder `src/widgets/new-widget/`
2. Create `new-widget.widget.ts` with Widget implementation and Schema
3. Create `new-widget.widget.spec.ts` with tests
4. Create `index.ts` barrel export:
   ```typescript
   export { NewWidget, NewWidgetSchema } from './new-widget.widget.js';
   ```
5. Register in `src/widgets/index.ts` registry
6. Import using barrel: `from '../new-widget/index.js'` (never `.widget.js` directly)

#### Configure Module Structure
```
src/configure/
├── index.ts              # Public API
├── server/               # HTTP server and API
│   ├── server.service.ts
│   └── routes.handler.ts
├── preview/              # Preview generation utilities
│   ├── ansi-to-html.util.ts
│   ├── mock-data.fixture.ts
│   └── terminal-themes.const.ts
└── gui/                  # Browser-based configuration UI
    ├── index.html
    ├── main.js           # Entry point
    ├── modules/          # ES6 modules (future)
    └── styles/
```

### Import Standards

#### CRITICAL: Always Use Barrel Exports
**Sheriff enforces this rule** - all cross-module imports MUST use barrel exports.

```typescript
// ✅ Correct - Use barrel exports (index.ts)
import type { Widget, RenderContext, WidgetConfig } from '../types/index.js';
import { colorize, loadSettings } from '../utils/index.js';

// ❌ Incorrect - Direct file imports violate encapsulation
import type { Widget } from '../types/widget.interface.js';
import { colorize } from '../utils/colors.util.js';
```

See [TECH_STACK.md](TECH_STACK.md#barrel-export-encapsulation) for rationale.

#### Import Order Convention
ESLint enforces this order with automatic formatting:

1. Node.js built-ins (with `node:` prefix)
2. External packages
3. Internal modules (barrel exports)
4. Sibling imports (same directory)

```typescript
// 1. Node.js built-ins
import { homedir } from 'node:os';
import { readFileSync } from 'node:fs';

// 2. External packages
import chalk from 'chalk';

// 3. Internal modules - barrel exports
import type { Widget, RenderContext } from '../types';
import { colorize } from '../utils';

// 4. Sibling imports
import { getOption } from './widget.helper.js';
```

Empty lines are required between groups. Run `npm run lint -- --fix` to auto-format.

#### Always Include .js Extension
ESM requires file extensions:
```typescript
// ✅ Correct
import { helper } from './helper.js';

// ❌ Incorrect
import { helper } from './helper';
```

### Module Boundaries (Sheriff)

Sheriff enforces architectural layers. See [TECH_STACK.md](TECH_STACK.md#module-boundaries-sheriff) for details.

**Quick reference:**
- **domain:** Types, schemas (no business logic)
- **core:** Widgets, utilities (business logic)
- **feature:** CLI, configure (application features)

**Verification:**
```bash
npm run lint:sheriff  # Check Sheriff rules
npm run lint:all      # Check ESLint + Sheriff
```

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Widget implementation | `{name}.widget.ts` | `directory.widget.ts` |
| Widget tests | `{name}.widget.spec.ts` | `directory.widget.spec.ts` |
| Utilities | `{name}.util.ts` | `colors.util.ts` |
| Tests | `{name}.util.spec.ts` | `colors.util.spec.ts` |
| Type definitions | `{name}.interface.ts` or `{name}.type.ts` | `settings.interface.ts` |
| Constants | `{name}.const.ts` | `terminal-themes.const.ts` |
| Test fixtures | `{name}.fixture.ts` | `mock-data.fixture.ts` |
| Barrel exports | `index.ts` | All folders |

### Testing Standards

#### Widget Tests
Each widget must have a test file co-located in its folder:

```typescript
// src/widgets/directory/directory.widget.spec.ts
import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types';

import { DirectoryWidget } from './directory.widget.js';

describe('DirectoryWidget', () => {
  it('should render shortened path', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/home/user/projects/app/src',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = DirectoryWidget.render(ctx);
    expect(result).toBeTruthy();
  });
});
```

### Type Safety

#### Always Use Type Imports
```typescript
// ✅ Correct - type-only import
import type { Widget, RenderContext } from '../types';

// ❌ Incorrect - runtime import for types
import { Widget, RenderContext } from '../types';
```

#### Widget Implementation Pattern
```typescript
export const MyWidgetSchema: WidgetSchema = {
  id: 'myWidget',
  meta: { displayName: '...', description: '...', category: '...' },
  options: { content: { color: 'blue' }, custom: [...] },
  previewStates: [...],
};

export const MyWidget: Widget = {
  name: 'myWidget',
  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    // Implementation
  },
};
```

## Commands

```bash
# Build
npm run build              # Build TypeScript + GUI + CSS
npm run build:production   # Build with minified CSS (production)
npm run build:gui          # Copy GUI files to dist
npm run build:css          # Build Tailwind CSS

# Development
npm run dev                # Watch mode for CLI
npm run dev:css            # Watch Tailwind CSS (auto-rebuild)
npm run dev:configure      # Watch mode for config GUI (--raw flag shows live console output)

# Testing
npm test                   # Run all tests (vitest + playwright)
npm run test:vitest        # Run unit tests only
npm run test:e2e           # Run E2E tests (exits cleanly, no auto-open report)
npm run test:e2e:report    # View last E2E test report

# Linting
npm run lint               # Run all linters (eslint + sheriff)
npm run lint:eslint        # Run ESLint only
npm run lint:sheriff       # Run Sheriff only
```
