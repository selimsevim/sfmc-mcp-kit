import type { OptimizerScope } from "../types";
import { SCOPE_LABELS } from "../data/optimizerTemplates";

const SCOPE_DESCRIPTIONS: Record<OptimizerScope, string> = {
  "selected-automation":
    "Focus on one automation and its SQL Query Activities and Data Extension dependencies.",
  "active-journey-pipelines":
    "Start from running journeys, find entry DEs, feeding queries, then map back to automations.",
  "pasted-context-only":
    "Analyze only pasted SQL / automation / journey / DE context. No MCP tools are called.",
};

const SCOPES: OptimizerScope[] = [
  "selected-automation",
  "active-journey-pipelines",
  "pasted-context-only",
];

interface OptimizerScopeSelectorProps {
  value: OptimizerScope;
  onChange: (scope: OptimizerScope) => void;
}

export default function OptimizerScopeSelector({
  value,
  onChange,
}: OptimizerScopeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SCOPES.map((scope) => {
        const active = scope === value;
        return (
          <button
            key={scope}
            type="button"
            onClick={() => onChange(scope)}
            aria-pressed={active}
            className={`flex flex-col rounded-lg border p-4 text-left transition ${
              active
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40"
                : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
            }`}
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {SCOPE_LABELS[scope]}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {SCOPE_DESCRIPTIONS[scope]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
