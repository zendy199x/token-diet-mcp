# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-11

### Added

- 🍃 Initial release of Token Diet MCP
- **7 MCP tools** for token optimization:
  - `optimize_content` — Auto-detect content type and apply best compression
  - `html_to_markdown` — Convert HTML to clean Markdown (60-90% savings)
  - `compress_code` — Language-aware code compression with 3 levels
  - `smart_read_file` — Read files with automatic compression
  - `count_tokens` — Token counting and multi-model cost estimation
  - `extract_web_content` — Fetch web pages as clean Markdown (70-95% savings)
  - `diff_summary` — Compact unified diff representation (70-95% savings)
- **4 compression engines:**
  - HTML compressor (Cheerio + Turndown)
  - Code compressor (TypeScript, JavaScript, Python, Java, Go, Rust, CSS, SQL, YAML)
  - JSON compressor (minify, null removal, array truncation)
  - Markdown optimizer (cleanup, formatting normalization)
- **Token counter** with cost estimation for GPT-4o, GPT-4, GPT-3.5, Claude
- **41 unit tests** with Vitest
- **CI/CD** with GitHub Actions (Node 18, 20, 22)
- Full documentation: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
- MIT License

[1.0.0]: https://github.com/zendy199x/token-diet-mcp/releases/tag/v1.0.0
