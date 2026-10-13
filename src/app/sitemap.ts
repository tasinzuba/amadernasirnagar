import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { data } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await data();
  const base = site.url.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/upazila",
    "/villages",
    "/unions",
    "/places",
    "/people",
    "/schools",
    "/news",
    "/events",
    "/transport",
    "/emergency",
    "/map",
    "/contribute",
    "/about",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...db.getUnions().map((u) => ({
      url: `${base}/unions/${u.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...db.getVillages().map((v) => ({
      url: `${base}/villages/${v.slug}`,
      changeFrequency: "monthly" as const,
      priority: v.status === "stub" ? 0.5 : 0.8,
    })),
    ...db.getPlaces().map((p) => ({
      url: `${base}/places/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...db.getSchools().map((s) => ({
      url: `${base}/schools/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...db.getNewsList().map((n) => ({
      url: `${base}/news/${n.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
