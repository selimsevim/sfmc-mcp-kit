/**
 * Core data model for MCP Quickstart Kit.
 *
 * Everything here is static configuration or in-browser state. No secrets are
 * persisted and no network calls are made anywhere in the app.
 */

export type Transport = "streamable-http" | "stdio" | "both";

export type AuthMode = "none" | "oauth" | "bearer" | "api-key" | "custom";

export type RiskLevel =
  | "read-only"
  | "write"
  | "destructive"
  | "async"
  | "unknown";

/** A validation rule applied softly to a recipe input. */
export type ValidationRule = "clientId24Soft" | "url" | "tenantId" | "nonEmpty";

/** A derivation applied to an input value before it is used in templates. */
export type DeriveRule = "tenantIdFromAuthBaseUri";

export type MCPRecipeInput = {
  id: string;
  label: string;
  placeholder?: string;
  type: "text" | "url" | "password" | "select";
  required: boolean;
  helperText?: string;
  validation?: ValidationRule;
  derive?: DeriveRule;
  /** Options for `type: "select"` inputs. */
  options?: Array<{ value: string; label: string }>;
};

export type MCPRegion = {
  id: string;
  label: string;
  baseUrl: string;
};

export type CapabilityTool = {
  name: string;
  description: string;
  category: string;
  risk: RiskLevel;
  requiredScopes?: string[];
  notes?: string[];
};

export type MCPRecipe = {
  id: string;
  name: string;
  description: string;
  category: string;
  docsUrl?: string;
  transport: Transport;
  authModes: AuthMode[];
  inputs: MCPRecipeInput[];
  endpointTemplate?: string;
  redirectUriTemplate?: string;
  regions?: MCPRegion[];
  capabilityCatalog?: CapabilityTool[];
  safetyNotes?: string[];
};

export type ClientOutputType = "command" | "json" | "toml" | "markdown";

export type AIClient = {
  id: string;
  name: string;
  description: string;
  supports: Array<"streamable-http" | "stdio">;
  outputTypes: ClientOutputType[];
};

/** Result of a soft validation check. `valid: false` blocks output generation. */
export interface ValidationResult {
  valid: boolean;
  warning?: string;
}

/** In-browser app state. Never persisted to localStorage. */
export interface AppState {
  recipeId: string;
  regionId: string | null;
  /** Raw input values keyed by `MCPRecipeInput.id`. */
  values: Record<string, string>;
  authMode: AuthMode;
  clientId: string;
}

/**
 * Fully resolved, derived values ready to render into client configs.
 * Computed from {@link AppState} plus the selected recipe — no side effects.
 */
export interface ResolvedConnection {
  recipe: MCPRecipe;
  region: MCPRegion | null;
  authMode: AuthMode;
  serverName: string;
  /** MCP server URL for streamable-http transports; "" for stdio. */
  mcpServerUrl: string;
  /** OAuth redirect URI, only when the recipe defines a template. */
  redirectUri: string;
  /** Extracted SFMC-style tenant id, when applicable. */
  tenantId: string;
  /** stdio launch command. */
  command: string;
  /** stdio args, split on whitespace. */
  args: string[];
  /** Declared environment variable names (bearer token / stdio env). */
  envVars: string[];
}

/* ------------------------------------------------------------------ *
 * Automation Optimizer Pack
 *
 * A local prompt/runbook generator. It produces instructions the user runs
 * inside their own AI client (Claude Code, Codex, Gemini CLI, Cursor) against
 * an already-connected SFMC MCP server. This app never calls MCP itself.
 * ------------------------------------------------------------------ */

export type OptimizerScope =
  | "selected-automation"
  | "active-journey-pipelines"
  | "pasted-context-only";

export type PermissionMode =
  | "read-only-audit"
  | "draft-refactor"
  | "controlled-apply";

export type OptimizerClient =
  | "claude-code"
  | "codex"
  | "gemini-cli"
  | "generic";

/** An SFMC area an MCP server can be responsible for. */
export type McpConcern =
  | "all"
  | "automations"
  | "journeys"
  | "content-assets"
  | "sql-data"
  | "contacts";

/**
 * One MCP server bound to an SFMC concern. Lets the user wire several servers —
 * e.g. one for automations, one for journeys — and route work accordingly.
 */
export interface McpServerBinding {
  /** Server name as configured in the AI client (e.g. `mce`, `mce-journeys`). */
  name: string;
  /** Which SFMC area this server is used for. */
  concern: McpConcern;
}

export interface OptimizerState {
  client: OptimizerClient;
  /**
   * MCP servers to use, each bound to an SFMC concern. Source of truth for the
   * generated runbook. When empty, the legacy `mcpServerName` is used as a
   * single "all" server.
   */
  mcpServers?: McpServerBinding[];
  /** @deprecated legacy single-server field; prefer `mcpServers`. */
  mcpServerName?: string;
  scope: OptimizerScope;
  automationName?: string;
  journeyName?: string;
  businessGoal?: string;
  marketNotes?: string;
  permissionMode: PermissionMode;
  pastedContext?: string;
}

export type OptimizerRuleCategory =
  | "journey-entry"
  | "consent-suppression"
  | "dependency"
  | "maintainability"
  | "data-quality"
  | "performance"
  | "orphaned-assets"
  | "safety";

export type OptimizerSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

export interface OptimizerRule {
  id: string;
  name: string;
  category: OptimizerRuleCategory;
  severityDefault: OptimizerSeverity;
  description: string;
  evidenceNeeded: string[];
  recommendationPattern: string;
}
