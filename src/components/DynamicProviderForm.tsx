import type { AuthMode, MCPRecipe, MCPRecipeInput } from "../types";
import { extractTenantId, validateInput } from "../lib/validation";

interface DynamicProviderFormProps {
  recipe: MCPRecipe;
  regionId: string | null;
  values: Record<string, string>;
  authMode: AuthMode;
  onRegionChange: (id: string) => void;
  onValueChange: (inputId: string, value: string) => void;
  onAuthModeChange: (mode: AuthMode) => void;
}

const AUTH_LABELS: Record<AuthMode, string> = {
  none: "None",
  oauth: "OAuth",
  bearer: "Bearer token",
  "api-key": "API key",
  custom: "Custom",
};

/** Renders region, auth mode, and the recipe's dynamic inputs. */
export default function DynamicProviderForm({
  recipe,
  regionId,
  values,
  authMode,
  onRegionChange,
  onValueChange,
  onAuthModeChange,
}: DynamicProviderFormProps) {
  return (
    <div className="space-y-5">
      {recipe.regions && recipe.regions.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Region / environment
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {recipe.regions.map((region) => {
              const active = region.id === regionId;
              return (
                <label
                  key={region.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
                    active
                      ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
                      : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="region"
                    className="mt-0.5"
                    checked={active}
                    onChange={() => onRegionChange(region.id)}
                  />
                  <span>
                    <span className="block font-medium text-slate-900 dark:text-slate-100">
                      {region.label}
                    </span>
                    <span className="block break-all font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {region.baseUrl}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {recipe.authModes.length > 1 && (
        <div>
          <label
            htmlFor="auth-mode"
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Auth mode
          </label>
          <select
            id="auth-mode"
            value={authMode}
            onChange={(e) => onAuthModeChange(e.target.value as AuthMode)}
            className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {recipe.authModes.map((mode) => (
              <option key={mode} value={mode}>
                {AUTH_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {recipe.inputs.map((input) => (
          <InputField
            key={input.id}
            input={input}
            value={values[input.id] ?? ""}
            onChange={(v) => onValueChange(input.id, v)}
          />
        ))}
      </div>
    </div>
  );
}

function InputField({
  input,
  value,
  onChange,
}: {
  input: MCPRecipeInput;
  value: string;
  onChange: (value: string) => void;
}) {
  const derivedTenant =
    input.derive === "tenantIdFromAuthBaseUri" ? extractTenantId(value) : undefined;
  const result = validateInput(input, value, derivedTenant);
  const showWarning = value.trim() !== "" && !!result.warning;
  const showBlock = value.trim() === "" && !result.valid;

  return (
    <div>
      <label
        htmlFor={`input-${input.id}`}
        className="block text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        {input.label}
        {input.required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {input.type === "select" && input.options ? (
        <select
          id={`input-${input.id}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">Select…</option>
          {input.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`input-${input.id}`}
          type={input.type === "password" ? "password" : "text"}
          inputMode={input.type === "url" ? "url" : undefined}
          value={value}
          placeholder={input.placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      )}

      {input.helperText && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {input.helperText}
        </p>
      )}

      {derivedTenant !== undefined && value.trim() !== "" && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Extracted Tenant ID:{" "}
          <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {derivedTenant || "—"}
          </span>
        </p>
      )}

      {(showWarning || showBlock) && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          {result.warning}
        </p>
      )}
    </div>
  );
}
