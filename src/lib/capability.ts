import type { RiskLevel } from "../types";

/**
 * Heuristically classify an MCP tool name by its action verb.
 *
 * Precedence (highest first): destructive > write > read-only > async.
 * `async` is a modifier, so it only wins when no action verb matches (e.g. a
 * bare "...async_job"); "create_..._async" classifies as write, and
 * "update_..._async" as destructive.
 *
 * This is best-effort only — always confirm against official documentation.
 */
export function classifyToolRisk(toolName: string): RiskLevel {
  const name = (toolName ?? "").toLowerCase();
  if (!name.trim()) return "unknown";

  const has = (...words: string[]) => words.some((w) => name.includes(w));

  if (has("update", "delete", "clear", "run", "execute", "send", "publish")) {
    return "destructive";
  }
  if (has("create", "upsert", "insert")) {
    return "write";
  }
  if (has("get", "list", "retrieve", "search", "describe", "read")) {
    return "read-only";
  }
  if (has("async")) {
    return "async";
  }
  return "unknown";
}

export interface ClassifiedTool {
  name: string;
  risk: RiskLevel;
}

/**
 * Split pasted MCP tool output into tool names and classify each. Accepts
 * newline-, comma-, or whitespace-separated lists; strips common list markers
 * (bullets, leading numbering, quotes) and de-duplicates.
 */
export function classifyToolList(pasted: string): ClassifiedTool[] {
  if (!pasted?.trim()) return [];

  const seen = new Set<string>();
  const tools: ClassifiedTool[] = [];

  for (const rawLine of pasted.split(/[\n,]+/)) {
    // Pull the first token that looks like a tool identifier from each line.
    const cleaned = rawLine
      .replace(/^[\s*\-•\d.()]+/, "")
      .trim()
      .replace(/^["'`]|["'`:,]+$/g, "");
    const match = cleaned.match(/[a-zA-Z][a-zA-Z0-9_.-]*/);
    if (!match) continue;

    const name = match[0];
    if (seen.has(name)) continue;
    seen.add(name);
    tools.push({ name, risk: classifyToolRisk(name) });
  }

  return tools;
}

export const HEURISTIC_WARNING =
  "This classification is heuristic. Confirm against official docs before using.";

export const SAFE_DISCOVERY_PROMPT =
  "List all available tools exposed by this MCP server. For each tool, show: tool name, description, required input fields, whether it appears read-only/write/destructive, and what permissions it likely needs. Do not call any tool that creates, updates, deletes, clears, sends, executes, or runs anything.";
