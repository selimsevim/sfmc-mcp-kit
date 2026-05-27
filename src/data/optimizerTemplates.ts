import type {
  McpConcern,
  OptimizerClient,
  OptimizerScope,
  PermissionMode,
} from "../types";
// Source of truth for the master prompt. Imported as raw text so editing the
// Markdown file changes the generated prompt (the dev server hot-reloads it).
import optimizerPromptTemplate from "../prompts/automation-optimizer.prompt.md?raw";

/** Human-readable labels used in both the UI and generated prompts. */
export const SCOPE_LABELS: Record<OptimizerScope, string> = {
  "selected-automation": "Selected Automation",
  "active-journey-pipelines": "Active Journey Pipelines",
  "pasted-context-only": "Pasted Context Only",
};

/** SFMC areas a server can own, and the order shown in the UI. */
export const MCP_CONCERNS: McpConcern[] = [
  "all",
  "automations",
  "journeys",
  "content-assets",
  "sql-data",
  "contacts",
];

export const MCP_CONCERN_LABELS: Record<McpConcern, string> = {
  all: "All / general SFMC areas",
  automations: "Automations & Automation Studio",
  journeys: "Journeys (Journey Builder)",
  "content-assets": "Content & assets (emails, templates)",
  "sql-data": "SQL Query Activities & Data Extensions",
  contacts: "Contacts & subscribers",
};

export const PERMISSION_MODE_LABELS: Record<PermissionMode, string> = {
  "read-only-audit": "Read-only Audit Mode",
  "draft-refactor": "Draft Refactor Mode",
  "controlled-apply": "Controlled Apply Mode",
};

export const CLIENT_LABELS: Record<OptimizerClient, string> = {
  "claude-code": "Claude Code",
  codex: "Codex",
  "gemini-cli": "Gemini CLI",
  generic: "Generic MCP Client",
};

export const OPTIMIZER_WARNING =
  "Automation Optimizer Pack generates instructions for your local AI client. The AI client will use your connected MCP server and your granted permissions. Start with read-only scopes. Review all outputs before applying changes.";

/** Context collection workflows per scope (interpolated into `{contextWorkflow}`). */
export const CONTEXT_WORKFLOWS: Record<OptimizerScope, string> = {
  "selected-automation": `## Context collection workflow — Selected Automation
- Find the automation by name/key: {automationName}.
- Retrieve automation details and steps.
- Identify the SQL Query Activities in each step.
- For each query, retrieve: name/key/id, SQL text, target DE, write method, and schedule context if available.
- Parse the SQL for source DE references (FROM/JOIN/UPDATE/MERGE).
- Retrieve metadata for the source and target Data Extensions.
- If tools exist, find journeys that use the target DEs as entry sources (filter: {journeyName}).
- Build an automation dependency map.`,
  "active-journey-pipelines": `## Context collection workflow — Active Journey Pipelines
- Retrieve running/published journeys only (filter: {journeyName}).
- Use the most recent version only where possible.
- Extract each journey's entry source DE key/name.
- Search/retrieve SQL Query Activities that target those entry DEs.
- Find the automations that contain those SQL Query Activities.
- Retrieve SQL text, write method, source DEs, target DEs, and metadata.
- Build a journey-to-query-to-automation dependency map.`,
  "pasted-context-only": `## Context collection workflow — Pasted Context Only
- Do not call MCP tools.
- Analyze only the pasted content provided below.
- If information is missing, mark it as unknown.

### Pasted context
{pastedContextBlock}`,
};

/**
 * The reusable master prompt template, sourced verbatim from
 * `src/prompts/automation-optimizer.prompt.md` — the single source of truth.
 * Edit that Markdown file to change the generated prompt. `{placeholders}` are
 * interpolated by generateOptimizerPrompt(); `{contextWorkflow}` is the
 * scope-specific block above.
 */
export const AUTOMATION_OPTIMIZER_PROMPT = optimizerPromptTemplate;

/** Client-specific setup notes shown in the "Client Notes" output. */
export const CLIENT_NOTES: Record<OptimizerClient, string[]> = {
  "claude-code": [
    "Confirm the MCP server is connected.",
    "Use /mcp to inspect/authenticate the server where applicable.",
    "Paste the generated prompt into Claude Code.",
    "Keep the first run read-only.",
  ],
  codex: [
    "Confirm the MCP server is present in ~/.codex/config.toml or .codex/config.toml.",
    "Use /mcp in the Codex TUI to see active MCP servers.",
    "For OAuth MCP servers, use `codex mcp login <server-name>` where supported.",
    'Prefer default_tools_approval_mode = "prompt".',
    "Use enabled_tools / disabled_tools in config.toml for stricter local control where useful.",
    "Paste the generated instructions into AGENTS.md or CODEX.md for project-local behavior.",
  ],
  "gemini-cli": [
    "Confirm the MCP server is available.",
    "Use /mcp auth and /mcp auth {serverName} where required.",
    "Paste the generated prompt.",
  ],
  generic: [
    "Verify the client can list MCP tools.",
    "Paste the generated prompt.",
    "Do not allow write/destructive tools for the first run.",
  ],
};
