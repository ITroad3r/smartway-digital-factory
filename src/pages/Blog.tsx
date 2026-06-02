import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";
import NewsletterForm from "@/components/site/NewsletterForm";

export default function Blog() {
  const { t, pick, lang } = useI18n();
  const { data: posts = [] } = useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").eq("published", true).order("published_at", { ascending: false })).data ?? [],
  });

  return (
    <>
      <Seo title="Blog — Smartway" description={t("blog.hero.sub")} />
      <section className="container-editorial py-20 lg:py-28">
        <p className="eyebrow mb-6">{t("nav.blog")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("blog.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("blog.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24">
        {posts.length === 0 ? (
          <p className="text-muted-foreground py-12">{t("blog.empty")}</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {posts.map((p: any) => {
              const titleHtml = pick(p, "title") || "";
              const titleAlt = titleHtml.replace(/<[^>]*>/g, "").trim();
              return (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group grid lg:grid-cols-12 gap-6 py-10 items-center hover:bg-paper-soft transition-colors px-2 -mx-2 rounded-lg">
                <div className="lg:col-span-3">
                  {p.cover_image ? (
                    <img
                      src={p.cover_image}
                      alt={titleAlt}
                      loading="lazy"
                      className="aspect-[1200/630] w-full object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <div className="aspect-[1200/630] w-full rounded-lg bg-paper-soft border border-border" />
                  )}
                </div>
                <div className="lg:col-span-2 text-xs text-muted-foreground">
                  {p.published_at && new Date(p.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  {p.category && <p className="eyebrow mt-1">{p.category}</p>}
                </div>
                <div className="lg:col-span-4">
                  <h2 className="display-serif text-2xl md:text-3xl group-hover:text-accent transition-colors [&_*]:inline" dangerouslySetInnerHTML={{ __html: titleHtml }} />
                </div>
                <div className="lg:col-span-3 text-sm text-muted-foreground">{pick(p, "excerpt")}</div>
              </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-gradient-hero text-white">
        <div className="container-editorial py-20 text-center">
          <h2 className="display-serif text-3xl md:text-4xl mb-6">{t("newsletter.title")}</h2>
          <div className="flex justify-center"><NewsletterForm variant="dark" /></div>
        </div>
      </section>
    </>
  );
}
