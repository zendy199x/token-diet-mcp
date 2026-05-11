# Contributing to Token Diet MCP

First off, thank you for considering contributing to Token Diet MCP! 🍃

Every contribution helps the community save tokens and reduce AI costs. Whether it's fixing a bug, adding a feature, improving docs, or sharing ideas — your help is welcome.

## Table of Contents

- [Contributing to Token Diet MCP](#contributing-to-token-diet-mcp)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
  - [Development Workflow](#development-workflow)
  - [Project Structure](#project-structure)
    - [Key Concepts](#key-concepts)
  - [Adding a New Compressor](#adding-a-new-compressor)
  - [Adding a New Tool](#adding-a-new-tool)
  - [Testing](#testing)
    - [Test Guidelines](#test-guidelines)
  - [Commit Messages](#commit-messages)
  - [Pull Request Guidelines](#pull-request-guidelines)
  - [Reporting Issues](#reporting-issues)
    - [Bug Reports](#bug-reports)
    - [Feature Requests](#feature-requests)

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Git**

### Setup

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/zendy199x/token-diet-mcp.git
cd token-diet-mcp
npm install
npm run build
npm test
```

## Development Workflow

1. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Make your changes** following the code style guidelines

3. **Write tests** for any new functionality

4. **Run the full check suite:**

   ```bash
   npm run typecheck    # Type checking
   npm test             # Unit tests
   npm run build        # Verify build
   ```

5. **Commit** with a [conventional commit message](#commit-messages)

6. **Push** and open a Pull Request

## Project Structure

```
src/
├── index.ts                # Entry point (stdio transport)
├── server.ts               # MCP server + tool registration
├── tools/                  # MCP tools (user-facing)
│   ├── optimize-content.ts
│   ├── html-to-markdown.ts
│   ├── compress-code.ts
│   ├── smart-read-file.ts
│   ├── count-tokens.ts
│   ├── extract-web-content.ts
│   └── diff-summary.ts
├── compressors/            # Core compression engines
│   ├── html.ts             # HTML → Markdown (Cheerio + Turndown)
│   ├── code.ts             # Language-aware code compression
│   ├── json.ts             # JSON minification
│   └── markdown.ts         # Markdown optimization
├── tokenizer/
│   └── counter.ts          # Token counting (gpt-tokenizer)
└── utils/
    └── detect-language.ts  # File/content type detection
```

### Key Concepts

- **Tools** (`src/tools/`) are user-facing MCP endpoints. They use Zod schemas for input validation and call compressors internally.
- **Compressors** (`src/compressors/`) contain the actual compression logic. They are pure functions with no MCP dependencies.
- **Tokenizer** (`src/tokenizer/`) provides token counting for savings calculation.

## Adding a New Compressor

1. Create `src/compressors/your-type.ts`:

   ```typescript
   export interface YourTypeOptions {
     // options here
   }

   export function compressYourType(content: string, options: YourTypeOptions = {}): string {
     // compression logic
     return compressed;
   }
   ```

2. Add content type detection in `src/utils/detect-language.ts`

3. Wire it into `src/tools/optimize-content.ts` in the `switch` statement

4. Add tests in `tests/compressors/your-type.test.ts`

## Adding a New Tool

1. Create `src/tools/your-tool.ts`:

   ```typescript
   import { z } from 'zod';

   export const yourToolSchema = z.object({
     // input schema
   });

   export function yourTool(input: z.infer<typeof yourToolSchema>) {
     return {
       content: [{ type: 'text' as const, text: 'result' }],
       _meta: {
         /* savings stats */
       },
     };
   }
   ```

2. Register in `src/server.ts`:

   ```typescript
   server.tool('your_tool', 'Description', yourToolSchema.shape, async (args) => yourTool(args));
   ```

3. Add tests in `tests/tools/your-tool.test.ts`

4. Update `README.md` with tool documentation

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npx vitest run tests/compressors/html.test.ts
```

### Test Guidelines

- Every compressor and tool must have corresponding tests
- Test edge cases (empty input, invalid input, large input)
- Include "before/after" tests with fixture files in `tests/fixtures/`
- Assert both correctness and that compression actually reduces size

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add YAML compressor support
fix: handle empty HTML documents without crashing
docs: add Cursor setup instructions
test: add edge case tests for JSON compressor
refactor: extract common post-processing logic
chore: update dependencies
perf: optimize HTML parsing for large documents
```

## Pull Request Guidelines

- **Keep PRs focused** — one feature or fix per PR
- **Include tests** for any new functionality
- **Update documentation** if adding/changing tools
- **Describe token savings** impact in your PR description
- **All CI checks must pass** before merging
- **Fill out the PR template** completely

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- Node.js version (`node --version`)
- npm version (`npm --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Content sample that triggers the bug (if applicable)

### Feature Requests

When requesting features, please describe:

- The use case / problem you're solving
- Expected token savings (if applicable)
- Any similar tools or prior art

---

Thank you for contributing! Every token saved counts. 🍃
