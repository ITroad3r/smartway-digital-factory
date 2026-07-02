import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function LegalPage() {
  const { slug } = useParams();
  const { pick } = useI18n();

  const { data: page } = useQuery({
    queryKey: ["legal", slug],
    queryFn: async () => (await supabase.from("legal_pages").select("*").eq("slug", slug!).maybeSingle()).data,
    enabled: !!slug,
  });

  if (!page) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;
  const title = pick(page, "title");

  return (
    <>
      <Seo
        title={pick(page, "seo_title") || `${title} — Smartway`}
        description={pick(page, "seo_description") || ""}
        structuredData={breadcrumbJsonLd([{ name: title, url: `/legal/${page.slug}` }])}
      />
      <Breadcrumbs items={[{ label: title }]} />
      <article className="container-editorial py-12 lg:py-20 max-w-3xl">
        <h1 className="display-serif text-4xl md:text-5xl mb-4">{title}</h1>
        {page.effective_date && (
          <p className="text-xs text-muted-foreground mb-10">
            Effective date: {new Date(page.effective_date).toLocaleDateString()}
          </p>
        )}
        <div
          className="prose prose-neutral max-w-none prose-headings:font-display prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-muted-foreground prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: pick(page, "content") }}
        />
      </article>
    </>
  );
}
