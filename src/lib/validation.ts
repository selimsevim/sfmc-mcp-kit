import type {
  MCPRecipeInput,
  ValidationResult,
  ValidationRule,
} from "../types";

const CLIENT_ID_EXPECTED_LENGTH = 24;

/**
 * Extract the SFMC Tenant ID (subdomain) from an Authentication Base URI.
 *
 * Examples:
 *   "https://mcphchq9d5b8mlzeyc2v1example.auth.marketingcloudapis.com/"
 *     -> "mcphchq9d5b8mlzeyc2v1example"
 *   "mcphchq9d5b8mlzeyc2v1example" (already a tenant id) -> unchanged
 *
 * Rules: strip protocol, drop path/query/fragment, trim whitespace and trailing
 * slashes, then take the hostname segment before the first dot.
 */
export function extractTenantId(input: string): string {
  if (!input) return "";

  let value = input.trim();
  if (!value) return "";

  // Remove protocol (http://, https://, etc.).
  value = value.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");

  // Trim leading/trailing slashes.
  value = value.replace(/^\/+/, "").replace(/\/+$/, "");

  // Drop any path, query, or fragment — keep only the host part.
  value = value.split("/")[0].split("?")[0].split("#")[0];

  // The tenant id is the hostname segment before the first dot.
  return value.split(".")[0].trim();
}

/**
 * Sanitize a server name for use as an identifier in client configs.
 * Lowercases, replaces runs of unsafe characters with single hyphens, and
 * trims leading/trailing hyphens. Falls back to "mcp-server" when empty.
 */
export function sanitizeServerName(input: string): string {
  const cleaned = (input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+/, "")
    .replace(/[-_]+$/, "");
  return cleaned || "mcp-server";
}

/** A non-blocking length check for SFMC Client IDs. */
export function validateClientId(clientId: string): ValidationResult {
  const value = clientId.trim();
  if (!value) {
    return { valid: false, warning: "Client ID is required." };
  }
  if (value.length !== CLIENT_ID_EXPECTED_LENGTH) {
    return {
      valid: true,
      warning: `Client ID is usually ${CLIENT_ID_EXPECTED_LENGTH} characters — yours is ${value.length}. Double-check you copied the full value.`,
    };
  }
  return { valid: true };
}

/** Validate an extracted Tenant ID. Empty blocks; odd characters only warn. */
export function validateTenantId(tenantId: string): ValidationResult {
  const value = tenantId.trim();
  if (!value) {
    return {
      valid: false,
      warning: "Enter the Authentication Base URI or Tenant ID.",
    };
  }
  if (!/^[a-zA-Z0-9-]+$/.test(value)) {
    return {
      valid: true,
      warning:
        "Tenant ID contains unexpected characters. Verify the value you pasted.",
    };
  }
  return { valid: true };
}

/** Validate a URL string. Empty blocks; malformed only warns. */
export function validateUrl(url: string): ValidationResult {
  const value = url.trim();
  if (!value) {
    return { valid: false, warning: "A server URL is required." };
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: true, warning: "URL should start with http:// or https://." };
    }
  } catch {
    return { valid: true, warning: "This does not look like a valid URL." };
  }
  return { valid: true };
}

/** Generic non-empty check. */
export function validateNonEmpty(value: string): ValidationResult {
  return value.trim()
    ? { valid: true }
    : { valid: false, warning: "This field is required." };
}

/**
 * Run the validation rule attached to a recipe input against a (possibly
 * derived) value. For the tenant rule the *derived* tenant id is validated.
 */
export function validateRule(
  rule: ValidationRule | undefined,
  value: string,
): ValidationResult {
  switch (rule) {
    case "clientId24Soft":
      return validateClientId(value);
    case "tenantId":
      return validateTenantId(value);
    case "url":
      return validateUrl(value);
    case "nonEmpty":
      return validateNonEmpty(value);
    default:
      return { valid: true };
  }
}

/**
 * Validate a single input given the raw value. The tenant-id rule operates on
 * the derived value, so callers pass that in via `derivedValue`.
 */
export function validateInput(
  input: MCPRecipeInput,
  rawValue: string,
  derivedValue?: string,
): ValidationResult {
  const value = rawValue.trim();
  if (!value) {
    return input.required
      ? { valid: false, warning: `${input.label} is required.` }
      : { valid: true };
  }
  const target = input.derive ? (derivedValue ?? value) : value;
  return validateRule(input.validation, target);
}
