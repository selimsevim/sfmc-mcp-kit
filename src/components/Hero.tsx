const PRIVACY_NOTE =
  "All values are processed locally in your browser. This app does not send your Client ID, tenant ID, URLs, or tokens anywhere.";

/** Hero / page intro. Developer-utility tone, not a marketing splash. */
export default function Hero() {
  return (
    <div className="mt-10">
      <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Client-side utility · No backend · No secrets stored
      </span>
      <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
        MCP Quickstart Kit
      </h1>
      <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">
        Generate MCP setup configs for Claude, Gemini, Codex, Cursor, and other
        AI tools. Pick a recipe, fill in your IDs and URLs, and copy the exact
        command, config file, and setup guide — without hand-building URLs.
      </p>
      <p className="mt-4 inline-flex items-start gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
        <ShieldIcon />
        <span>{PRIVACY_NOTE}</span>
      </p>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}
