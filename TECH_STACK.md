# Tech Stack

## Runtime & Language

- **Node.js:** >= 18.0.0 (ESM modules)
- **TypeScript:** Strict mode with full type checking
- **Package Manager:** npm

## Build & Development Tools

- **Build:** tsup (ESBuild-based bundler)
- **Test:** Vitest (unit + integration)
- **E2E:** Playwright (browser automation)
- **Lint:** ESLint + Prettier + Sheriff (module boundaries)
- **CSS:** Tailwind CSS (utility-first styling)

## Key Dependencies

- **chalk:** Terminal color output (supports FORCE_COLOR)
- **zod:** Runtime schema validation
- **Tailwind CSS:** Utility-first CSS framework for GUI

## Architectural Patterns

### FORCE_COLOR Bootstrap Pattern

**File:** `src/index.ts`

Forces color output before chalk loads using dynamic imports:

```typescript
// Force colors BEFORE any imports
process.env.FORCE_COLOR = '1';

// Dynamic import ensures FORCE_COLOR is set first
import('./main.js').then(({ main }) => main());
```

**Why:** ESM hoists static imports, so environment variables must be set before any import chain executes. This ensures chalk respects the FORCE_COLOR setting.

**Impact:** Without this pattern, statusline colors would be disabled in non-TTY environments (CI, redirected output).

### Widget Registry Pattern

**File:** `src/widgets/index.ts`

Widgets register themselves with metadata and render functions. The registry stores both implementation and schema:

```typescript
export const WIDGET_REGISTRY: Record<string, WidgetEntry> = {
  directory: { widget: DirectoryWidget, schema: DirectorySchema },
  gitBranch: { widget: GitBranchWidget, schema: GitBranchSchema },
  // ...
};
```

**Benefits:**
- Single source of truth for widgets and their configuration
- Dynamic widget loading
- Schema-driven configuration GUI
- Preview state generation
- Type-safe widget access

### Deferred Cache Refresh

**File:** `src/utils/cache.util.ts`

Stale-while-revalidate caching pattern:

```typescript
export async function loadUsageCache(ttl: number): Promise<UsageCache | null> {
  const cached = loadCacheFromDisk();

  if (isCacheValid(cached, ttl)) {
    return cached; // Fresh cache, return immediately
  }

  // Cache is stale - trigger background refresh
  pendingRefresh = refreshUsageCache().catch(() => null);

  // Return stale cache (or null) immediately for fast rendering
  return cached;
}

// Call before process.exit() to ensure refresh completes
export async function waitForPendingRefresh(): Promise<UsageCache | null> {
  if (!pendingRefresh) return null;
  return await pendingRefresh;
}
```

**Why:** Prevents blocking main thread on slow OAuth API calls. Users see stale data immediately while fresh data loads in the background.

**Usage:**
1. `loadUsageCache()` returns stale data + triggers refresh
2. Render statusline with stale data (fast)
3. `waitForPendingRefresh()` before `process.exit()` ensures refresh completes

### Barrel Export Encapsulation

**Files:** All `index.ts` barrel exports

Sheriff enforces module boundaries through controlled exports. All cross-module imports MUST use barrel exports:

```typescript
// ✅ Correct - Use barrel exports
import type { Widget, RenderContext } from '../types/index.js';
import { colorize, loadSettings } from '../utils/index.js';

// ❌ Incorrect - Direct file imports violate encapsulation
import type { Widget } from '../types/widget.interface.js';
import { colorize } from '../utils/colors.util.js';
```

**Why:**
- **Encapsulation:** Modules control what they expose through index.ts
- **Refactoring:** Internal file organization can change without breaking imports
- **Tree-shaking:** Bundlers optimize based on barrel exports
- **Consistency:** One import pattern across the entire codebase

**Enforcement:** Sheriff will fail on direct file imports. Run `npm run lint:sheriff` to verify.

## Module Boundaries (Sheriff)

```
feature:cli ──────> core:widgets ──────> domain:types
            │                     │
            └──> core:utils ──────┘
            │
            └──> feature:configure
```

**Layers:**
- **domain:** Types, schemas, defaults (no business logic, no imports from core)
- **core:** Widgets, utilities (business logic, can import from domain)
- **feature:** CLI, configure (application features, can import from domain + core)

**Rules:**
- Features can import from core and domain
- Core can import from domain and other core modules
- Domain can only import external packages
- Core widgets can import from shared widget helpers

**Verification:**
```bash
npm run lint:sheriff  # Check Sheriff rules
npm run lint      # Check ESLint + Sheriff
```

## GUI Architecture

**Files:** `src/configure/gui/`, `src/configure/server/`

- **Frontend:** Vanilla JavaScript + Tailwind CSS (no framework)
- **Backend:** Built-in Node.js HTTP server with REST API
- **Live Reload:** Server-Sent Events (SSE) for CSS hot reload
- **Preview:** ANSI-to-HTML conversion with terminal themes

**Design Philosophy:**
- Zero frontend dependencies (faster builds, smaller bundle)
- Tailwind CSS for rapid prototyping and consistent design
- Native Web APIs (fetch, SSE) for simplicity

## Testing Strategy

- **Unit tests:** Vitest (`*.spec.ts` co-located with source)
- **Integration tests:** Vitest (server/API endpoints)
- **E2E tests:** Playwright (browser-based GUI testing)
- **Coverage target:** >80% overall

**Test Commands:**
```bash
npm test                # Run all tests (vitest + playwright)
npm run test:vitest     # Run unit tests only
npm run test:e2e        # Run E2E tests (exits cleanly, no auto-open)
npm run test:e2e:report # View last E2E HTML report
```

**Playwright Configuration:**
- Reporter: `html` with `{ open: 'never' }` to prevent auto-opening and hanging
- Tests exit cleanly without serving report forever
- HTML report can be viewed later with `npm run test:e2e:report`

**Test Patterns:**
```typescript
// Widget tests
describe('DirectoryWidget', () => {
  it('should render shortened path', () => {
    const ctx: RenderContext = { /* ... */ };
    const result = DirectoryWidget.render(ctx);
    expect(result).toBeTruthy();
  });
});

// E2E tests
test('should save settings via GUI', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('[data-widget-id="directory"]').click();
  // ...
});
```

## Build Process

```bash
npm run build              # Build TypeScript + GUI + CSS
npm run build:production   # Build with minified CSS (production)
npm run build:gui          # Copy GUI files to dist
npm run build:css          # Build Tailwind CSS
```

**Build Pipeline:**
1. `tsc` - Compile TypeScript to JavaScript (ESM)
2. `build:gui` - Copy HTML/CSS/JS from `src/configure/gui/` to `dist/`
3. `build:css` - Process Tailwind CSS with PostCSS (autoprefixer, cssnano)

**Production Optimizations:**
- Minified CSS with cssnano
- Tree-shaken Tailwind CSS (unused classes removed)
- TypeScript compiled with sourcemaps

## Development Workflow

```bash
npm run dev                # Watch mode for CLI
npm run dev:css            # Watch Tailwind CSS (auto-rebuild)
npm run dev:configure      # Watch mode for config GUI (--raw for live console output)
```

**Live Development Features:**
- `dev:configure` uses `concurrently --raw` to show real-time console output from both processes
- Server outputs URL and file watcher status on startup
- Cache-Control headers (`no-cache, no-store, must-revalidate`) prevent browser caching
- SSE pushes reload events to browser when files change
- File watcher monitors `.html`, `.js`, `.css` files with 100ms debounce

**Hot Reload Flow:**
1. `dev:css` watches `src/configure/gui/styles/tailwind.css` and rebuilds on changes
2. Server file watcher detects file changes
3. Server notifies browser via SSE (`/__live-reload` endpoint)
4. Browser reloads automatically (no manual refresh needed)
