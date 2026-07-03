import { useEffect, useRef } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Lang } from "@/lib/i18n";
import Seo from "@/components/site/Seo";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug;
  const urlLang = params.lang as Lang | undefined;
  const { t, pick, lang, setLang } = useI18n();
  const navigate = useNavigate();

  // On initial mount only: adopt the URL's language as the app language (URL wins on landing).
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    if (urlLang && (urlLang === "en" || urlLang === "fr") && urlLang !== lang) {
      setLang(urlLang);
    }
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveLang: Lang = (urlLang === "en" || urlLang === "fr") ? urlLang : lang;

  const { data: post } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => (await supabase.from("blog_posts").select("*").or(`slug.eq.${slug},slug_fr.eq.${slug}`).eq("published", true).maybeSingle()).data,
    enabled: !!slug,
  });
  const { data: settings } = useQuery({
    queryKey: ["site_settings_seo"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });

  // When the user toggles the language after landing, redirect to the matching language URL/slug.
  useEffect(() => {
    if (!post || !urlLang) return;
    if (lang === urlLang) return;
    const targetSlug = lang === "fr" ? ((post as any).slug_fr || post.slug) : post.slug;
    navigate(`/blog/${lang}/${targetSlug}`, { replace: true });
  }, [lang, urlLang, post, navigate]);

  // Legacy /blog/:slug URL — redirect to language-specific URL for clean sharing.
  if (!urlLang && slug) {
    return <Navigate to={`/blog/${lang}/${slug}`} replace />;
  }

  if (!post) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;


  const stripHtml = (s?: string | null) => (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const titlePlain = stripHtml(pick(post, "title"));
  const seoTitle = stripHtml(pick(post, "seo_title")) || `${titlePlain} — Smartway`;
  const seoDescription = stripHtml(pick(post, "seo_description")) || stripHtml(pick(post, "excerpt"));
  const ogTitle = stripHtml(pick(post, "og_title")) || titlePlain;
  const ogDescription = stripHtml(pick(post, "og_description")) || seoDescription;
  const h1Html = pick(post, "h1") || pick(post, "title");
  const h2Html = pick(post, "h2");
  const cover = (lang === "fr" ? (post as any).cover_image_fr : post.cover_image) || post.cover_image;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": post.structured_data_type || "Article",
    headline: titlePlain,
    description: seoDescription,
    image: post.og_image || cover || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author || settings?.organization_name || "Smartway" },
    publisher: {
      "@type": "Organization",
      name: settings?.organization_name || "Smartway",
      logo: settings?.organization_logo ? { "@type": "ImageObject", url: settings.organization_logo } : undefined,
    },
    keywords: post.tags?.join(", ") || post.seo_keywords || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": post.canonical_url || (typeof window !== "undefined" ? window.location.href : "") },
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://smartways.ma";
  const enSlug = post.slug;
  const frSlug = (post as any).slug_fr || post.slug;
  const canonicalHref = post.canonical_url || `${origin}/blog/${effectiveLang}/${effectiveLang === "fr" ? frSlug : enSlug}`;
  const alternates = [
    { hreflang: "en", href: `${origin}/blog/en/${enSlug}` },
    { hreflang: "fr", href: `${origin}/blog/fr/${frSlug}` },
    { hreflang: "x-default", href: `${origin}/blog/en/${enSlug}` },
  ];

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={post.seo_keywords || post.tags?.join(", ")}
        canonical={canonicalHref}
        ogImage={post.og_image || cover}
        ogTitle={ogTitle}
        ogDescription={ogDescription}
        ogType="article"
        twitterCard={post.twitter_card || "summary_large_image"}
        twitterHandle={settings?.twitter_handle}
        robots={post.meta_robots || "index,follow"}
        structuredData={structuredData}
        siteName={settings?.site_name || "Smartway"}
        alternates={alternates}
      />
      <article className="container-editorial py-20 max-w-3xl">
        <Link to="/blog" className="link-underline text-sm mb-8 inline-flex"><ArrowLeft className="h-4 w-4 mr-2" /> {t("nav.blog")}</Link>
        {cover && (
          <img
            src={cover}
            alt={titlePlain}
            className="aspect-[1200/630] w-full object-cover rounded-xl border border-border my-8"
          />
        )}
        {post.category && <p className="eyebrow mt-6 mb-3">{post.category}</p>}
        <h1 className="display-serif text-4xl md:text-6xl text-balance [&_*]:inline" dangerouslySetInnerHTML={{ __html: h1Html || "" }} />
        {h2Html && <h2 className="display-serif text-2xl md:text-3xl text-muted-foreground mt-4 [&_*]:inline" dangerouslySetInnerHTML={{ __html: h2Html }} />}
        <p className="mt-6 text-sm text-muted-foreground">
          {post.author} · {post.published_at && new Date(post.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
          {post.reading_time_minutes ? ` · ${post.reading_time_minutes} min read` : ""}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-paper-soft border border-border text-muted-foreground">#{tag}</span>
            ))}
          </div>
        )}
        <p className="mt-10 text-xl text-muted-foreground italic">{pick(post, "excerpt")}</p>
        <div
          className="mt-10 prose prose-lg max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: pick(post, "content") || "" }}
        />
      </article>
    </>
  );
}
