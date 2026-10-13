import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdmin } from "@/lib/admin/auth";

/** লগইন না থাকলে /admin/login-এ পাঠায়; সব অ্যাডমিন পাতা রিকোয়েস্টের সময় রেন্ডার হয় (তাজা তথ্য) */
async function Gate({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-ink-600">অ্যাডমিন প্যানেল লোড হচ্ছে…</div>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
