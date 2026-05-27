import { useEffect, useMemo, useState } from "react";
import type { AppState, AuthMode } from "./types";
import { RECIPES, getRecipe } from "./data/recipes";
import { CLIENTS, getClient } from "./data/clients";
import Hero from "./components/Hero";
import RecipeSelector from "./components/RecipeSelector";
import DynamicProviderForm from "./components/DynamicProviderForm";
import ClientSelector from "./components/ClientSelector";
import GeneratedOutputs from "./components/GeneratedOutputs";
import MarkdownExport from "./components/MarkdownExport";
import SafetyNotes from "./components/SafetyNotes";
import OptimizerPack from "./components/OptimizerPack";

type Theme = "light" | "dark";
type Tab = "setup" | "optimizer";

const THEME_KEY = "mcp-quickstart-theme";

/** Saved preference, else the OS setting, else light. */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const TABS: { id: Tab; label: string }[] = [
  { id: "setup", label: "MCP Setup Generator" },
  { id: "optimizer", label: "Automation Optimizer Pack" },
];

/** Build the initial state for a given recipe (no persistence). */
function initialStateFor(recipeId: string): AppState {
  const recipe = getRecipe(recipeId) ?? RECIPES[0];
  const compatible = compatibleClients(recipe.transport);
  const preferred = compatible.find((c) => c.id === "claude") ?? compatible[0];
  return {
    recipeId: recipe.id,
    regionId: recipe.regions?.[0]?.id ?? null,
    values: {},
    authMode: recipe.authModes[0] ?? "none",
    clientId: preferred?.id ?? "claude",
  };
}

function compatibleClients(transport: string) {
  return CLIENTS.filter(
    (c) => transport === "both" || c.supports.includes(transport as never),
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [tab, setTab] = useState<Tab>("setup");

  // Persist the theme so it survives a refresh.
  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  const [state, setState] = useState<AppState>(() => initialStateFor("sfmc-mce"));

  const recipe = getRecipe(state.recipeId) ?? RECIPES[0];
  const clients = useMemo(
    () => compatibleClients(recipe.transport),
    [recipe.transport],
  );
  const client = getClient(state.clientId) ?? clients[0];

  function selectRecipe(id: string) {
    setState(initialStateFor(id));
  }

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""}`}
    >
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <Header
            theme={theme}
            onToggleTheme={() =>
              setTheme((t) => (t === "dark" ? "light" : "dark"))
            }
          />

          <nav className="mt-6 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "optimizer" ? (
            <main className="mt-8">
              <OptimizerPack />
            </main>
          ) : (
          <>
          <Hero />

          <main className="mt-10 space-y-6">
            <Section number={1} title="Choose a recipe">
              <RecipeSelector
                recipes={RECIPES}
                selectedId={state.recipeId}
                onSelect={selectRecipe}
              />
            </Section>

            <Section
              number={2}
              title="Provider inputs"
              subtitle={recipe.name}
            >
              <DynamicProviderForm
                recipe={recipe}
                regionId={state.regionId}
                values={state.values}
                authMode={state.authMode}
                onRegionChange={(regionId) =>
                  setState((s) => ({ ...s, regionId }))
                }
                onAuthModeChange={(authMode: AuthMode) =>
                  setState((s) => ({ ...s, authMode }))
                }
                onValueChange={(inputId, value) =>
                  setState((s) => ({
                    ...s,
                    values: { ...s.values, [inputId]: value },
                  }))
                }
              />
            </Section>

            <Section number={3} title="Select AI client">
              <ClientSelector
                clients={clients}
                selectedId={state.clientId}
                onSelect={(clientId) => setState((s) => ({ ...s, clientId }))}
              />
            </Section>

            <Section number={4} title="Generated config">
              <GeneratedOutputs
                recipe={recipe}
                state={state}
                clientName={client?.name ?? state.clientId}
              />
            </Section>

            <Section number={5} title="Markdown export">
              <MarkdownExport state={state} />
            </Section>

            <Section number={6} title="Safety & privacy">
              <SafetyNotes recipe={recipe} />
            </Section>
          </main>
          </>
          )}

          <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            MCP Quickstart Kit — a client-side utility. No backend, no secrets
            stored.
          </footer>
        </div>
      </div>
    </div>
  );
}

function Header({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
          MQ
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">
            MCP Quickstart Kit
          </p>
          <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
            MCP setup &amp; config generator
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {number}
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
