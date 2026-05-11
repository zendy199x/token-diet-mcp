import { describe, it, expect } from 'vitest';
import { compressJson } from '../../src/compressors/json';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FIXTURES_DIR = path.join(import.meta.dirname, '..', 'fixtures');

describe('JSON Compressor', () => {
  it('should minify JSON by removing whitespace', () => {
    const json = JSON.stringify({ name: 'John', age: 30 }, null, 2);
    const result = compressJson(json);

    expect(result).toBe('{"name":"John","age":30}');
  });

  it('should remove null values when option is set', () => {
    const json = JSON.stringify({ name: 'John', nickname: null, age: 30 });
    const result = compressJson(json, { removeNulls: true });

    const parsed = JSON.parse(result);
    expect(parsed).not.toHaveProperty('nickname');
    expect(parsed).toHaveProperty('name', 'John');
  });

  it('should truncate long arrays', () => {
    const data = { items: Array.from({ length: 100 }, (_, i) => i) };
    const json = JSON.stringify(data);
    const result = compressJson(json, { maxArrayLength: 5 });

    const parsed = JSON.parse(result);
    expect(parsed.items).toHaveLength(6); // 5 items + message
    expect(parsed.items[5]).toContain('95 more items');
  });

  it('should handle deeply nested objects', () => {
    const deep = { a: { b: { c: { d: { e: { f: 'deep' } } } } } };
    const json = JSON.stringify(deep);
    const result = compressJson(json, { maxDepth: 3 });

    const parsed = JSON.parse(result);
    expect(parsed.a.b.c).toBeDefined();
  });

  it('should handle the sample JSON fixture', () => {
    const json = fs.readFileSync(path.join(FIXTURES_DIR, 'sample.json'), 'utf-8');
    const result = compressJson(json);

    // Should be valid JSON
    expect(() => JSON.parse(result)).not.toThrow();

    // Should be shorter (minified)
    expect(result.length).toBeLessThan(json.length);

    // Should preserve data
    const parsed = JSON.parse(result);
    expect(parsed.users).toHaveLength(2);
    expect(parsed.users[0].name).toBe('John Doe');
  });

  it('should handle invalid JSON gracefully', () => {
    const invalid = 'not json { broken';
    const result = compressJson(invalid);

    // Should return simplified version without crashing
    expect(result).toBeDefined();
  });
});
