import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Cloud, BrainCircuit, Database, Zap, Shield, Award, CheckCircle2, Users, Globe, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import NewsletterForm from "@/components/site/NewsletterForm";
import DynamicIcon from "@/components/site/DynamicIcon";
import FaqAccordion from "@/components/site/FaqAccordion";
import Seo from "@/components/site/Seo";
import hero from "@/assets/hero-collaboration.jpg";
import cta from "@/assets/cta-design.jpg";
import { organizationJsonLd, websiteJsonLd, faqJsonLd } from "@/lib/seo";

const METHOD = [
  { icon: Sparkles, key: "discover", en: { t: "Discover", d: "Business context, value chain, maturity assessment." }, fr: { t: "Discover", d: "Contexte, chaîne de valeur et maturité." } },
  { icon: BrainCircuit, key: "design", en: { t: "Design", d: "Target architecture, roadmap and business case." }, fr: { t: "Design", d: "Architecture cible, roadmap et business case." } },
  { icon: Zap, key: "build", en: { t: "Build", d: "Agile delivery with cross-functional squads." }, fr: { t: "Build", d: "Delivery agile en squads pluridisciplinaires." } },
  { icon: Cloud, key: "scale", en: { t: "Scale", d: "Industrialize on cloud with MLOps & DevOps." }, fr: { t: "Scale", d: "Industrialisation cloud avec MLOps et DevOps." } },
  { icon: CheckCircle2, key: "measure", en: { t: "Measure", d: "Track business KPIs and iterate continuously." }, fr: { t: "Measure", d: "Suivi des KPIs et amélioration continue." } },
];

const TECH = [
  "Microsoft Azure", "AWS", "Google Cloud", "Databricks", "Snowflake", "Power BI",
  "Microsoft 365 Copilot", "OpenAI", "Kubernetes", "Terraform", "Salesforce", "SAP",
];

const SERVICE_MAP = [
  { slug: "digital-transformation", icon: Sparkles, en: "Digital Transformation", fr: "Transformation Digitale", en_d: "End-to-end digital strategy, target operating model and delivery.", fr_d: "Stratégie digitale, operating model et delivery de bout en bout." },
  { slug: "artificial-intelligence", icon: BrainCircuit, en: "Artificial Intelligence", fr: "Intelligence Artificielle", en_d: "Predictive AI, generative AI, LLM copilots and MLOps at scale.", fr_d: "IA prédictive, générative, copilots LLM et MLOps à l'échelle." },
  { slug: "cloud-consulting", icon: Cloud, en: "Cloud Consulting", fr: "Cloud Consulting", en_d: "Azure & AWS migration, landing zones, FinOps and modernization.", fr_d: "Migration Azure & AWS, landing zones, FinOps et modernisation." },
  { slug: "data-analytics", icon: Database, en: "Data & Analytics", fr: "Data & Analytics", en_d: "Modern lakehouse, real-time data, Power BI and data governance.", fr_d: "Lakehouse moderne, temps réel, Power BI et gouvernance data." },
  { slug: "business-process-automation", icon: Zap, en: "Business Process Automation", fr: "Automatisation des processus", en_d: "RPA, workflow, AI agents and intelligent document processing.", fr_d: "RPA, workflow, agents IA et traitement documentaire intelligent." },
  { slug: "cybersecurity", icon: Shield, en: "Cybersecurity", fr: "Cybersécurité", en_d: "Zero-trust security, SOC, IAM and CNDP/DGSSI compliance.", fr_d: "Zero-trust, SOC, IAM et conformité CNDP/DGSSI." },
];

export default function Home() {
  const { t, pick, lang } = useI18n();
  const { settings } = useSiteSettings();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });
  const { data: pillars = [] } = useQuery({
    queryKey: ["pillars"],
    queryFn: async () => (await supabase.from("home_pillars").select("*").order("sort_order")).data ?? [],
  });
  const { data: stats = [] } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await supabase.from("home_stats").select("*").order("sort_order")).data ?? [],
  });
  const { data: industries = [] } = useQuery({
    queryKey: ["industries"],
    queryFn: async () => (await supabase.from("industries").select("*").eq("published", true).order("sort_order")).data ?? [],
  });
  const { data: cases = [] } = useQuery({
    queryKey: ["case_studies_home"],
    queryFn: async () => (await supabase.from("case_studies").select("*").eq("published", true).order("sort_order").limit(3)).data ?? [],
  });
  const { data: faqs = [] } = useQuery({
    queryKey: ["faqs_home"],
    queryFn: async () => (await supabase.from("faqs").select("*").eq("published", true).order("sort_order").limit(6)).data ?? [],
  });

  const faqItems = faqs.map((f: any) => ({ q: pick(f, "question"), a: pick(f, "answer") }));

  return (
    <>
      <Seo
        title="Smartway — Digital Transformation, AI & Cloud Consulting in Morocco"
        description="Smartway is a Moroccan digital factory delivering digital transformation, AI, cloud, data, automation and cybersecurity consulting across Morocco, Africa and Europe. A subsidiary of ITRoad Group in Agadir."
        keywords="digital transformation morocco, ai consulting morocco, cloud consulting morocco, microsoft azure consulting, aws consulting morocco, data analytics, business automation, cybersecurity morocco, it consulting morocco, power bi consulting"
        ogImage={hero}
        structuredData={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(faqItems)]}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-editorial pt-12 lg:pt-20 pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="eyebrow mb-6 flex items-center"><span className="accent-rule" />{t("tag.tagline")}</p>
            <h1 className="display-serif text-5xl md:text-6xl lg:text-7xl text-balance">
              {pick(settings, "hero_headline") || "Digital transformation, AI & cloud — engineered in Morocco."}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
              {pick(settings, "hero_sub") || "Smartway is a Moroccan digital factory helping enterprises modernize with AI, cloud, data and automation — from strategy to industrialization."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-card transition-all hover:bg-accent hover:shadow-glow">
                {t("cta.discovery")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground">
                {t("cta.explore")}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-elev">
              <img src={hero} alt="Smartway digital transformation team collaborating in Agadir, Morocco" className="h-full w-full object-cover" width={1600} height={1200} />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-card p-5 hidden md:block">
              <p className="font-display text-3xl">150+</p>
              <p className="text-xs text-muted-foreground mt-1">Projects · Morocco & beyond</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SMARTWAY / PILLARS */}
      <section className="container-editorial py-24">
        <p className="eyebrow mb-3">{t("home.pillars.title")}</p>
        <h2 className="display-serif text-3xl md:text-5xl max-w-3xl mb-6 text-balance">{t("home.pillars.sub")}</h2>
        <p className="text-muted-foreground max-w-2xl mb-14">
          {lang === "fr"
            ? "Nous combinons stratégie, ingénierie et data science pour livrer des résultats mesurables — pas seulement des livrables."
            : "We combine strategy, engineering and data science to deliver measurable business outcomes — not just deliverables."}
        </p>
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

      {/* SERVICES OVERVIEW */}
      <section className="border-y border-border bg-paper-soft">
        <div className="container-editorial py-24">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="eyebrow mb-3">{t("home.services.title")}</p>
              <h2 className="display-serif text-3xl md:text-5xl max-w-3xl">{t("home.services.sub")}</h2>
            </div>
            <Link to="/services" className="link-underline text-sm">{t("cta.viewall")} →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(services.length > 0 ? services.map((s: any) => ({
              slug: s.slug, icon: null, title: pick(s, "title"), desc: pick(s, "tagline"), sIcon: s.icon
            })) : SERVICE_MAP.map((s) => ({
              slug: s.slug, icon: s.icon, title: lang === "fr" ? s.fr : s.en, desc: lang === "fr" ? s.fr_d : s.en_d, sIcon: null
            }))).map((s: any) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="group p-6 rounded-2xl bg-card border border-border hover:border-accent transition-all hover:shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  {s.sIcon ? <DynamicIcon name={s.sIcon} className="h-5 w-5 text-accent" /> : s.icon && <s.icon className="h-5 w-5 text-accent" />}
                </div>
                <h3 className="font-display text-lg leading-snug mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                <p className="mt-4 text-xs font-medium text-accent group-hover:underline">{t("cta.learn")} →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="container-editorial py-24">
        <p className="eyebrow mb-3">{t("home.method.title")}</p>
        <h2 className="display-serif text-3xl md:text-5xl mb-4 max-w-3xl text-balance">{t("home.method.sub")}</h2>
        <div className="mt-12 grid md:grid-cols-5 gap-6">
          {METHOD.map((m, i) => {
            const txt = lang === "fr" ? m.fr : m.en;
            return (
              <div key={m.key} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="display-serif text-accent text-2xl">0{i + 1}</span>
                  <m.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg mb-2">{txt.t}</h3>
                <p className="text-sm text-muted-foreground">{txt.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INDUSTRIES */}
      {industries.length > 0 && (
        <section className="border-y border-border bg-paper-soft">
          <div className="container-editorial py-24">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="eyebrow mb-3">{t("home.industries.title")}</p>
                <h2 className="display-serif text-3xl md:text-5xl max-w-3xl">{t("home.industries.sub")}</h2>
              </div>
              <Link to="/industries" className="link-underline text-sm">{t("cta.viewall")} →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((ind: any) => (
                <Link key={ind.id} to={`/industries/${ind.slug}`} className="group p-6 rounded-2xl bg-card border border-border hover:border-accent transition-all">
                  <DynamicIcon name={ind.icon} className="h-6 w-6 text-accent mb-4" />
                  <h3 className="font-display text-lg mb-1">{pick(ind, "title")}</h3>
                  <p className="text-sm text-muted-foreground">{pick(ind, "tagline")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TECHNOLOGIES */}
      <section className="container-editorial py-24">
        <p className="eyebrow mb-3">{t("home.tech.title")}</p>
        <h2 className="display-serif text-3xl md:text-5xl mb-10 max-w-3xl text-balance">{t("home.tech.sub")}</h2>
        <div className="flex flex-wrap gap-3">
          {TECH.map((tech) => (
            <span key={tech} className="text-sm px-4 py-2 rounded-full border border-border bg-card hover:border-accent hover:text-accent transition-colors">
              {tech}
            </span>
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

      {/* CASE STUDIES */}
      {cases.length > 0 && (
        <section className="container-editorial py-24">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="eyebrow mb-3">{t("home.cases.title")}</p>
              <h2 className="display-serif text-3xl md:text-5xl max-w-3xl">{t("home.cases.sub")}</h2>
            </div>
            <Link to="/case-studies" className="link-underline text-sm">{t("cta.viewall")} →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {cases.map((c: any) => (
              <Link key={c.id} to={`/case-studies/${c.slug}`} className="group p-6 rounded-2xl bg-card border border-border hover:border-accent transition-all">
                {c.industry && <p className="eyebrow mb-3">{c.industry}</p>}
                <h3 className="font-display text-xl mb-3 group-hover:text-accent transition-colors">{pick(c, "title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{pick(c, "summary")}</p>
                {Array.isArray(c.metrics) && c.metrics[0] && (
                  <div className="pt-4 border-t border-border">
                    <p className="display-serif text-3xl text-accent">{c.metrics[0].value}</p>
                    <p className="text-xs text-muted-foreground">{c.metrics[0].label}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS / PARTNERS */}
      <section className="border-y border-border bg-paper-soft">
        <div className="container-editorial py-16">
          <p className="eyebrow mb-6 text-center">Certifications & Partnerships</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {[
              { label: "Microsoft Azure Certified", Icon: Award },
              { label: "AWS Certified", Icon: Award },
              { label: "ITRoad Group", Icon: Building2 },
              { label: "ISO 27001 Aligned", Icon: Shield },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
                <p.Icon className="h-5 w-5 text-accent" />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section className="container-editorial py-24 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-3">{t("home.faq.title")}</p>
            <h2 className="display-serif text-3xl md:text-5xl mb-4 text-balance">{t("home.faq.sub")}</h2>
            <Link to="/faq" className="link-underline text-sm">{t("cta.viewall")} →</Link>
          </div>
          <div className="lg:col-span-8">
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-editorial py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="aspect-[5/4] overflow-hidden rounded-2xl shadow-elev order-2 lg:order-1">
          <img src={cta} alt="Smartway consultant designing digital solutions" className="h-full w-full object-cover" loading="lazy" width={1600} height={1000} />
        </div>
        <div className="order-1 lg:order-2">
          <p className="eyebrow mb-3">{t("cta.start")}</p>
          <h2 className="display-serif text-3xl md:text-5xl mb-6 text-balance">{t("home.cta.title")}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl">{t("home.cta.sub")}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background hover:bg-accent transition-colors">
              {t("cta.consult")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/resources" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground hover:border-foreground transition-colors">
              {t("cta.download")}
            </Link>
          </div>
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
