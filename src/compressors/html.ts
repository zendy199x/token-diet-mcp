/**
 * HTML to Markdown compressor.
 * Strips noise (scripts, styles, nav, ads) and converts to clean Markdown.
 */

import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

export interface HtmlCompressOptions {
  /** Preserve link URLs in output */
  preserveLinks?: boolean;
  /** Preserve image references in output */
  preserveImages?: boolean;
  /** CSS selector to extract specific content (e.g., "main", "#content") */
  selector?: string;
}

/** Tags to completely remove from HTML before conversion */
const NOISE_TAGS = [
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
  'canvas',
  'video',
  'audio',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'select',
  'textarea',
];

/** Tags commonly used for non-content areas */
const NON_CONTENT_SELECTORS = [
  'nav',
  'header:not(article header)',
  'footer:not(article footer)',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="complementary"]',
  '.sidebar',
  '.nav',
  '.menu',
  '.advertisement',
  '.ad',
  '.ads',
  '.cookie-banner',
  '.popup',
  '.modal',
  '#cookie-consent',
];

/**
 * Compress HTML content to clean Markdown.
 */
export function compressHtml(html: string, options: HtmlCompressOptions = {}): string {
  const { preserveLinks = true, preserveImages = false, selector } = options;

  // Load HTML into cheerio
  const $ = cheerio.load(html);

  // Remove noise tags
  NOISE_TAGS.forEach((tag) => $(tag).remove());

  // Remove non-content areas
  NON_CONTENT_SELECTORS.forEach((sel) => {
    try {
      $(sel).remove();
    } catch {
      // Invalid selector, skip
    }
  });

  // Remove hidden elements
  $('[style*="display:none"], [style*="display: none"], [hidden], .hidden, .d-none').remove();

  // Remove all HTML comments
  $('*')
    .contents()
    .filter(function () {
      return this.type === 'comment';
    })
    .remove();

  // Remove empty elements
  $('div, span, p').each(function () {
    if ($(this).text().trim() === '' && $(this).find('img').length === 0) {
      $(this).remove();
    }
  });

  // Extract specific selector if provided
  let targetHtml: string;
  if (selector) {
    const selected = $(selector);
    targetHtml = selected.length > 0 ? selected.html() || '' : $.html();
  } else {
    // Try to find main content area
    const mainContent =
      $('main').html() ||
      $('article').html() ||
      $('[role="main"]').html() ||
      $('#content').html() ||
      $('.content').html();
    targetHtml = mainContent || $.html();
  }

  // Configure Turndown
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  // Handle links
  if (!preserveLinks) {
    turndownService.addRule('removeLinks', {
      filter: 'a',
      replacement: (_content, node) => {
        return (node as { textContent?: string }).textContent || '';
      },
    });
  }

  // Handle images
  if (!preserveImages) {
    turndownService.addRule('removeImages', {
      filter: 'img',
      replacement: () => '',
    });
  }

  // Collapse consecutive <br> tags before conversion
  const collapsedHtml = targetHtml.replace(/(<br\s*\/?\s*>\s*){2,}/gi, '<br>');

  // Remove data attributes, classes, ids from remaining HTML
  const cleanHtml = collapsedHtml.replace(/\s+(class|id|style|data-\w+)="[^"]*"/g, '');

  // Convert to Markdown
  let markdown = turndownService.turndown(cleanHtml);

  // Post-processing cleanup
  markdown = postProcessMarkdown(markdown);

  return markdown;
}

/**
 * Clean up converted Markdown.
 */
function postProcessMarkdown(md: string): string {
  let result = md;

  // Remove trailing whitespace on lines
  result = result.replace(/[ \t]+$/gm, '');

  // Remove empty list items
  result = result.replace(/^[-*+]\s*$/gm, '');

  // Clean up empty heading lines
  result = result.replace(/^#{1,6}\s*$/gm, '');

  // Collapse multiple spaces within lines
  result = result.replace(/ {2,}/g, ' ');

  // Trim start and end
  result = result.trim();

  // Final: collapse excessive blank lines (max 2 consecutive newlines)
  // Applied last because other cleanups can create new blank line sequences
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}
