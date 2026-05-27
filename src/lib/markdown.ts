import type { AppState } from "../types";
import { getRecipe } from "../data/recipes";
import { getClient } from "../data/clients";
import {
  buildClientBlocks,
  buildSetupNotes,
  buildTestPrompt,
  resolveConnection,
} from "./template";

const FENCE: Record<string, string> = {
  bash: "bash",
  toml: "toml",
  json: "json",
  text: "",
  markdown: "",
};

/**
 * Generate a complete, copyable Markdown setup guide for the current state.
 * Includes the server URL, redirect URI (when applicable), the selected
 * client's config, a safe first test prompt, setup notes, and safety notes.
 *
 * For the "Generic Markdown" client, every compatible client config is
 * included so the document is self-contained.
 */
export function generateMarkdownSetup(state: AppState): string {
  const recipe = getRecipe(state.recipeId);
  if (!recipe) return "";

  const conn = resolveConnection(state, recipe);
  const lines: string[] = [];

  lines.push(`# MCP setup: ${recipe.name}`, "");
  lines.push(`> Generated with MCP Quickstart Kit. ${recipe.description}`, "");

  // Connection facts.
  lines.push("## Connection", "");
  if (conn.region) {
    lines.push(`- **Region:** ${conn.region.label}`);
  }
  lines.push(`- **Transport:** ${recipe.transport}`);
  lines.push(`- **Auth mode:** ${conn.authMode}`);
  lines.push(`- **Server name:** \`${conn.serverName}\``);
  if (conn.mcpServerUrl) {
    lines.push(`- **MCP server URL:** \`${conn.mcpServerUrl}\``);
  }
  if (recipe.transport === "stdio" && conn.command) {
    lines.push(
      `- **Command:** \`${conn.command}${conn.args.length ? " " + conn.args.join(" ") : ""}\``,
    );
  }
  if (conn.redirectUri) {
    lines.push(`- **OAuth redirect URI:** \`${conn.redirectUri}\``);
  }
  lines.push("");

  // Client config block(s).
  const clientIds =
    state.clientId === "markdown"
      ? ["claude", "gemini", "codex", "cursor"]
      : [state.clientId];

  lines.push("## Client configuration", "");
  for (const id of clientIds) {
    const client = getClient(id);
    const blocks = buildClientBlocks(id, conn, state);
    if (blocks.length === 0) continue;
    if (clientIds.length > 1 && client) {
      lines.push(`### ${client.name}`, "");
    }
    for (const block of blocks) {
      const fence = FENCE[block.language] ?? "";
      lines.push(`**${block.title}**`, "", `\`\`\`${fence}`, block.content, "```", "");
    }
    for (const note of buildSetupNotes(id, conn)) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  // Safe first test prompt.
  lines.push("## Safe first test prompt", "", "```text", buildTestPrompt(recipe), "```", "");

  // Safety notes.
  if (recipe.safetyNotes?.length) {
    lines.push("## Safety notes", "");
    for (const note of recipe.safetyNotes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  lines.push(
    "---",
    "",
    "_All values were processed locally in your browser. This guide may contain identifiers and URLs you pasted — do not commit secrets._",
  );

  return lines.join("\n");
}
