import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // content/ ফোল্ডারের JSON ফাইল রানটাইমেও পাওয়া যায় (অজানা slug রেন্ডারের সময়)
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  experimental: {
    serverActions: {
      // অ্যাডমিন প্যানেলে একসাথে কয়েকটি ছবি আপলোডের জন্য
      bodySizeLimit: "40mb",
    },
  },
};

export default nextConfig;
