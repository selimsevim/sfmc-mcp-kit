import type { OptimizerRule, OptimizerState } from "../types";
import { OPTIMIZER_RULES } from "../data/optimizerRules";
import {
  CLIENT_LABELS,
  MCP_CONCERN_LABELS,
  OPTIMIZER_WARNING,
  PERMISSION_MODE_LABELS,
  SCOPE_LABELS,
} from "../data/optimizerTemplates";
import {
  generateClientOptimizerPrompt,
  generateOptimizerPrompt,
  getClientNotes,
  normalizeMcpServerName,
  primaryMcpServerName,
  resolveMcpServers,
} from "./optimizerPrompt";

/** Render the rule catalog as Markdown, grouped by category. */
export function buildRuleCatalogMarkdown(
  rules: OptimizerRule[] = OPTIMIZER_RULES,
): string {
  const byCategory = new Map<string, OptimizerRule[]>();
  for (const rule of rules) {
    const list = byCategory.get(rule.category) ?? [];
    list.push(rule);
    byCategory.set(rule.category, list);
  }

  const lines: string[] = [`# Automation Optimizer — Rule Catalog`, ""];
  lines.push(`Total rules: ${rules.length}`, "");

  for (const [category, list] of byCategory) {
    lines.push(`## ${category}`, "");
    lines.push("| Rule | Severity | Description |", "| --- | --- | --- |");
    for (const rule of list) {
      lines.push(
        `| \`${rule.id}\` | ${rule.severityDefault} | ${rule.description} |`,
      );
    }
    lines.push("");
    for (const rule of list) {
      lines.push(`### ${rule.name} (\`${rule.id}\`)`);
      lines.push(`- **Severity:** ${rule.severityDefault}`);
      lines.push(`- **Evidence needed:** ${rule.evidenceNeeded.join("; ")}`);
      lines.push(`- **Recommendation:** ${rule.recommendationPattern}`);
      lines.push("");
    }
  }

  return lines.join("\n").trimEnd();
}

/**
 * Full Markdown runbook for the current state: warning, parameters, the core
 * read-only optimizer prompt, client setup notes, the expected report format
 * (dependency map + findings), and the rule catalog.
 */
export function generateOptimizerMarkdownRunbook(state: OptimizerState): string {
  const servers = resolveMcpServers(state);
  const lines: string[] = [];

  lines.push("# Automation Optimizer Pack — Runbook", "");
  lines.push(`> ${OPTIMIZER_WARNING}`, "");

  lines.push("## Run parameters", "");
  lines.push(`- **AI client:** ${CLIENT_LABELS[state.client]}`);
  if (servers.length <= 1) {
    lines.push(`- **MCP server:** \`${primaryMcpServerName(state)}\``);
  } else {
    lines.push("- **MCP servers:**");
    for (const s of servers) {
      lines.push(
        `  - \`${normalizeMcpServerName(s.name)}\` — ${MCP_CONCERN_LABELS[s.concern]}`,
      );
    }
  }
  lines.push(`- **Analysis scope:** ${SCOPE_LABELS[state.scope]}`);
  lines.push(`- **Permission mode:** ${PERMISSION_MODE_LABELS[state.permissionMode]} (read-only)`);
  if (state.automationName?.trim()) {
    lines.push(`- **Automation:** ${state.automationName.trim()}`);
  }
  if (state.journeyName?.trim()) {
    lines.push(`- **Journey:** ${state.journeyName.trim()}`);
  }
  if (state.businessGoal?.trim()) {
    lines.push(`- **Business goal:** ${state.businessGoal.trim()}`);
  }
  if (state.marketNotes?.trim()) {
    lines.push(`- **Market/BU notes:** ${state.marketNotes.trim()}`);
  }
  lines.push("");

  lines.push(`## ${CLIENT_LABELS[state.client]} setup notes`, "");
  for (const note of getClientNotes(state)) {
    lines.push(`- ${note}`);
  }
  lines.push("");

  lines.push("## Prompt to run", "");
  lines.push("Paste the following into your AI client:", "");
  lines.push("````markdown", generateOptimizerPrompt(state), "````", "");

  lines.push("## Expected report format", "");
  lines.push(
    "The AI client should return an **Automation Optimizer Report** containing a **Dependency Map** (Source | Activity / Query | Target | Write Method | Consumer | Risk, plus a Mermaid graph) and a **Findings** section where each finding lists Severity, Category, Evidence, Why it matters, Recommendation, Safe implementation note, and Confidence.",
    "",
  );

  lines.push("## Rule catalog", "");
  lines.push(buildRuleCatalogMarkdown(), "");

  lines.push("---", "");
  lines.push(
    "_Generated locally by MCP Quickstart Kit · Automation Optimizer Pack. This document is instructions only — it does not connect to Salesforce and applies no changes._",
  );

  return lines.join("\n");
}

/** Convenience re-export so components can grab the client-specific prompt. */
export { generateClientOptimizerPrompt };
