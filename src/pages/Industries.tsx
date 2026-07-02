import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import DynamicIcon from "@/components/site/DynamicIcon";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";

export default function Industries() {
  const { t, pick } = useI18n();
  const { data: industries = [] } = useQuery({
    queryKey: ["industries"],
    queryFn: async () => (await supabase.from("industries").select("*").eq("published", true).order("sort_order")).data ?? [],
  });

  return (
    <>
      <Seo
        title="Industries We Serve — Smartway | Digital Transformation Morocco"
        description="Deep vertical expertise in banking, retail, manufacturing, healthcare, public sector and telecom. Smartway delivers digital transformation across industries."
        keywords="industries morocco, banking digital transformation, retail consulting, manufacturing industry 4.0, healthcare digital, public sector morocco, telecom consulting"
        structuredData={breadcrumbJsonLd([
          { name: t("nav.industries"), url: "/industries" },
        ])}
      />
      <Breadcrumbs items={[{ label: t("nav.industries") }]} />
      <section className="container-editorial py-16 lg:py-24">
        <p className="eyebrow mb-6">{t("nav.industries")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("industries.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("industries.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind: any) => (
            <Link
              key={ind.id}
              to={`/industries/${ind.slug}`}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-accent hover:shadow-card transition-all"
            >
              <DynamicIcon name={ind.icon} className="h-7 w-7 text-accent mb-5" />
              <h2 className="display-serif text-2xl mb-2">{pick(ind, "title")}</h2>
              <p className="text-sm text-muted-foreground mb-4">{pick(ind, "tagline")}</p>
              <span className="text-xs font-medium text-accent inline-flex items-center gap-1">
                {t("cta.learn")} <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
