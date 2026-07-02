// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Fetches published dynamic content from Supabase and writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const BASE_URL = "https://smartways.ma";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/industries", changefreq: "monthly", priority: "0.8" },
  { path: "/case-studies", changefreq: "weekly", priority: "0.8" },
  { path: "/resources", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.9" },
];

async function fetchDynamic(): Promise<SitemapEntry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[sitemap] Supabase env vars missing — skipping dynamic entries.");
    return [];
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const entries: SitemapEntry[] = [];

  const [services, industries, cases, blog, resources, legal] = await Promise.all([
    supabase.from("services").select("slug, updated_at"),
    supabase.from("industries").select("slug, updated_at"),
    supabase.from("case_studies").select("slug, updated_at, published").eq("published", true),
    supabase.from("blog_posts").select("slug, updated_at, published_at, published").eq("published", true),
    supabase.from("resources").select("slug, updated_at, published").eq("published", true),
    supabase.from("legal_pages").select("slug, updated_at"),
  ]);

  const toIso = (v: any) => (v ? new Date(v).toISOString().split("T")[0] : undefined);

  (services.data ?? []).forEach((r: any) =>
    entries.push({ path: `/services/${r.slug}`, lastmod: toIso(r.updated_at), priority: "0.8" })
  );
  (industries.data ?? []).forEach((r: any) =>
    entries.push({ path: `/industries/${r.slug}`, lastmod: toIso(r.updated_at), priority: "0.7" })
  );
  (cases.data ?? []).forEach((r: any) =>
    entries.push({ path: `/case-studies/${r.slug}`, lastmod: toIso(r.updated_at), priority: "0.7" })
  );
  (blog.data ?? []).forEach((r: any) =>
    entries.push({
      path: `/blog/${r.slug}`,
      lastmod: toIso(r.updated_at || r.published_at),
      changefreq: "monthly",
      priority: "0.7",
    })
  );
  (resources.data ?? []).forEach((r: any) =>
    entries.push({ path: `/resources/${r.slug}`, lastmod: toIso(r.updated_at), priority: "0.6" })
  );
  (legal.data ?? []).forEach((r: any) =>
    entries.push({ path: `/legal/${r.slug}`, lastmod: toIso(r.updated_at), priority: "0.3" })
  );

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

(async () => {
  try {
    const dynamic = await fetchDynamic();
    const all = [...staticEntries, ...dynamic];
    writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all));
    console.log(`[sitemap] wrote ${all.length} entries (${dynamic.length} dynamic)`);
  } catch (err) {
    console.error("[sitemap] generation failed:", err);
    // Do not fail the build; keep any existing sitemap.
  }
})();
