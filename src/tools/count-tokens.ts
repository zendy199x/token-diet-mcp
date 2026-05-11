/**
 * Tool: count_tokens
 * Count tokens and estimate cost for different AI models.
 */

import { z } from 'zod';
import { countTokens, type ModelFamily } from '../tokenizer/counter.js';

export const countTokensSchema = z.object({
  content: z.string().describe('The content to count tokens for'),
  model: z
    .enum(['gpt-4o', 'gpt-4', 'gpt-3.5', 'claude'])
    .optional()
    .default('gpt-4o')
    .describe('Model family for token counting and cost estimation'),
});

export type CountTokensInput = z.infer<typeof countTokensSchema>;

export function countTokensTool(input: CountTokensInput) {
  const { content, model } = input;

  const result = countTokens(content, model as ModelFamily);

  // Also calculate for all models for comparison
  const allModels = (['gpt-4o', 'gpt-4', 'gpt-3.5', 'claude'] as ModelFamily[]).map((m) => {
    const r = countTokens(content, m);
    return {
      model: m,
      tokens: r.tokens,
      estimatedCostUsd: r.estimatedCostUsd,
    };
  });

  const summaryLines = [
    `📊 Token Count Report`,
    `═══════════════════════════════`,
    `Content length: ${content.length} characters`,
    `Tokens (${model}): ${result.tokens}`,
    `Estimated cost: $${result.estimatedCostUsd.toFixed(6)}`,
    ``,
    `💰 Cost comparison across models:`,
    ...allModels.map(
      (m) => `  ${m.model.padEnd(10)} │ ${String(m.tokens).padStart(8)} tokens │ $${m.estimatedCostUsd.toFixed(6)}`,
    ),
  ];

  return {
    content: [
      {
        type: 'text' as const,
        text: summaryLines.join('\n'),
      },
    ],
    _meta: {
      tokens: result.tokens,
      model: result.model,
      estimatedCostUsd: result.estimatedCostUsd,
      allModels,
    },
  };
}
