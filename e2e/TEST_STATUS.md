# E2E Test Suite Status

## Summary

**Total Tests:** 70
**Passing:** 14 (20%)
**Failing:** 56 (80%)

**Last Updated:** 2026-02-02

## Test Results by Suite

### ✅ 01-initial-load.spec.ts (8/8 passing)
All tests passing. This suite validates:
- Page loads without errors
- API endpoints return correct data structure
- Initial UI elements are present
- No console errors

### ❌ 02-drag-drop.spec.ts (0/8 passing)
**Status:** All failing
**Root Cause:** Selector mismatches and missing drag-drop implementation details

**Actual GUI Structure:**
- Widgets in rows: `.row-widget[data-widget-id][data-row-index][data-widget-index]`
- No separate "gear icon" - click widget directly to configure
- Trash/remove: `.row-widget-remove` button on each widget
- Palette widgets: `.palette-widget[data-widget-id]`

**Required Fixes:**
1. Update drag-drop helper to use actual selectors
2. Remove "gear icon" references - widgets are clicked directly
3. Update trash zone selector (if it exists)
4. Verify drag-drop event handlers are working

### ❌ 03-widget-config.spec.ts (0/10 passing)
**Status:** All failing
**Root Cause:** Config panel opens differently than expected

**Actual Behavior:**
- Click widget directly (not gear icon) to open config
- Config panel structure: `#widget-config-panel` → `#config-content`
- Color options rendered dynamically based on widget schema
- No universal `.option-section` class - structure varies by widget

**Required Fixes:**
1. Remove "gear icon" test - replace with "click widget" test
2. Update option selectors to match dynamic structure
3. Check actual color picker, checkbox, select HTML structure
4. Verify state selector exists and selector is correct

### ❌ 04-row-operations.spec.ts (0/8 passing)
**Status:** All failing
**Root Cause:** Missing alignment/separator controls in row editor

**Actual Implementation:**
- Rows have class `.row-container[data-row-index]`
- Delete button: `.row-close` (not `.delete-row-btn`)
- **No visible alignment or separator selectors in row editor**
  - These might be in settings or not implemented yet

**Required Fixes:**
1. Update row selectors to use `.row-container`
2. Update delete button selector to `.row-close`
3. **Investigate:** Are alignment/separator controls implemented?
   - If yes: Find correct selectors
   - If no: Skip these tests or mark as TODO

### ❌ 05-preview-controls.spec.ts (1/7 passing)
**Status:** Mostly failing
**Root Cause:** Width input selector wrong, some controls missing

**Actual Selectors:**
- Terminal: `#terminal-select` ✅
- Theme: `#theme-select` ✅
- Width: `#width-input` ✅ (but value display selector may be wrong)

**Required Fixes:**
1. Remove width-value selector (uses same input for value)
2. Verify all control change events trigger preview updates
3. Check if width slider has min/max attributes

### ❌ 06-context-simulation.spec.ts (1/9 passing)
**Status:** Mostly failing
**Root Cause:** Context control selectors partially correct

**Actual Selectors (from HTML):**
- Context type: Radio buttons `input[name="context-type"]` ✅
- File input: `#file-context-name` ✅
- Lines input: `#line-selection-count` ✅
- Autocompact: `#autocompact-percent` ✅
- Plan mode: `#show-plan-mode` ✅

**Issues:**
- Tests may be trying to use `contextType` as select instead of radio
- Right section selector may be wrong

**Required Fixes:**
1. Update tests to handle radio buttons correctly (not select)
2. Verify right section selector (`#terminal-right`)
3. Check how context values are displayed in preview

### ❌ 07-settings-persistence.spec.ts (0/10 passing)
**Status:** All failing
**Root Cause:** Dirty flag implementation and status message selectors

**Actual Selectors:**
- Save: `#save-btn` ✅
- Reset: `#reset-btn` ✅
- Status: `#status-message` ✅

**Issues:**
- Dirty indicator selector may be wrong (`.dirty-badge`)
- Status message class changes based on state (`success`/`error`)
- Need to verify state management of dirty flag

**Required Fixes:**
1. Find actual dirty indicator element/class
2. Update success/error message selectors
3. Verify button disabled states work correctly

### ❌ 08-error-handling.spec.ts (4/8 passing)
**Status:** Partially passing
**Root Cause:** API mocking and error display varies

**What Works:**
- Basic error handling validation
- Some API failure scenarios

**What Fails:**
- Malformed data handling
- Invalid drag operations
- Form validation

**Required Fixes:**
1. Verify error message display selectors
2. Update invalid drag operation tests to match actual drag handlers
3. Check form validation implementation

## Selector Reference: Actual vs Expected

### Rows & Widgets

| Element | Expected | Actual | Status |
|---------|----------|--------|--------|
| Row container | `[data-row-index]` | `.row-container[data-row-index]` | ⚠️ Partial |
| Row widgets area | `.widget-slots` | `.row-widgets` | ❌ Wrong |
| Widget in row | `.widget-slot .widget` | `.row-widget` | ❌ Wrong |
| Delete row | `.delete-row-btn` | `.row-close` | ❌ Wrong |
| Row alignment | `.row-alignment` | **NOT FOUND** | ❌ Missing |
| Row separator | `.row-separator` | **NOT FOUND** | ❌ Missing |

### Widget Configuration

| Element | Expected | Actual | Status |
|---------|----------|--------|--------|
| Config panel | `#widget-config-panel` | `#widget-config-panel` | ✅ Correct |
| Config title | `#config-widget-title` | `#config-widget-title` | ✅ Correct |
| Close button | `#config-close-btn` | `#config-close-btn` | ✅ Correct |
| Gear icon | `.widget-config-btn` | **NONE** (click widget) | ❌ N/A |
| Option section | `[data-option]` | Dynamic structure | ⚠️ Complex |

### Footer & Actions

| Element | Expected | Actual | Status |
|---------|----------|--------|--------|
| Save button | `#save-btn` | `#save-btn` | ✅ Correct |
| Reset button | `#reset-btn` | `#reset-btn` | ✅ Correct |
| Status message | `#status-message` | `#status-message` | ✅ Correct |
| Dirty indicator | `.dirty-badge` | **UNKNOWN** | ❓ TBD |

## Fix Priority

### High Priority (Core Functionality)
1. **02-drag-drop.spec.ts** - Critical user interaction
2. **03-widget-config.spec.ts** - Widget customization
3. **07-settings-persistence.spec.ts** - Data persistence

### Medium Priority (User Experience)
4. **04-row-operations.spec.ts** - Layout management
5. **05-preview-controls.spec.ts** - Preview customization
6. **06-context-simulation.spec.ts** - Context preview

### Low Priority (Edge Cases)
7. **08-error-handling.spec.ts** - Error scenarios (partial pass)

## Fix Strategy

### Option A: Incremental Fix (Recommended)
1. Update `e2e/utils/selectors.ts` with correct selectors
2. Fix one suite at a time, starting with drag-drop
3. Run tests after each suite fix to verify
4. Document any missing features (alignment/separator)

### Option B: Exploratory Fix
1. Run tests in headed mode to see actual failures
2. Use browser DevTools to inspect actual HTML structure
3. Update selectors based on live inspection
4. Validate with Playwright codegen for complex interactions

### Option C: Defer Testing
1. Mark failing tests as `.skip` with TODO comments
2. Focus on manual testing until GUI is stable
3. Update tests when GUI implementation is finalized

## Next Steps

1. **Immediate:** Update `selectors.ts` with correct row/widget selectors
2. **Short-term:** Fix drag-drop and config panel tests
3. **Long-term:** Investigate missing features (alignment/separator)
4. **Documentation:** Update test expectations based on actual GUI

## Commands

```bash
# Run specific suite in headed mode to debug
npm run test:e2e:headed -- 02-drag-drop.spec.ts

# Run with UI mode for interactive debugging
npm run test:e2e:ui

# Run single test
npm run test:e2e -- 02-drag-drop.spec.ts --grep "should drag widget"
```

## Notes

- The GUI was refactored (Phase 7) into module-based architecture
- Some planned features (alignment/separator per-row) may not be implemented
- Tests were written based on plan, not actual implementation
- This is normal for greenfield projects - tests catch mismatches early
