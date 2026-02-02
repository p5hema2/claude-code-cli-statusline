/**
 * ANSI color type definitions
 *
 * Defines the supported color values for widget customization.
 * These map directly to chalk's color methods.
 */

/** Standard ANSI colors supported by chalk */
export type AnsiColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'grey'
  | 'blackBright'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';

/** Text modifiers supported by chalk */
export type AnsiModifier = 'dim' | 'bold' | 'italic' | 'underline';

/** Combined type for any valid color or modifier value */
export type ColorValue = AnsiColor | AnsiModifier;

/** All valid color values for validation */
export const VALID_COLORS: readonly ColorValue[] = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
  'dim',
  'bold',
  'italic',
  'underline',
] as const;

/**
 * Check if a value is a valid ColorValue
 */
export function isValidColor(value: unknown): value is ColorValue {
  return typeof value === 'string' && VALID_COLORS.includes(value as ColorValue);
}
