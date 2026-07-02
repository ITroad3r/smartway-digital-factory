import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function CaseStudies() {
  const { t, pick } = useI18n();
  const { data: cases = [] } = useQuery({
    queryKey: ["case_studies"],
    queryFn: async () => (await supabase.from("case_studies").select("*").eq("published", true).order("sort_order")).data ?? [],
  });

  return (
    <>
      <Seo
        title="Case Studies — Smartway | Real Client Outcomes"
        description="Explore real projects delivered by Smartway across banking, retail, manufacturing and insurance in Morocco and beyond."
        structuredData={breadcrumbJsonLd([{ name: t("nav.cases"), url: "/case-studies" }])}
      />
      <Breadcrumbs items={[{ label: t("nav.cases") }]} />
      <section className="container-editorial py-16 lg:py-24">
        <p className="eyebrow mb-6">{t("nav.cases")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("cases.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("cases.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {cases.map((c: any) => (
            <Link
              key={c.id}
              to={`/case-studies/${c.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-accent hover:shadow-card transition-all"
            >
              {c.cover_image ? (
                <img src={c.cover_image} alt={pick(c, "title")} loading="lazy" className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div className="aspect-[16/9] w-full bg-gradient-hero" />
              )}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.industry && <span className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 rounded-full">{c.industry}</span>}
                  {(c.services ?? []).slice(0, 2).map((s: string) => (
                    <span key={s} className="text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <h2 className="display-serif text-2xl mb-3 group-hover:text-accent transition-colors">{pick(c, "title")}</h2>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{pick(c, "summary")}</p>
                {Array.isArray(c.metrics) && c.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    {c.metrics.slice(0, 2).map((m: any, i: number) => (
                      <div key={i}>
                        <p className="display-serif text-2xl text-accent">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <span className="mt-6 text-xs font-medium text-accent inline-flex items-center gap-1">
                  {t("cta.read")} <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
