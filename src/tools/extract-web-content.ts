/**
 * Tool: extract_web_content
 * Fetches a web page and extracts clean, token-efficient content.
 */

import { z } from 'zod';
import { compressHtml } from '../compressors/html.js';
import { calculateSavings } from '../tokenizer/counter.js';

export const extractWebContentSchema = z.object({
  url: z.string().url().describe('URL of the web page to extract content from'),
  selector: z
    .string()
    .optional()
    .describe('CSS selector to extract specific section (e.g., "article", "#main-content")'),
});

export type ExtractWebContentInput = z.infer<typeof extractWebContentSchema>;

export async function extractWebContent(input: ExtractWebContentInput) {
  const { url, selector } = input;

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; TokenDietMCP/1.0; +https://github.com/zendy199x/token-diet-mcp)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: HTTP ${response.status} ${response.statusText} for ${url}`,
          },
        ],
        isError: true,
      };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Compress HTML to Markdown
    const markdown = compressHtml(html, {
      preserveLinks: true,
      preserveImages: false,
      selector,
    });

    const savings = calculateSavings(html, markdown);

    const output = [`# ${title}`, `> Source: ${url}`, '', markdown].join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: output,
        },
      ],
      _meta: {
        url,
        title,
        originalTokens: savings.originalTokens,
        optimizedTokens: savings.optimizedTokens,
        savingsPercent: savings.savingsPercent,
        savedTokens: savings.savedTokens,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching ${url}: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
