# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### AI Context Analyzer (/)

A fullstack developer tool that analyzes codebases by accepting a user query and returning the most relevant files with relevance scores.

**Frontend:** React + Vite (`artifacts/ai-context-analyzer`)
- Dark IDE-like aesthetic with sidebar navigation
- Query input field with pre-loaded 10 mock files
- Toggleable file list (include/exclude files from analysis)
- Results panel with relevance scores, matched keywords, and file content

**Backend:** Express API (`artifacts/api-server`)
- `POST /api/analyze` — analyzes files against a query
- Keyword matching with frequency-based scoring
- Dependency tracing (files imported by matched files get a bonus score)
- Returns top 5 most relevant files with scores and explanations

**Analyze Logic** (`artifacts/api-server/src/lib/analyzer.ts`):
1. Tokenizes the query into keywords
2. Scores each file by keyword frequency in content + filename match bonus
3. Traces imports: if a matched file imports another, that file gets +15 score boost
4. Returns top 5 results sorted by score (0–100)
