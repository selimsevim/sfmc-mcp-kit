import type { AIClient } from "../types";

/**
 * Built-in AI client/tool generators. Each entry describes which transports it
 * supports and which output formats the app produces for it.
 */
export const CLIENTS: AIClient[] = [
  {
    id: "claude",
    name: "Claude Code",
    description:
      "Anthropic's CLI. Registers an MCP server with `claude mcp add` and authenticates via /mcp.",
    supports: ["streamable-http"],
    outputTypes: ["command"],
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    description:
      "Google's CLI. Registers an MCP server with `gemini mcp add` and authenticates via /mcp auth.",
    supports: ["streamable-http"],
    outputTypes: ["command"],
  },
  {
    id: "codex",
    name: "Codex",
    description:
      "OpenAI Codex CLI/IDE. Reads MCP servers from ~/.codex/config.toml or a project .codex/config.toml.",
    supports: ["streamable-http", "stdio"],
    outputTypes: ["toml", "command"],
  },
  {
    id: "cursor",
    name: "Cursor / Generic MCP JSON",
    description:
      "Standard mcpServers JSON block compatible with Cursor and most other MCP clients.",
    supports: ["streamable-http", "stdio"],
    outputTypes: ["json"],
  },
  {
    id: "markdown",
    name: "Generic Markdown",
    description: "A full, copyable Markdown setup guide for the selected recipe.",
    supports: ["streamable-http", "stdio"],
    outputTypes: ["markdown"],
  },
];

export function getClient(id: string): AIClient | undefined {
  return CLIENTS.find((c) => c.id === id);
}
