/**
 * Token Diet MCP — Entry Point
 *
 * 🍃 An MCP server that reduces AI token consumption by 40-90%
 * while preserving output quality.
 *
 * Compatible with: Claude, Codex, Copilot, Cursor, Antigravity
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error('🍃 Token Diet MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting Token Diet MCP:', error);
  process.exit(1);
});
