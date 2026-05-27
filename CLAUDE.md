# CLAUDE.md

## Project
**MCP Quickstart Kit** — a client-side React/TypeScript app (Vite + Tailwind) that generates MCP setup configs and AI runbooks for Claude Code, Gemini CLI, Codex, and Cursor.

No backend. No secrets. All processing is in-browser.

## Dev commands
```bash
npm install        # install dependencies
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # tsc -b + vite build
npm test           # vitest run (unit tests)
```

## Key files
- `src/data/recipes.ts` — MCP provider recipes (add new providers here)
- `src/data/clients.ts` — AI client generators
- `src/lib/template.ts` — URL/config builders and output block generators
- `src/prompts/automation-optimizer.prompt.md` — master prompt source of truth (imported `?raw`; edit here, hot-reloads everywhere)
- `src/lib/optimizerPrompt.ts` — prompt interpolation and per-client generators

## Conventions
- Components in `src/components/`, pure logic in `src/lib/`, static data in `src/data/`.
- Tests in `src/test/` using Vitest.
- No comments unless the WHY is non-obvious.
- No analytics, no network calls, no localStorage except the light/dark theme key.
