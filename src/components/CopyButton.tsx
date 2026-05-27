import { useState } from "react";

interface CopyButtonProps {
  value: string;
  /** Disable when there is nothing meaningful to copy yet. */
  disabled?: boolean;
  label?: string;
}

/**
 * Small copy-to-clipboard button with a transient "Copied" confirmation.
 * Falls back gracefully if the Clipboard API is unavailable.
 */
export default function CopyButton({
  value,
  disabled = false,
  label = "Copy",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Legacy fallback for non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore — copying is best-effort.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label={copied ? "Copied" : label}
    >
      {copied ? (
        <>
          <CheckIcon /> Copied
        </>
      ) : (
        <>
          <CopyIcon /> {label}
        </>
      )}
    </button>
  );
}

interface CodeBlockProps {
  title?: string;
  content: string;
  /** Optional note rendered beneath the code box. */
  note?: string;
  /** Emphasize as a high-risk / destructive value. */
  danger?: boolean;
}

/** A monospace output box with a header and copy button. */
export function CodeBlock({ title, content, note, danger }: CodeBlockProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {title && (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {title}
          </span>
        )}
        <div className="ml-auto">
          <CopyButton value={content} disabled={!content} />
        </div>
      </div>
      <pre
        className={`mt-1.5 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed ${
          danger
            ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
            : "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        }`}
      >
        <code>{content || "—"}</code>
      </pre>
      {note && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
