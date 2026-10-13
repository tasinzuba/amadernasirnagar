"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label = "সংরক্ষণ করুন", pendingLabel = "সংরক্ষণ হচ্ছে…", className = "c-btn c-btn--solid c-btn--lg" }: { label?: string; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}>
      {pending ? pendingLabel : label}
    </button>
  );
}
