import type { ReactNode } from "react";

/** অ্যাডমিন ফর্মের ছোট ছোট ফিল্ড কম্পোনেন্ট (ক্লায়েন্ট ও সার্ভার দুই জায়গাতেই ব্যবহারযোগ্য) */

export function Fieldset({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="c-card p-5">
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-ink-300">{hint}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  name,
  hint,
  required,
  children,
}: {
  label: string;
  name?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="c-label">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-300">{hint}</p>}
    </div>
  );
}

export function Input({
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
  readOnly,
  pattern,
  step,
  inputMode,
}: {
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  type?: string;
  readOnly?: boolean;
  pattern?: string;
  step?: string;
  inputMode?: "numeric" | "decimal" | "text";
}) {
  return (
    <input
      id={name}
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      pattern={pattern}
      step={step}
      inputMode={inputMode}
      className={`c-input ${readOnly ? "bg-ink-50 text-ink-400" : ""}`}
    />
  );
}

export function TextArea({
  name,
  defaultValue,
  placeholder,
  rows = 4,
  required,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <textarea
      id={name}
      name={name}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="c-input"
    />
  );
}

export function Select({
  name,
  defaultValue,
  options,
  placeholder,
  required,
  value,
  onChange,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const controlled = value !== undefined;
  return (
    <select
      id={name}
      name={name}
      required={required}
      className="c-input"
      {...(controlled
        ? { value, onChange: (e) => onChange?.(e.target.value) }
        : { defaultValue: defaultValue ?? "" })}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** প্রতি লাইনে একটি আইটেম */
export function LinesField({
  label,
  name,
  values,
  hint = "প্রতি লাইনে একটি",
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  values?: string[];
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field label={label} name={name} hint={hint}>
      <TextArea name={name} defaultValue={(values ?? []).join("\n")} rows={rows} placeholder={placeholder} />
    </Field>
  );
}

export function CheckboxGroup({
  name,
  options,
  checked,
  empty = "কিছু নেই",
}: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  checked?: string[];
  empty?: string;
}) {
  const set = new Set(checked ?? []);
  if (options.length === 0) return <p className="text-sm text-ink-300">{empty}</p>;
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {options.map((o) => (
        <label key={o.value} className="flex items-start gap-2 rounded-xl border border-ink-100 px-3 py-2 text-sm hover:bg-ink-50">
          <input type="checkbox" name={name} value={o.value} defaultChecked={set.has(o.value)} className="mt-1 accent-brand-500" />
          <span>
            <span className="font-semibold text-ink-900">{o.label}</span>
            {o.hint && <span className="block text-xs text-ink-300">{o.hint}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
        state.ok ? "bg-brand-50 text-brand-800" : "bg-danger-50 text-danger-700"
      }`}
    >
      {state.message}
    </p>
  );
}
