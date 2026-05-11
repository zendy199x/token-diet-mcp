import { describe, it, expect } from 'vitest';
import { countTokensTool } from '../../src/tools/count-tokens';

describe('count_tokens tool', () => {
  it('should count tokens for content', () => {
    const result = countTokensTool({ content: 'Hello, World!', model: 'gpt-4o' });
    expect(result._meta?.tokens).toBeGreaterThan(0);
    expect(result._meta?.model).toBe('gpt-4o');
    expect(result._meta?.estimatedCostUsd).toBeGreaterThanOrEqual(0);
  });

  it('should provide comparison across all models', () => {
    const result = countTokensTool({ content: 'Test content', model: 'gpt-4o' });
    expect(result._meta?.allModels).toHaveLength(4);
    expect(result._meta?.allModels?.map((m: { model: string }) => m.model)).toEqual(
      expect.arrayContaining(['gpt-4o', 'gpt-4', 'gpt-3.5', 'claude']),
    );
  });

  it('should format readable output', () => {
    const result = countTokensTool({ content: 'Hello world', model: 'gpt-4o' });
    expect(result.content[0].text).toContain('Token Count Report');
    expect(result.content[0].text).toContain('Cost comparison');
  });

  it('should handle empty string', () => {
    const result = countTokensTool({ content: '', model: 'gpt-4o' });
    expect(result._meta?.tokens).toBe(0);
  });
});
