// Post-build prerender: writes a static HTML file per published blog post
// (EN and FR) at dist/blog/{lang}/{slug}/index.html with fully-populated
// <head> so crawlers (WhatsApp, LinkedIn, Facebook, Twitter, Slack) see
// article-specific title, description, og:image, twitter:image, canonical,
// and JSON-LD directly in the initial HTML response. The SPA script tags
// from the built index.html are preserved so real browsers hydrate the app
// and the client-side router takes over from there.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SITE = "https://smartways.ma";
const DIST = resolve("dist");
const INDEX = resolve(DIST, "index.html");

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (s?: string | null) =>
  (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const toAbs = (u?: string | null) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE}${u.startsWith("/") ? "" : "/"}${u}`;
};

function buildHead(post: any, lang: "en" | "fr") {
  const enSlug = post.slug;
  const frSlug = post.slug_fr || post.slug;
  const activeSlug = lang === "fr" ? frSlug : enSlug;

  const title =
    stripHtml(lang === "fr" ? post.seo_title_fr : post.seo_title_en) ||
    stripHtml(lang === "fr" ? post.title_fr : post.title_en) ||
    "Smartway";
  const description =
    stripHtml(lang === "fr" ? post.seo_description_fr : post.seo_description_en) ||
    stripHtml(lang === "fr" ? post.excerpt_fr : post.excerpt_en) ||
    "";
  const ogTitle =
    stripHtml(lang === "fr" ? post.og_title_fr : post.og_title_en) || title;
  const ogDescription =
    stripHtml(lang === "fr" ? post.og_description_fr : post.og_description_en) ||
    description;

  const cover =
    (lang === "fr" ? post.cover_image_fr : post.cover_image) || post.cover_image || "";
  const image = toAbs(post.og_image || cover || `${SITE}/logo-smartway.png`);
  const canonical = post.canonical_url || `${SITE}/blog/${lang}/${activeSlug}`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": post.structured_data_type || "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author || "Smartway" },
    publisher: {
      "@type": "Organization",
      name: "Smartway",
      logo: { "@type": "ImageObject", url: `${SITE}/logo-smartway.png` },
    },
    mainEntityOfPage: canonical,
    inLanguage: lang,
  };

  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canonical)}" />
    <link rel="alternate" hreflang="en" href="${SITE}/blog/en/${esc(enSlug)}" />
    <link rel="alternate" hreflang="fr" href="${SITE}/blog/fr/${esc(frSlug)}" />
    <link rel="alternate" hreflang="x-default" href="${SITE}/blog/en/${esc(enSlug)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Smartway" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(ogDescription)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:locale" content="${lang === "fr" ? "fr_FR" : "en_US"}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:secure_url" content="${esc(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(ogTitle)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(ogTitle)}" />
    <meta name="twitter:description" content="${esc(ogDescription)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    <script type="application/ld+json">${JSON.stringify(jsonld)}</script>`;
}

function injectHead(indexHtml: string, headBlock: string, lang: "en" | "fr") {
  // Strip generic tags that would conflict with per-article ones.
  let html = indexHtml
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta[^>]+name=["']description["'][^>]*>/gi, "")
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta[^>]+name=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");

  // Set html lang and inject article head right before </head>.
  html = html.replace(/<html[^>]*>/i, `<html lang="${lang}">`);
  html = html.replace(/<\/head>/i, `${headBlock}\n  </head>`);
  return html;
}

(async () => {
  if (!existsSync(INDEX)) {
    console.warn("[prerender-blog] dist/index.html missing — skip.");
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[prerender-blog] Supabase env vars missing — skip.");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true);

  if (error) {
    console.error("[prerender-blog] fetch failed:", error.message);
    return;
  }

  const template = readFileSync(INDEX, "utf-8");
  let count = 0;

  for (const post of posts ?? []) {
    for (const lang of ["en", "fr"] as const) {
      const slug = lang === "fr" ? post.slug_fr || post.slug : post.slug;
      if (!slug) continue;
      const head = buildHead(post, lang);
      const html = injectHead(template, head, lang);
      const outPath = resolve(DIST, "blog", lang, slug, "index.html");
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      count++;
    }
  }

  console.log(`[prerender-blog] wrote ${count} static blog HTML files.`);
})().catch((e) => {
  console.error("[prerender-blog] failed:", e);
});
