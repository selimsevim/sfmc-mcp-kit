import type { McpServerBinding } from "../types";

/**
 * Single MCP alias entry. The alias must match a server already configured in
 * the user's AI tool (Claude Code, Codex, Gemini, Cursor). It is interpolated
 * into the generated runbook so the model knows which server to call — this is
 * one-way: the app never reads from or writes to the client's MCP config.
 */
export default function OptimizerServers({
  servers,
  onChange,
}: {
  servers: McpServerBinding[];
  onChange: (servers: McpServerBinding[]) => void;
}) {
  const alias = servers[0]?.name ?? "";
  const setAlias = (name: string) => onChange([{ name, concern: "all" }]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="mce"
        aria-label="MCP alias in your AI tool"
        className="w-full max-w-[18rem] rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Enter the MCP alias exactly as it is named in your AI tool (e.g.{" "}
        <code className="font-mono">mce</code>). It is written into the generated
        runbook so the model calls the right server — nothing is read from or
        saved to your client config.
      </p>
    </div>
  );
}
