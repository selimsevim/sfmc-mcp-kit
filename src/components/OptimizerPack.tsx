import { useState } from "react";
import type {
  OptimizerClient,
  OptimizerState,
  PermissionMode,
} from "../types";
import {
  CLIENT_LABELS,
  OPTIMIZER_WARNING,
  PERMISSION_MODE_LABELS,
} from "../data/optimizerTemplates";
import { validateOptimizerState } from "../lib/optimizerPrompt";
import OptimizerScopeSelector from "./OptimizerScopeSelector";
import OptimizerInputs from "./OptimizerInputs";
import OptimizerPromptOutputs from "./OptimizerPromptOutputs";
import OptimizerServers from "./OptimizerServers";

const CLIENTS: OptimizerClient[] = [
  "claude-code",
  "codex",
  "gemini-cli",
  "generic",
];

const CLIENT_DESCRIPTIONS: Record<OptimizerClient, string> = {
  "claude-code": "Paste the prompt into Claude Code; authenticate with /mcp.",
  codex: "Generates an AGENTS.md / CODEX.md style instruction block.",
  "gemini-cli": "Paste the prompt into Gemini CLI; auth with /mcp auth.",
  generic: "Works with Cursor and any MCP-capable client.",
};

const PERMISSION_MODES: {
  id: PermissionMode;
  enabled: boolean;
  note: string;
}[] = [
  { id: "read-only-audit", enabled: true, note: "Retrieval and analysis only." },
  { id: "draft-refactor", enabled: false, note: "Coming later." },
  { id: "controlled-apply", enabled: false, note: "Coming later." },
];

const INITIAL_STATE: OptimizerState = {
  client: "claude-code",
  mcpServers: [{ name: "mce", concern: "all" }],
  scope: "selected-automation",
  automationName: "",
  journeyName: "",
  businessGoal: "",
  marketNotes: "",
  permissionMode: "read-only-audit",
  pastedContext: "",
};

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {number}
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** Automation Optimizer Pack — local read-only prompt/runbook generator. */
export default function OptimizerPack() {
  const [state, setState] = useState<OptimizerState>(INITIAL_STATE);
  const patch = (p: Partial<OptimizerState>) =>
    setState((s) => ({ ...s, ...p }));

  const validation = validateOptimizerState(state);

  return (
    <div className="space-y-6">
      <div className="mt-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Automation Optimizer Pack
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Generate a local AI runbook that uses your connected SFMC MCP server
          to inspect automations, SQL Query Activities, journeys, and Data
          Extensions in read-only mode.
        </p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
        {OPTIMIZER_WARNING}
      </div>

      <Section number={1} title="Client">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CLIENTS.map((c) => {
            const active = c === state.client;
            return (
              <button
                key={c}
                type="button"
                onClick={() => patch({ client: c })}
                aria-pressed={active}
                className={`flex flex-col rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40"
                    : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {CLIENT_LABELS[c]}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {CLIENT_DESCRIPTIONS[c]}
                </p>
              </button>
            );
          })}
        </div>
      </Section>

      <Section number={2} title="MCP alias in your AI tool">
        <OptimizerServers
          servers={state.mcpServers ?? []}
          onChange={(mcpServers) => patch({ mcpServers })}
        />
      </Section>

      <Section number={3} title="Analysis scope">
        <OptimizerScopeSelector
          value={state.scope}
          onChange={(scope) => patch({ scope })}
        />
      </Section>

      <Section number={4} title="Inputs">
        <OptimizerInputs state={state} onChange={patch} />
        {validation.warning && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            {validation.warning}
          </p>
        )}
      </Section>

      <Section number={5} title="Permission mode">
        <div className="grid gap-3 sm:grid-cols-3">
          {PERMISSION_MODES.map((m) => {
            const active = m.id === state.permissionMode;
            return (
              <button
                key={m.id}
                type="button"
                disabled={!m.enabled}
                onClick={() => m.enabled && patch({ permissionMode: m.id })}
                aria-pressed={active}
                className={`flex flex-col rounded-lg border p-4 text-left transition ${
                  !m.enabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/40"
                    : active
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/40"
                      : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {PERMISSION_MODE_LABELS[m.id]}
                  {!m.enabled && (
                    <span className="rounded bg-slate-200 px-1 py-0.5 text-[9px] font-medium uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      Coming later
                    </span>
                  )}
                </span>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {m.note}
                </p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          MVP supports Read-only Audit Mode only. The generated runbook is
          always read-only.
        </p>
      </Section>

      <Section number={6} title="Generated outputs">
        {validation.valid ? (
          <OptimizerPromptOutputs state={state} />
        ) : (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {validation.warning}
          </p>
        )}
      </Section>
    </div>
  );
}
