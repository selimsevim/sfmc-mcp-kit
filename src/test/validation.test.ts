import { describe, it, expect } from "vitest";
import {
  extractTenantId,
  sanitizeServerName,
  validateClientId,
  validateTenantId,
} from "../lib/validation";
import { classifyToolRisk } from "../lib/capability";

const TENANT = "mcphchq9d5b8mlzeyc2v1example";

describe("extractTenantId", () => {
  it("extracts the tenant id from a full SFMC auth base URI", () => {
    expect(
      extractTenantId(`https://${TENANT}.auth.marketingcloudapis.com/`),
    ).toBe(TENANT);
  });

  it("handles http, extra whitespace, and trailing slashes", () => {
    expect(
      extractTenantId(`  http://${TENANT}.auth.marketingcloudapis.com///  `),
    ).toBe(TENANT);
  });

  it("returns a plain tenant id unchanged", () => {
    expect(extractTenantId(TENANT)).toBe(TENANT);
  });

  it("returns empty string for empty input", () => {
    expect(extractTenantId("")).toBe("");
    expect(extractTenantId("   ")).toBe("");
  });
});

describe("sanitizeServerName", () => {
  it("lowercases and hyphenates unsafe characters", () => {
    expect(sanitizeServerName("My Cool Server!")).toBe("my-cool-server");
  });

  it("trims leading/trailing separators and collapses runs", () => {
    expect(sanitizeServerName("__a   b__")).toBe("a-b");
  });

  it("falls back to mcp-server when empty", () => {
    expect(sanitizeServerName("   ")).toBe("mcp-server");
    expect(sanitizeServerName("!!!")).toBe("mcp-server");
  });
});

describe("validateClientId", () => {
  it("blocks empty values", () => {
    expect(validateClientId("").valid).toBe(false);
  });

  it("warns but allows non-24-character values", () => {
    const r = validateClientId("short");
    expect(r.valid).toBe(true);
    expect(r.warning).toBeTruthy();
  });

  it("accepts a 24-character value without warning", () => {
    const r = validateClientId("a".repeat(24));
    expect(r).toEqual({ valid: true });
  });
});

describe("validateTenantId", () => {
  it("blocks empty values", () => {
    expect(validateTenantId("").valid).toBe(false);
  });

  it("warns on unexpected characters but stays valid", () => {
    const r = validateTenantId("bad/id");
    expect(r.valid).toBe(true);
    expect(r.warning).toBeTruthy();
  });
});

describe("classifyToolRisk", () => {
  it("classifies read-only tools", () => {
    expect(classifyToolRisk("sfmc_get_data_extension")).toBe("read-only");
    expect(classifyToolRisk("sfmc_list_journeys")).toBe("read-only");
    expect(classifyToolRisk("sfmc_retrieve_record")).toBe("read-only");
  });

  it("classifies write tools", () => {
    expect(classifyToolRisk("sfmc_create_data_extension")).toBe("write");
    expect(classifyToolRisk("sfmc_upsert_record")).toBe("write");
  });

  it("classifies destructive tools", () => {
    expect(classifyToolRisk("sfmc_delete_data_extension")).toBe("destructive");
    expect(classifyToolRisk("sfmc_clear_data_extension_data")).toBe("destructive");
    expect(classifyToolRisk("sfmc_run_automation")).toBe("destructive");
    expect(classifyToolRisk("sfmc_publish_journey")).toBe("destructive");
  });

  it("classifies async-only tools as async", () => {
    expect(classifyToolRisk("some_async_job")).toBe("async");
  });

  it("returns unknown for unrecognized names", () => {
    expect(classifyToolRisk("mystery_tool")).toBe("unknown");
    expect(classifyToolRisk("")).toBe("unknown");
  });
});
