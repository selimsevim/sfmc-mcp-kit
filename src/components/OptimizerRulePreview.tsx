import { useMemo, useState } from "react";
import type { OptimizerRule, OptimizerSeverity } from "../types";
import { OPTIMIZER_RULES } from "../data/optimizerRules";
import { buildRuleCatalogMarkdown } from "../lib/optimizerMarkdown";
import CopyButton from "./CopyButton";

const SEVERITY_STYLES: Record<OptimizerSeverity, string> = {
  critical:
    "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  high: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  medium:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  low: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  info: "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const CATEGORIES = [
  "all",
  ...Array.from(new Set(OPTIMIZER_RULES.map((r) => r.category))),
];

function SeverityBadge({ severity }: { severity: OptimizerSeverity }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

/** Browsable preview of the rule catalog with a copy-to-Markdown button. */
export default function OptimizerRulePreview() {
  const [category, setCategory] = useState<string>("all");

  const filtered: OptimizerRule[] = useMemo(
    () =>
      category === "all"
        ? OPTIMIZER_RULES
        : OPTIMIZER_RULES.filter((r) => r.category === category),
    [category],
  );

  const markdown = useMemo(() => buildRuleCatalogMarkdown(), []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {OPTIMIZER_RULES.length} conceptual risk checks embedded in the
          runbook.
        </p>
        <CopyButton value={markdown} label="Copy rule catalog (Markdown)" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded border px-2 py-0.5 text-[11px] transition ${
              category === cat
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((rule) => (
          <li
            key={rule.id}
            className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {rule.name}
              </span>
              <SeverityBadge severity={rule.severityDefault} />
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
              {rule.id} · {rule.category}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {rule.description}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium">Recommendation:</span>{" "}
              {rule.recommendationPattern}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
