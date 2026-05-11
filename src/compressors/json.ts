/**
 * JSON compressor.
 * Minifies JSON while optionally truncating large arrays and removing null values.
 */

export interface JsonCompressOptions {
  /** Remove keys with null/undefined values */
  removeNulls?: boolean;
  /** Truncate arrays longer than this (show first N + count) */
  maxArrayLength?: number;
  /** Maximum depth to include (deeper levels are summarized) */
  maxDepth?: number;
}

/**
 * Compress JSON content to reduce token count.
 */
export function compressJson(jsonString: string, options: JsonCompressOptions = {}): string {
  const { removeNulls = false, maxArrayLength = 50, maxDepth = 10 } = options;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    // If not valid JSON, just minify whitespace
    return jsonString.replace(/\s+/g, ' ').trim();
  }

  const processed = processValue(parsed, 0, { removeNulls, maxArrayLength, maxDepth });
  return JSON.stringify(processed);
}

/**
 * Recursively process a JSON value for compression.
 */
function processValue(
  value: unknown,
  depth: number,
  options: Required<JsonCompressOptions>,
): unknown {
  if (depth > options.maxDepth) {
    if (Array.isArray(value)) {
      return `[Array(${value.length})]`;
    }
    if (typeof value === 'object' && value !== null) {
      return `[Object(${Object.keys(value).length} keys)]`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > options.maxArrayLength) {
      const truncated = value
        .slice(0, options.maxArrayLength)
        .map((item) => processValue(item, depth + 1, options));
      return [...truncated, `... and ${value.length - options.maxArrayLength} more items`];
    }
    return value.map((item) => processValue(item, depth + 1, options));
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (options.removeNulls && (val === null || val === undefined)) {
        continue;
      }
      result[key] = processValue(val, depth + 1, options);
    }
    return result;
  }

  return value;
}
