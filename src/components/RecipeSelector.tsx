import type { MCPRecipe } from "../types";

interface RecipeSelectorProps {
  recipes: MCPRecipe[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Card grid for choosing the MCP provider recipe. */
export default function RecipeSelector({
  recipes,
  selectedId,
  onSelect,
}: RecipeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => {
        const active = recipe.id === selectedId;
        return (
          <button
            key={recipe.id}
            type="button"
            onClick={() => onSelect(recipe.id)}
            aria-pressed={active}
            className={`flex flex-col rounded-lg border p-4 text-left transition ${
              active
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40"
                : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {recipe.name}
              </span>
              <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
                {recipe.category}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {recipe.description}
            </p>
            <span className="mt-3 inline-flex w-fit items-center rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {recipe.transport}
            </span>
          </button>
        );
      })}
    </div>
  );
}
