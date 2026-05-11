# 🚀 Deployment & Usage Guide

> Complete guide to deploy Token Diet MCP to npm and use it with AI coding assistants.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Part 1: Deploy to npm](#part-1-deploy-to-npm)
- [Part 2: Setup with AI Assistants](#part-2-setup-with-ai-assistants)
- [Part 3: Using the Tools](#part-3-using-the-tools)
- [Part 4: Version Management](#part-4-version-management)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** ≥ 18 ([download](https://nodejs.org))
- **npm** account ([signup](https://www.npmjs.com/signup))
- **Git** installed

---

## Part 1: Deploy to npm

### Step 1: Build the project

```bash
cd ~/Desktop/token-diet-mcp
npm install
npm run build
```

Verify the build output:
```
dist/
├── index.js      # Bundled MCP server (~26 KB)
├── index.js.map  # Source map
└── index.d.ts    # TypeScript declarations
```

### Step 2: Run tests

```bash
npm test
```

Expected: `41 passed (41)` ✅

### Step 3: Preview the package

```bash
npm pack --dry-run
```

This shows exactly what will be published:
```
📦  token-diet-mcp@1.0.0
Tarball Contents:
  LICENSE
  README.md
  dist/index.d.ts
  dist/index.js
  dist/index.js.map
  package.json
```

### Step 4: Login to npm

```bash
npm login
```

Verify login:
```bash
npm whoami
# Should print your npm username
```

### Step 5: Publish

**Option A — With 2FA disabled:**
```bash
npm publish --access public
```

**Option B — With 2FA enabled (OTP):**
```bash
npm publish --access public --otp=YOUR_6_DIGIT_CODE
```

**Option C — With Granular Access Token (recommended for 2FA accounts):**

1. Go to [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens)
2. Click **"Generate New Token"** → **"Granular Access Token"**
3. Set permissions: **Read and write** for packages
4. Copy the token (`npm_xxxxxxxxxxxx`)
5. Publish:

```bash
npm publish --access public --//registry.npmjs.org/:_authToken=npm_YOUR_TOKEN
```

### Step 6: Verify publication

```bash
# Check on npm
npm view token-diet-mcp

# Test install
npx -y token-diet-mcp
```

Visit: [https://www.npmjs.com/package/token-diet-mcp](https://www.npmjs.com/package/token-diet-mcp)

---

## Part 2: Setup with AI Assistants

### 🟣 Claude Desktop

**Config file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Add configuration:**

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

**Restart Claude Desktop** → Look for the 🔌 plug icon → Ready!

---

### 🟢 Claude Code (CLI)

```bash
# Add the MCP server
claude mcp add token-diet -- npx -y token-diet-mcp

# Verify it's added
claude mcp list

# Remove if needed
claude mcp remove token-diet
```

---

### 🔵 Cursor

**Config file:** `.cursor/mcp.json` (project root) or global settings

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

**Restart Cursor** → Check MCP panel → Ready!

---

### 🟠 Windsurf

**Config file:** `~/.codeium/windsurf/mcp_config.json`

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

---

### ⚫ Antigravity (Gemini)

Add to your MCP configuration:

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

---

### 🔧 From Source (any MCP client)

If you prefer running from local source instead of npm:

```json
{
  "mcpServers": {
    "token-diet": {
      "command": "node",
      "args": ["/absolute/path/to/token-diet-mcp/dist/index.js"]
    }
  }
}
```

---

## Part 3: Using the Tools

Once connected, the AI assistant will have access to 7 tools. You can ask the AI to use them directly.

### Tool 1: `optimize_content`

> Auto-detects content type and compresses it.

**Try asking:**
```
"Optimize this content for me: <paste HTML/code/JSON here>"
```

**Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `content` | ✅ | Content to optimize |
| `hint` | ❌ | `"html"`, `"code"`, `"json"`, or `"markdown"` |

---

### Tool 2: `html_to_markdown`

> Converts HTML to clean Markdown. Saves 60-90% tokens.

**Try asking:**
```
"Convert this HTML to markdown: <div><script>...</script><p>Hello</p></div>"
```

**Parameters:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `html` | ✅ | — | HTML content |
| `preserve_links` | ❌ | `true` | Keep hyperlinks |
| `preserve_images` | ❌ | `false` | Keep image refs |
| `selector` | ❌ | — | CSS selector (e.g., `"article"`) |

---

### Tool 3: `compress_code`

> Language-aware code compression. Saves 10-60%.

**Try asking:**
```
"Compress this TypeScript code at medium level: <paste code>"
```

**Parameters:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `code` | ✅ | — | Source code |
| `language` | ❌ | auto | `"typescript"`, `"python"`, `"java"`, etc. |
| `level` | ❌ | `"medium"` | `"light"`, `"medium"`, `"aggressive"` |

**Compression levels explained:**

| Level | Removes | Best for |
|-------|---------|----------|
| `light` | Trailing whitespace, extra blank lines | Production code review |
| `medium` | + Comments (keeps JSDoc), collapses imports | General development |
| `aggressive` | + Type annotations, all blank lines | Maximum savings |

---

### Tool 4: `smart_read_file`

> Reads a file and auto-compresses based on file type.

**Try asking:**
```
"Smart read the file at /path/to/my-service.ts with medium compression"
```

**Parameters:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `path` | ✅ | — | Absolute file path |
| `level` | ❌ | `"medium"` | Compression level |

---

### Tool 5: `count_tokens`

> Count tokens and compare costs across AI models.

**Try asking:**
```
"Count the tokens in this text and show me the cost across models"
```

**Parameters:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `content` | ✅ | — | Content to count |
| `model` | ❌ | `"gpt-4o"` | `"gpt-4o"`, `"gpt-4"`, `"gpt-3.5"`, `"claude"` |

**Example output:**
```
📊 Token Count Report
═══════════════════════════════
Content length: 1523 characters
Tokens (gpt-4o): 342
Estimated cost: $0.000855

💰 Cost comparison across models:
  gpt-4o     │      342 tokens │ $0.000855
  gpt-4      │      342 tokens │ $0.010260
  gpt-3.5    │      342 tokens │ $0.000171
  claude     │      342 tokens │ $0.001026
```

---

### Tool 6: `extract_web_content`

> Fetch a web page and extract as clean Markdown. Saves 70-95%.

**Try asking:**
```
"Extract the main content from https://example.com as clean markdown"
```

**Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `url` | ✅ | Web page URL |
| `selector` | ❌ | CSS selector (e.g., `"article"`, `"#main"`) |

---

### Tool 7: `diff_summary`

> Create compact diff instead of sending both full files. Saves 70-95%.

**Try asking:**
```
"Show me a compact diff between these two versions: <original> and <modified>"
```

**Parameters:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `original` | ✅ | — | Original content |
| `modified` | ✅ | — | Modified content |
| `context_lines` | ❌ | `3` | Lines of context around changes |
| `filename` | ❌ | `"file"` | Filename for diff header |

---

## Part 4: Version Management

### Bump version and publish

```bash
# Patch release (1.0.0 → 1.0.1) — bug fixes
npm version patch -m "🔧 v%s: fix description"

# Minor release (1.0.0 → 1.1.0) — new features
npm version minor -m "✨ v%s: feature description"

# Major release (1.0.0 → 2.0.0) — breaking changes
npm version major -m "💥 v%s: breaking change description"

# Push code + tag
git push && git push --tags
```

If GitHub Actions CI is configured with `NPM_TOKEN` secret, tagging with `v*` will **auto-publish** to npm.

### Manual publish after version bump

```bash
npm publish --access public --otp=YOUR_CODE
```

---

## Troubleshooting

### "npx: command not found"

```bash
# Ensure Node.js is installed
node --version  # Should be ≥ 18
npm --version   # Should be ≥ 9
```

### MCP server not showing in Claude Desktop

1. Check config file path is correct for your OS
2. Ensure JSON syntax is valid (use a JSON validator)
3. Restart Claude Desktop completely (quit + reopen)
4. Check Claude Desktop logs for errors

### "npm ERR! 403 Forbidden" when publishing

- **2FA required:** Add `--otp=CODE` flag
- **Token invalid:** Create a new Granular Access Token from npmjs.com
- **Package name taken:** Change `name` in `package.json`

### "npm ERR! 401 Unauthorized"

```bash
# Re-login
npm logout
npm login

# Verify
npm whoami
```

### "npm ERR! E404" when publishing

- Verify email is confirmed on npmjs.com
- Check you're logged in: `npm whoami`

### Tools not working / timeout

```bash
# Test the server locally
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

If you see a JSON response listing 7 tools, the server is working correctly.

---

<p align="center">
  <strong>Need help?</strong> Open an <a href="https://github.com/zendy199x/token-diet-mcp/issues">issue</a> on GitHub.
</p>
