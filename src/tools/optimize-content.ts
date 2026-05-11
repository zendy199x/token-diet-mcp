/**
 * Tool: optimize_content
 * Auto-detects content type and applies the best compression strategy.
 */

import { z } from 'zod';
import { compressHtml } from '../compressors/html.js';
import { compressCode } from '../compressors/code.js';
import { compressJson } from '../compressors/json.js';
import { optimizeMarkdown } from '../compressors/markdown.js';
import { calculateSavings } from '../tokenizer/counter.js';
import { detectContentType, type ContentType } from '../utils/detect-language.js';

export const optimizeContentSchema = z.object({
  content: z.string().describe('The content to optimize'),
  hint: z
    .enum(['html', 'code', 'json', 'markdown'])
    .optional()
    .describe('Content type hint. If not provided, auto-detection is used.'),
});

export type OptimizeContentInput = z.infer<typeof optimizeContentSchema>;

export function optimizeContent(input: OptimizeContentInput) {
  const { content, hint } = input;
  const contentType: ContentType = hint || detectContentType(content);

  let optimized: string;

  switch (contentType) {
    case 'html':
      optimized = compressHtml(content);
      break;
    case 'code':
      optimized = compressCode(content, { level: 'medium' });
      break;
    case 'json':
      optimized = compressJson(content);
      break;
    case 'markdown':
      optimized = optimizeMarkdown(content);
      break;
    default:
      // Plain text — just basic cleanup
      optimized = content.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
      break;
  }

  const savings = calculateSavings(content, optimized);

  return {
    content: [
      {
        type: 'text' as const,
        text: optimized,
      },
    ],
    _meta: {
      detectedType: contentType,
      originalTokens: savings.originalTokens,
      optimizedTokens: savings.optimizedTokens,
      savingsPercent: savings.savingsPercent,
      savedTokens: savings.savedTokens,
    },
  };
}
