import { cookies } from "next/headers";
import { ADMIN_COOKIE, SESSION_DAYS, makeToken, safeEqual, verifyToken } from "./token";

/**
 * অ্যাডমিন লগইন: .env.local-এর ADMIN_PASSWORD মিললে স্বাক্ষরিত কুকি বসে।
 * src/proxy.ts প্রতিটি /admin রিকোয়েস্টে একই কুকি যাচাই করে, তাই লগইন ছাড়া কোনো অ্যাডমিন পাতা রেন্ডারই হয় না।
 */

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return safeEqual(input, password);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("অনুমতি নেই: আগে অ্যাডমিন প্যানেলে লগইন করুন");
}

export async function setSessionCookie(): Promise<boolean> {
  const token = makeToken();
  if (!token) return false;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return true;
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
