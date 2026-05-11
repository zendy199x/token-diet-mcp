import { describe, it, expect } from 'vitest';
import { optimizeContent } from '../../src/tools/optimize-content';

describe('optimize_content tool', () => {
  it('should auto-detect HTML and compress', () => {
    const html = '<!DOCTYPE html><html><body><script>alert(1)</script><p>Hello</p></body></html>';
    const result = optimizeContent({ content: html });
    expect(result._meta?.detectedType).toBe('html');
    expect(result._meta?.savingsPercent).toBeGreaterThan(0);
    expect(result.content[0].text).toContain('Hello');
    expect(result.content[0].text).not.toContain('alert');
  });

  it('should auto-detect JSON and compress', () => {
    const json = JSON.stringify({ name: 'John', age: 30, active: true }, null, 4);
    const result = optimizeContent({ content: json });
    expect(result._meta?.detectedType).toBe('json');
    expect(result.content[0].text.length).toBeLessThan(json.length);
  });

  it('should use hint when provided', () => {
    const code = 'const x = 1; // comment\nconst y = 2;';
    const result = optimizeContent({ content: code, hint: 'code' });
    expect(result._meta?.detectedType).toBe('code');
  });

  it('should report savings statistics', () => {
    const html = '<div class="container"><div class="row"><div class="col"><p>Text</p></div></div></div>';
    const result = optimizeContent({ content: html, hint: 'html' });
    expect(result._meta?.originalTokens).toBeGreaterThan(0);
    expect(result._meta?.optimizedTokens).toBeGreaterThan(0);
    expect(result._meta?.savingsPercent).toBeGreaterThanOrEqual(0);
  });
});
