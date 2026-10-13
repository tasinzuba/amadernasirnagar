import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * অ্যাডমিন সেশন টোকেন (HMAC-স্বাক্ষরিত)। next/headers ছাড়া লেখা, যাতে proxy.ts-ও ব্যবহার করতে পারে।
 */

export const ADMIN_COOKIE = "an_admin";
export const SESSION_DAYS = 30;

function signingKey(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return process.env.ADMIN_SECRET ?? createHash("sha256").update(`amader-nasirnagar:${password}`).digest("hex");
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function makeToken(): string | null {
  const key = signingKey();
  if (!key) return null;
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const key = signingKey();
  if (!key) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(parts[2], sign(`${parts[0]}.${parts[1]}`, key));
}
