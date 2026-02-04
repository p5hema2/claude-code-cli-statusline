# Changelog

All notable changes to this project will be documented in this file.

See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.0](https://github.com/p5hema2/claude-code-cli-statusline/compare/v0.2.0...v0.3.0) (2026-02-04)


### Features

* **configure:** migrate GUI from custom CSS to Tailwind CSS ([#13](https://github.com/p5hema2/claude-code-cli-statusline/issues/13)) ([#15](https://github.com/p5hema2/claude-code-cli-statusline/issues/15)) ([294e068](https://github.com/p5hema2/claude-code-cli-statusline/commit/294e068a856586d8d44c6350eae4e08523396072))

## [Unreleased]

### Changed
- Migrated configuration GUI from custom CSS to Tailwind CSS (#13, #15)
- Updated widget rendering with utility-first styling approach

### Fixed
- Fixed dim text test for color-based implementation

## [0.2.0] - 2026-01-28

### Added
- Browser-based WYSIWYG configuration GUI (#2, #4)
- Drag & drop widget arrangement
- Multi-row statusline support
- Live preview with terminal themes
- Configurable widget labels and colors (#10)

### Changed
- All widgets now support custom labels and color overrides

## [0.1.0] - 2026-01-28

### Added
- Initial claude-code-cli-statusline implementation (#1)
- OAuth usage metrics (5-hour session, 7-day total, 7-day Sonnet)
- 9 built-in widgets: directory, gitBranch, model, contextUsage, sessionUsage, weeklyUsage, weeklySonnet, outputStyle, vimMode
- Deferred cache refresh pattern with stale-while-revalidate
- CLI entry point with statusline rendering
- TypeScript strict mode with full type checking

[Unreleased]: https://github.com/p5hema2/claude-code-cli-statusline/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/p5hema2/claude-code-cli-statusline/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/p5hema2/claude-code-cli-statusline/releases/tag/v0.1.0
