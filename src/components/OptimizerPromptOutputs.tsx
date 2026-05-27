import { useState } from "react";
import type { OptimizerState } from "../types";
import {
  generateClientOptimizerPrompt,
  getClientNotes,
} from "../lib/optimizerPrompt";
import { generateOptimizerMarkdownRunbook } from "../lib/optimizerMarkdown";
import { CLIENT_LABELS } from "../data/optimizerTemplates";
import { CodeBlock } from "./CopyButton";
import OptimizerRulePreview from "./OptimizerRulePreview";

type Tab = "prompt" | "runbook" | "rules" | "notes";

const TABS: { id: Tab; label: string }[] = [
  { id: "prompt", label: "Prompt" },
  { id: "runbook", label: "Markdown Runbook" },
  { id: "rules", label: "Rule Catalog" },
  { id: "notes", label: "Client Notes" },
];

interface OptimizerPromptOutputsProps {
  state: OptimizerState;
}

/** Tabbed, copyable generated outputs for the selected client + scope. */
export default function OptimizerPromptOutputs({
  state,
}: OptimizerPromptOutputsProps) {
  const [tab, setTab] = useState<Tab>("prompt");

  const prompt = generateClientOptimizerPrompt(state);
  const runbook = generateOptimizerMarkdownRunbook(state);
  const notes = getClientNotes(state);
  const promptTitle =
    state.client === "codex"
      ? "Codex Prompt / AGENTS.md"
      : `${CLIENT_LABELS[state.client]} Prompt`;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "prompt" && (
          <CodeBlock title={promptTitle} content={prompt} />
        )}
        {tab === "runbook" && (
          <CodeBlock title="Markdown Runbook Export" content={runbook} />
        )}
        {tab === "rules" && <OptimizerRulePreview />}
        {tab === "notes" && (
          <div className="rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {CLIENT_LABELS[state.client]} setup notes
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
              {notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
