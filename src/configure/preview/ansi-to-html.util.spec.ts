/**
 * Tests for ANSI to HTML converter
 */

import { describe, it, expect } from 'vitest';

import { ansiToHtml, stripAnsi } from './ansi-to-html.util.js';

describe('ansiToHtml', () => {
  it('should return plain text unchanged', () => {
    expect(ansiToHtml('hello world')).toBe('hello world');
  });

  it('should escape HTML entities', () => {
    expect(ansiToHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should convert bold text', () => {
    const ansi = '\x1b[1mbold\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="font-weight:bold">bold</span>');
  });

  it('should convert dim text', () => {
    const ansi = '\x1b[2mdim\x1b[0m';
    // Dim darkens the default foreground color (#e5e5e5 in xterm) by 50%
    // 0xe5 * 0.5 = 114.5 -> 115 = 0x73
    expect(ansiToHtml(ansi)).toBe('<span style="color:#737373">dim</span>');
  });

  it('should convert italic text', () => {
    const ansi = '\x1b[3mitalic\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="font-style:italic">italic</span>');
  });

  it('should convert underline text', () => {
    const ansi = '\x1b[4munderline\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="text-decoration:underline">underline</span>');
  });

  it('should convert red foreground color', () => {
    const ansi = '\x1b[31mred\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="color:#cd0000">red</span>');
  });

  it('should convert green foreground color', () => {
    const ansi = '\x1b[32mgreen\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="color:#00cd00">green</span>');
  });

  it('should convert background colors', () => {
    const ansi = '\x1b[41mred bg\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="background-color:#cd0000">red bg</span>');
  });

  it('should handle 256-color mode', () => {
    // Color 196 is bright red in 256-color palette
    const ansi = '\x1b[38;5;196mbright red\x1b[0m';
    const result = ansiToHtml(ansi);
    expect(result).toContain('color:');
    expect(result).toContain('bright red');
  });

  it('should handle combined styles', () => {
    const ansi = '\x1b[1;31mbold red\x1b[0m';
    const result = ansiToHtml(ansi);
    expect(result).toContain('font-weight:bold');
    expect(result).toContain('color:#cd0000');
  });

  it('should handle bright colors', () => {
    const ansi = '\x1b[91mbright red\x1b[0m';
    expect(ansiToHtml(ansi)).toBe('<span style="color:#ff0000">bright red</span>');
  });

  it('should handle text before and after ANSI codes', () => {
    const ansi = 'before \x1b[32mgreen\x1b[0m after';
    expect(ansiToHtml(ansi)).toBe('before <span style="color:#00cd00">green</span> after');
  });

  it('should handle multiple colored segments', () => {
    const ansi = '\x1b[31mred\x1b[0m and \x1b[32mgreen\x1b[0m';
    expect(ansiToHtml(ansi)).toBe(
      '<span style="color:#cd0000">red</span> and <span style="color:#00cd00">green</span>'
    );
  });

  it('should handle reset in the middle', () => {
    const ansi = '\x1b[1mbold\x1b[0m normal';
    expect(ansiToHtml(ansi)).toBe('<span style="font-weight:bold">bold</span> normal');
  });
});

describe('stripAnsi', () => {
  it('should return plain text unchanged', () => {
    expect(stripAnsi('hello world')).toBe('hello world');
  });

  it('should strip ANSI codes', () => {
    const ansi = '\x1b[31mred\x1b[0m';
    expect(stripAnsi(ansi)).toBe('red');
  });

  it('should strip multiple ANSI codes', () => {
    const ansi = '\x1b[1;31mbold red\x1b[0m and \x1b[32mgreen\x1b[0m';
    expect(stripAnsi(ansi)).toBe('bold red and green');
  });
});
