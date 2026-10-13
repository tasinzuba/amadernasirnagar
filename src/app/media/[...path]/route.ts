import type { NextRequest } from "next/server";
import { getSql, hasDatabase } from "@/lib/db";

/**
 * অ্যাডমিন থেকে আপলোড করা ছবি (ডেটাবেসের media টেবিল) দেখানো: /media/villages/x/cover-abc.jpg
 * প্রতিটা আপলোডের নাম আলাদা, তাই ব্রাউজার ও CDN ছবিটা বছরভর ক্যাশে রাখতে পারে।
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/media/[...path]">) {
  const { path } = await ctx.params;
  const key = path.join("/");
  if (!hasDatabase() || !/^[a-z0-9/_.-]+$/i.test(key)) return new Response("Not found", { status: 404 });

  const rows = (await getSql()`select content_type, data from media where path = ${key}`) as { content_type: string; data: Buffer }[];
  const row = rows[0];
  if (!row) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.content_type,
      "Content-Length": String(row.data.length),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
