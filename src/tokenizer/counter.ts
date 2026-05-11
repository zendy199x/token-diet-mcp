/**
 * Token counting utility using gpt-tokenizer.
 * Provides token counting for multiple model families.
 */

import { encode } from 'gpt-tokenizer';

export type ModelFamily = 'gpt-4o' | 'gpt-4' | 'gpt-3.5' | 'claude';

/** Approximate cost per 1M input tokens (USD) */
const COST_PER_MILLION_INPUT: Record<ModelFamily, number> = {
  'gpt-4o': 2.5,
  'gpt-4': 30.0,
  'gpt-3.5': 0.5,
  claude: 3.0, // Claude Sonnet approximate
};

export interface TokenCountResult {
  tokens: number;
  model: ModelFamily;
  estimatedCostUsd: number;
}

/**
 * Count the number of tokens in a string.
 * Uses GPT tokenizer as a reasonable cross-model approximation.
 */
export function countTokens(content: string, model: ModelFamily = 'gpt-4o'): TokenCountResult {
  const tokens = encode(content).length;
  const costPerToken = COST_PER_MILLION_INPUT[model] / 1_000_000;
  const estimatedCostUsd = Math.round(tokens * costPerToken * 1_000_000) / 1_000_000;

  return {
    tokens,
    model,
    estimatedCostUsd,
  };
}

/**
 * Calculate token savings between original and optimized content.
 */
export function calculateSavings(
  originalContent: string,
  optimizedContent: string,
  model: ModelFamily = 'gpt-4o',
) {
  const original = countTokens(originalContent, model);
  const optimized = countTokens(optimizedContent, model);
  const savedTokens = original.tokens - optimized.tokens;
  const savingsPercent =
    original.tokens > 0 ? Math.round((savedTokens / original.tokens) * 10000) / 100 : 0;

  return {
    originalTokens: original.tokens,
    optimizedTokens: optimized.tokens,
    savedTokens,
    savingsPercent,
    originalCostUsd: original.estimatedCostUsd,
    optimizedCostUsd: optimized.estimatedCostUsd,
    savedCostUsd:
      Math.round((original.estimatedCostUsd - optimized.estimatedCostUsd) * 1_000_000) /
      1_000_000,
  };
}
