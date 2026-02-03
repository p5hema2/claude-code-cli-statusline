/**
 * Terminal themes for the configuration GUI
 *
 * This file only contains:
 * - Terminal themes (for preview background)
 */

import type { TerminalTheme } from '../../types/index.js';

/** Terminal themes for preview background */
export const TERMINAL_THEMES: TerminalTheme[] = [
  { id: 'monokai', name: 'Monokai', bg: '#272822', fg: '#f8f8f2' },
  { id: 'dark', name: 'VS Code Dark', bg: '#1e1e1e', fg: '#d4d4d4' },
  { id: 'light', name: 'Light', bg: '#ffffff', fg: '#333333' },
  { id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36', fg: '#839496' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', fg: '#f8f8f2' },
  { id: 'nord', name: 'Nord', bg: '#2e3440', fg: '#d8dee9' },
];
