import type { OptimizerRule } from "../types";

/**
 * Conceptual risk-check catalog for the Automation Optimizer Pack. These rules
 * are embedded into the generated runbook so the local AI client knows what to
 * look for. They describe *potential* risks inferred from structure — the
 * generated prompt always instructs the AI client to keep findings
 * evidence-based and to mark missing data as unknown.
 */
export const OPTIMIZER_RULES: OptimizerRule[] = [
  // --- journey-entry ---
  {
    id: "journey-entry-overwrite",
    name: "Overwrite into journey entry DE",
    category: "journey-entry",
    severityDefault: "high",
    description:
      "A query overwrites a Data Extension used as a running journey's entry source.",
    evidenceNeeded: [
      "Query write method (Overwrite)",
      "Target DE key/name",
      "Journey entry source DE key/name",
    ],
    recommendationPattern:
      "Stage the audience separately and validate counts before refreshing the journey entry DE; avoid overwriting an entry source in place.",
  },
  {
    id: "journey-entry-append-no-dedupe",
    name: "Append to journey entry DE without dedupe",
    category: "journey-entry",
    severityDefault: "high",
    description:
      "A query appends rows to a journey entry DE without clear dedupe logic.",
    evidenceNeeded: [
      "Query write method (Append)",
      "Presence/absence of dedupe (GROUP BY / DISTINCT / ROW_NUMBER)",
      "Target DE primary key",
    ],
    recommendationPattern:
      "Add explicit dedupe on SubscriberKey/ContactKey before appending, or write to a staging DE first.",
  },
  {
    id: "missing-dedupe-before-activation",
    name: "Missing dedupe before activation",
    category: "journey-entry",
    severityDefault: "high",
    description:
      "Activation audience is built without dedupe, risking duplicate sends.",
    evidenceNeeded: ["SQL of the activation query", "Join cardinality"],
    recommendationPattern:
      "Introduce a dedupe stage keyed on the subscriber identifier before the activation step.",
  },
  {
    id: "missing-qa-count-validation",
    name: "Missing QA count validation",
    category: "journey-entry",
    severityDefault: "medium",
    description:
      "No count/QA validation step exists before the audience is activated.",
    evidenceNeeded: ["Automation step list", "Presence of a QA/validation step"],
    recommendationPattern:
      "Add a QA count-validation step that checks row counts/thresholds before activation.",
  },

  // --- consent-suppression ---
  {
    id: "missing-consent-filter",
    name: "Missing consent filter",
    category: "consent-suppression",
    severityDefault: "critical",
    description:
      "No consent/opt-in filtering is applied before building the send audience.",
    evidenceNeeded: ["SQL filters", "Consent/opt-in source reference"],
    recommendationPattern:
      "Join consent/opt-in status and filter early so non-consented contacts never enter the audience.",
  },
  {
    id: "missing-suppression-filter",
    name: "Missing suppression filter",
    category: "consent-suppression",
    severityDefault: "high",
    description: "No suppression list filtering is applied to the audience.",
    evidenceNeeded: ["SQL filters", "Suppression DE/data view reference"],
    recommendationPattern:
      "Apply suppression filtering (NOT EXISTS against the suppression set) before activation.",
  },
  {
    id: "late-consent-filter",
    name: "Late consent/suppression filter",
    category: "consent-suppression",
    severityDefault: "medium",
    description:
      "Consent/suppression is applied after heavy joins instead of early.",
    evidenceNeeded: ["Query structure / join order"],
    recommendationPattern:
      "Move consent/suppression filtering earlier to reduce processed rows and avoid leakage.",
  },
  {
    id: "repeated-consent-join",
    name: "Repeated consent logic across queries",
    category: "consent-suppression",
    severityDefault: "low",
    description:
      "Consent/suppression logic is duplicated across multiple queries.",
    evidenceNeeded: ["SQL of multiple queries in the automation"],
    recommendationPattern:
      "Centralize consent/suppression into a reusable base/staging DE to avoid drift.",
  },

  // --- dependency ---
  {
    id: "multiple-writers-same-de",
    name: "Multiple writers to same DE",
    category: "dependency",
    severityDefault: "high",
    description: "More than one automation writes to the same Data Extension.",
    evidenceNeeded: ["Target DE key", "Automation/query write list"],
    recommendationPattern:
      "Define a single owner for the DE or split into per-process DEs to avoid clobbering.",
  },
  {
    id: "parallel-read-write-same-de",
    name: "Parallel read/write on same DE",
    category: "dependency",
    severityDefault: "high",
    description:
      "Parallel activities in the same step read and write the same DE.",
    evidenceNeeded: ["Automation step structure", "Activity DE targets/sources"],
    recommendationPattern:
      "Serialize the read and write, or separate into staging DEs to remove the race.",
  },
  {
    id: "overwrite-read-by-another-automation",
    name: "Overwrite of DE read by another automation",
    category: "dependency",
    severityDefault: "high",
    description:
      "One automation overwrites a DE that another automation reads from.",
    evidenceNeeded: ["Cross-automation dependency map", "Write methods"],
    recommendationPattern:
      "Coordinate schedules or introduce a stable published DE consumed downstream.",
  },
  {
    id: "unknown-schedule-overlap",
    name: "Unknown schedule overlap",
    category: "dependency",
    severityDefault: "medium",
    description:
      "Timing overlap between dependent automations is possible or unknown.",
    evidenceNeeded: ["Automation schedules", "Run durations"],
    recommendationPattern:
      "Confirm schedules and add ordering/dependency so dependent automations cannot overlap.",
  },

  // --- maintainability ---
  {
    id: "monolithic-query",
    name: "Monolithic query",
    category: "maintainability",
    severityDefault: "medium",
    description: "A single query performs too many distinct jobs.",
    evidenceNeeded: ["SQL length/structure", "Number of logical concerns"],
    recommendationPattern:
      "Split into staged queries (base, eligibility, consent/suppression, dedupe, QA, final).",
  },
  {
    id: "mixed-logic-layers",
    name: "Mixed logic layers",
    category: "maintainability",
    severityDefault: "medium",
    description:
      "Eligibility, consent, suppression, dedupe, and activation logic are mixed in one SQL.",
    evidenceNeeded: ["SQL of the query"],
    recommendationPattern:
      "Separate concerns into discrete stages so each layer is testable and reusable.",
  },
  {
    id: "unclear-activity-naming",
    name: "Unclear activity naming",
    category: "maintainability",
    severityDefault: "low",
    description:
      "Automation/query/DE names do not convey purpose or ordering.",
    evidenceNeeded: ["Activity and DE names"],
    recommendationPattern:
      "Adopt an ordered, descriptive naming convention (e.g. 01_STG_..., 06_FINAL_...).",
  },
  {
    id: "missing-staging-layer",
    name: "Missing staging layer",
    category: "maintainability",
    severityDefault: "medium",
    description:
      "No staging/base-audience layer exists; queries build final output directly.",
    evidenceNeeded: ["Automation structure", "DE roles"],
    recommendationPattern:
      "Introduce a reusable base audience / staging layer feeding downstream activation.",
  },

  // --- data-quality ---
  {
    id: "nullable-subscriber-key",
    name: "Nullable SubscriberKey/ContactKey",
    category: "data-quality",
    severityDefault: "high",
    description:
      "SubscriberKey/ContactKey may be null or is not enforced in joins/output.",
    evidenceNeeded: ["DE field nullability", "SQL key handling"],
    recommendationPattern:
      "Filter out null keys and ensure the identifier is non-null and primary-keyed downstream.",
  },
  {
    id: "missing-primary-key",
    name: "Missing primary key",
    category: "data-quality",
    severityDefault: "high",
    description: "The target DE lacks a primary key, allowing duplicates.",
    evidenceNeeded: ["Target DE field/primary-key metadata"],
    recommendationPattern:
      "Define a primary key (typically the subscriber identifier) on the target DE.",
  },
  {
    id: "date-as-text",
    name: "Date stored as text",
    category: "data-quality",
    severityDefault: "medium",
    description:
      "Date values are stored as text, requiring conversions and risking errors.",
    evidenceNeeded: ["DE field types", "CONVERT/CAST usage in SQL"],
    recommendationPattern:
      "Store dates as Date fields and avoid per-row text-to-date conversions in filters.",
  },
  {
    id: "one-to-many-join-duplicate-risk",
    name: "One-to-many join duplicate risk",
    category: "data-quality",
    severityDefault: "high",
    description:
      "A one-to-many join can multiply rows and inflate the audience.",
    evidenceNeeded: ["Join keys and cardinality", "Row counts where available"],
    recommendationPattern:
      "Aggregate or dedupe the many-side before joining, keyed on the subscriber identifier.",
  },
  {
    id: "select-distinct-mask",
    name: "SELECT DISTINCT masking join explosion",
    category: "data-quality",
    severityDefault: "medium",
    description:
      "SELECT DISTINCT is used to hide duplicates caused by joins rather than fixing the join.",
    evidenceNeeded: ["SQL DISTINCT usage", "Join structure"],
    recommendationPattern:
      "Fix the join cardinality at the source instead of relying on DISTINCT to mask it.",
  },

  // --- performance ---
  {
    id: "function-on-filter-column",
    name: "Function on join/filter column",
    category: "performance",
    severityDefault: "medium",
    description:
      "Functions applied to join/filter columns prevent efficient filtering.",
    evidenceNeeded: ["SQL WHERE/JOIN expressions"],
    recommendationPattern:
      "Pre-compute or store the derived value so filters/joins use raw indexed columns.",
  },
  {
    id: "broad-select-star",
    name: "Broad SELECT *",
    category: "performance",
    severityDefault: "low",
    description: "SELECT * pulls unnecessary columns and obscures intent.",
    evidenceNeeded: ["SQL select list"],
    recommendationPattern:
      "Select only required columns to reduce data movement and clarify intent.",
  },
  {
    id: "suppression-after-heavy-joins",
    name: "Suppression applied after heavy joins",
    category: "performance",
    severityDefault: "medium",
    description:
      "Suppression/filtering runs after heavy joins, processing rows that get discarded.",
    evidenceNeeded: ["Query structure / join order"],
    recommendationPattern:
      "Apply suppression and narrowing filters before expensive joins.",
  },

  // --- orphaned-assets ---
  {
    id: "orphaned-query-target",
    name: "Orphaned query target DE",
    category: "orphaned-assets",
    severityDefault: "medium",
    description:
      "A query updates a DE not referenced by any active journey, automation, or known send process.",
    evidenceNeeded: ["Downstream consumer search", "Active journey/automation map"],
    recommendationPattern:
      "Confirm whether the target DE is still needed; flag for review or retirement if orphaned.",
  },
  {
    id: "no-active-consumer",
    name: "No active downstream consumer",
    category: "orphaned-assets",
    severityDefault: "low",
    description:
      "An automation exists but has no clear active downstream consumer.",
    evidenceNeeded: ["Consumer mapping", "Send/journey references"],
    recommendationPattern:
      "Verify the automation is still in use; document its consumer or retire it.",
  },

  // --- safety ---
  {
    id: "destructive-tool-available",
    name: "Destructive MCP tool available",
    category: "safety",
    severityDefault: "info",
    description:
      "The connected MCP server exposes write/destructive tools that must not be used in audit mode.",
    evidenceNeeded: ["MCP tool list with classification"],
    recommendationPattern:
      "Keep destructive tools in approval/prompt mode and do not call them during read-only analysis.",
  },
  {
    id: "insufficient-metadata",
    name: "Insufficient metadata",
    category: "safety",
    severityDefault: "info",
    description:
      "Required metadata (row counts, run durations, schedules) is unavailable from MCP context.",
    evidenceNeeded: ["Attempted MCP retrievals", "What was returned vs missing"],
    recommendationPattern:
      "Mark affected findings as inferred and list the missing data under required verification.",
  },
];
