/**
 * ANSI to HTML converter
 *
 * Converts ANSI escape codes (from chalk) to HTML spans with inline styles.
 * Supports 16-color, 256-color, and truecolor modes, plus text styling.
 *
 * Terminal color palettes from:
 * https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
 */

/** Terminal color palette type */
export type TerminalPalette = {
  id: string;
  name: string;
  colors: Record<number, string>;
};

/**
 * Terminal color palettes from Wikipedia ANSI escape code article
 * Each palette maps ANSI codes (30-37, 90-97) to hex colors
 */
export const TERMINAL_PALETTES: TerminalPalette[] = [
  {
    id: 'xterm',
    name: 'xterm',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#cd0000', 32: '#00cd00', 33: '#cdcd00',
      34: '#0000ee', 35: '#cd00cd', 36: '#00cdcd', 37: '#e5e5e5',
      // Bright (90-97)
      90: '#7f7f7f', 91: '#ff0000', 92: '#00ff00', 93: '#ffff00',
      94: '#5c5cff', 95: '#ff00ff', 96: '#00ffff', 97: '#ffffff',
    },
  },
  {
    id: 'vga',
    name: 'VGA',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#c40000', 32: '#00c400', 33: '#c47e00',
      34: '#0000c4', 35: '#c400c4', 36: '#00c4c4', 37: '#c4c4c4',
      // Bright (90-97)
      90: '#4e4e4e', 91: '#dc4e4e', 92: '#4edc4e', 93: '#f3f34e',
      94: '#4e4edc', 95: '#f34ef3', 96: '#4ef3f3', 97: '#ffffff',
    },
  },
  {
    id: 'win-console',
    name: 'Windows Console',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#c40000', 32: '#008000', 33: '#808000',
      34: '#000080', 35: '#800080', 36: '#008080', 37: '#c0c0c0',
      // Bright (90-97)
      90: '#808080', 91: '#ff0000', 92: '#00ff00', 93: '#ffff00',
      94: '#0000ff', 95: '#ff00ff', 96: '#00ffff', 97: '#ffffff',
    },
  },
  {
    id: 'win10',
    name: 'Windows 10',
    colors: {
      // Standard (30-37)
      30: '#0c0c0c', 31: '#c50f1f', 32: '#13a10e', 33: '#c19c00',
      34: '#0037da', 35: '#881798', 36: '#3a96dd', 37: '#cccccc',
      // Bright (90-97)
      90: '#767676', 91: '#e74856', 92: '#16c60c', 93: '#f9f1a5',
      94: '#3b78ff', 95: '#b4009e', 96: '#61d6d6', 97: '#f2f2f2',
    },
  },
  {
    id: 'vscode',
    name: 'VS Code',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#cd3131', 32: '#0dbc79', 33: '#e5e510',
      34: '#2472c8', 35: '#bc3fbc', 36: '#11a8cd', 37: '#e5e5e5',
      // Bright (90-97)
      90: '#666666', 91: '#f14c4c', 92: '#23d18b', 93: '#f5f543',
      94: '#3b8eea', 95: '#d670d6', 96: '#29b8db', 97: '#e5e5e5',
    },
  },
  {
    id: 'terminal-app',
    name: 'macOS Terminal',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#990000', 32: '#00a600', 33: '#999900',
      34: '#0000b2', 35: '#b200b2', 36: '#00a6b2', 37: '#bfbfbf',
      // Bright (90-97)
      90: '#666666', 91: '#e60000', 92: '#00d900', 93: '#e5e500',
      94: '#0000ff', 95: '#e600e6', 96: '#00e6e6', 97: '#e6e6e6',
    },
  },
  {
    id: 'putty',
    name: 'PuTTY',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#bb0000', 32: '#00bb00', 33: '#bbbb00',
      34: '#0000bb', 35: '#bb00bb', 36: '#00bbbb', 37: '#bbbbbb',
      // Bright (90-97)
      90: '#555555', 91: '#ff5555', 92: '#55ff55', 93: '#ffff55',
      94: '#5555ff', 95: '#ff55ff', 96: '#55ffff', 97: '#ffffff',
    },
  },
  {
    id: 'mirc',
    name: 'mIRC',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#7f0000', 32: '#009300', 33: '#fc7f00',
      34: '#00007f', 35: '#9c009c', 36: '#009393', 37: '#d2d2d2',
      // Bright (90-97)
      90: '#7f7f7f', 91: '#ff0000', 92: '#00fc00', 93: '#ffff00',
      94: '#0000fc', 95: '#ff00ff', 96: '#00ffff', 97: '#ffffff',
    },
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    colors: {
      // Standard (30-37)
      30: '#010101', 31: '#de382b', 32: '#39b54a', 33: '#ffc706',
      34: '#006fb8', 35: '#762671', 36: '#2cb5e9', 37: '#cccccc',
      // Bright (90-97)
      90: '#808080', 91: '#ff0000', 92: '#00ff00', 93: '#ffff00',
      94: '#0000ff', 95: '#ff00ff', 96: '#00ffff', 97: '#ffffff',
    },
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    colors: {
      // Standard (30-37)
      30: '#000000', 31: '#cd0000', 32: '#00cd00', 33: '#cdcd00',
      34: '#0000ee', 35: '#cd00cd', 36: '#00cdcd', 37: '#e5e5e5',
      // Bright (90-97)
      90: '#000000', 91: '#ff0000', 92: '#00ff00', 93: '#ffff00',
      94: '#5c5cff', 95: '#ff00ff', 96: '#00ffff', 97: '#ffffff',
    },
  },
];

/** Get palette by ID, defaulting to xterm */
export function getTerminalPalette(id: string): TerminalPalette {
  return TERMINAL_PALETTES.find((p) => p.id === id) || TERMINAL_PALETTES[0];
}

/** Build foreground color map from palette */
function buildColorMap(palette: TerminalPalette): Record<number, string> {
  return palette.colors;
}

/** Build background color map from palette (codes 40-47, 100-107) */
function buildBgColorMap(palette: TerminalPalette): Record<number, string> {
  const bgColors: Record<number, string> = {};
  // Map foreground codes to background codes
  for (const [code, color] of Object.entries(palette.colors)) {
    const fgCode = parseInt(code, 10);
    if (fgCode >= 30 && fgCode <= 37) {
      bgColors[fgCode + 10] = color; // 40-47
    } else if (fgCode >= 90 && fgCode <= 97) {
      bgColors[fgCode + 10] = color; // 100-107
    }
  }
  return bgColors;
}


/** Convert 256-color index to RGB hex */
function color256ToHex(n: number, palette: TerminalPalette): string {
  if (n < 16) {
    // Standard colors - use palette
    const colors = buildColorMap(palette);
    if (n < 8) {
      return colors[30 + n] || '#ffffff';
    } else {
      return colors[90 + (n - 8)] || '#ffffff';
    }
  } else if (n < 232) {
    // 216-color cube (6x6x6)
    n -= 16;
    const r = Math.floor(n / 36);
    const g = Math.floor((n % 36) / 6);
    const b = n % 6;
    const toHex = (v: number) =>
      Math.round(v * 255 / 5)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } else {
    // Grayscale (24 shades)
    const gray = Math.round((n - 232) * 255 / 23);
    const hex = gray.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  }
}

/** Style state while parsing */
interface StyleState {
  color?: string;
  bgColor?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

/**
 * Darken a hex color by a factor (0-1, where 0.5 = 50% darker)
 */
function darkenColor(hex: string, factor: number): string {
  // Remove # if present
  const color = hex.replace('#', '');
  const r = Math.round(parseInt(color.slice(0, 2), 16) * (1 - factor));
  const g = Math.round(parseInt(color.slice(2, 4), 16) * (1 - factor));
  const b = Math.round(parseInt(color.slice(4, 6), 16) * (1 - factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Convert style state to CSS string */
function styleToCss(state: StyleState, defaultFg: string): string {
  const parts: string[] = [];

  // Handle dim: darken the color by 50%
  // In real terminals, dim reduces intensity rather than using opacity
  if (state.dim) {
    const baseColor = state.color || defaultFg;
    parts.push(`color:${darkenColor(baseColor, 0.5)}`);
  } else if (state.color) {
    parts.push(`color:${state.color}`);
  }

  if (state.bgColor) parts.push(`background-color:${state.bgColor}`);
  if (state.bold) parts.push('font-weight:bold');
  if (state.italic) parts.push('font-style:italic');
  if (state.underline) parts.push('text-decoration:underline');
  if (state.strikethrough) {
    if (state.underline) {
      parts.pop();
      parts.push('text-decoration:underline line-through');
    } else {
      parts.push('text-decoration:line-through');
    }
  }

  return parts.join(';');
}

/** Check if style state has any active styles */
function hasStyles(state: StyleState): boolean {
  return !!(
    state.color ||
    state.bgColor ||
    state.bold ||
    state.dim ||
    state.italic ||
    state.underline ||
    state.strikethrough
  );
}

/** Parse SGR (Select Graphic Rendition) parameters */
function parseSGR(
  params: number[],
  state: StyleState,
  fgColors: Record<number, string>,
  bgColors: Record<number, string>,
  palette: TerminalPalette
): void {
  let i = 0;
  while (i < params.length) {
    const code = params[i];

    switch (code) {
      case 0: // Reset
        delete state.color;
        delete state.bgColor;
        delete state.bold;
        delete state.dim;
        delete state.italic;
        delete state.underline;
        delete state.strikethrough;
        break;

      case 1: // Bold
        state.bold = true;
        break;

      case 2: // Dim
        state.dim = true;
        break;

      case 3: // Italic
        state.italic = true;
        break;

      case 4: // Underline
        state.underline = true;
        break;

      case 9: // Strikethrough
        state.strikethrough = true;
        break;

      case 22: // Normal intensity (not bold or dim)
        delete state.bold;
        delete state.dim;
        break;

      case 23: // Not italic
        delete state.italic;
        break;

      case 24: // Not underlined
        delete state.underline;
        break;

      case 29: // Not strikethrough
        delete state.strikethrough;
        break;

      case 38: // Set foreground color
        if (params[i + 1] === 5 && params[i + 2] !== undefined) {
          // 256-color mode: ESC[38;5;Nm
          state.color = color256ToHex(params[i + 2], palette);
          i += 2;
        } else if (
          params[i + 1] === 2 &&
          params[i + 2] !== undefined &&
          params[i + 3] !== undefined &&
          params[i + 4] !== undefined
        ) {
          // Truecolor mode: ESC[38;2;R;G;Bm
          const r = params[i + 2].toString(16).padStart(2, '0');
          const g = params[i + 3].toString(16).padStart(2, '0');
          const b = params[i + 4].toString(16).padStart(2, '0');
          state.color = `#${r}${g}${b}`;
          i += 4;
        }
        break;

      case 39: // Default foreground color
        delete state.color;
        break;

      case 48: // Set background color
        if (params[i + 1] === 5 && params[i + 2] !== undefined) {
          // 256-color mode
          state.bgColor = color256ToHex(params[i + 2], palette);
          i += 2;
        } else if (
          params[i + 1] === 2 &&
          params[i + 2] !== undefined &&
          params[i + 3] !== undefined &&
          params[i + 4] !== undefined
        ) {
          // Truecolor mode
          const r = params[i + 2].toString(16).padStart(2, '0');
          const g = params[i + 3].toString(16).padStart(2, '0');
          const b = params[i + 4].toString(16).padStart(2, '0');
          state.bgColor = `#${r}${g}${b}`;
          i += 4;
        }
        break;

      case 49: // Default background color
        delete state.bgColor;
        break;

      default:
        // Standard foreground colors (30-37, 90-97)
        if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
          state.color = fgColors[code];
        }
        // Standard background colors (40-47, 100-107)
        else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
          state.bgColor = bgColors[code];
        }
        break;
    }
    i++;
  }
}

/** Escape HTML special characters */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert ANSI-escaped text to HTML with inline styles
 *
 * @param ansi - Text with ANSI escape sequences
 * @param terminalId - Terminal palette ID (default: 'xterm')
 * @returns HTML string with spans containing inline styles
 */
export function ansiToHtml(ansi: string, terminalId?: string): string {
  // Get the terminal palette
  const palette = getTerminalPalette(terminalId || 'xterm');
  const fgColors = buildColorMap(palette);
  const bgColors = buildBgColorMap(palette);

  // Default foreground is "white" (code 37) from the palette
  const defaultFg = fgColors[37] || '#e5e5e5';

  // Match ANSI escape sequences: ESC[ followed by params and ending with 'm'
  const ansiRegex = /\x1b\[([0-9;]*)m/g;

  const state: StyleState = {};
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ansiRegex.exec(ansi)) !== null) {
    // Add text before this escape sequence
    const textBefore = ansi.slice(lastIndex, match.index);
    if (textBefore) {
      const escapedText = escapeHtml(textBefore);
      if (hasStyles(state)) {
        result += `<span style="${styleToCss(state, defaultFg)}">${escapedText}</span>`;
      } else {
        result += escapedText;
      }
    }

    // Parse the escape sequence parameters
    const paramStr = match[1] || '0';
    const params = paramStr.split(';').map((p) => parseInt(p, 10) || 0);
    parseSGR(params, state, fgColors, bgColors, palette);

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last escape sequence
  const remaining = ansi.slice(lastIndex);
  if (remaining) {
    const escapedText = escapeHtml(remaining);
    if (hasStyles(state)) {
      result += `<span style="${styleToCss(state, defaultFg)}">${escapedText}</span>`;
    } else {
      result += escapedText;
    }
  }

  return result;
}

/**
 * Strip ANSI escape sequences from text
 *
 * @param ansi - Text with ANSI escape sequences
 * @returns Plain text without escape sequences
 */
export function stripAnsi(ansi: string): string {
  return ansi.replace(/\x1b\[[0-9;]*m/g, '');
}
