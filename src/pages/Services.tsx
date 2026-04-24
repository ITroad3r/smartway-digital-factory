import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import DynamicIcon from "@/components/site/DynamicIcon";
import Seo from "@/components/site/Seo";

export default function Services() {
  const { t, pick } = useI18n();
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });

  return (
    <>
      <Seo title="Services — Smartway" description={t("services.hero.sub")} />
      <section className="container-editorial py-20 lg:py-28">
        <p className="eyebrow mb-6">{t("nav.services")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("services.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("services.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24">
        <div className="divide-y divide-border border-y border-border">
          {services.map((s: any) => (
            <Link key={s.id} to={`/services/${s.slug}`} className="group grid lg:grid-cols-12 gap-6 py-10 items-start hover:bg-paper-soft transition-colors px-2 -mx-2 rounded-lg">
              <div className="lg:col-span-1">
                <span className="font-display text-3xl text-muted-foreground">{s.number}</span>
              </div>
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-2">
                  <DynamicIcon name={s.icon} className="h-5 w-5 text-accent" />
                  <h2 className="display-serif text-2xl md:text-4xl">{pick(s, "title")}</h2>
                </div>
                <p className="text-muted-foreground italic mt-2">{pick(s, "tagline")}</p>
              </div>
              <div className="lg:col-span-3 text-muted-foreground text-sm">{pick(s, "description")}</div>
              <div className="lg:col-span-1 flex justify-end">
                <ArrowRight className="h-5 w-5 text-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-editorial pb-24">
        <div className="rounded-3xl bg-gradient-hero text-white p-12 md:p-16 text-center">
          <h3 className="display-serif text-3xl md:text-4xl mb-4 text-balance">{t("services.notsure")}</h3>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">{t("services.notsure.sub")}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground hover:shadow-glow transition-shadow">
            {t("cta.discovery")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
