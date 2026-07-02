import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqAccordion from "@/components/site/FaqAccordion";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export default function Faq() {
  const { t, pick } = useI18n();
  const [cat, setCat] = useState<string>("all");

  const { data: faqs = [] } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => (await supabase.from("faqs").select("*").eq("published", true).order("sort_order")).data ?? [],
  });

  const categories = useMemo(() => Array.from(new Set(faqs.map((f: any) => f.category).filter(Boolean))), [faqs]);
  const filtered = cat === "all" ? faqs : faqs.filter((f: any) => f.category === cat);

  const jsonld = useMemo(() =>
    faqJsonLd(filtered.map((f: any) => ({ q: pick(f, "question"), a: pick(f, "answer") }))),
    [filtered, pick]);

  return (
    <>
      <Seo
        title="FAQ — Smartway | Digital Transformation, AI & Cloud Consulting"
        description="Answers to common questions about Smartway's digital transformation, AI, cloud, data and cybersecurity services in Morocco."
        structuredData={[
          breadcrumbJsonLd([{ name: t("nav.faq"), url: "/faq" }]),
          jsonld,
        ]}
      />
      <Breadcrumbs items={[{ label: t("nav.faq") }]} />
      <section className="container-editorial py-16 lg:py-24">
        <p className="eyebrow mb-6">{t("nav.faq")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("faq.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("faq.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {["all", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors",
                  cat === c ? "bg-foreground text-background border-foreground" : "border-border hover:border-accent"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <FaqAccordion items={filtered.map((f: any) => ({ q: pick(f, "question"), a: pick(f, "answer") }))} />
      </section>
    </>
  );
}
