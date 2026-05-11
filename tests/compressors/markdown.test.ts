import { describe, it, expect } from 'vitest';
import { optimizeMarkdown } from '../../src/compressors/markdown';

describe('Markdown Optimizer', () => {
  it('should collapse excessive blank lines', () => {
    const md = '# Title\n\n\n\n\nParagraph';
    const result = optimizeMarkdown(md);
    expect(result).toBe('# Title\n\nParagraph');
  });

  it('should remove trailing whitespace', () => {
    const md = '# Title   \nParagraph  ';
    const result = optimizeMarkdown(md);
    expect(result).not.toMatch(/\s+$/m);
  });

  it('should normalize horizontal rules', () => {
    const md = 'Above\n\n----------\n\nBelow';
    const result = optimizeMarkdown(md);
    expect(result).toContain('---');
    expect(result).not.toContain('----------');
  });

  it('should remove images when option is set', () => {
    const md = 'Text before ![alt](img.png) text after';
    const result = optimizeMarkdown(md, { removeImages: true });
    expect(result).not.toContain('img.png');
    expect(result).toContain('Text before');
  });

  it('should simplify links when option is set', () => {
    const md = 'Visit [Google](https://google.com) for more';
    const result = optimizeMarkdown(md, { removeLinks: true });
    expect(result).toContain('Google');
    expect(result).not.toContain('https://google.com');
  });

  it('should remove HTML tags when option is set', () => {
    const md = '# Title\n\n<div class="note">Note</div>';
    const result = optimizeMarkdown(md, { removeHtml: true });
    expect(result).toContain('Note');
    expect(result).not.toContain('<div');
  });

  it('should handle complex markdown without errors', () => {
    const md = '# Main\n\n## Section\n\nText **bold** *italic*.\n\n- Item 1\n- Item 2\n\n---\n\n> Quote';
    const result = optimizeMarkdown(md);
    expect(result).toContain('# Main');
    expect(result).toContain('## Section');
    expect(result.length).toBeLessThanOrEqual(md.length);
  });
});
