/**
 * Token Diet MCP Server
 *
 * Registers all tools with the MCP server for token optimization.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { optimizeContentSchema, optimizeContent } from './tools/optimize-content.js';
import { htmlToMarkdownSchema, htmlToMarkdown } from './tools/html-to-markdown.js';
import { compressCodeSchema, compressCodeTool } from './tools/compress-code.js';
import { smartReadFileSchema, smartReadFile } from './tools/smart-read-file.js';
import { countTokensSchema, countTokensTool } from './tools/count-tokens.js';
import { extractWebContentSchema, extractWebContent } from './tools/extract-web-content.js';
import { diffSummarySchema, diffSummary } from './tools/diff-summary.js';

/**
 * Create and configure the MCP server with all tools.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: 'token-diet-mcp',
    version: '1.0.0',
  });

  // Tool 1: optimize_content — Auto-detect and optimize any content
  server.tool(
    'optimize_content',
    'Auto-detect content type (HTML, code, JSON, Markdown) and apply the best compression strategy to reduce token count. Returns optimized content with savings statistics.',
    optimizeContentSchema.shape,
    async (args) => optimizeContent(args),
  );

  // Tool 2: html_to_markdown — Convert HTML to clean Markdown
  server.tool(
    'html_to_markdown',
    'Convert HTML to clean, token-efficient Markdown. Strips scripts, styles, navigation, ads, and other noise. Typically saves 60-90% of tokens.',
    htmlToMarkdownSchema.shape,
    async (args) => htmlToMarkdown(args),
  );

  // Tool 3: compress_code — Language-aware code compression
  server.tool(
    'compress_code',
    'Compress source code while preserving semantics. Supports light (whitespace), medium (+ comments), and aggressive (+ type annotations) levels. Works with TypeScript, JavaScript, Python, Java, Go, Rust, and more.',
    compressCodeSchema.shape,
    async (args) => compressCodeTool(args),
  );

  // Tool 4: smart_read_file — Read file with compression
  server.tool(
    'smart_read_file',
    'Read a file and return its content optimized for LLM consumption. Auto-detects file type and applies appropriate compression. Saves 20-60% tokens vs raw file reading.',
    smartReadFileSchema.shape,
    async (args) => smartReadFile(args),
  );

  // Tool 5: count_tokens — Token counting & cost estimation
  server.tool(
    'count_tokens',
    'Count tokens in content and estimate cost across AI models (GPT-4o, GPT-4, GPT-3.5, Claude). Useful for monitoring token usage and optimizing prompts.',
    countTokensSchema.shape,
    async (args) => countTokensTool(args),
  );

  // Tool 6: extract_web_content — URL to clean Markdown
  server.tool(
    'extract_web_content',
    'Fetch a web page and extract its main content as clean Markdown. Removes navigation, ads, scripts, and boilerplate. Typically saves 70-95% of tokens vs raw HTML.',
    extractWebContentSchema.shape,
    async (args) => extractWebContent(args),
  );

  // Tool 7: diff_summary — Compact diff representation
  server.tool(
    'diff_summary',
    'Create a compact unified diff between original and modified content. Much more token-efficient than sending both full versions. Typically saves 70-95% of tokens.',
    diffSummarySchema.shape,
    async (args) => diffSummary(args),
  );

  return server;
}
