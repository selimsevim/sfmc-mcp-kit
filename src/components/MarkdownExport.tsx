import type { AppState } from "../types";
import { generateMarkdownSetup } from "../lib/markdown";
import { CodeBlock } from "./CopyButton";

interface MarkdownExportProps {
  state: AppState;
}

/** Full copyable Markdown setup guide for the current selection. */
export default function MarkdownExport({ state }: MarkdownExportProps) {
  const markdown = generateMarkdownSetup(state);
  return (
    <div>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
        A self-contained setup guide you can paste into a README, ticket, or
        team doc.
      </p>
      <CodeBlock title="Markdown setup guide" content={markdown} />
    </div>
  );
}
