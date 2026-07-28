// Public crawler-friendly HTML for blog articles.
// Returns fully-populated <head> so LinkedIn/WhatsApp/Facebook/Twitter can read
// per-article OG tags (title, description, canonical, og:image, twitter:image).
// Route: GET /functions/v1/blog-og/{lang}/{slug}
// Web server should proxy crawler user-agents on /blog/{lang}/{slug} here.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_ORIGIN = "https://smartways.ma";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (s?: string | null) =>
  (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // Path may be /functions/v1/blog-og/en/some-slug OR /blog-og/en/some-slug
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("blog-og");
  const lang = (parts[idx + 1] === "fr" ? "fr" : "en") as "en" | "fr";
  const slug = parts[idx + 2] ?? "";

  if (!slug) {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  const col = lang === "fr" ? "slug_fr" : "slug";
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq(col, slug)
    .eq("published", true)
    .maybeSingle();

  if (!post) {
    return new Response("Not found", { status: 404, headers: { ...corsHeaders, "Content-Type": "text/html" } });
  }

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
    stripHtml(lang === "fr" ? post.og_description_fr : post.og_description_en) || description;

  const cover =
    (lang === "fr" ? post.cover_image_fr : post.cover_image) || post.cover_image || "";
  const image = post.og_image || cover || `${SITE_ORIGIN}/logo-smartway.png`;
  const canonical = post.canonical_url || `${SITE_ORIGIN}/blog/${lang}/${activeSlug}`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": post.structured_data_type || "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author || "Smartway" },
    publisher: { "@type": "Organization", name: "Smartway", logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/logo-smartway.png` } },
    mainEntityOfPage: canonical,
    inLanguage: lang,
  };

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(canonical)}" />
<link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/blog/en/${esc(enSlug)}" />
<link rel="alternate" hreflang="fr" href="${SITE_ORIGIN}/blog/fr/${esc(frSlug)}" />
<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/blog/en/${esc(enSlug)}" />
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
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
<h1>${esc(stripHtml(lang === "fr" ? post.title_fr : post.title_en) || title)}</h1>
<p>${esc(description)}</p>
${image ? `<img src="${esc(image)}" alt="${esc(ogTitle)}" width="1200" height="630" />` : ""}
<p><a href="${esc(canonical)}">Read the full article on smartways.ma</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
});
