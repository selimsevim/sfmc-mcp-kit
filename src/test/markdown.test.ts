import { describe, it, expect } from "vitest";
import { generateMarkdownSetup } from "../lib/markdown";
import type { AppState } from "../types";

const TENANT = "mcphchq9d5b8mlzeyc2v1example";
const CLIENT = "abcdef1234567890example1";

const sfmcState: AppState = {
  recipeId: "sfmc-mce",
  regionId: "EU",
  authMode: "oauth",
  clientId: "codex",
  values: {
    clientId: CLIENT,
    authBaseUri: `https://${TENANT}.auth.marketingcloudapis.com/`,
  },
};

describe("generateMarkdownSetup", () => {
  it("includes the recipe name, server URL, and redirect URI", () => {
    const md = generateMarkdownSetup(sfmcState);
    expect(md).toContain("# MCP setup: Salesforce Marketing Cloud Engagement MCP");
    expect(md).toContain(`/t/${TENANT}/c/${CLIENT}/api/mcp`);
    expect(md).toContain("api/mcp/oauth/callback");
  });

  it("includes the selected client's config block", () => {
    const md = generateMarkdownSetup(sfmcState);
    expect(md).toContain("Codex config.toml");
    expect(md).toContain("[mcp_servers.mce]");
  });

  it("includes a safe first test prompt and safety notes", () => {
    const md = generateMarkdownSetup(sfmcState);
    expect(md).toContain("## Safe first test prompt");
    expect(md).toContain("## Safety notes");
  });

  it("includes every compatible client when client is markdown", () => {
    const md = generateMarkdownSetup({ ...sfmcState, clientId: "markdown" });
    expect(md).toContain("claude mcp add");
    expect(md).toContain("gemini mcp add");
    expect(md).toContain("[mcp_servers.mce]");
    expect(md).toContain('"type": "http"');
  });

  it("returns empty string for an unknown recipe", () => {
    expect(generateMarkdownSetup({ ...sfmcState, recipeId: "nope" })).toBe("");
  });
});
