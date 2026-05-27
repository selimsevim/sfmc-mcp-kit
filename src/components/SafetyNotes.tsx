import type { MCPRecipe } from "../types";

interface SafetyNotesProps {
  recipe: MCPRecipe;
}

const GLOBAL_NOTES = [
  "All values are processed locally in your browser. This app does not send your Client ID, tenant ID, URLs, or tokens anywhere.",
  "No values are persisted — nothing is written to localStorage, and there is no backend, login, or analytics.",
  "Never paste a Client Secret or any secret value. Reference tokens by environment variable name instead.",
];

/** Privacy and safety guidance, plus recipe-specific notes. */
export default function SafetyNotes({ recipe }: SafetyNotesProps) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {GLOBAL_NOTES.map((note, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <CheckIcon />
            <span>{note}</span>
          </li>
        ))}
      </ul>

      {recipe.safetyNotes && recipe.safetyNotes.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {recipe.name} — specific notes
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-amber-800 dark:text-amber-300/90">
            {recipe.safetyNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-emerald-500"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
