import { describe, it, expect } from "vitest";
import {
  buildClaudeCommand,
  buildCodexTomlHttp,
  buildCodexTomlStdio,
  buildGeminiCommand,
  buildGenericJsonHttp,
  buildGenericJsonStdio,
  buildSfmcEndpoint,
  buildSfmcRedirectUri,
  renderTemplate,
  resolveConnection,
} from "../lib/template";
import { SFMC_RECIPE, CUSTOM_STDIO_RECIPE } from "../data/recipes";
import type { AppState } from "../types";

const TENANT = "mcphchq9d5b8mlzeyc2v1example";
const CLIENT = "abcdef1234567890example1";
const US_BASE = SFMC_RECIPE.regions![0].baseUrl;

describe("renderTemplate", () => {
  it("replaces known placeholders and leaves unknown ones", () => {
    expect(renderTemplate("{a}/{b}/{c}", { a: "1", b: "2" })).toBe("1/2/{c}");
  });
});

describe("buildSfmcEndpoint", () => {
  it("builds the SFMC MCP server URL", () => {
    expect(buildSfmcEndpoint(US_BASE, TENANT, CLIENT)).toBe(
      `${US_BASE}/t/${TENANT}/c/${CLIENT}/api/mcp`,
    );
  });

  it("collapses a trailing slash on the base URL", () => {
    expect(buildSfmcEndpoint(`${US_BASE}/`, TENANT, CLIENT)).toBe(
      `${US_BASE}/t/${TENANT}/c/${CLIENT}/api/mcp`,
    );
  });
});

describe("buildSfmcRedirectUri", () => {
  it("builds the OAuth redirect URI", () => {
    expect(buildSfmcRedirectUri(US_BASE, TENANT, CLIENT)).toBe(
      `${US_BASE}/t/${TENANT}/c/${CLIENT}/api/mcp/oauth/callback`,
    );
  });
});

describe("buildClaudeCommand", () => {
  it("builds the Claude Code add command", () => {
    expect(buildClaudeCommand("mce", "https://x/api/mcp")).toBe(
      "claude mcp add --transport http mce https://x/api/mcp",
    );
  });
});

describe("buildGeminiCommand", () => {
  it("builds the Gemini CLI add command", () => {
    expect(buildGeminiCommand("mce", "https://x/api/mcp")).toBe(
      "gemini mcp add mce -t http https://x/api/mcp",
    );
  });
});

describe("buildCodexTomlHttp", () => {
  it("builds an HTTP TOML block", () => {
    expect(buildCodexTomlHttp("mce", "https://x/api/mcp")).toBe(
      [
        "[mcp_servers.mce]",
        'url = "https://x/api/mcp"',
        'default_tools_approval_mode = "prompt"',
        "enabled = true",
      ].join("\n"),
    );
  });

  it("includes a bearer token env var when provided", () => {
    const toml = buildCodexTomlHttp("mce", "https://x/api/mcp", {
      bearerTokenEnvVar: "MY_TOKEN",
    });
    expect(toml).toContain('bearer_token_env_var = "MY_TOKEN"');
  });
});

describe("buildCodexTomlStdio", () => {
  it("builds a STDIO TOML block with args and env vars", () => {
    const toml = buildCodexTomlStdio("local", "npx", ["-y", "pkg"], ["API_KEY"]);
    expect(toml).toContain("[mcp_servers.local]");
    expect(toml).toContain('command = "npx"');
    expect(toml).toContain('args = ["-y", "pkg"]');
    expect(toml).toContain('env_vars = ["API_KEY"]');
  });
});

describe("buildGenericJsonHttp", () => {
  it("builds the generic mcpServers JSON for HTTP", () => {
    const json = JSON.parse(buildGenericJsonHttp("mce", "https://x/api/mcp"));
    expect(json).toEqual({
      mcpServers: { mce: { type: "http", url: "https://x/api/mcp" } },
    });
  });
});

describe("buildGenericJsonStdio", () => {
  it("builds the generic mcpServers JSON for STDIO", () => {
    const json = JSON.parse(buildGenericJsonStdio("local", "npx", ["-y", "pkg"]));
    expect(json).toEqual({
      mcpServers: { local: { command: "npx", args: ["-y", "pkg"] } },
    });
  });
});

describe("resolveConnection", () => {
  it("derives SFMC URL and redirect URI from form state", () => {
    const state: AppState = {
      recipeId: "sfmc-mce",
      regionId: "US",
      authMode: "oauth",
      clientId: "claude",
      values: {
        clientId: CLIENT,
        authBaseUri: `https://${TENANT}.auth.marketingcloudapis.com/`,
      },
    };
    const conn = resolveConnection(state, SFMC_RECIPE);
    expect(conn.serverName).toBe("mce");
    expect(conn.tenantId).toBe(TENANT);
    expect(conn.mcpServerUrl).toBe(
      `${US_BASE}/t/${TENANT}/c/${CLIENT}/api/mcp`,
    );
    expect(conn.redirectUri).toBe(
      `${US_BASE}/t/${TENANT}/c/${CLIENT}/api/mcp/oauth/callback`,
    );
  });

  it("resolves a STDIO recipe with sanitized name, command, and args", () => {
    const state: AppState = {
      recipeId: "custom-stdio",
      regionId: null,
      authMode: "none",
      clientId: "codex",
      values: {
        serverName: "My Local MCP!",
        command: "npx",
        args: "-y my-pkg --flag",
        envVars: "API_KEY, REGION",
      },
    };
    const conn = resolveConnection(state, CUSTOM_STDIO_RECIPE);
    expect(conn.serverName).toBe("my-local-mcp");
    expect(conn.command).toBe("npx");
    expect(conn.args).toEqual(["-y", "my-pkg", "--flag"]);
    expect(conn.envVars).toEqual(["API_KEY", "REGION"]);
    expect(conn.mcpServerUrl).toBe("");
    expect(conn.redirectUri).toBe("");
  });
});
