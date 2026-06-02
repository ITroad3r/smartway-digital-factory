import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";

export default function BlogPost() {
  const { slug } = useParams();
  const { t, pick, lang } = useI18n();
  const { data: post } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => (await supabase.from("blog_posts").select("*").eq("slug", slug!).eq("published", true).maybeSingle()).data,
    enabled: !!slug,
  });
  const { data: settings } = useQuery({
    queryKey: ["site_settings_seo"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });

  if (!post) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;

  const stripHtml = (s?: string | null) => (s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const titlePlain = stripHtml(pick(post, "title"));
  const seoTitle = stripHtml(pick(post, "seo_title")) || `${titlePlain} — Smartway`;
  const seoDescription = stripHtml(pick(post, "seo_description")) || stripHtml(pick(post, "excerpt"));
  const ogTitle = stripHtml(pick(post, "og_title")) || titlePlain;
  const ogDescription = stripHtml(pick(post, "og_description")) || seoDescription;
  const h1Html = pick(post, "h1") || pick(post, "title");
  const h2Html = pick(post, "h2");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": post.structured_data_type || "Article",
    headline: titlePlain,
    description: seoDescription,
    image: post.og_image || post.cover_image || undefined,
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

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        keywords={post.seo_keywords || post.tags?.join(", ")}
        canonical={post.canonical_url}
        ogImage={post.og_image || post.cover_image}
        ogTitle={ogTitle}
        ogDescription={ogDescription}
        ogType="article"
        twitterCard={post.twitter_card || "summary_large_image"}
        twitterHandle={settings?.twitter_handle}
        robots={post.meta_robots || "index,follow"}
        structuredData={structuredData}
        siteName={settings?.site_name || "Smartway"}
      />
      <article className="container-editorial py-20 max-w-3xl">
        <Link to="/blog" className="link-underline text-sm mb-8 inline-flex"><ArrowLeft className="h-4 w-4 mr-2" /> {t("nav.blog")}</Link>
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={pick(post, "title")}
            className="aspect-[1200/630] w-full object-cover rounded-xl border border-border my-8"
          />
        )}
        {post.category && <p className="eyebrow mt-6 mb-3">{post.category}</p>}
        <h1 className="display-serif text-4xl md:text-6xl text-balance">{h1}</h1>
        {h2 && <h2 className="display-serif text-2xl md:text-3xl text-muted-foreground mt-4">{h2}</h2>}
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
