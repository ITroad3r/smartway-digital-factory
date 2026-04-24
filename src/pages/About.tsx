import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import DynamicIcon from "@/components/site/DynamicIcon";
import Seo from "@/components/site/Seo";
import office from "@/assets/about-office.jpg";

export default function About() {
  const { t, pick } = useI18n();
  const { settings } = useSiteSettings();
  const { data: values = [] } = useQuery({
    queryKey: ["values"],
    queryFn: async () => (await supabase.from("about_values").select("*").order("sort_order")).data ?? [],
  });

  return (
    <>
      <Seo title="About — Smartway" description={t("about.hero.sub")} />
      <section className="container-editorial py-20 lg:py-28">
        <p className="eyebrow mb-6">{t("nav.about")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("about.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("about.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-elev sticky top-28">
            <img src={office} alt="Smartway office" className="h-full w-full object-cover" loading="lazy" width={1600} height={1100} />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-16">
          <div>
            <p className="eyebrow mb-3">{t("about.story")}</p>
            <p className="text-lg leading-relaxed">{pick(settings, "about_story")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p className="eyebrow mb-3">{t("about.mission")}</p>
              <p className="leading-relaxed text-muted-foreground">{pick(settings, "mission")}</p>
            </div>
            <div>
              <p className="eyebrow mb-3">{t("about.vision")}</p>
              <p className="leading-relaxed text-muted-foreground">{pick(settings, "vision")}</p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">{t("about.different")}</p>
            <p className="leading-relaxed text-muted-foreground">{pick(settings, "differentiator")}</p>
          </div>
          <div>
            <p className="eyebrow mb-3">{t("about.team")}</p>
            <p className="leading-relaxed text-muted-foreground">{pick(settings, "team_culture")}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-paper-soft">
        <div className="container-editorial py-24">
          <p className="eyebrow mb-3">{t("about.values")}</p>
          <h2 className="display-serif text-3xl md:text-5xl mb-14 max-w-3xl">{t("about.values")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {values.map((v: any) => (
              <div key={v.id} className="bg-paper p-8">
                <DynamicIcon name={v.icon} className="h-6 w-6 text-accent mb-5" />
                <h3 className="font-display text-xl mb-3">{pick(v, "title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pick(v, "description")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
