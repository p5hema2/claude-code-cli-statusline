# Changelog

All notable changes to this project will be documented in this file.

See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.0](https://github.com/p5hema2/claude-code-cli-statusline/compare/v0.2.0...v0.3.0) (2026-02-05)


### Features

* **configure:** add ARIA live regions for screen reader announcements ([deb81f8](https://github.com/p5hema2/claude-code-cli-statusline/commit/deb81f8847fae14aababfaf182cc05908f13f100)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** add dark/light theme toggle with CSS variables ([a9b09e6](https://github.com/p5hema2/claude-code-cli-statusline/commit/a9b09e6dfb41b8822b319b416a9485eaf633b71a)), closes [#14](https://github.com/p5hema2/claude-code-cli-statusline/issues/14)
* **configure:** add Escape key handler for config panel closure ([db1b420](https://github.com/p5hema2/claude-code-cli-statusline/commit/db1b420dd924013cc0d31bbc4b35f29b84c37dd7)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** add explicit form label associations for WCAG compliance ([4fcc8ab](https://github.com/p5hema2/claude-code-cli-statusline/commit/4fcc8ab49e9a15980ef20ac9dc46406ec3f5ebe4)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** add keyboard navigation to widget palette and categories ([3766d17](https://github.com/p5hema2/claude-code-cli-statusline/commit/3766d1790e10c1dcc230c9265b7d108c1434b646)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** add WCAG 2.0 AA compliant focus indicators ([8b4f335](https://github.com/p5hema2/claude-code-cli-statusline/commit/8b4f335cda40acb3b73a2e43b2d2acb3003485b2)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** fix color contrast to meet WCAG 2.0 AA standards ([6c50cbe](https://github.com/p5hema2/claude-code-cli-statusline/commit/6c50cbe918848be14015df59ebe139a18dd3eeed)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** fix heading hierarchy for WCAG compliance ([a75bb54](https://github.com/p5hema2/claude-code-cli-statusline/commit/a75bb540b839ed1d6694b42e36141ac04c58eaa2)), closes [#23](https://github.com/p5hema2/claude-code-cli-statusline/issues/23)
* **configure:** migrate GUI from custom CSS to Tailwind CSS ([#13](https://github.com/p5hema2/claude-code-cli-statusline/issues/13)) ([#15](https://github.com/p5hema2/claude-code-cli-statusline/issues/15)) ([294e068](https://github.com/p5hema2/claude-code-cli-statusline/commit/294e068a856586d8d44c6350eae4e08523396072))
* **configure:** rebrand GUI to Smart Commerce colors and typography ([3ac6cdd](https://github.com/p5hema2/claude-code-cli-statusline/commit/3ac6cdde603e53175853726cd5810055a751a9ba)), closes [#14](https://github.com/p5hema2/claude-code-cli-statusline/issues/14)
* **configure:** Smart Commerce rebranding with dark/light theme toggle ([079442e](https://github.com/p5hema2/claude-code-cli-statusline/commit/079442e29d7d3266470cb9c2d5b9096062130838))
* **widgets:** add configurable label and N/A visibility to all widgets ([0dedc45](https://github.com/p5hema2/claude-code-cli-statusline/commit/0dedc45b51afba20994864ea5db101eb08aaec3e))
* **widgets:** add configurable label and N/A visibility to all widgets ([b7e0ed4](https://github.com/p5hema2/claude-code-cli-statusline/commit/b7e0ed4e99051a2c28c5f22efb3216d34b043a08)), closes [#11](https://github.com/p5hema2/claude-code-cli-statusline/issues/11)
* **widgets:** add free-form text input to text widget ([79d9745](https://github.com/p5hema2/claude-code-cli-statusline/commit/79d9745b7a35d2490bd6d17acfea876039db111e))
* **widgets:** add free-form text input to text widget ([af78cd2](https://github.com/p5hema2/claude-code-cli-statusline/commit/af78cd2b9efaf48ac3702bbf5c8a78c454609424)), closes [#12](https://github.com/p5hema2/claude-code-cli-statusline/issues/12)


### Bug Fixes

* **ci:** run build before playwright E2E tests ([36c6f2d](https://github.com/p5hema2/claude-code-cli-statusline/commit/36c6f2d6fcd1f0147a48f4992226643e8261f556))
* **ci:** run build before playwright E2E tests ([45f15d1](https://github.com/p5hema2/claude-code-cli-statusline/commit/45f15d1395c13750e93b3593cabd57e017508765))
* **lint:** fix all ESLint and Sheriff violations in test files ([1db9520](https://github.com/p5hema2/claude-code-cli-statusline/commit/1db952099208570c38f71a470cab1b8f471297b4))
* **lint:** resolve all ESLint and Sheriff violations in test files ([89d64a1](https://github.com/p5hema2/claude-code-cli-statusline/commit/89d64a1f83ccb5b670eb57becdb3183d3b0911fb))
* **server:** skip file watcher in CI environments ([6ddb0eb](https://github.com/p5hema2/claude-code-cli-statusline/commit/6ddb0ebd9ec8ae3f69e13c27fe91133ff12365df))
* **server:** skip file watcher in CI environments ([4d71bfe](https://github.com/p5hema2/claude-code-cli-statusline/commit/4d71bfe71c3f8533fe9aabecd0dfc35b58292546)), closes [#45](https://github.com/p5hema2/claude-code-cli-statusline/issues/45)
* **test:** add missing ahead/behind properties to git-branch mockGitInfo ([67e147e](https://github.com/p5hema2/claude-code-cli-statusline/commit/67e147eb2c6821b00cb13cb84642051147854dae))
* **test:** add missing ahead/behind properties to git-branch mockGitInfo ([5840909](https://github.com/p5hema2/claude-code-cli-statusline/commit/5840909372cf23fe32ccfb54f11a3ae51000240b))
* **types:** resolve TypeScript compilation errors in test files ([ccd061f](https://github.com/p5hema2/claude-code-cli-statusline/commit/ccd061f2d9fd576432e0646160350c0362de8959))

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
