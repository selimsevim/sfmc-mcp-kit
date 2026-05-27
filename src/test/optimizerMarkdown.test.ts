import { describe, it, expect } from "vitest";
import {
  buildRuleCatalogMarkdown,
  generateOptimizerMarkdownRunbook,
} from "../lib/optimizerMarkdown";
import { OPTIMIZER_RULES } from "../data/optimizerRules";
import type { OptimizerState } from "../types";

const state: OptimizerState = {
  client: "codex",
  mcpServerName: "mce",
  scope: "selected-automation",
  automationName: "Daily_Activation",
  journeyName: "Welcome_Series",
  businessGoal: "reduce duplicate sends",
  marketNotes: "EU BU",
  permissionMode: "read-only-audit",
  pastedContext: "",
};

describe("generateOptimizerMarkdownRunbook", () => {
  it("includes the warning, run parameters, and prompt", () => {
    const md = generateOptimizerMarkdownRunbook(state);
    expect(md).toContain("# Automation Optimizer Pack — Runbook");
    expect(md).toContain("Run parameters");
    expect(md).toContain("Daily_Activation");
    expect(md).toContain("read-only");
  });

  it("documents the dependency map and findings output format", () => {
    const md = generateOptimizerMarkdownRunbook(state);
    expect(md).toContain("Dependency Map");
    expect(md).toContain("Findings");
    expect(md).toContain("Write Method");
    expect(md).toContain("Severity");
  });

  it("embeds the rule catalog", () => {
    const md = generateOptimizerMarkdownRunbook(state);
    expect(md).toContain("Rule catalog");
    expect(md).toContain("journey-entry-overwrite");
  });
});

describe("buildRuleCatalogMarkdown", () => {
  it("lists every rule and reports the total count", () => {
    const md = buildRuleCatalogMarkdown();
    expect(md).toContain(`Total rules: ${OPTIMIZER_RULES.length}`);
    for (const rule of OPTIMIZER_RULES) {
      expect(md).toContain(rule.id);
    }
  });

  it("groups by category with severity and recommendation", () => {
    const md = buildRuleCatalogMarkdown();
    expect(md).toContain("## journey-entry");
    expect(md).toContain("## consent-suppression");
    expect(md).toContain("Recommendation:");
  });
});
