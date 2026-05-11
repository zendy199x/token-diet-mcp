/**
 * Language-aware code compressor.
 * Reduces token count while preserving semantic meaning.
 */

export type CompressionLevel = 'light' | 'medium' | 'aggressive';

export interface CodeCompressOptions {
  /** Programming language */
  language?: string;
  /** Compression level */
  level?: CompressionLevel;
}

/**
 * Compress source code to reduce token count.
 */
export function compressCode(code: string, options: CodeCompressOptions = {}): string {
  const { language = 'unknown', level = 'medium' } = options;

  let result = code;

  // Light: Basic cleanup (always applied)
  result = removeTrailingWhitespace(result);
  result = collapseBlankLines(result);

  if (level === 'light') {
    return result.trim();
  }

  // Medium: Remove comments, collapse imports
  result = removeComments(result, language);
  result = collapseConsecutiveImports(result, language);
  result = removeRedundantBlankLines(result);

  if (level === 'medium') {
    return result.trim();
  }

  // Aggressive: Additional optimizations
  result = simplifyTypeAnnotations(result, language);
  result = collapseSimpleStatements(result);
  result = removeAllBlankLines(result);

  return result.trim();
}

/**
 * Remove trailing whitespace from each line.
 */
function removeTrailingWhitespace(code: string): string {
  return code.replace(/[ \t]+$/gm, '');
}

/**
 * Collapse 3+ consecutive blank lines into 1.
 */
function collapseBlankLines(code: string): string {
  return code.replace(/\n{3,}/g, '\n\n');
}

/**
 * Remove all extra blank lines (keep max 1).
 */
function removeRedundantBlankLines(code: string): string {
  return code.replace(/\n{3,}/g, '\n\n');
}

/**
 * Remove all blank lines.
 */
function removeAllBlankLines(code: string): string {
  return code
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
}

/**
 * Remove comments from code based on language.
 * Preserves JSDoc/documentation comments in medium mode.
 */
function removeComments(code: string, language: string): string {
  const lines = code.split('\n');
  const result: string[] = [];
  let inBlockComment = false;
  let inDocComment = false;

  const isJsLike = ['typescript', 'javascript', 'java', 'go', 'rust', 'css'].includes(language);
  const isPython = language === 'python';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (isJsLike) {
      // Handle block comments
      if (inBlockComment || inDocComment) {
        if (trimmed.includes('*/')) {
          if (inDocComment) {
            // Keep doc comment closing
            result.push(line);
          }
          inBlockComment = false;
          inDocComment = false;
        } else if (inDocComment) {
          result.push(line);
        }
        continue;
      }

      // Doc comment start (/** ... */)
      if (trimmed.startsWith('/**')) {
        if (trimmed.includes('*/')) {
          // Single-line doc comment — keep it
          result.push(line);
          continue;
        }
        inDocComment = true;
        result.push(line);
        continue;
      }

      // Block comment start (/* ... */)
      if (trimmed.startsWith('/*')) {
        if (trimmed.includes('*/')) {
          // Single-line block comment — skip
          continue;
        }
        inBlockComment = true;
        continue;
      }

      // Single-line comment
      if (trimmed.startsWith('//')) {
        continue;
      }

      // Inline comment (be careful with strings)
      const withoutStrings = line.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '""');
      const commentIndex = withoutStrings.indexOf('//');
      if (commentIndex > 0) {
        result.push(line.substring(0, commentIndex).trimEnd());
        continue;
      }

      result.push(line);
    } else if (isPython) {
      // Python single-line comments
      if (trimmed.startsWith('#')) {
        continue;
      }

      // Inline comments
      const withoutStrings = line.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '""');
      const hashIndex = withoutStrings.indexOf('#');
      if (hashIndex > 0) {
        result.push(line.substring(0, hashIndex).trimEnd());
        continue;
      }

      result.push(line);
    } else if (language === 'sql') {
      if (trimmed.startsWith('--')) {
        continue;
      }
      result.push(line);
    } else if (language === 'yaml') {
      if (trimmed.startsWith('#')) {
        continue;
      }
      result.push(line);
    } else {
      // Unknown language — try both // and # patterns
      if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
        continue;
      }
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Collapse consecutive import/require statements into fewer lines.
 */
function collapseConsecutiveImports(code: string, language: string): string {
  if (!['typescript', 'javascript'].includes(language)) {
    return code;
  }

  const lines = code.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect import blocks
    if (trimmed.startsWith('import ') && !trimmed.includes('import(')) {
      const importBlock: string[] = [trimmed];
      let j = i + 1;

      while (j < lines.length) {
        const nextTrimmed = lines[j].trim();
        if (nextTrimmed === '') {
          j++;
          continue;
        }
        if (nextTrimmed.startsWith('import ') && !nextTrimmed.includes('import(')) {
          importBlock.push(nextTrimmed);
          j++;
        } else {
          break;
        }
      }

      // Add all imports without blank lines between them
      result.push(...importBlock);
      i = j;
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join('\n');
}

/**
 * Simplify TypeScript type annotations in aggressive mode.
 */
function simplifyTypeAnnotations(code: string, language: string): string {
  if (language !== 'typescript') {
    return code;
  }

  let result = code;

  // Remove explicit return type on arrow functions when it can be inferred
  // e.g., ": void" on simple functions
  result = result.replace(/\):\s*void\s*=>/g, ') =>');

  // Simplify "as any" and "as unknown" — keep them as they affect semantics
  // Don't simplify too much to avoid breaking code

  return result;
}

/**
 * Collapse simple one-liner statements.
 */
function collapseSimpleStatements(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = i + 1 < lines.length ? lines[i + 1]?.trim() : undefined;

    // Collapse: "if (x)\n  return y;" → "if (x) return y;"
    if (
      /^(if|else if)\s*\(.*\)\s*$/.test(trimmed) &&
      nextLine &&
      /^(return|continue|break|throw)\s/.test(nextLine) &&
      !nextLine.includes('{')
    ) {
      const indent = line.match(/^(\s*)/)?.[1] || '';
      result.push(`${indent}${trimmed} ${nextLine}`);
      i++; // Skip next line
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}
