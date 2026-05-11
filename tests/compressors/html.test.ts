import { describe, it, expect } from 'vitest';
import { compressHtml } from '../../src/compressors/html';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', 'fixtures');

describe('HTML Compressor', () => {
  it('should convert basic HTML to Markdown', () => {
    const html = '<h1>Hello World</h1><p>This is a paragraph.</p>';
    const result = compressHtml(html);

    expect(result).toContain('Hello World');
    expect(result).toContain('This is a paragraph.');
    expect(result).not.toContain('<h1>');
    expect(result).not.toContain('<p>');
  });

  it('should remove script tags', () => {
    const html = `
      <div>
        <p>Content</p>
        <script>alert('evil');</script>
      </div>
    `;
    const result = compressHtml(html);

    expect(result).toContain('Content');
    expect(result).not.toContain('alert');
    expect(result).not.toContain('script');
  });

  it('should remove style tags', () => {
    const html = `
      <div>
        <style>.foo { color: red; }</style>
        <p>Visible content</p>
      </div>
    `;
    const result = compressHtml(html);

    expect(result).toContain('Visible content');
    expect(result).not.toContain('color: red');
  });

  it('should remove navigation elements', () => {
    const html = `
      <nav><a href="/">Home</a><a href="/about">About</a></nav>
      <main><p>Main content here</p></main>
    `;
    const result = compressHtml(html);

    expect(result).toContain('Main content here');
  });

  it('should preserve links when option is true', () => {
    const html = '<a href="https://example.com">Click here</a>';
    const result = compressHtml(html, { preserveLinks: true });

    expect(result).toContain('https://example.com');
    expect(result).toContain('Click here');
  });

  it('should remove links when option is false', () => {
    const html = '<a href="https://example.com">Click here</a>';
    const result = compressHtml(html, { preserveLinks: false });

    expect(result).toContain('Click here');
    expect(result).not.toContain('https://example.com');
  });

  it('should extract content from specific selector', () => {
    const html = `
      <div id="sidebar">Sidebar content</div>
      <article id="main">Article content</article>
    `;
    const result = compressHtml(html, { selector: '#main' });

    expect(result).toContain('Article content');
  });

  it('should handle the sample HTML fixture', () => {
    const html = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.html'), 'utf-8');
    const result = compressHtml(html);

    // Should contain main content
    expect(result).toContain('Token Optimization');
    expect(result).toContain('Key Strategies');

    // Should not contain noise
    expect(result).not.toContain('analytics');
    expect(result).not.toContain('cookie');
    expect(result).not.toContain('<script');

    // Should be significantly shorter
    expect(result.length).toBeLessThan(html.length * 0.5);
  });

  it('should remove excessive blank lines', () => {
    const html = '<p>Line 1</p><br><br><br><br><br><p>Line 2</p>';
    const result = compressHtml(html);

    // Should not have more than 2 consecutive newlines
    expect(result).not.toMatch(/\n{3,}/);
  });
});
