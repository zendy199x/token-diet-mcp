# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

If you discover a security vulnerability in Token Diet MCP, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email **[zendy199x@gmail.com](mailto:zendy199x@gmail.com)** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix release** within 2 weeks for critical issues

### Scope

Token Diet MCP is a local MCP server that processes content on the user's machine. Key security considerations include:

- **File access** via `smart_read_file` tool — limited to files the user has permission to read
- **Network access** via `extract_web_content` tool — makes HTTP requests to user-specified URLs
- **No data collection** — Token Diet MCP does not send any data to external servers (except user-initiated web fetches)
- **No persistence** — No data is stored between sessions

### Security Best Practices for Users

- Only install Token Diet MCP from the [official npm package](https://www.npmjs.com/package/token-diet-mcp)
- Keep the package updated to the latest version
- Review the [source code](https://github.com/zendy199x/token-diet-mcp) if you have concerns
