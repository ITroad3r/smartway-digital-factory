import { useState } from "react";
import { Mail, Linkedin, MapPin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import Seo from "@/components/site/Seo";

export default function Contact() {
  const { t, pick } = useI18n();
  const { settings } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", company: "", phone: "", service_interest: "", message: "" });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("id, slug, title_en, title_fr").order("sort_order")).data ?? [],
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert(form);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }
    toast.success(t("contact.form.success"));
    setForm({ full_name: "", email: "", company: "", phone: "", service_interest: "", message: "" });
  };

  const inputCls = "w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors";

  return (
    <>
      <Seo title="Contact — Smartway" description={t("contact.hero.sub")} />
      <section className="container-editorial py-20 lg:py-28">
        <p className="eyebrow mb-6">{t("nav.contact")}</p>
        <h1 className="display-serif text-4xl md:text-6xl max-w-4xl text-balance">{t("contact.hero.title")}</h1>
        <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl">{t("contact.hero.sub")}</p>
      </section>

      <section className="container-editorial pb-24 grid lg:grid-cols-12 gap-12">
        <form onSubmit={onSubmit} className="lg:col-span-7 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="eyebrow block mb-2">{t("contact.form.name")} *</label>
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="eyebrow block mb-2">{t("contact.form.company")}</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="eyebrow block mb-2">{t("contact.form.email")} *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="eyebrow block mb-2">{t("contact.form.phone")}</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">{t("contact.form.service")}</label>
            <select value={form.service_interest} onChange={(e) => setForm({ ...form, service_interest: e.target.value })} className={inputCls}>
              <option value="">—</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.slug}>{pick(s, "title")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow block mb-2">{t("contact.form.message")} *</label>
            <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
          </div>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background hover:bg-accent transition-colors disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("cta.send")}
          </button>
          <p className="text-xs text-muted-foreground">{t("contact.form.privacy")}</p>
        </form>

        <aside className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-paper-soft border border-border p-8 space-y-5">
            {settings?.contact_email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="eyebrow mb-1">{t("contact.alt.email")}</p>
                  <a href={`mailto:${settings.contact_email}`} className="link-underline text-sm">{settings.contact_email}</a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="eyebrow mb-1">{t("footer.location")}</p>
                <p className="text-sm">{pick(settings, "address")}</p>
              </div>
            </div>
            {settings?.linkedin_url && (
              <div className="flex items-start gap-3">
                <Linkedin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="eyebrow mb-1">{t("contact.alt.linkedin")}</p>
                  <a href={settings.linkedin_url} target="_blank" rel="noopener" className="link-underline text-sm">LinkedIn</a>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
