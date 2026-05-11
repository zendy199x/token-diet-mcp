/**
 * Tool: smart_read_file
 * Reads a file and returns compressed content based on file type.
 */

import { z } from 'zod';
import * as fs from 'node:fs';
import { compressHtml } from '../compressors/html.js';
import { compressCode } from '../compressors/code.js';
import { compressJson } from '../compressors/json.js';
import { optimizeMarkdown } from '../compressors/markdown.js';
import { calculateSavings } from '../tokenizer/counter.js';
import {
  detectContentTypeFromPath,
  detectLanguageFromPath,
  type ContentType,
} from '../utils/detect-language.js';

export const smartReadFileSchema = z.object({
  path: z.string().describe('Absolute path to the file to read'),
  level: z
    .enum(['light', 'medium', 'aggressive'])
    .optional()
    .default('medium')
    .describe('Compression level'),
});

export type SmartReadFileInput = z.infer<typeof smartReadFileSchema>;

export function smartReadFile(input: SmartReadFileInput) {
  const { path: filePath, level } = input;

  // Validate file exists
  if (!fs.existsSync(filePath)) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: File not found: ${filePath}`,
        },
      ],
      isError: true,
    };
  }

  // Read file
  const originalContent = fs.readFileSync(filePath, 'utf-8');
  const contentType: ContentType = detectContentTypeFromPath(filePath);
  const language = detectLanguageFromPath(filePath);

  let optimized: string;

  switch (contentType) {
    case 'html':
      optimized = compressHtml(originalContent);
      break;
    case 'code':
      optimized = compressCode(originalContent, { language, level });
      break;
    case 'json':
      optimized = compressJson(originalContent);
      break;
    case 'markdown':
      optimized = optimizeMarkdown(originalContent);
      break;
    default:
      optimized = originalContent.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
      break;
  }

  const savings = calculateSavings(originalContent, optimized);

  return {
    content: [
      {
        type: 'text' as const,
        text: optimized,
      },
    ],
    _meta: {
      filePath,
      contentType,
      language,
      level,
      originalTokens: savings.originalTokens,
      optimizedTokens: savings.optimizedTokens,
      savingsPercent: savings.savingsPercent,
      savedTokens: savings.savedTokens,
    },
  };
}
