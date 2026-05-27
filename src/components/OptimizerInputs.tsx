import type { OptimizerState } from "../types";

interface OptimizerInputsProps {
  state: OptimizerState;
  onChange: (patch: Partial<OptimizerState>) => void;
}

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      {children}
      {helper && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
  );
}

/** Scope-dependent input fields. No values are ever persisted. */
export default function OptimizerInputs({
  state,
  onChange,
}: OptimizerInputsProps) {
  if (state.scope === "pasted-context-only") {
    return (
      <Field
        label="Pasted context"
        helper="Paste exported SQL, automation step lists, journey names, DE schemas, or previous MCP outputs. The AI client analyzes only this — it will not call MCP tools."
      >
        <textarea
          rows={10}
          value={state.pastedContext ?? ""}
          onChange={(e) => onChange({ pastedContext: e.target.value })}
          placeholder={"-- Example\nSELECT SubscriberKey FROM Master_Audience\nWHERE OptIn = 'true'\n\nAutomation: Daily_Activation\nStep 1: Query 'Build_Audience' -> DE 'Journey_Entry_DE' (Overwrite)"}
          className={`${inputClass} font-mono`}
        />
      </Field>
    );
  }

  return (
    <div className="space-y-4">
      {state.scope === "selected-automation" && (
        <Field
          label="Automation name / key"
          helper="The Automation Studio automation to analyze."
        >
          <input
            type="text"
            value={state.automationName ?? ""}
            onChange={(e) => onChange({ automationName: e.target.value })}
            placeholder="Daily_Activation or a CustomerKey"
            className={inputClass}
          />
        </Field>
      )}

      <Field
        label={
          state.scope === "active-journey-pipelines"
            ? "Journey name / key filter (optional)"
            : "Journey name / key (optional)"
        }
        helper="Restrict the analysis to a specific journey, where supported."
      >
        <input
          type="text"
          value={state.journeyName ?? ""}
          onChange={(e) => onChange({ journeyName: e.target.value })}
          placeholder="Welcome_Series or a journey key"
          className={inputClass}
        />
      </Field>

      <Field label="Business goal (optional)">
        <input
          type="text"
          value={state.businessGoal ?? ""}
          onChange={(e) => onChange({ businessGoal: e.target.value })}
          placeholder="e.g. reduce duplicate sends, speed up nightly build"
          className={inputClass}
        />
      </Field>

      <Field label="Market / BU notes (optional)">
        <input
          type="text"
          value={state.marketNotes ?? ""}
          onChange={(e) => onChange({ marketNotes: e.target.value })}
          placeholder="e.g. EU BU, GDPR consent required"
          className={inputClass}
        />
      </Field>
    </div>
  );
}
