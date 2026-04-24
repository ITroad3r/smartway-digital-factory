import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import DynamicIcon from "@/components/site/DynamicIcon";
import Seo from "@/components/site/Seo";

export default function ServiceDetail() {
  const { slug } = useParams();
  const { t, pick, lang } = useI18n();

  const { data: service } = useQuery({
    queryKey: ["service", slug],
    queryFn: async () => (await supabase.from("services").select("*").eq("slug", slug!).maybeSingle()).data,
    enabled: !!slug,
  });

  const { data: subs = [] } = useQuery({
    queryKey: ["sub_services", service?.id],
    queryFn: async () => (await supabase.from("sub_services").select("*").eq("service_id", service!.id).order("sort_order")).data ?? [],
    enabled: !!service?.id,
  });

  if (!service) return <div className="container-editorial py-32 text-center text-muted-foreground">Loading…</div>;

  return (
    <>
      <Seo title={`${pick(service, "title")} — Smartway`} description={pick(service, "tagline")} />
      <section className="container-editorial py-20">
        <Link to="/services" className="link-underline text-sm mb-8 inline-flex"><ArrowLeft className="h-4 w-4 mr-2" /> {t("nav.services")}</Link>
        <div className="flex items-center gap-4 mb-6 mt-4">
          <span className="font-display text-3xl text-muted-foreground">{service.number}</span>
          <DynamicIcon name={service.icon} className="h-7 w-7 text-accent" />
        </div>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{pick(service, "title")}</h1>
        <p className="mt-6 text-xl md:text-2xl italic text-muted-foreground max-w-3xl">{pick(service, "tagline")}</p>
        <p className="mt-8 text-lg max-w-3xl">{pick(service, "description")}</p>
      </section>

      <section className="border-t border-border bg-paper-soft">
        <div className="container-editorial py-20">
          <p className="eyebrow mb-3">{t("services.detail.subservices")}</p>
          <div className="mt-10 grid gap-px bg-border rounded-2xl overflow-hidden">
            {subs.map((sub: any) => (
              <div key={sub.id} className="bg-paper p-8 lg:p-10 grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <p className="eyebrow mb-2">{sub.number}</p>
                  <h3 className="display-serif text-2xl md:text-3xl">{pick(sub, "title")}</h3>
                  <p className="mt-3 text-muted-foreground italic">{pick(sub, "what_it_is")}</p>
                </div>
                <div className="lg:col-span-5">
                  <p className="eyebrow mb-3">{t("services.detail.included")}</p>
                  <ul className="space-y-2">
                    {((lang === "fr" ? sub.whats_included_fr : sub.whats_included_en) ?? []).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" /> <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:col-span-3 space-y-4">
                  {pick(sub, "best_for") && (
                    <div>
                      <p className="eyebrow mb-1">{t("services.detail.bestfor")}</p>
                      <p className="text-sm text-muted-foreground">{pick(sub, "best_for")}</p>
                    </div>
                  )}
                  {pick(sub, "why_it_matters") && (
                    <div>
                      <p className="eyebrow mb-1">{t("services.detail.matters")}</p>
                      <p className="text-sm text-muted-foreground">{pick(sub, "why_it_matters")}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background hover:bg-accent transition-colors">
              {t("cta.contact")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
