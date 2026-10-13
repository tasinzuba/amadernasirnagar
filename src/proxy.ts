import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyToken } from "@/lib/admin/token";

/**
 * /admin-এর সব পাতা রেন্ডারের আগেই কুকি যাচাই: লগইন না থাকলে /admin/login-এ পাঠায়।
 * (লেআউটের ভেতরের গেট যথেষ্ট নয়, কারণ Next.js পাতার সেগমেন্ট আলাদাভাবে রেন্ডার করে।)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = verifyToken(request.cookies.get(ADMIN_COOKIE)?.value);
  const url = request.nextUrl.clone();
  url.search = "";

  if (pathname === "/admin/login") {
    // লগইন থাকা অবস্থায় লগইন পাতায় এলে সরাসরি ড্যাশবোর্ডে (সার্ভার অ্যাকশনের POST বাদে)
    if (loggedIn && request.method === "GET") {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  if (loggedIn) return NextResponse.next();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
