import type {
  McpServerBinding,
  OptimizerState,
  ValidationResult,
} from "../types";
import {
  AUTOMATION_OPTIMIZER_PROMPT,
  CLIENT_LABELS,
  CLIENT_NOTES,
  CONTEXT_WORKFLOWS,
  MCP_CONCERN_LABELS,
  PERMISSION_MODE_LABELS,
  SCOPE_LABELS,
} from "../data/optimizerTemplates";

const NOT_SPECIFIED = "(not specified)";

/**
 * Normalize an MCP server name to match how AI clients reference it: trimmed,
 * lowercased, spaces/unsafe chars to hyphens. Falls back to "mce".
 */
export function normalizeMcpServerName(input: string): string {
  const cleaned = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+/, "")
    .replace(/[-_]+$/, "");
  return cleaned || "mce";
}

/**
 * Resolve the server bindings to use: the `mcpServers` list (named entries
 * only), falling back to the legacy single `mcpServerName` as an "all" server.
 * Returns an empty array when nothing is configured.
 */
export function resolveMcpServers(state: OptimizerState): McpServerBinding[] {
  const list = (state.mcpServers ?? []).filter((s) => s.name.trim());
  if (list.length > 0) return list;
  const legacy = state.mcpServerName?.trim();
  return legacy ? [{ name: legacy, concern: "all" }] : [];
}

/** Normalized name of the first/primary server (used where one is needed). */
export function primaryMcpServerName(state: OptimizerState): string {
  return normalizeMcpServerName(resolveMcpServers(state)[0]?.name ?? "");
}

/** The `## Run parameters` line(s) describing the configured MCP server(s). */
export function mcpServersBlock(state: OptimizerState): string {
  const servers = resolveMcpServers(state);
  if (servers.length === 0) return "- MCP server name: (none specified)";
  if (servers.length === 1) {
    const s = servers[0];
    return `- MCP server: \`${normalizeMcpServerName(s.name)}\` — ${MCP_CONCERN_LABELS[s.concern]}`;
  }
  return [
    "- MCP servers (route each retrieval to the server that owns the relevant SFMC area; if only one server exposes a needed tool, use it):",
    ...servers.map(
      (s) =>
        `  - \`${normalizeMcpServerName(s.name)}\` — ${MCP_CONCERN_LABELS[s.concern]}`,
    ),
  ].join("\n");
}

/** Soft validation. `valid: false` only when a scope's required input is empty. */
export function validateOptimizerState(state: OptimizerState): ValidationResult {
  if (resolveMcpServers(state).length === 0) {
    return {
      valid: false,
      warning: "Add at least one MCP server name (e.g. mce).",
    };
  }
  if (
    state.scope === "selected-automation" &&
    !state.automationName?.trim()
  ) {
    return {
      valid: true,
      warning:
        "No automation name/key entered — the runbook will ask the AI client to locate it interactively.",
    };
  }
  if (state.scope === "pasted-context-only" && !state.pastedContext?.trim()) {
    return {
      valid: false,
      warning: "Paste the context to analyze for Pasted Context Only scope.",
    };
  }
  return { valid: true };
}

function fill(value: string | undefined): string {
  const v = value?.trim();
  return v ? v : NOT_SPECIFIED;
}

function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? vars[key] : match,
  );
}

/**
 * Generate the core, client-agnostic optimizer prompt. The scope-specific
 * context workflow is interpolated, then the prompt's `{placeholders}` are
 * filled from state. Always read-only.
 */
export function generateOptimizerPrompt(state: OptimizerState): string {
  const serverName = primaryMcpServerName(state);
  const vars: Record<string, string> = {
    mcpServersBlock: mcpServersBlock(state),
    mcpServerName: serverName,
    serverName,
    analysisScope: SCOPE_LABELS[state.scope],
    automationName: fill(state.automationName),
    journeyName: fill(state.journeyName),
    businessGoal: fill(state.businessGoal),
    marketNotes: fill(state.marketNotes),
    permissionMode: PERMISSION_MODE_LABELS[state.permissionMode],
    pastedContextBlock: state.pastedContext?.trim()
      ? state.pastedContext.trim()
      : "(no context pasted)",
  };

  // Resolve the scope workflow first (it contains its own placeholders).
  const contextWorkflow = interpolate(CONTEXT_WORKFLOWS[state.scope], vars);

  return interpolate(AUTOMATION_OPTIMIZER_PROMPT, {
    ...vars,
    contextWorkflow,
  });
}

function clientNotesBlock(state: OptimizerState): string {
  const serverName = primaryMcpServerName(state);
  const notes = CLIENT_NOTES[state.client].map((n) =>
    n.replace(/\{serverName\}/g, serverName),
  );
  return notes.map((n) => `- ${n}`).join("\n");
}

/** Claude Code: setup notes + core prompt. */
export function generateClaudeOptimizerPrompt(state: OptimizerState): string {
  return `<!-- Claude Code — Automation Optimizer Pack -->
## Claude Code setup
${clientNotesBlock({ ...state, client: "claude-code" })}

---

${generateOptimizerPrompt(state)}`;
}

/** Codex: AGENTS.md / CODEX.md style instruction block + core prompt. */
export function generateCodexOptimizerInstructions(
  state: OptimizerState,
): string {
  const names = resolveMcpServers(state).map((s) =>
    normalizeMcpServerName(s.name),
  );
  const serverNames = names.length ? names : [primaryMcpServerName(state)];
  const configBlocks = serverNames
    .map(
      (name) => `[mcp_servers.${name}]
url = "https://your-sfmc-mcp-endpoint/api/mcp"
default_tools_approval_mode = "prompt"
enabled = true
# enabled_tools = ["<read-only tool names once discovered>"]
# disabled_tools = ["<write/destructive tool names>"]`,
    )
    .join("\n\n");
  const loginLine = serverNames
    .map((n) => `\`codex mcp login ${n}\``)
    .join(", ");
  return `# AGENTS.md / CODEX.md — SFMC Automation Optimizer (read-only)

## MCP server(s)
${mcpServersBlock(state)}

Configure these in \`~/.codex/config.toml\` or a project-scoped \`.codex/config.toml\`. Codex supports STDIO and Streamable HTTP MCP servers.

## Codex operating instructions
- Use \`/mcp\` to verify the SFMC MCP server(s) are active.
- Keep destructive tools in prompt approval mode (\`default_tools_approval_mode = "prompt"\`).
- Do not call tools that create, update, delete, clear, run, execute, send, publish, or trigger anything.
- Use \`enabled_tools\` / \`disabled_tools\` in \`config.toml\` if you want stricter local control.
- For OAuth MCP servers, use ${loginLine} where supported.

### Example config.toml (Streamable HTTP)
\`\`\`toml
${configBlocks}
\`\`\`

## Setup notes
${clientNotesBlock({ ...state, client: "codex" })}

---

${generateOptimizerPrompt(state)}`;
}

/** Gemini CLI: setup notes + core prompt. */
export function generateGeminiOptimizerPrompt(state: OptimizerState): string {
  return `<!-- Gemini CLI — Automation Optimizer Pack -->
## Gemini CLI setup
${clientNotesBlock({ ...state, client: "gemini-cli" })}

---

${generateOptimizerPrompt(state)}`;
}

/** Generic MCP client: setup notes + core prompt. */
export function generateGenericOptimizerPrompt(state: OptimizerState): string {
  return `<!-- Generic MCP client — Automation Optimizer Pack -->
## Generic MCP client setup
${clientNotesBlock({ ...state, client: "generic" })}

---

${generateOptimizerPrompt(state)}`;
}

/** Dispatch to the correct client-specific generator. */
export function generateClientOptimizerPrompt(state: OptimizerState): string {
  switch (state.client) {
    case "claude-code":
      return generateClaudeOptimizerPrompt(state);
    case "codex":
      return generateCodexOptimizerInstructions(state);
    case "gemini-cli":
      return generateGeminiOptimizerPrompt(state);
    case "generic":
    default:
      return generateGenericOptimizerPrompt(state);
  }
}

/** The client notes list for the currently selected client. */
export function getClientNotes(state: OptimizerState): string[] {
  const serverName = primaryMcpServerName(state);
  return CLIENT_NOTES[state.client].map((n) =>
    n.replace(/\{serverName\}/g, serverName),
  );
}

export { CLIENT_LABELS };
