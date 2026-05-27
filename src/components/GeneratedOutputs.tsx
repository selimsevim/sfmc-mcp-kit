import type { AppState, MCPRecipe } from "../types";
import {
  buildClientBlocks,
  buildSetupNotes,
  buildTestPrompt,
  resolveConnection,
} from "../lib/template";
import { CodeBlock } from "./CopyButton";

interface GeneratedOutputsProps {
  recipe: MCPRecipe;
  state: AppState;
  clientName: string;
}

/** Renders the generated connection facts and client-specific config. */
export default function GeneratedOutputs({
  recipe,
  state,
  clientName,
}: GeneratedOutputsProps) {
  const conn = resolveConnection(state, recipe);
  const blocks = buildClientBlocks(state.clientId, conn, state);
  const notes = buildSetupNotes(state.clientId, conn);
  const isStdio = recipe.transport === "stdio";

  return (
    <div className="space-y-4">
      {/* Core connection values */}
      {!isStdio && (
        <CodeBlock title="MCP Server URL" content={conn.mcpServerUrl} />
      )}

      {isStdio && conn.command && (
        <CodeBlock
          title="Launch command"
          content={`${conn.command}${conn.args.length ? " " + conn.args.join(" ") : ""}`}
        />
      )}

      {recipe.redirectUriTemplate && (
        <CodeBlock
          title="OAuth Redirect URI (set this on your provider)"
          content={conn.redirectUri}
          note="Add this exact value as the redirect/callback URI on your MCP provider."
        />
      )}

      {/* Client-specific config */}
      {blocks.length > 0 ? (
        blocks.map((block) => (
          <CodeBlock key={block.id} title={block.title} content={block.content} />
        ))
      ) : (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {clientName} does not support this recipe's transport ({recipe.transport}).
          Choose a different client.
        </p>
      )}

      {/* Safe first test prompt */}
      <CodeBlock
        title="Safe first test prompt"
        content={buildTestPrompt(recipe)}
      />

      {/* Client-specific setup notes */}
      {notes.length > 0 && (
        <div className="rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Setup notes — {clientName}
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
            {notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
