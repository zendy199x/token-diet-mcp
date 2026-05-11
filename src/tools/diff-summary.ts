/**
 * Tool: diff_summary
 * Creates a compact diff representation to reduce tokens when comparing files.
 */

import { z } from 'zod';
import { createPatch } from 'diff';
import { calculateSavings } from '../tokenizer/counter.js';

export const diffSummarySchema = z.object({
  original: z.string().describe('Original content'),
  modified: z.string().describe('Modified content'),
  context_lines: z
    .number()
    .optional()
    .default(3)
    .describe('Number of context lines around each change (default: 3)'),
  filename: z
    .string()
    .optional()
    .default('file')
    .describe('Filename for the diff header'),
});

export type DiffSummaryInput = z.infer<typeof diffSummarySchema>;

export function diffSummary(input: DiffSummaryInput) {
  const { original, modified, context_lines, filename } = input;

  // Generate unified diff
  const patch = createPatch(filename, original, modified, 'original', 'modified', {
    context: context_lines,
  });

  // Calculate savings: sending diff vs sending both full files
  const bothFiles = `--- Original ---\n${original}\n\n--- Modified ---\n${modified}`;
  const savings = calculateSavings(bothFiles, patch);

  // Count changes
  const additions = (patch.match(/^\+[^+]/gm) || []).length;
  const deletions = (patch.match(/^-[^-]/gm) || []).length;

  const summary = [
    `📝 Diff Summary: ${filename}`,
    `═══════════════════════════════`,
    `Additions: +${additions} lines`,
    `Deletions: -${deletions} lines`,
    `Token savings: ${savings.savingsPercent}% (${savings.savedTokens} tokens saved)`,
    ``,
    patch,
  ].join('\n');

  return {
    content: [
      {
        type: 'text' as const,
        text: summary,
      },
    ],
    _meta: {
      additions,
      deletions,
      originalTokens: savings.originalTokens,
      diffTokens: savings.optimizedTokens,
      savingsPercent: savings.savingsPercent,
      savedTokens: savings.savedTokens,
    },
  };
}
