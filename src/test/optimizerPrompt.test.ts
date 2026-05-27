import { describe, it, expect } from "vitest";
import {
  generateCodexOptimizerInstructions,
  generateOptimizerPrompt,
  normalizeMcpServerName,
  validateOptimizerState,
} from "../lib/optimizerPrompt";
import { OPTIMIZER_RULES } from "../data/optimizerRules";
import type { OptimizerState } from "../types";

function baseState(overrides: Partial<OptimizerState> = {}): OptimizerState {
  return {
    client: "claude-code",
    mcpServerName: "mce",
    scope: "selected-automation",
    automationName: "Daily_Activation",
    journeyName: "",
    businessGoal: "",
    marketNotes: "",
    permissionMode: "read-only-audit",
    pastedContext: "",
    ...overrides,
  };
}

describe("normalizeMcpServerName", () => {
  it("normalizes and falls back to mce", () => {
    expect(normalizeMcpServerName("  My Server  ")).toBe("my-server");
    expect(normalizeMcpServerName("")).toBe("mce");
  });
});

describe("generateOptimizerPrompt", () => {
  it("includes read-only safety rules", () => {
    const p = generateOptimizerPrompt(baseState());
    expect(p).toContain("Read-only analysis only.");
    expect(p).toContain(
      "Do not create, update, delete, clear, run, execute, send, publish, trigger, or modify anything.",
    );
  });

  it("includes a tool discovery requirement before analysis", () => {
    const p = generateOptimizerPrompt(baseState());
    expect(p).toContain("Tool discovery");
    expect(p).toContain("List the available MCP tools");
    expect(p).toMatch(/do not assume exact names/i);
  });

  it("does not hard-code a mandatory tool name (examples are marked)", () => {
    const p = generateOptimizerPrompt(baseState());
    expect(p).toMatch(/EXAMPLES ONLY/);
  });

  it("interpolates the automation name for selected-automation scope", () => {
    const p = generateOptimizerPrompt(
      baseState({ automationName: "Nightly_Build" }),
    );
    expect(p).toContain("Selected Automation");
    expect(p).toContain("Nightly_Build");
    expect(p).toContain("Find the automation by name/key");
  });

  it("includes running journey retrieval for active-journey-pipelines scope", () => {
    const p = generateOptimizerPrompt(
      baseState({ scope: "active-journey-pipelines", automationName: "" }),
    );
    expect(p).toContain("Active Journey Pipelines");
    expect(p).toContain("Retrieve running/published journeys only");
    expect(p).toContain("journey-to-query-to-automation dependency map");
  });

  it("tells the AI not to call MCP tools for pasted-context-only scope", () => {
    const p = generateOptimizerPrompt(
      baseState({
        scope: "pasted-context-only",
        pastedContext: "SELECT SubscriberKey FROM Foo",
      }),
    );
    expect(p).toContain("Do not call MCP tools.");
    expect(p).toContain("SELECT SubscriberKey FROM Foo");
  });

  it("interpolates the normalized server name", () => {
    const p = generateOptimizerPrompt(baseState({ mcpServerName: "My MCE" }));
    expect(p).toContain("my-mce");
  });

  it("lists multiple servers with their concerns and a routing instruction", () => {
    const p = generateOptimizerPrompt(
      baseState({
        mcpServerName: undefined,
        mcpServers: [
          { name: "mce-auto", concern: "automations" },
          { name: "mce-journeys", concern: "journeys" },
        ],
      }),
    );
    expect(p).toContain("MCP servers (route each retrieval");
    expect(p).toContain("`mce-auto` — Automations & Automation Studio");
    expect(p).toContain("`mce-journeys` — Journeys (Journey Builder)");
  });
});

describe("generateCodexOptimizerInstructions", () => {
  it("mentions config.toml, /mcp, approval prompt mode, login, and disabled tools", () => {
    const p = generateCodexOptimizerInstructions(baseState({ client: "codex" }));
    expect(p).toContain("config.toml");
    expect(p).toContain("/mcp");
    expect(p).toContain('default_tools_approval_mode = "prompt"');
    expect(p).toContain("codex mcp login mce");
    expect(p).toContain("enabled_tools");
    expect(p).toContain("disabled_tools");
  });
});

describe("validateOptimizerState", () => {
  it("blocks pasted-context-only with no context", () => {
    const r = validateOptimizerState(
      baseState({ scope: "pasted-context-only", pastedContext: "" }),
    );
    expect(r.valid).toBe(false);
  });

  it("blocks an empty server name", () => {
    expect(validateOptimizerState(baseState({ mcpServerName: "" })).valid).toBe(
      false,
    );
  });

  it("allows a valid selected-automation state", () => {
    expect(validateOptimizerState(baseState()).valid).toBe(true);
  });
});

describe("rule catalog", () => {
  it("contains at least 20 rules across multiple categories", () => {
    expect(OPTIMIZER_RULES.length).toBeGreaterThanOrEqual(20);
    const categories = new Set(OPTIMIZER_RULES.map((r) => r.category));
    expect(categories.size).toBeGreaterThanOrEqual(7);
  });

  it("has unique rule ids", () => {
    const ids = OPTIMIZER_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
