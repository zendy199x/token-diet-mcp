/**
 * Tool: compress_code
 * Language-aware code compression with configurable levels.
 */

import { z } from 'zod';
import { compressCode as compressCodeEngine } from '../compressors/code.js';
import { calculateSavings } from '../tokenizer/counter.js';

export const compressCodeSchema = z.object({
  code: z.string().describe('Source code to compress'),
  language: z
    .string()
    .optional()
    .describe(
      'Programming language (e.g., "typescript", "python", "java"). Auto-detected if not specified.',
    ),
  level: z
    .enum(['light', 'medium', 'aggressive'])
    .optional()
    .default('medium')
    .describe(
      'Compression level: light (whitespace only), medium (+ comments), aggressive (+ type annotations)',
    ),
});

export type CompressCodeInput = z.infer<typeof compressCodeSchema>;

export function compressCodeTool(input: CompressCodeInput) {
  const { code, language, level } = input;

  const compressed = compressCodeEngine(code, { language, level });
  const savings = calculateSavings(code, compressed);

  return {
    content: [
      {
        type: 'text' as const,
        text: compressed,
      },
    ],
    _meta: {
      language: language || 'auto',
      level,
      originalTokens: savings.originalTokens,
      optimizedTokens: savings.optimizedTokens,
      savingsPercent: savings.savingsPercent,
      savedTokens: savings.savedTokens,
    },
  };
}
