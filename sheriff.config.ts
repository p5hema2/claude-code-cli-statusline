/**
 * Sheriff configuration - Module boundary enforcement
 *
 * Defines architectural layers and dependency rules to prevent
 * unwanted imports and maintain clean architecture.
 */

import { noDependencies, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  // Use tsconfig.json to find all TypeScript files
  tsConfig: './tsconfig.json',
  // Entry point for module graph
  entryFile: './src/index.ts',
  tagging: {
    // Entry points
    'src/index.ts': 'feature:cli',
    'src/main.ts': 'feature:cli',

    // Domain layer - shared types and defaults
    'src/types': 'domain:types',
    'src/defaults': 'domain:defaults',

    // Core layer - business logic
    // Widget subdirectories are directly importable within core:widgets boundary.
    'src/widgets': 'core:widgets',
    'src/widgets/api-duration': 'core:widgets',
    'src/widgets/code-changes': 'core:widgets',
    'src/widgets/session-cost': 'core:widgets',
    'src/widgets/shared': 'core:widgets',
    'src/widgets/mock': 'core:widgets',
    'src/widgets/context-threshold': 'core:widgets',
    'src/widgets/extra-usage': 'core:widgets',
    'src/widgets/weekly-oauth-apps': 'core:widgets',
    'src/widgets/weekly-cowork': 'core:widgets',
    'src/widgets/weekly-opus': 'core:widgets',
    'src/widgets/tokens-cache-read': 'core:widgets',
    'src/widgets/tokens-total': 'core:widgets',
    'src/widgets/turn-count': 'core:widgets',
    'src/utils': 'core:utils',

    // Feature layer - application features
    'src/configure': 'feature:configure',
    'src/configure/<server>': 'feature:configure',
    'src/configure/<preview>': 'feature:configure',

    // Exclude browser JS from Sheriff (not TypeScript)
    'src/configure/gui': noDependencies,
  },

  depRules: {
    // Domain layer: types can only import external packages
    'domain:types': ['domain:types', 'external:*'],
    'domain:defaults': noDependencies,

    // Core layer: can import domain + other core modules
    'core:widgets': ['domain:types', 'core:widgets', 'core:utils', 'external:*'],
    'core:utils': ['domain:types', 'domain:defaults', 'core:widgets', 'external:*'],

    // Feature layer: can import everything except other features
    'feature:cli': ['domain:*', 'core:*', 'feature:configure', 'external:*'],
    'feature:configure': ['domain:*', 'core:*', 'external:*'],

    // Untagged files: can import anything (permissive for flexibility)
    noTag: ['domain:*', 'core:*', 'feature:*', 'external:*'],

    // Default: root files can import anything
    root: ['domain:*', 'core:*', 'feature:*', 'external:*'],
  },
};
