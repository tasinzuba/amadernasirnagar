"use client";

import { useState } from "react";

export interface RowColumn {
  key: string;
  label: string;
  type?: "text" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

interface Row {
  id: number;
  values: Record<string, string>;
}

/**
 * সারি যোগ/মুছে ফেলার সম্পাদক। প্রতিটি কলাম `${prefix}.${key}` নামে জমা হয়;
 * সার্ভারে form.rows() একই ইনডেক্সের মানগুলো এক সারি ধরে।
 */
export function RowsEditor({
  prefix,
  columns,
  initial = [],
  addLabel = "নতুন সারি",
  emptyRow,
}: {
  prefix: string;
  columns: RowColumn[];
  initial?: Record<string, string>[];
  addLabel?: string;
  emptyRow?: Record<string, string>;
}) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((values, i) => ({ id: i + 1, values })));
  const [nextId, setNextId] = useState(initial.length + 1);

  const add = () => {
    setRows((r) => [...r, { id: nextId, values: emptyRow ?? {} }]);
    setNextId((n) => n + 1);
  };
  const remove = (id: number) => setRows((r) => r.filter((row) => row.id !== id));

  return (
    <div className="grid grid-cols-1 gap-2">
      {rows.length > 0 && (
        <div className="hidden gap-2 text-xs font-semibold text-ink-300 sm:grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) 2.5rem` }}>
          {columns.map((c) => (
            <span key={c.key}>{c.label}</span>
          ))}
          <span />
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-1 gap-2 rounded-xl border border-ink-100 p-2 sm:border-0 sm:p-0"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) 2.5rem` }}
        >
          {columns.map((c) =>
            c.type === "select" ? (
              <select key={c.key} name={`${prefix}.${c.key}`} defaultValue={row.values[c.key] ?? ""} className="c-input" aria-label={c.label}>
                {(c.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={c.key}
                name={`${prefix}.${c.key}`}
                defaultValue={row.values[c.key] ?? ""}
                placeholder={c.placeholder ?? c.label}
                className="c-input"
                aria-label={c.label}
              />
            ),
          )}
          <button
            type="button"
            onClick={() => remove(row.id)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-danger-500 hover:bg-danger-50"
            aria-label="সারি মুছুন"
            title="মুছুন"
          >
            ✕
          </button>
        </div>
      ))}
      <div>
        <button type="button" onClick={add} className="c-btn c-btn--outline">
          + {addLabel}
        </button>
      </div>
    </div>
  );
}
