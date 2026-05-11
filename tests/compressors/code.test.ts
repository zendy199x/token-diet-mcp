import { describe, it, expect } from 'vitest';
import { compressCode } from '../../src/compressors/code';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', 'fixtures');

describe('Code Compressor', () => {
  describe('light level', () => {
    it('should remove trailing whitespace', () => {
      const code = 'const x = 1;   \nconst y = 2;  \n';
      const result = compressCode(code, { level: 'light' });

      expect(result).toBe('const x = 1;\nconst y = 2;');
    });

    it('should collapse excessive blank lines', () => {
      const code = 'line 1\n\n\n\n\nline 2';
      const result = compressCode(code, { level: 'light' });

      expect(result).toBe('line 1\n\nline 2');
    });

    it('should preserve comments in light mode', () => {
      const code = '// This is a comment\nconst x = 1;';
      const result = compressCode(code, { level: 'light', language: 'typescript' });

      expect(result).toContain('// This is a comment');
    });
  });

  describe('medium level', () => {
    it('should remove single-line comments', () => {
      const code = '// This is a comment\nconst x = 1;\n// Another comment\nconst y = 2;';
      const result = compressCode(code, { level: 'medium', language: 'typescript' });

      expect(result).not.toContain('// This is a comment');
      expect(result).not.toContain('// Another comment');
      expect(result).toContain('const x = 1;');
      expect(result).toContain('const y = 2;');
    });

    it('should remove block comments', () => {
      const code = '/* Block comment */\nconst x = 1;';
      const result = compressCode(code, { level: 'medium', language: 'typescript' });

      expect(result).not.toContain('Block comment');
      expect(result).toContain('const x = 1;');
    });

    it('should preserve JSDoc comments', () => {
      const code = '/** @param {string} name */\nfunction greet(name) {}';
      const result = compressCode(code, { level: 'medium', language: 'typescript' });

      expect(result).toContain('/** @param {string} name */');
    });

    it('should remove Python comments', () => {
      const code = '# This is a comment\nx = 1\n# Another one\ny = 2';
      const result = compressCode(code, { level: 'medium', language: 'python' });

      expect(result).not.toContain('# This is a comment');
      expect(result).toContain('x = 1');
    });

    it('should remove SQL comments', () => {
      const code = '-- Select all users\nSELECT * FROM users;';
      const result = compressCode(code, { level: 'medium', language: 'sql' });

      expect(result).not.toContain('-- Select all users');
      expect(result).toContain('SELECT * FROM users;');
    });
  });

  describe('aggressive level', () => {
    it('should remove all blank lines', () => {
      const code = 'const x = 1;\n\nconst y = 2;\n\nconst z = 3;';
      const result = compressCode(code, { level: 'aggressive', language: 'typescript' });

      expect(result).not.toMatch(/\n\n/);
    });

    it('should simplify void return types', () => {
      const code = 'const fn = (): void => { console.log("hi"); };';
      const result = compressCode(code, { level: 'aggressive', language: 'typescript' });

      expect(result).not.toContain(': void =>');
      expect(result).toContain(') =>');
    });
  });

  it('should handle the TypeScript fixture file', () => {
    const code = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.ts'), 'utf-8');
    const result = compressCode(code, { level: 'medium', language: 'typescript' });

    // Should keep functional code
    expect(result).toContain('async create');
    expect(result).toContain('async findAll');
    expect(result).toContain('async findOne');

    // Should remove inline comments
    expect(result).not.toContain('// Validate email format');
    expect(result).not.toContain('// Hash the password before saving');

    // Should be shorter
    expect(result.length).toBeLessThan(code.length);
  });
});
