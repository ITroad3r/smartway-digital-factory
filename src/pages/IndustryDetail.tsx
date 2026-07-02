import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import DynamicIcon from "@/components/site/DynamicIcon";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function IndustryDetail() {
  const { slug } = useParams();
  const { t, pick, lang } = useI18n();

  const { data: industry } = useQuery({
    queryKey: ["industry", slug],
    queryFn: async () => (await supabase.from("industries").select("*").eq("slug", slug!).maybeSingle()).data,
    enabled: !!slug,
  });

  if (!industry) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;

  const challenges = (lang === "fr" ? industry.challenges_fr : industry.challenges_en) as string[] ?? [];
  const solutions = (lang === "fr" ? industry.solutions_fr : industry.solutions_en) as string[] ?? [];
  const title = pick(industry, "title");
  const seoTitle = pick(industry, "seo_title") || `${title} — Smartway`;
  const seoDesc = pick(industry, "seo_description") || pick(industry, "tagline");

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDesc}
        keywords={industry.seo_keywords}
        ogImage={industry.cover_image}
        structuredData={breadcrumbJsonLd([
          { name: t("nav.industries"), url: "/industries" },
          { name: title, url: `/industries/${industry.slug}` },
        ])}
      />
      <Breadcrumbs items={[{ label: t("nav.industries"), href: "/industries" }, { label: title }]} />

      <section className="container-editorial py-16">
        <div className="flex items-center gap-3 mb-4">
          <DynamicIcon name={industry.icon} className="h-6 w-6 text-accent" />
          <p className="eyebrow">{t("nav.industries")}</p>
        </div>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{title}</h1>
        <p className="mt-6 text-xl italic text-muted-foreground max-w-3xl">{pick(industry, "tagline")}</p>
        <p className="mt-6 text-lg max-w-3xl">{pick(industry, "description")}</p>
      </section>

      <section className="border-t border-border bg-paper-soft">
        <div className="container-editorial py-20 grid md:grid-cols-2 gap-12">
          <div>
            <p className="eyebrow mb-4">{t("industries.detail.challenges")}</p>
            <ul className="space-y-3">
              {challenges.map((c: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">{t("industries.detail.solutions")}</p>
            <ul className="space-y-3">
              {solutions.map((c: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-editorial py-20 text-center">
        <h2 className="display-serif text-3xl md:text-4xl mb-6 max-w-2xl mx-auto text-balance">
          Ready to accelerate transformation in {title}?
        </h2>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background hover:bg-accent transition-colors">
          {t("cta.discovery")} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}
