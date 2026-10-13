import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Emblem } from "@/components/logo";
import { site } from "@/data/site";
import { isAdmin, isAdminConfigured } from "@/lib/admin/auth";

async function LoginGate() {
  if (await isAdmin()) redirect("/admin");
  return (
    <>
      {!isAdminConfigured() && (
        <p className="mb-4 rounded-xl bg-danger-50 px-4 py-2.5 text-sm font-semibold text-danger-700">
          .env.local ফাইলে ADMIN_PASSWORD দেওয়া নেই। README-এর অ্যাডমিন অংশ দেখুন।
        </p>
      )}
      <LoginForm />
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-box">
        <div className="mb-5 flex items-center gap-3">
          <Emblem className="h-12 w-12" id="login-emblem-clip" />
          <div>
            <p className="font-display text-lg font-bold leading-tight text-ink-900">{site.name}</p>
            <p className="text-xs text-ink-300">অ্যাডমিন প্যানেল</p>
          </div>
        </div>
        <Suspense fallback={<LoginForm />}>
          <LoginGate />
        </Suspense>
      </div>
    </div>
  );
}
