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

  if (!post) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;

  return (
    <>
      <Seo title={`${pick(post, "title")} — Smartway`} description={pick(post, "excerpt")} />
      <article className="container-editorial py-20 max-w-3xl">
        <Link to="/blog" className="link-underline text-sm mb-8 inline-flex"><ArrowLeft className="h-4 w-4 mr-2" /> {t("nav.blog")}</Link>
        {post.category && <p className="eyebrow mt-6 mb-3">{post.category}</p>}
        <h1 className="display-serif text-4xl md:text-6xl text-balance">{pick(post, "title")}</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          {post.author} · {post.published_at && new Date(post.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <p className="mt-10 text-xl text-muted-foreground italic">{pick(post, "excerpt")}</p>
        <div className="mt-10 prose prose-lg max-w-none text-foreground leading-relaxed whitespace-pre-line">
          {pick(post, "content")}
        </div>
      </article>
    </>
  );
}
