import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import NewsletterForm from "@/components/site/NewsletterForm";
import DynamicIcon from "@/components/site/DynamicIcon";
import Seo from "@/components/site/Seo";
import hero from "@/assets/hero-collaboration.jpg";
import cta from "@/assets/cta-design.jpg";

export default function Home() {
  const { t, pick } = useI18n();
  const { settings } = useSiteSettings();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: pillars = [] } = useQuery({
    queryKey: ["pillars"],
    queryFn: async () => {
      const { data } = await supabase.from("home_pillars").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: stats = [] } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await supabase.from("home_stats").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <>
      <Seo title="Smartway — Shaping the Future of Digital Business" description={pick(settings, "hero_sub")} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-editorial pt-12 lg:pt-20 pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="eyebrow mb-6 flex items-center"><span className="accent-rule" />{t("tag.tagline")}</p>
            <h1 className="display-serif text-5xl md:text-6xl lg:text-7xl text-balance">
              {pick(settings, "hero_headline") || "Your Partner for Digital Transformation"}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
              {pick(settings, "hero_sub")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/services" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-card transition-all hover:bg-accent hover:shadow-glow">
                {t("cta.explore")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground">
                {t("cta.contact")}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-elev">
              <img src={hero} alt="Smartway team collaborating" className="h-full w-full object-cover" width={1600} height={1200} />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-card p-5 hidden md:block">
              <p className="font-display text-3xl">150+</p>
              <p className="text-xs text-muted-foreground mt-1">Projects · Morocco & beyond</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES STRIP */}
      <section className="border-y border-border bg-paper-soft">
        <div className="container-editorial py-20">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="eyebrow mb-3">{t("home.services.title")}</p>
              <h2 className="display-serif text-3xl md:text-4xl max-w-2xl">{t("home.services.sub")}</h2>
            </div>
            <Link to="/services" className="link-underline text-sm">{t("cta.learn")} →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s: any) => (
              <Link key={s.id} to={`/services/${s.slug}`} className="group p-6 rounded-2xl bg-card border border-border hover:border-foreground transition-all hover:shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="eyebrow text-foreground">{s.number}</span>
                  <DynamicIcon name={s.icon} className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-medium text-lg leading-snug">{pick(s, "title")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pick(s, "tagline")}</p>
                <p className="mt-4 text-xs font-medium text-accent group-hover:underline">{t("cta.learn")} →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="container-editorial py-24">
        <p className="eyebrow mb-3">{t("home.pillars.title")}</p>
        <h2 className="display-serif text-3xl md:text-5xl max-w-3xl mb-14 text-balance">{t("home.pillars.sub")}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          {pillars.map((p: any) => (
            <div key={p.id} className="bg-paper p-8">
              <DynamicIcon name={p.icon} className="h-7 w-7 text-accent mb-6" />
              <h3 className="font-display text-xl mb-3">{pick(p, "title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pick(p, "description")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-foreground text-background">
        <div className="container-editorial py-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s: any) => (
            <div key={s.id}>
              <p className="display-serif text-5xl md:text-6xl text-accent">{s.value}</p>
              <p className="mt-3 text-sm opacity-80">{pick(s, "label")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="aspect-[5/4] overflow-hidden rounded-2xl shadow-elev order-2 lg:order-1">
          <img src={cta} alt="Designer working" className="h-full w-full object-cover" loading="lazy" width={1600} height={1000} />
        </div>
        <div className="order-1 lg:order-2">
          <p className="eyebrow mb-3">{t("cta.start")}</p>
          <h2 className="display-serif text-3xl md:text-5xl mb-6 text-balance">{t("home.cta.title")}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl">{t("home.cta.sub")}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background hover:bg-accent transition-colors">
            {t("cta.start")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-gradient-hero text-white">
        <div className="container-editorial py-24 text-center">
          <p className="eyebrow text-white/70 mb-3">{t("newsletter.title")}</p>
          <h2 className="display-serif text-3xl md:text-5xl mb-6 text-balance">{t("newsletter.title")}</h2>
          <p className="max-w-2xl mx-auto text-white/80 mb-10">{t("newsletter.sub")}</p>
          <div className="flex justify-center"><NewsletterForm variant="dark" /></div>
        </div>
      </section>
    </>
  );
}
