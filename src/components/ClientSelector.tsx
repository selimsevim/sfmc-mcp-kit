import type { AIClient } from "../types";

interface ClientSelectorProps {
  clients: AIClient[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Pick the target AI client/tool. Already filtered to compatible transports. */
export default function ClientSelector({
  clients,
  selectedId,
  onSelect,
}: ClientSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => {
        const active = client.id === selectedId;
        return (
          <button
            key={client.id}
            type="button"
            onClick={() => onSelect(client.id)}
            aria-pressed={active}
            className={`flex flex-col rounded-lg border p-4 text-left transition ${
              active
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40"
                : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
            }`}
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {client.name}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {client.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
