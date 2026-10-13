"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/admin/actions";
import { FormMessage } from "./fields";
import { SubmitButton } from "./submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(loginAction, null);
  return (
    <form action={formAction} className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="password" className="c-label">
          পাসওয়ার্ড
        </label>
        <input id="password" name="password" type="password" required autoFocus className="c-input" />
        <p className="mt-1 text-xs text-ink-300">প্রজেক্টের .env.local ফাইলের ADMIN_PASSWORD</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton label="লগইন" pendingLabel="যাচাই হচ্ছে…" />
    </form>
  );
}
