"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/admin/actions";
import { FormMessage } from "./fields";

/** নিশ্চিত হয়ে মুছে ফেলার বোতাম; অ্যাকশন থেকে এরর এলে দেখায় */
export function DeleteButton({
  action,
  fields,
  label = "মুছে ফেলুন",
  confirmText = "সত্যিই মুছে ফেলতে চান? এটি ফেরানো যাবে না।",
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  label?: string;
  confirmText?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="grid grid-cols-1 gap-2"
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={pending} className="c-btn border-danger-500/60 text-danger-600 hover:bg-danger-50 disabled:opacity-60">
        {pending ? "মুছছে…" : label}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
