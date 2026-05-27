# MCP Quickstart Kit

> Generate MCP setup configs for Claude, Gemini, Codex, Cursor, and other AI tools.

A forkable, **client-side** web app that helps developers connect an existing
MCP server to an AI tool without hand-building URLs, config files, and setup
commands. Pick a recipe, fill in the required IDs/URLs, choose your AI client,
and copy the exact command, config snippet, and Markdown setup guide.

Salesforce Marketing Cloud Engagement is the first built-in recipe, but the
kit is a **general MCP setup/config generator** — add your own recipes and
client generators.

The app has two top-level tabs:

1. **MCP Setup Generator** — connect an MCP server to an AI client (below).
2. **Automation Optimizer Pack** — generate a local, read-only AI runbook that
   uses an already-connected SFMC MCP server to analyze automations, SQL Query
   Activities, journeys, and Data Extensions
   ([details](#automation-optimizer-pack)).

---

## Who it is for

Developers and consultants who want to connect an existing MCP server to an AI
tool such as **Claude Code, Gemini CLI, Codex, Cursor**, or another
MCP-compatible client — and want the connection URL, OAuth redirect URI, and
client config generated correctly the first time.

## What it does

You select:

- an **MCP provider recipe**,
- an **AI client/tool**,
- a **region/environment** (when the recipe has one),
- the required **IDs / URLs / tokens**, and
- an **auth mode**.

The app generates:

- the **MCP server URL**,
- the **OAuth redirect URI** (only when the recipe defines one),
- a **client-specific command or config** (CLI command, TOML, or JSON),
- a **safe first test prompt**,
- a **capability summary** (where known), and
- a copyable **Markdown setup guide**.

## What it does **not** do

- It does **not** have a backend, database, login, or analytics.
- It does **not** store or transmit your values — all form inputs stay in
  browser state for the session and are never persisted. The only thing saved
  to `localStorage` is your light/dark theme preference (no inputs, no secrets).
- It does **not** make any external/network API calls.
- It does **not** authenticate to MCP providers or verify permissions.
- It does **not** ask for client secrets (see below).

---

## Run locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm test         # run Vitest unit tests
```

Requires Node 18+.

## Supported clients

| Client | Output | Notes |
| --- | --- | --- |
| **Claude Code** | `claude mcp add --transport http …` | Authenticate with `/mcp`. |
| **Gemini CLI** | `gemini mcp add … -t http …` | Authenticate with `/mcp auth`. |
| **Codex** | `~/.codex/config.toml` block | `codex mcp login` for OAuth; `/mcp` in the TUI. |
| **Cursor / Generic MCP JSON** | `mcpServers` JSON | Works with Cursor and most MCP clients. |
| **Generic Markdown** | Full setup guide | Self-contained doc with every compatible config. |

## Built-in recipes

| Recipe | Transport | Auth | Notes |
| --- | --- | --- | --- |
| **Salesforce Marketing Cloud Engagement MCP** | streamable-http | OAuth | US/EU regions; derives Tenant ID and builds the redirect URI. |
| **Custom Streamable HTTP MCP** | streamable-http | none / oauth / bearer / api-key | Bring your own server URL; optional bearer-token env var name. |
| **Custom STDIO MCP** | stdio | none | Local subprocess: command, args, and env var names. |

---

## How to add a new MCP recipe

Recipes are plain data in `src/data/recipes.ts`. Add an `MCPRecipe` object and
include it in the exported `RECIPES` array:

```ts
export const MY_RECIPE: MCPRecipe = {
  id: "my-provider",
  name: "My Provider MCP",
  description: "…",
  category: "Custom",
  transport: "streamable-http",
  authModes: ["bearer"],
  inputs: [
    { id: "serverName", label: "Server name", type: "text", required: true, validation: "nonEmpty" },
    { id: "serverUrl", label: "Server URL", type: "url", required: true, validation: "url" },
  ],
  endpointTemplate: "{serverUrl}",        // or e.g. "{baseUrl}/t/{tenantId}/api/mcp"
  // redirectUriTemplate: "…/oauth/callback",
  // regions: [{ id, label, baseUrl }],
  // capabilityCatalog: [...],
  // safetyNotes: ["…"],
};
```

- `endpointTemplate` / `redirectUriTemplate` use `{placeholder}` tokens that
  are filled from input ids plus the derived `baseUrl`, `tenantId`, and
  `clientId`. Omit `redirectUriTemplate` and no redirect URI is generated.
- Inputs may declare a `validation` rule (`clientId24Soft`, `url`, `tenantId`,
  `nonEmpty`) and a `derive` rule (`tenantIdFromAuthBaseUri`).
- Optionally attach a `capabilityCatalog` of known tools tagged by risk level.

## How to add a new AI client generator

1. Add an `AIClient` entry to `src/data/clients.ts` declaring the transports it
   `supports` and its `outputTypes`.
2. Add a `case` to `buildClientBlocks()` in `src/lib/template.ts` returning the
   `OutputBlock[]` for that client, and (optionally) a `case` to
   `buildSetupNotes()`.

The new client automatically appears in the selector for any recipe whose
transport it supports, and is included in the Markdown export.

---

## Security & privacy

- **All values are processed locally in your browser.** The app does not send
  your Client ID, tenant ID, URLs, or tokens anywhere.
- **No inputs are persisted** — no cookies, no backend. The only `localStorage`
  entry is your light/dark theme preference (`mcp-quickstart-theme`).
- **No analytics, no login, no external API calls.**
- All example values in the UI are **fake** — never real credentials.

### Why the Client Secret is not requested

The MCP connection and OAuth flow are completed inside your AI client, not in
this app. The Client ID and Authentication Base URI are configuration values,
not secrets — so there is no reason to paste a **Client Secret** here. The SFMC
recipe never asks for one. Custom recipes reference tokens by **environment
variable name** only; if a custom recipe ever marks a secret as required, the
app warns strongly against pasting secrets into any hosted version.

## Automation Optimizer Pack

The **Automation Optimizer Pack** is the second tab. It is a **prompt/runbook
generator** — not an integration.

- It **does not** connect to Salesforce itself.
- It assumes you have **already connected an SFMC MCP server** through your AI
  client (Claude Code, Codex, Gemini CLI, Cursor, …) using the MCP Setup
  Generator tab.
- It uses **your local AI client** to retrieve SFMC context through MCP — the
  AI client does all retrieval; this app only generates the instructions.
- It is **read-only by default** (MVP supports Read-only Audit Mode only; Draft
  Refactor and Controlled Apply are shown as coming later and are disabled).
- It helps analyze **automations, SQL Query Activities, journeys, and Data
  Extension dependencies**, and produces a structured optimization report.
- It is **not** a production deployment tool and **does not auto-change** any
  Marketing Cloud assets.

Because different MCP clients expose tools under different names, the generated
prompt always **starts with tool discovery** and instructs the AI client to
inspect the actual available tools and adapt — example Salesforce tool names
are included but clearly marked as examples, never mandatory.

### Editing the prompt

The master prompt is **not hard-coded in TypeScript** — it lives in
`src/prompts/automation-optimizer.prompt.md` and is imported as raw text
(`?raw`). That Markdown file is the **single source of truth**: edit it and the
generated prompt changes everywhere (the dev server hot-reloads it). Keep the
`{placeholders}` intact — `{mcpServersBlock}`, `{analysisScope}`,
`{automationName}`, `{journeyName}`, `{businessGoal}`, `{marketNotes}`,
`{permissionMode}`, and `{contextWorkflow}` are interpolated at generation time.

### How it works

1. Pick your AI client, one or more **MCP servers** (each bound to an SFMC area;
   default a single `mce` for all areas), and an analysis scope: **Selected
   Automation**, **Active Journey Pipelines**, or **Pasted Context Only**.
2. Fill in the scope inputs (automation/journey name, business goal, BU notes,
   or pasted context).
3. Copy the generated **Prompt**, **Markdown Runbook**, **Rule Catalog**, or
   **Client Notes** and run it inside your AI client.

### Example workflow — Claude Code

1. Connect the SFMC MCP server (MCP Setup Generator tab → `claude mcp add …`).
2. In Claude Code, run `/mcp` and authenticate the server.
3. In the Optimizer tab choose **Claude Code**, scope **Selected Automation**,
   enter your automation name, and copy the prompt.
4. Paste it into Claude Code and keep the first run read-only.

### Example workflow — Codex

1. Ensure the server is in `~/.codex/config.toml` (or a project
   `.codex/config.toml`) with `default_tools_approval_mode = "prompt"`.
2. In the Codex TUI run `/mcp` to confirm the server is active; for OAuth
   servers use `codex mcp login <server-name>`.
3. In the Optimizer tab choose **Codex** and copy the **AGENTS.md / CODEX.md**
   instruction block into your project, then run the prompt. Use
   `enabled_tools` / `disabled_tools` for stricter local control.

### Example workflow — Gemini CLI

1. Add the server to Gemini CLI (`gemini mcp add … -t http …`).
2. Run `/mcp auth` and `/mcp auth <server-name>` where required.
3. In the Optimizer tab choose **Gemini CLI**, copy the prompt, and run it.

### Example generated prompt excerpt

```markdown
## Safety rules
- Read-only analysis only.
- First discover available tools before doing anything else.
- Do not call any destructive or write tool.
- Do not create, update, delete, clear, run, execute, send, publish, trigger,
  or modify anything.

## Tool discovery (do this first)
- List the available MCP tools exposed by the connected server.
- Classify each available tool as read-only / write / destructive / unknown.
- Only use read-only tools. Do not call write/destructive tools.
```

### Safety notes

- The runbook is read-only and repeatedly instructs the AI client never to
  create, update, delete, clear, run, execute, send, publish, or trigger
  anything.
- Start with read-only scopes on the MCP server and review every output before
  acting on it.
- No secrets are collected; the app stores nothing and makes no network calls.

### Known limitations (Optimizer Pack)

- Actual MCP tool names may differ from the examples shown.
- The local AI client must be authenticated to the MCP server.
- The optimizer can only inspect what the MCP server exposes and what you have
  permission to read.
- Performance findings are inferred unless run durations / row counts are
  available.
- The app does not verify live MCP connectivity.
- The app does not execute MCP tool calls itself.
- The app does not apply changes to SFMC.

---

## Limitations

- The app does not verify that the MCP server is reachable.
- The app does not authenticate to MCP providers.
- The app does not inspect live MCP tools unless you paste tool output.
- Capability classification is heuristic unless backed by a maintained catalog.
- Exact scopes must be confirmed from official provider documentation.
- OAuth behavior differs by AI client.

## Roadmap

- More built-in MCP recipes
- Download config files
- Import / export recipe JSON
- Live local MCP inspection helper
- More client-specific generators
- Official scope catalogs
- MCP risk scanner
- Hosted docs site
- Browser extension or CLI companion

---

## Project structure

```
src/
  App.tsx                 # Page layout + local state wiring
  main.tsx
  index.css
  data/
    recipes.ts            # Built-in MCP recipes
    clients.ts            # Built-in AI client generators
    sfmcTools.ts          # SFMC capability catalog
    optimizerRules.ts     # Optimizer risk-check catalog (28 rules)
    optimizerTemplates.ts # Labels, context workflows, client notes; imports the prompt .md
  prompts/
    automation-optimizer.prompt.md  # Master prompt (source of truth, imported ?raw)
  components/
    Hero.tsx
    RecipeSelector.tsx
    DynamicProviderForm.tsx
    ClientSelector.tsx
    GeneratedOutputs.tsx
    MarkdownExport.tsx
    CopyButton.tsx        # CopyButton + reusable CodeBlock
    SafetyNotes.tsx
    OptimizerPack.tsx     # Automation Optimizer Pack orchestrator
    OptimizerScopeSelector.tsx
    OptimizerInputs.tsx
    OptimizerPromptOutputs.tsx
    OptimizerRulePreview.tsx
  lib/
    template.ts           # URL/config builders, connection resolver, output blocks
    validation.ts         # extractTenantId, sanitizeServerName, validators
    markdown.ts           # generateMarkdownSetup
    capability.ts         # classifyToolRisk, classifyToolList
    optimizerPrompt.ts    # generateOptimizerPrompt + per-client generators
    optimizerMarkdown.ts  # generateOptimizerMarkdownRunbook, buildRuleCatalogMarkdown
  types/
    index.ts
  test/
    template.test.ts
    validation.test.ts
    markdown.test.ts
    optimizerPrompt.test.ts
    optimizerMarkdown.test.ts
```

---

_MCP Quickstart Kit is an unofficial, client-side helper and is not affiliated
with Anthropic, Google, OpenAI, Cursor, or Salesforce. Verify all generated
values and scopes against official provider documentation before use._
