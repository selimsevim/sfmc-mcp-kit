import type { CapabilityTool } from "../types";

/**
 * Static, best-effort catalog of Salesforce Marketing Cloud Engagement MCP
 * tools. This is a documentation aid, not a live introspection of any server.
 * Risk levels are conservative; always confirm against official docs.
 *
 * Only the Data Extension category is enumerated in the MVP. Other categories
 * are intentionally left as placeholders — paste live MCP tool output into the
 * Capability Explorer to classify more tools heuristically.
 */
export const SFMC_TOOL_CATALOG: CapabilityTool[] = [
  {
    name: "sfmc_get_data_extension",
    description: "Retrieve a data extension by ID.",
    category: "Data Extensions",
    risk: "read-only",
  },
  {
    name: "sfmc_get_data_extensions",
    description: "Search and list data extensions.",
    category: "Data Extensions",
    risk: "read-only",
  },
  {
    name: "sfmc_get_data_extension_fields",
    description: "Retrieve field definitions for a data extension.",
    category: "Data Extensions",
    risk: "read-only",
  },
  {
    name: "sfmc_get_data_extension_folders",
    description: "List data extension folders.",
    category: "Data Extensions",
    risk: "read-only",
  },
  {
    name: "sfmc_get_data_extension_link",
    description: "Create/output a direct UI link to a data extension.",
    category: "Data Extensions",
    risk: "read-only",
  },
  {
    name: "sfmc_retrieve_data_extension_record",
    description: "Retrieve a single row from a data extension.",
    category: "Data Extensions",
    risk: "read-only",
  },
  {
    name: "sfmc_create_data_extension",
    description: "Create a data extension.",
    category: "Data Extensions",
    risk: "write",
  },
  {
    name: "sfmc_update_data_extension",
    description: "Update data extension properties.",
    category: "Data Extensions",
    risk: "destructive",
    notes: ["Modifies an existing object — review planned changes first."],
  },
  {
    name: "sfmc_delete_data_extension",
    description: "Delete a data extension.",
    category: "Data Extensions",
    risk: "destructive",
    notes: ["Irreversible. Removes the object and its data."],
  },
  {
    name: "sfmc_clear_data_extension_data",
    description: "Clear all data from a data extension.",
    category: "Data Extensions",
    risk: "destructive",
    notes: ["Irreversible. Empties all rows."],
  },
  {
    name: "sfmc_create_data_extension_field_async",
    description: "Add fields to a data extension asynchronously.",
    category: "Data Extensions",
    risk: "async",
    notes: ["Asynchronous write — completion is not immediate."],
  },
  {
    name: "sfmc_update_data_extension_field_async",
    description: "Update data extension fields asynchronously.",
    category: "Data Extensions",
    risk: "async",
    notes: ["Asynchronous and potentially destructive — confirm before running."],
  },
  {
    name: "sfmc_upsert_data_extension_record",
    description: "Insert or update a row in a data extension.",
    category: "Data Extensions",
    risk: "write",
  },
];

/**
 * Placeholder categories where exact tool names are not yet catalogued in the
 * MVP. The UI surfaces these so users know the catalog is incomplete.
 */
export const SFMC_PLACEHOLDER_CATEGORIES: string[] = [
  "Automations",
  "Journeys",
  "Assets / Content",
  "SQL Query Activities",
  "Campaign analytics",
  "Contact data",
];

export const SFMC_CATALOG_INCOMPLETE_NOTE =
  "Tool catalog incomplete in MVP. Paste live MCP tool output to classify more tools.";
