# Changelog

All notable changes to this project will be documented in this file.

See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.0](https://github.com/p5hema2/claude-code-cli-statusline/compare/v0.2.0...v0.3.0) (2026-02-14)


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
* **defaults:** update default configuration for new users ([46db902](https://github.com/p5hema2/claude-code-cli-statusline/commit/46db90280d89da3df7f925ead2c7b30132636b6b)), closes [#95](https://github.com/p5hema2/claude-code-cli-statusline/issues/95)
* **infra:** add transcript parser and status hydration logic ([54f8a06](https://github.com/p5hema2/claude-code-cli-statusline/commit/54f8a0687a522754050d3549a7e362cff5b9388f)), closes [#57](https://github.com/p5hema2/claude-code-cli-statusline/issues/57)
* **infra:** transcript parser and status hydration ([#57](https://github.com/p5hema2/claude-code-cli-statusline/issues/57)) ([54ad4c3](https://github.com/p5hema2/claude-code-cli-statusline/commit/54ad4c3fd06688181d7085d40eabcfab1bf9d773))
* **text:** increase text widget maxLength from 50 to 100 ([f6455be](https://github.com/p5hema2/claude-code-cli-statusline/commit/f6455be87b5029f228d6b31f0cff0dfd9eb95fc2)), closes [#95](https://github.com/p5hema2/claude-code-cli-statusline/issues/95)
* **widgets:** add apiDuration widget ([9f701ee](https://github.com/p5hema2/claude-code-cli-statusline/commit/9f701ee333588aa3ef100b9a89522bf5e902a0e2)), closes [#64](https://github.com/p5hema2/claude-code-cli-statusline/issues/64)
* **widgets:** add codeChanges widget ([dbbb33e](https://github.com/p5hema2/claude-code-cli-statusline/commit/dbbb33e287d14044a333f6b3ab87ed9a713c2557)), closes [#63](https://github.com/p5hema2/claude-code-cli-statusline/issues/63)
* **widgets:** add configurable label and N/A visibility to all widgets ([0dedc45](https://github.com/p5hema2/claude-code-cli-statusline/commit/0dedc45b51afba20994864ea5db101eb08aaec3e))
* **widgets:** add configurable label and N/A visibility to all widgets ([b7e0ed4](https://github.com/p5hema2/claude-code-cli-statusline/commit/b7e0ed4e99051a2c28c5f22efb3216d34b043a08)), closes [#11](https://github.com/p5hema2/claude-code-cli-statusline/issues/11)
* **widgets:** add contextThreshold warning widget ([9555939](https://github.com/p5hema2/claude-code-cli-statusline/commit/9555939def78b258d0158c0bf88ff65c345a6647)), closes [#65](https://github.com/p5hema2/claude-code-cli-statusline/issues/65)
* **widgets:** add extraUsage widget for overuse credits tracking ([47be3cd](https://github.com/p5hema2/claude-code-cli-statusline/commit/47be3cdb5797de807fd92ccb54a76eccbfe69a4f)), closes [#72](https://github.com/p5hema2/claude-code-cli-statusline/issues/72)
* **widgets:** add free-form text input to text widget ([79d9745](https://github.com/p5hema2/claude-code-cli-statusline/commit/79d9745b7a35d2490bd6d17acfea876039db111e))
* **widgets:** add free-form text input to text widget ([af78cd2](https://github.com/p5hema2/claude-code-cli-statusline/commit/af78cd2b9efaf48ac3702bbf5c8a78c454609424)), closes [#12](https://github.com/p5hema2/claude-code-cli-statusline/issues/12)
* **widgets:** add git-changes widget ([#32](https://github.com/p5hema2/claude-code-cli-statusline/issues/32)) ([5b11565](https://github.com/p5hema2/claude-code-cli-statusline/commit/5b11565688b308a0869ff88562e72968688e034d))
* **widgets:** add git-changes widget to display diff statistics ([839d6d8](https://github.com/p5hema2/claude-code-cli-statusline/commit/839d6d8a09bac25029b7ecd89607c0cf274da490)), closes [#32](https://github.com/p5hema2/claude-code-cli-statusline/issues/32)
* **widgets:** add git-worktree widget ([#33](https://github.com/p5hema2/claude-code-cli-statusline/issues/33)) ([0fecf57](https://github.com/p5hema2/claude-code-cli-statusline/commit/0fecf57b984e62c80640ac5e4f47f7c83e8b6135))
* **widgets:** add git-worktree widget to display current worktree ([fe52d43](https://github.com/p5hema2/claude-code-cli-statusline/commit/fe52d43cd857f342c4501f1b8ef674fd640d2765)), closes [#33](https://github.com/p5hema2/claude-code-cli-statusline/issues/33)
* **widgets:** add granular token usage widgets ([#37](https://github.com/p5hema2/claude-code-cli-statusline/issues/37)) ([8c59a71](https://github.com/p5hema2/claude-code-cli-statusline/commit/8c59a7177dfb2da44e524b45340459765f98cb4a))
* **widgets:** add granular token usage widgets (input/output/cached) ([fd225a2](https://github.com/p5hema2/claude-code-cli-statusline/commit/fd225a21cacc1b87c30aa1dd7829d9924e475799)), closes [#37](https://github.com/p5hema2/claude-code-cli-statusline/issues/37)
* **widgets:** add session-clock widget ([#36](https://github.com/p5hema2/claude-code-cli-statusline/issues/36)) ([08907f1](https://github.com/p5hema2/claude-code-cli-statusline/commit/08907f167226e00dc63dd296e508727d807f6eb1))
* **widgets:** add session-clock widget to display elapsed session time ([7df488d](https://github.com/p5hema2/claude-code-cli-statusline/commit/7df488d01c61424b757ba9d66b4b591e3d5dfc6b)), closes [#36](https://github.com/p5hema2/claude-code-cli-statusline/issues/36)
* **widgets:** add session-id widget ([#40](https://github.com/p5hema2/claude-code-cli-statusline/issues/40)) ([8a33004](https://github.com/p5hema2/claude-code-cli-statusline/commit/8a33004fd19d6ee72007975ee8e34517ae0e4136))
* **widgets:** add session-id widget to display session identifier ([f3dc4a2](https://github.com/p5hema2/claude-code-cli-statusline/commit/f3dc4a254455faed5d26532ac91c63d8242b6845)), closes [#40](https://github.com/p5hema2/claude-code-cli-statusline/issues/40)
* **widgets:** add sessionCost widget ([09ef2ea](https://github.com/p5hema2/claude-code-cli-statusline/commit/09ef2ea2763421c1ee0910ec292cb6d7e41865d2)), closes [#62](https://github.com/p5hema2/claude-code-cli-statusline/issues/62)
* **widgets:** add tokensCacheRead widget ([74f3dab](https://github.com/p5hema2/claude-code-cli-statusline/commit/74f3dab4498073f25ee6bf2d87cf62a689be2faf)), closes [#66](https://github.com/p5hema2/claude-code-cli-statusline/issues/66)
* **widgets:** add tokensTotal widget ([1a21db5](https://github.com/p5hema2/claude-code-cli-statusline/commit/1a21db55a3ba00b126c5bee4dc9b6d53b9532f1f)), closes [#67](https://github.com/p5hema2/claude-code-cli-statusline/issues/67)
* **widgets:** add turnCount widget for conversation turns tracking ([580644b](https://github.com/p5hema2/claude-code-cli-statusline/commit/580644b557add090b4a385238ac9ac67fe39b581)), closes [#68](https://github.com/p5hema2/claude-code-cli-statusline/issues/68)
* **widgets:** add version widget ([#38](https://github.com/p5hema2/claude-code-cli-statusline/issues/38)) ([200165a](https://github.com/p5hema2/claude-code-cli-statusline/commit/200165ab81937fc104f9d479a1cc9f422996daf0))
* **widgets:** add version widget to display CLI version ([edf0389](https://github.com/p5hema2/claude-code-cli-statusline/commit/edf0389c837b92c209142c4bbdcb5ab523fa48ac)), closes [#38](https://github.com/p5hema2/claude-code-cli-statusline/issues/38)
* **widgets:** add weeklyCowork widget for Cowork usage tracking ([87a0111](https://github.com/p5hema2/claude-code-cli-statusline/commit/87a01118f114a0eb15487c5bdf1100168e380a04)), closes [#70](https://github.com/p5hema2/claude-code-cli-statusline/issues/70)
* **widgets:** add weeklyOAuthApps widget for OAuth apps usage tracking ([f6e90f3](https://github.com/p5hema2/claude-code-cli-statusline/commit/f6e90f33b3069aa5701ae4ff43419052fce61a7d)), closes [#71](https://github.com/p5hema2/claude-code-cli-statusline/issues/71)
* **widgets:** add weeklyOpus widget for Opus model usage tracking ([f218259](https://github.com/p5hema2/claude-code-cli-statusline/commit/f218259a7a353a60004e274e658a87040d3c0952)), closes [#69](https://github.com/p5hema2/claude-code-cli-statusline/issues/69)


### Bug Fixes

* **ci:** install Playwright browsers before E2E tests ([82878f9](https://github.com/p5hema2/claude-code-cli-statusline/commit/82878f9bf3c6a19e5f9d224d29ab2e5042b57fd8))
* **ci:** run build before playwright E2E tests ([606bcc7](https://github.com/p5hema2/claude-code-cli-statusline/commit/606bcc7db8afdd3f7c4c208f20ba575057743401))
* **configure:** deep merge nested status objects in preview mock data ([dd887b9](https://github.com/p5hema2/claude-code-cli-statusline/commit/dd887b9607e86e71b875d80f9a27fcb2329d7c8f))
* **configure:** deep merge nested status objects in preview mock data ([bbf9bdc](https://github.com/p5hema2/claude-code-cli-statusline/commit/bbf9bdcebf759a75af94fc575a5314a995f0aa7b))
* **configure:** fix color field default value deletion ([58ef603](https://github.com/p5hema2/claude-code-cli-statusline/commit/58ef603c6564cad127a5fe09b207c15d75cf63b5)), closes [#95](https://github.com/p5hema2/claude-code-cli-statusline/issues/95)
* **configure:** fix indicator grid alignment and missing label inputs ([9f6269c](https://github.com/p5hema2/claude-code-cli-statusline/commit/9f6269cdf827053a25f9b33cec4b041a34704bfe)), closes [#95](https://github.com/p5hema2/claude-code-cli-statusline/issues/95)
* **configure:** fix multiple GUI configuration issues ([2825ffa](https://github.com/p5hema2/claude-code-cli-statusline/commit/2825ffa76aa926c67e5206f213fbbf1458482c5c))
* **configure:** fix multiple GUI configuration issues ([9f0183f](https://github.com/p5hema2/claude-code-cli-statusline/commit/9f0183f38f52e6633a46cec246de6b1045c1b99a)), closes [#95](https://github.com/p5hema2/claude-code-cli-statusline/issues/95)
* **configure:** sync GUI reset defaults with backend defaults ([dcf69b1](https://github.com/p5hema2/claude-code-cli-statusline/commit/dcf69b1745488a3d15bff269545b89046a44a1aa)), closes [#95](https://github.com/p5hema2/claude-code-cli-statusline/issues/95)
* **lint:** fix all ESLint and Sheriff violations in test files ([1db9520](https://github.com/p5hema2/claude-code-cli-statusline/commit/1db952099208570c38f71a470cab1b8f471297b4))
* **lint:** resolve all ESLint and Sheriff violations in test files ([89d64a1](https://github.com/p5hema2/claude-code-cli-statusline/commit/89d64a1f83ccb5b670eb57becdb3183d3b0911fb))
* **server:** skip file watcher in CI environments ([bc2502f](https://github.com/p5hema2/claude-code-cli-statusline/commit/bc2502fda1e48521b0517e6c75f73c3773b7e227))
* **test:** add missing ahead/behind properties to git-branch mockGitInfo ([67e147e](https://github.com/p5hema2/claude-code-cli-statusline/commit/67e147eb2c6821b00cb13cb84642051147854dae))
* **test:** add missing ahead/behind properties to git-branch mockGitInfo ([5840909](https://github.com/p5hema2/claude-code-cli-statusline/commit/5840909372cf23fe32ccfb54f11a3ae51000240b))
* **tokens-cached:** add transcript-hydrated verification tests ([79e5b4f](https://github.com/p5hema2/claude-code-cli-statusline/commit/79e5b4f5d04a83db3ed75d5001704d48038fff01))
* **tokens-cached:** add transcript-hydrated verification tests ([#61](https://github.com/p5hema2/claude-code-cli-statusline/issues/61)) ([110773f](https://github.com/p5hema2/claude-code-cli-statusline/commit/110773f458a49757419380e90220d04fa10e57e5))
* **types:** resolve TypeScript compilation errors in test files ([ccd061f](https://github.com/p5hema2/claude-code-cli-statusline/commit/ccd061f2d9fd576432e0646160350c0362de8959))
* **widgets:** add configurable spacing to separator widget ([cfbfe03](https://github.com/p5hema2/claude-code-cli-statusline/commit/cfbfe03d50eb7ad94e64bce1abe966bb5ed53739)), closes [#78](https://github.com/p5hema2/claude-code-cli-statusline/issues/78)
* **widgets:** verify sessionClock with transcript data ([#58](https://github.com/p5hema2/claude-code-cli-statusline/issues/58)) ([9348c11](https://github.com/p5hema2/claude-code-cli-statusline/commit/9348c111026053b16c8b872284203b6c964ec198))
* **widgets:** verify sessionClock with transcript-hydrated data ([7a48810](https://github.com/p5hema2/claude-code-cli-statusline/commit/7a48810e04a32a8fc5920496ac7815974a2847bf)), closes [#58](https://github.com/p5hema2/claude-code-cli-statusline/issues/58)
* **widgets:** verify tokensInput with transcript data ([#59](https://github.com/p5hema2/claude-code-cli-statusline/issues/59)) ([67cedac](https://github.com/p5hema2/claude-code-cli-statusline/commit/67cedac509fd85daeb633a47e2a43b9863f3b577))
* **widgets:** verify tokensInput with transcript-hydrated data ([9cc4a6a](https://github.com/p5hema2/claude-code-cli-statusline/commit/9cc4a6a7a70b0949127b20dc95bdcb2964cf89c6)), closes [#59](https://github.com/p5hema2/claude-code-cli-statusline/issues/59)
* **widgets:** verify tokensOutput with transcript data ([#60](https://github.com/p5hema2/claude-code-cli-statusline/issues/60)) ([99c6860](https://github.com/p5hema2/claude-code-cli-statusline/commit/99c6860bfe257cd514f72b936d43520fcc42423e))
* **widgets:** verify tokensOutput with transcript-hydrated data ([c9b6481](https://github.com/p5hema2/claude-code-cli-statusline/commit/c9b6481f28f65e1e898401c08aa37837119a34c8)), closes [#60](https://github.com/p5hema2/claude-code-cli-statusline/issues/60)

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
