/**
 * Language detection utility for files and content.
 */

import * as path from 'node:path';

export type ContentType = 'html' | 'code' | 'json' | 'markdown' | 'text';
export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'css'
  | 'sql'
  | 'yaml'
  | 'unknown';

const EXTENSION_TO_LANGUAGE: Record<string, CodeLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.css': 'css',
  '.scss': 'css',
  '.less': 'css',
  '.sql': 'sql',
  '.yaml': 'yaml',
  '.yml': 'yaml',
};

const EXTENSION_TO_CONTENT_TYPE: Record<string, ContentType> = {
  '.html': 'html',
  '.htm': 'html',
  '.xhtml': 'html',
  '.json': 'json',
  '.jsonc': 'json',
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.markdown': 'markdown',
};

/**
 * Detect content type from file path extension.
 */
export function detectContentTypeFromPath(filePath: string): ContentType {
  const ext = path.extname(filePath).toLowerCase();

  if (EXTENSION_TO_CONTENT_TYPE[ext]) {
    return EXTENSION_TO_CONTENT_TYPE[ext];
  }

  if (EXTENSION_TO_LANGUAGE[ext]) {
    return 'code';
  }

  return 'text';
}

/**
 * Detect programming language from file extension.
 */
export function detectLanguageFromPath(filePath: string): CodeLanguage {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] || 'unknown';
}

/**
 * Auto-detect content type from the content itself (heuristic).
 */
export function detectContentType(content: string): ContentType {
  const trimmed = content.trim();

  // HTML detection
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    /<[a-z][\s\S]*>/i.test(trimmed.slice(0, 500))
  ) {
    // Make sure it's actual HTML, not just markdown with some inline HTML
    const tagDensity = (trimmed.match(/<[^>]+>/g) || []).length / (trimmed.length / 100);
    if (tagDensity > 0.5) {
      return 'html';
    }
  }

  // JSON detection
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON, continue
    }
  }

  // Markdown detection (headings, lists, links)
  const mdPatterns = [
    /^#{1,6}\s/m, // headings
    /^\s*[-*+]\s/m, // unordered list
    /^\s*\d+\.\s/m, // ordered list
    /\[.+?\]\(.+?\)/m, // links
    /```[\s\S]*?```/m, // code blocks
  ];
  const mdScore = mdPatterns.filter((p) => p.test(trimmed)).length;
  if (mdScore >= 2) {
    return 'markdown';
  }

  // Code detection (imports, functions, braces)
  const codePatterns = [
    /^(import|from|require|export|const|let|var|function|class|def|func|fn|pub|package)\s/m,
    /[{};]\s*$/m,
    /=>/m,
    /^\s*(if|else|for|while|return|switch|case)\s/m,
  ];
  const codeScore = codePatterns.filter((p) => p.test(trimmed)).length;
  if (codeScore >= 2) {
    return 'code';
  }

  return 'text';
}
