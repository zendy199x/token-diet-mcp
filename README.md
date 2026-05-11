<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/leaf-fluttering-in-wind_1f343.png" width="80" alt="Token Diet Logo" />
</p>

<h1 align="center">Token Diet MCP</h1>

<p align="center">
  <strong>🍃 Reduce AI token consumption by 40-90% while preserving output quality.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/token-diet-mcp"><img src="https://img.shields.io/npm/v/token-diet-mcp?color=brightgreen&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/token-diet-mcp"><img src="https://img.shields.io/npm/dm/token-diet-mcp?color=blue" alt="npm downloads"></a>
  <a href="https://github.com/zendy199x/token-diet-mcp/actions"><img src="https://github.com/zendy199x/token-diet-mcp/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node.js"></a>
</p>

<p align="center">
  An MCP (Model Context Protocol) server that provides intelligent content compression tools for AI coding assistants.<br/>
  Works with <strong>Claude</strong> · <strong>Codex</strong> · <strong>Copilot</strong> · <strong>Cursor</strong> · <strong>Antigravity</strong> · and any MCP-compatible client.
</p>

---

## 🎯 The Problem

AI coding assistants waste **40-90% of tokens** on noise that adds zero value:

| Source | Waste | Example |
|--------|-------|---------|
| HTML tags, scripts, styles | 60-90% | `<div class="container" id="main" style="padding:20px">` |
| Code comments, blank lines | 25-40% | `// Check if user exists` (AI already reads the code) |
| JSON formatting whitespace | 20-40% | Pretty-printed with 2-space indentation |
| Sending full files vs diffs | 70-95% | 998/1000 lines unchanged but re-sent |

**You're paying for tokens that don't improve AI output.** Token Diet MCP fixes this.

## 💡 How It Works

Token Diet MCP compresses content **before** it enters the AI's context window:

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Raw Content │ ──▶ │  Token Diet MCP  │ ──▶ │  AI Model   │
│  (5000 tok)  │     │  Compress & Clean│     │  (500 tok)  │
└─────────────┘     └──────────────────┘     └─────────────┘
                         90% savings!
```

**Key insight:** AI models understand compressed content just as well as verbose content. Comments like `// Hash the password` add nothing when the next line is `hashPassword()`.

## 🚀 Quick Start

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "token-diet": {
      "command": "npx",
      "args": ["-y", "token-diet-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add token-diet -- npx -y token-diet-mcp
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "token-diet": {
      "command": "npx",
      "args": ["-y", "token-diet-mcp"]
    }
  }
}
```

### Windsurf / Copilot / Other MCP Clients

```json
{
  "mcpServers": {
    "token-diet": {
      "command": "npx",
      "args": ["-y", "token-diet-mcp"]
    }
  }
}
```

### Install from Source

```bash
git clone https://github.com/zendy199x/token-diet-mcp.git
cd token-diet-mcp
npm install
npm run build
```

## 🔧 Tools

### 1. `optimize_content` — Auto-optimize any content

Auto-detects content type (HTML, code, JSON, Markdown) and applies the best compression strategy.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | ✅ | Content to optimize |
| `hint` | `"html"` \| `"code"` \| `"json"` \| `"markdown"` | ❌ | Content type hint (auto-detected if omitted) |

**Example:** *"Use optimize_content to compress this HTML: `<div>...<script>...</script>...</div>`"*

---

### 2. `html_to_markdown` — HTML → clean Markdown

Strips scripts, styles, navigation, ads, and converts to Markdown. **Typically saves 60-90%.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `html` | string | ✅ | HTML content |
| `preserve_links` | boolean | ❌ | Keep hyperlink URLs (default: `true`) |
| `preserve_images` | boolean | ❌ | Keep image references (default: `false`) |
| `selector` | string | ❌ | CSS selector for specific content (e.g., `"article"`, `"#main"`) |

<details>
<summary><strong>📖 Before/After Example</strong></summary>

**Before (HTML — ~200 tokens):**
```html
<div class="container" id="main" style="padding:20px">
  <script>analytics.track('page_view');</script>
  <style>.content { font-size: 14px; }</style>
  <nav><a href="/">Home</a><a href="/about">About</a></nav>
  <article>
    <h1>Token Optimization</h1>
    <p>Reduce your AI costs by <strong>40-90%</strong>.</p>
  </article>
  <footer>&copy; 2025</footer>
</div>
```

**After (Markdown — ~15 tokens):**
```markdown
# Token Optimization

Reduce your AI costs by **40-90%**.
```
</details>

---

### 3. `compress_code` — Language-aware code compression

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ | Source code |
| `language` | string | ❌ | Programming language (auto-detected) |
| `level` | `"light"` \| `"medium"` \| `"aggressive"` | ❌ | Compression level (default: `"medium"`) |

**Compression levels:**

| Level | What it removes | Typical savings |
|-------|----------------|-----------------|
| `light` | Trailing whitespace, excessive blank lines | 10-20% |
| `medium` | + Comments (keeps JSDoc), collapses imports | 25-40% |
| `aggressive` | + Type annotations, all blank lines | 40-60% |

**Supported languages:** TypeScript, JavaScript, Python, Java, Go, Rust, CSS, SQL, YAML.

---

### 4. `smart_read_file` — Read files with compression

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ | Absolute file path |
| `level` | `"light"` \| `"medium"` \| `"aggressive"` | ❌ | Compression level (default: `"medium"`) |

---

### 5. `count_tokens` — Token counting & cost estimation

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | ✅ | Content to count |
| `model` | `"gpt-4o"` \| `"gpt-4"` \| `"gpt-3.5"` \| `"claude"` | ❌ | Model for estimation (default: `"gpt-4o"`) |

**Output example:**
```
📊 Token Count Report
═══════════════════════════════
Content length: 1523 characters
Tokens (gpt-4o): 342

💰 Cost comparison across models:
  gpt-4o     │      342 tokens │ $0.000855
  gpt-4      │      342 tokens │ $0.010260
  gpt-3.5    │      342 tokens │ $0.000171
  claude     │      342 tokens │ $0.001026
```

---

### 6. `extract_web_content` — URL → clean Markdown

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ | Web page URL |
| `selector` | string | ❌ | CSS selector for specific section |

**Typically saves 70-95%** by extracting only the main article content.

---

### 7. `diff_summary` — Compact diff representation

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `original` | string | ✅ | Original content |
| `modified` | string | ✅ | Modified content |
| `context_lines` | number | ❌ | Context lines around changes (default: `3`) |
| `filename` | string | ❌ | Filename for diff header |

**Typically saves 70-95%** — sends only what changed, not both full files.

## 📊 Benchmarks

| Content Type | Before | After | Savings |
|-------------|--------|-------|---------|
| Typical web page | ~5,000 tokens | ~500 tokens | **90%** |
| TypeScript service file | ~800 tokens | ~480 tokens | **40%** |
| Pretty-printed JSON | ~600 tokens | ~400 tokens | **33%** |
| Full file comparison | ~2,000 tokens | ~200 tokens | **90%** |

## 🏗️ Architecture

```
token-diet-mcp/
├── src/
│   ├── index.ts                    # Entry point (stdio transport)
│   ├── server.ts                   # MCP server + tool registration
│   ├── tools/                      # 7 MCP tools
│   │   ├── optimize-content.ts     # Auto-detect & optimize
│   │   ├── html-to-markdown.ts     # HTML → Markdown
│   │   ├── compress-code.ts        # Code compression
│   │   ├── smart-read-file.ts      # File reading + compression
│   │   ├── count-tokens.ts         # Token counting
│   │   ├── extract-web-content.ts  # Web scraping + cleaning
│   │   └── diff-summary.ts         # Unified diff generation
│   ├── compressors/                # Compression engines
│   │   ├── html.ts                 # Cheerio + Turndown
│   │   ├── code.ts                 # Language-aware compression
│   │   ├── json.ts                 # JSON minification
│   │   └── markdown.ts             # Markdown optimization
│   ├── tokenizer/
│   │   └── counter.ts              # gpt-tokenizer integration
│   └── utils/
│       └── detect-language.ts      # File type detection
├── tests/                          # 41 unit tests
├── .github/
│   └── workflows/ci.yml           # CI/CD pipeline
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── SECURITY.md
└── LICENSE (MIT)
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode (rebuild on changes)
npm run dev

# Type checking
npm run typecheck

# Format code
npm run format
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 [Report a bug](https://github.com/zendy199x/token-diet-mcp/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/zendy199x/token-diet-mcp/issues/new?template=feature_request.md)
- 📖 [Read contributing guide](CONTRIBUTING.md)
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md)

## 📄 License

[MIT](LICENSE) — free for personal and commercial use.

## ⭐ Star History

If this project helps you save tokens and money, please consider giving it a ⭐!

---

<p align="center">
  <strong>Built with ❤️ for the AI developer community.</strong><br/>
  <sub>Saving tokens, one request at a time.</sub>
</p>
