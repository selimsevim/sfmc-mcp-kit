/**
 * Pure builders for MCP server URLs and per-client configuration snippets.
 * No side effects, no network — everything is string assembly.
 */
import type {
  AppState,
  MCPRecipe,
  ResolvedConnection,
} from "../types";
import { extractTenantId, sanitizeServerName } from "./validation";

/** Join URL segments, collapsing duplicate slashes between them. */
function joinUrl(base: string, ...segments: string[]): string {
  const trimmedBase = base.replace(/\/+$/, "");
  const path = segments
    .map((s) => s.replace(/^\/+/, "").replace(/\/+$/, ""))
    .filter(Boolean)
    .join("/");
  return path ? `${trimmedBase}/${path}` : trimmedBase;
}

/**
 * Replace `{key}` placeholders in a template with values. Unknown placeholders
 * are left as-is so missing inputs are visible rather than silently blank.
 */
export function renderTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key] : match,
  );
}

/** SFMC MCP server URL: {baseUrl}/t/{tenantId}/c/{clientId}/api/mcp */
export function buildSfmcEndpoint(
  baseUrl: string,
  tenantId: string,
  clientId: string,
): string {
  return joinUrl(baseUrl, "t", tenantId, "c", clientId, "api/mcp");
}

/** SFMC OAuth redirect URI: {mcpUrl}/oauth/callback */
export function buildSfmcRedirectUri(
  baseUrl: string,
  tenantId: string,
  clientId: string,
): string {
  return joinUrl(
    baseUrl,
    "t",
    tenantId,
    "c",
    clientId,
    "api/mcp/oauth/callback",
  );
}

/** Claude Code: register an HTTP MCP server. */
export function buildClaudeCommand(serverName: string, url: string): string {
  return `claude mcp add --transport http ${serverName} ${url}`;
}

/** Gemini CLI: register an HTTP MCP server. */
export function buildGeminiCommand(serverName: string, url: string): string {
  return `gemini mcp add ${serverName} -t http ${url}`;
}

export interface CodexHttpOptions {
  /** Name of an env var holding a bearer token, if any. */
  bearerTokenEnvVar?: string;
}

/** Codex config.toml block for a Streamable HTTP MCP server. */
export function buildCodexTomlHttp(
  serverName: string,
  url: string,
  options: CodexHttpOptions = {},
): string {
  const lines = [
    `[mcp_servers.${serverName}]`,
    `url = "${url}"`,
    `default_tools_approval_mode = "prompt"`,
    `enabled = true`,
  ];
  if (options.bearerTokenEnvVar?.trim()) {
    lines.push(`bearer_token_env_var = "${options.bearerTokenEnvVar.trim()}"`);
  }
  return lines.join("\n");
}

/** Codex config.toml block for a STDIO MCP server. */
export function buildCodexTomlStdio(
  serverName: string,
  command: string,
  args: string[],
  envVars: string[] = [],
): string {
  const argsList = args.map((a) => `"${a}"`).join(", ");
  const lines = [
    `[mcp_servers.${serverName}]`,
    `command = "${command}"`,
    `args = [${argsList}]`,
    `enabled = true`,
    `default_tools_approval_mode = "prompt"`,
  ];
  if (envVars.length > 0) {
    lines.push(`env_vars = [${envVars.map((v) => `"${v}"`).join(", ")}]`);
  }
  return lines.join("\n");
}

/** Generic mcpServers JSON for an HTTP server (Cursor and most clients). */
export function buildGenericJsonHttp(serverName: string, url: string): string {
  return JSON.stringify(
    { mcpServers: { [serverName]: { type: "http", url } } },
    null,
    2,
  );
}

/** Generic mcpServers JSON for a STDIO server. */
export function buildGenericJsonStdio(
  serverName: string,
  command: string,
  args: string[],
): string {
  return JSON.stringify(
    { mcpServers: { [serverName]: { command, args } } },
    null,
    2,
  );
}

/** Split a free-text list into trimmed, non-empty tokens. */
export function splitList(value: string | undefined, byComma = false): string[] {
  if (!value?.trim()) return [];
  const pattern = byComma ? /[\s,]+/ : /\s+/;
  return value.trim().split(pattern).filter(Boolean);
}

/** Default server name for a recipe when there is no `serverName` input. */
function defaultServerName(recipe: MCPRecipe): string {
  return recipe.id === "sfmc-mce" ? "mce" : sanitizeServerName(recipe.id);
}

/**
 * Resolve raw form state into the derived connection values. Pure: given the
 * same state and recipe it always returns the same object.
 */
export function resolveConnection(
  state: AppState,
  recipe: MCPRecipe,
): ResolvedConnection {
  const { values } = state;
  const region =
    recipe.regions?.find((r) => r.id === state.regionId) ?? null;
  const baseUrl = region?.baseUrl ?? "";

  const tenantInput = recipe.inputs.find(
    (i) => i.derive === "tenantIdFromAuthBaseUri",
  );
  const tenantId = tenantInput
    ? extractTenantId(values[tenantInput.id] ?? "")
    : "";

  const clientId = values.clientId ?? "";

  const serverName = values.serverName?.trim()
    ? sanitizeServerName(values.serverName)
    : defaultServerName(recipe);

  const templateValues: Record<string, string> = {
    ...values,
    baseUrl,
    tenantId,
    clientId,
  };

  const mcpServerUrl = recipe.endpointTemplate
    ? renderTemplate(recipe.endpointTemplate, templateValues)
    : "";
  const redirectUri = recipe.redirectUriTemplate
    ? renderTemplate(recipe.redirectUriTemplate, templateValues)
    : "";

  return {
    recipe,
    region,
    authMode: state.authMode,
    serverName,
    mcpServerUrl,
    redirectUri,
    tenantId,
    command: values.command?.trim() ?? "",
    args: splitList(values.args),
    envVars: splitList(values.envVars, true),
  };
}

export type OutputLanguage = "bash" | "toml" | "json" | "text" | "markdown";

export interface OutputBlock {
  id: string;
  title: string;
  language: OutputLanguage;
  content: string;
  /** Optional plain-text note rendered beneath the block. */
  note?: string;
}

function bearerEnvVar(state: AppState): string | undefined {
  const v = state.values.bearerTokenEnvVar?.trim();
  return v || undefined;
}

/**
 * A safe, read-only first test prompt tailored to the recipe. Never asks the
 * client to mutate anything.
 */
export function buildTestPrompt(recipe: MCPRecipe): string {
  if (recipe.id === "sfmc-mce") {
    return "List the available Marketing Cloud MCP tools and confirm whether you can access Marketing Cloud in read-only mode. Do not create, update, delete, clear, send, or run anything.";
  }
  return "List the available tools exposed by this MCP server and describe what each one does. Do not create, update, delete, clear, send, execute, or run anything.";
}

/** Concise, client-specific setup notes shown beneath the generated config. */
export function buildSetupNotes(
  clientId: string,
  conn: ResolvedConnection,
): string[] {
  const oauth = conn.authMode === "oauth";
  switch (clientId) {
    case "claude":
      return [
        "Run the command above in your terminal to register the server.",
        oauth
          ? "Open Claude Code and use /mcp to inspect and authenticate the server."
          : "Open Claude Code and use /mcp to confirm the server is connected.",
      ];
    case "gemini":
      return [
        "Run the command above to register the server.",
        oauth
          ? `Run /mcp auth, then /mcp auth ${conn.serverName} to authenticate.`
          : "Use /mcp to confirm the server is connected.",
      ];
    case "codex": {
      const notes = [
        "Add the TOML block to ~/.codex/config.toml or a project-scoped .codex/config.toml.",
        "In the Codex TUI, use /mcp to see active MCP servers.",
      ];
      if (oauth) {
        notes.push(`If the server uses OAuth, run: codex mcp login ${conn.serverName}`);
      }
      return notes;
    }
    case "cursor":
      return [
        "Add the JSON block to your client's MCP config (e.g. Cursor's mcp.json).",
        "Restart or reload the client so it picks up the new server.",
      ];
    case "markdown":
      return ["Copy the full guide below and share it with your team."];
    default:
      return [];
  }
}

/**
 * Build the output snippet(s) for a given client from a resolved connection.
 * Returns an empty array when the client cannot support the recipe transport.
 */
export function buildClientBlocks(
  clientId: string,
  conn: ResolvedConnection,
  state: AppState,
): OutputBlock[] {
  const isStdio = conn.recipe.transport === "stdio";
  const { serverName, mcpServerUrl, command, args, envVars } = conn;

  switch (clientId) {
    case "claude":
      if (isStdio) return [];
      return [
        {
          id: "claude-cmd",
          title: "Claude Code command",
          language: "bash",
          content: buildClaudeCommand(serverName, mcpServerUrl),
        },
      ];
    case "gemini":
      if (isStdio) return [];
      return [
        {
          id: "gemini-cmd",
          title: "Gemini CLI command",
          language: "bash",
          content: buildGeminiCommand(serverName, mcpServerUrl),
        },
      ];
    case "codex":
      return [
        {
          id: "codex-toml",
          title: "Codex config.toml",
          language: "toml",
          content: isStdio
            ? buildCodexTomlStdio(serverName, command, args, envVars)
            : buildCodexTomlHttp(serverName, mcpServerUrl, {
                bearerTokenEnvVar: bearerEnvVar(state),
              }),
        },
      ];
    case "cursor":
      return [
        {
          id: "cursor-json",
          title: "Cursor / Generic MCP JSON",
          language: "json",
          content: isStdio
            ? buildGenericJsonStdio(serverName, command, args)
            : buildGenericJsonHttp(serverName, mcpServerUrl),
        },
      ];
    default:
      return [];
  }
}
