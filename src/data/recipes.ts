import type { MCPRecipe } from "../types";
import { SFMC_TOOL_CATALOG } from "./sfmcTools";

/**
 * Salesforce Marketing Cloud Engagement MCP — the first built-in recipe.
 * The user still creates their own Installed Package inside SFMC; this recipe
 * only assembles the connection URL, redirect URI, and client config.
 */
export const SFMC_RECIPE: MCPRecipe = {
  id: "sfmc-mce",
  name: "Salesforce Marketing Cloud Engagement MCP",
  description:
    "Connect the Marketing Cloud Engagement MCP server to your AI client over Streamable HTTP with OAuth.",
  category: "Marketing",
  docsUrl: "https://developer.salesforce.com/docs/marketing/marketing-cloud",
  transport: "streamable-http",
  authModes: ["oauth"],
  regions: [
    {
      id: "US",
      label: "US-hosted MCP Server",
      baseUrl: "https://mai-mce-mcp-cdp1.sfdc-yfeipo.svc.sfdcfc.net",
    },
    {
      id: "EU",
      label: "EU-hosted MCP Server",
      baseUrl: "https://mai-mce-mcp-cdp1.sfdc-yzvdd4.svc.sfdcfc.net",
    },
  ],
  inputs: [
    {
      id: "serverName",
      label: "MCP server name",
      placeholder: "mce",
      type: "text",
      required: false,
      helperText:
        "How your AI client refers to this server (used in the generated commands). Letters, digits, and hyphens; defaults to “mce” if left blank.",
    },
    {
      id: "clientId",
      label: "Client ID",
      placeholder: "abcdef1234567890example1",
      type: "text",
      required: true,
      validation: "clientId24Soft",
      helperText:
        "The 24-character Client ID from your SFMC Installed Package. A different length only triggers a warning, never a block.",
    },
    {
      id: "authBaseUri",
      label: "Authentication Base URI or Tenant ID",
      placeholder: "https://mcphchq9d5b8mlzeyc2v1example.auth.marketingcloudapis.com/",
      type: "text",
      required: true,
      derive: "tenantIdFromAuthBaseUri",
      validation: "tenantId",
      helperText:
        "Paste the SFMC Authentication Base URI or just the tenant ID. The app extracts the tenant ID automatically.",
    },
  ],
  endpointTemplate: "{baseUrl}/t/{tenantId}/c/{clientId}/api/mcp",
  redirectUriTemplate: "{baseUrl}/t/{tenantId}/c/{clientId}/api/mcp/oauth/callback",
  capabilityCatalog: SFMC_TOOL_CATALOG,
  safetyNotes: [
    "Do not grant more Marketing Cloud permissions than needed.",
    "Start with read-only scopes where possible.",
    "Some MCP tools can create, update, delete, clear, or execute assets/data.",
    "Always ask the AI client to show planned actions before destructive operations.",
    "This app does not authenticate to Salesforce and does not verify permissions.",
  ],
};

/** Generic Streamable HTTP MCP server — bring your own URL. */
export const CUSTOM_HTTP_RECIPE: MCPRecipe = {
  id: "custom-http",
  name: "Custom Streamable HTTP MCP Server",
  description:
    "Configure any MCP server that speaks Streamable HTTP by supplying its URL directly.",
  category: "Custom",
  transport: "streamable-http",
  authModes: ["none", "oauth", "bearer", "api-key"],
  inputs: [
    {
      id: "serverName",
      label: "Server name",
      placeholder: "my-mcp-server",
      type: "text",
      required: true,
      validation: "nonEmpty",
      helperText:
        "A short identifier for this server in your client config (letters, digits, hyphens).",
    },
    {
      id: "serverUrl",
      label: "Server URL",
      placeholder: "https://example.com/api/mcp",
      type: "url",
      required: true,
      validation: "url",
      helperText: "The full Streamable HTTP endpoint of the MCP server.",
    },
    {
      id: "bearerTokenEnvVar",
      label: "Bearer token environment variable (optional)",
      placeholder: "MY_SERVER_TOKEN",
      type: "text",
      required: false,
      helperText:
        "Name of an environment variable holding a bearer token. Never paste the token itself.",
    },
  ],
  endpointTemplate: "{serverUrl}",
  safetyNotes: [
    "If you choose OAuth, add the callback/redirect details required by your provider manually.",
    "Reference tokens by environment variable name — do not paste secret values into this app.",
  ],
};

/** Generic STDIO MCP server — launched as a local subprocess. */
export const CUSTOM_STDIO_RECIPE: MCPRecipe = {
  id: "custom-stdio",
  name: "Custom STDIO MCP Server",
  description:
    "Configure a local MCP server launched as a subprocess over stdio.",
  category: "Custom",
  transport: "stdio",
  authModes: ["none"],
  inputs: [
    {
      id: "serverName",
      label: "Server name",
      placeholder: "my-local-mcp",
      type: "text",
      required: true,
      validation: "nonEmpty",
      helperText: "A short identifier for this server in your client config.",
    },
    {
      id: "command",
      label: "Command",
      placeholder: "npx",
      type: "text",
      required: true,
      validation: "nonEmpty",
      helperText: "The executable to launch (e.g. npx, node, python, uvx).",
    },
    {
      id: "args",
      label: "Arguments",
      placeholder: "-y my-mcp-package --flag",
      type: "text",
      required: false,
      helperText: "Space-separated arguments passed to the command.",
    },
    {
      id: "envVars",
      label: "Environment variable names (optional)",
      placeholder: "API_KEY, REGION",
      type: "text",
      required: false,
      helperText:
        "Comma- or space-separated env var names the server needs. Never paste secret values.",
    },
  ],
  safetyNotes: [
    "Reference secrets by environment variable name — do not paste secret values into this app.",
    "Only run STDIO servers and packages you trust; they execute on your machine.",
  ],
};

export const RECIPES: MCPRecipe[] = [
  SFMC_RECIPE,
  CUSTOM_HTTP_RECIPE,
  CUSTOM_STDIO_RECIPE,
];

export function getRecipe(id: string): MCPRecipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
