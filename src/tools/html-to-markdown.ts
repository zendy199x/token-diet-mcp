/**
 * Tool: html_to_markdown
 * Converts HTML content to clean, token-efficient Markdown.
 */

import { z } from 'zod';
import { compressHtml } from '../compressors/html.js';
import { calculateSavings } from '../tokenizer/counter.js';

export const htmlToMarkdownSchema = z.object({
  html: z.string().describe('HTML content to convert to Markdown'),
  preserve_links: z.boolean().optional().default(true).describe('Keep hyperlink URLs in output'),
  preserve_images: z
    .boolean()
    .optional()
    .default(false)
    .describe('Keep image references in output'),
  selector: z
    .string()
    .optional()
    .describe('CSS selector to extract specific content (e.g., "main", "#content", "article")'),
});

export type HtmlToMarkdownInput = z.infer<typeof htmlToMarkdownSchema>;

export function htmlToMarkdown(input: HtmlToMarkdownInput) {
  const { html, preserve_links, preserve_images, selector } = input;

  const markdown = compressHtml(html, {
    preserveLinks: preserve_links,
    preserveImages: preserve_images,
    selector,
  });

  const savings = calculateSavings(html, markdown);

  return {
    content: [
      {
        type: 'text' as const,
        text: markdown,
      },
    ],
    _meta: {
      originalTokens: savings.originalTokens,
      optimizedTokens: savings.optimizedTokens,
      savingsPercent: savings.savingsPercent,
      savedTokens: savings.savedTokens,
    },
  };
}
