import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const { t, pick, lang } = useI18n();

  const { data: cs } = useQuery({
    queryKey: ["case_study", slug],
    queryFn: async () => (await supabase.from("case_studies").select("*").eq("slug", slug!).maybeSingle()).data,
    enabled: !!slug,
  });

  if (!cs) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;

  const title = pick(cs, "title");
  const results = (lang === "fr" ? cs.results_fr : cs.results_en) as string[] ?? [];

  return (
    <>
      <Seo
        title={pick(cs, "seo_title") || `${title} — Smartway`}
        description={pick(cs, "seo_description") || pick(cs, "summary")}
        ogImage={cs.cover_image}
        ogType="article"
        structuredData={breadcrumbJsonLd([
          { name: t("nav.cases"), url: "/case-studies" },
          { name: title, url: `/case-studies/${cs.slug}` },
        ])}
      />
      <Breadcrumbs items={[{ label: t("nav.cases"), href: "/case-studies" }, { label: title }]} />

      <section className="container-editorial py-12">
        <Link to="/case-studies" className="link-underline text-sm mb-6 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("nav.cases")}
        </Link>
        <div className="flex flex-wrap gap-2 mb-4">
          {cs.industry && <span className="text-xs uppercase tracking-widest border border-border px-2 py-1 rounded-full">{cs.industry}</span>}
          {(cs.services ?? []).map((s: string) => (
            <span key={s} className="text-xs uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 rounded-full">{s}</span>
          ))}
        </div>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{title}</h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-3xl">{pick(cs, "summary")}</p>
      </section>

      {cs.cover_image && (
        <section className="container-editorial pb-12">
          <img src={cs.cover_image} alt={title} className="w-full aspect-[16/8] object-cover rounded-2xl" />
        </section>
      )}

      <section className="container-editorial pb-16 grid md:grid-cols-2 gap-12">
        <div>
          <p className="eyebrow mb-3">{t("cases.detail.challenge")}</p>
          <p className="leading-relaxed">{pick(cs, "challenge")}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">{t("cases.detail.solution")}</p>
          <p className="leading-relaxed">{pick(cs, "solution")}</p>
        </div>
      </section>

      {Array.isArray(cs.metrics) && cs.metrics.length > 0 && (
        <section className="bg-foreground text-background">
          <div className="container-editorial py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {cs.metrics.map((m: any, i: number) => (
              <div key={i}>
                <p className="display-serif text-4xl md:text-5xl text-accent">{m.value}</p>
                <p className="mt-2 text-sm opacity-80">{m.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.length > 0 && (
        <section className="container-editorial py-20">
          <p className="eyebrow mb-4">{t("cases.detail.results")}</p>
          <ul className="space-y-3 max-w-2xl">
            {results.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-editorial pb-24 text-center">
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background hover:bg-accent transition-colors">
          {t("cta.consult")} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}
