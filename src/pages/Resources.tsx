import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Seo from "@/components/site/Seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/seo";
import { ArrowRight, FileText, BookOpen, ClipboardCheck, Video } from "lucide-react";

const iconFor = (t?: string) => {
  switch (t) {
    case "whitepaper": return BookOpen;
    case "checklist": return ClipboardCheck;
    case "video": return Video;
    default: return FileText;
  }
};

export default function Resources() {
  const { t, pick } = useI18n();
  const { data: items = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => (await supabase.from("resources").select("*").eq("published", true).order("sort_order")).data ?? [],
  });

  return (
    <>
      <Seo
        title="Resources — Smartway | Guides, Whitepapers & Tools"
        description="Practical guides, whitepapers and tools on digital transformation, AI, cloud, data and cybersecurity by Smartway."
        structuredData={breadcrumbJsonLd([{ name: t("nav.resources"), url: "/resources" }])}
      />
      <Breadcrumbs items={[{ label: t("nav.resources") }]} />
      <section className="container-editorial py-16 lg:py-24">
        <p className="eyebrow mb-6">{t("nav.resources")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("resources.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("resources.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((r: any) => {
            const Icon = iconFor(r.resource_type);
            const href = r.download_url || r.external_url || "/contact";
            const external = !!(r.download_url || r.external_url);
            return (
              <a
                key={r.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-accent transition-all flex flex-col"
              >
                <Icon className="h-6 w-6 text-accent mb-5" />
                {r.category && <p className="eyebrow mb-2">{r.category}</p>}
                <h2 className="display-serif text-xl mb-3">{pick(r, "title")}</h2>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{pick(r, "description")}</p>
                <span className="text-xs font-medium text-accent inline-flex items-center gap-1">
                  {pick(r, "cta_label") || t("cta.download")} <ArrowRight className="h-3 w-3" />
                </span>
              </a>
            );
          })}
          {items.length === 0 && (
            <p className="text-muted-foreground col-span-full">No resources yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
