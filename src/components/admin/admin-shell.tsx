import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { site } from "@/data/site";
import { logoutAction } from "@/lib/admin/actions";
import { canWrite } from "@/lib/admin/store";
import { AdminNav } from "./admin-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  const writable = canWrite();
  return (
    <div className="min-h-screen bg-ink-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-brand-950 text-brand-200 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Logo className="h-9 w-9" id="admin-logo-clip" />
          <div>
            <p className="font-display text-base font-bold leading-tight text-white">{site.name}</p>
            <p className="text-xs text-brand-300">অ্যাডমিন প্যানেল</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav />
        </div>
        <div className="grid grid-cols-1 gap-2 border-t border-white/10 px-4 py-4 text-sm">
          <Link href="/" target="_blank" className="text-brand-200 hover:text-white">
            সাইট দেখুন ↗
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-brand-300 hover:text-white">
              লগআউট
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {!writable && (
          <div className="bg-accent-500 px-5 py-2 text-sm font-semibold text-white">
            এই সার্ভারে ফাইল লেখা যায় না (read-only)। এখানে এডিট করতে হোস্টিংয়ে <code className="rounded bg-black/20 px-1">DATABASE_URL</code> যুক্ত করুন (README দেখুন), অথবা নিজের কম্পিউটারে <code className="rounded bg-black/20 px-1">npm run dev</code> চালিয়ে এডিট করে git push করুন।
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
        {intro && <p className="mt-1 text-sm text-ink-600">{intro}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
