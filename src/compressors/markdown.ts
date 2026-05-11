/**
 * Markdown optimizer.
 * Cleans up Markdown formatting to reduce token count while preserving structure.
 */

export interface MarkdownOptimizeOptions {
  /** Remove image references */
  removeImages?: boolean;
  /** Remove link URLs (keep text only) */
  removeLinks?: boolean;
  /** Remove HTML tags embedded in Markdown */
  removeHtml?: boolean;
}

/**
 * Optimize Markdown content to reduce token count.
 */
export function optimizeMarkdown(
  markdown: string,
  options: MarkdownOptimizeOptions = {},
): string {
  const { removeImages = false, removeLinks = false, removeHtml = false } = options;

  let result = markdown;

  // Remove excessive blank lines (max 1 between sections)
  result = result.replace(/\n{3,}/g, '\n\n');

  // Remove trailing whitespace
  result = result.replace(/[ \t]+$/gm, '');

  // Remove empty list items
  result = result.replace(/^[-*+]\s*$/gm, '');

  // Collapse multiple spaces
  result = result.replace(/ {2,}/g, ' ');

  // Remove horizontal rules that are overly long
  result = result.replace(/^[-*_]{4,}\s*$/gm, '---');

  // Remove images if requested
  if (removeImages) {
    result = result.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
  }

  // Simplify links if requested (keep text, remove URL)
  if (removeLinks) {
    result = result.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  }

  // Remove embedded HTML if requested
  if (removeHtml) {
    result = result.replace(/<[^>]+>/g, '');
  }

  // Remove empty headings
  result = result.replace(/^#{1,6}\s*$/gm, '');

  // Normalize heading spacing (ensure single blank line before heading)
  result = result.replace(/\n{2,}(#{1,6}\s)/g, '\n\n$1');

  // Remove blank lines at start and end
  result = result.trim();

  // Final pass: collapse any remaining excessive blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}
