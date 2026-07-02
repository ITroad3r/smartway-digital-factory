import { Link } from "react-router-dom";
import { Linkedin, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Music2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const { t, pick } = useI18n();
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  const services = [
    { to: "/services/digital-transformation", label: "Digital Transformation" },
    { to: "/services/artificial-intelligence", label: "Artificial Intelligence" },
    { to: "/services/cloud-consulting", label: "Cloud Consulting" },
    { to: "/services/data-analytics", label: "Data & Analytics" },
    { to: "/services/business-process-automation", label: "Automation" },
    { to: "/services/cybersecurity", label: "Cybersecurity" },
    { to: "/services/microsoft-solutions", label: "Microsoft" },
    { to: "/services/aws-solutions", label: "AWS" },
  ];

  return (
    <footer className="relative border-t border-border bg-paper-soft overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      <div className="container-editorial py-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="display-serif text-2xl mb-4">
            Smart<span className="text-accent">way</span>
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">{t("footer.tagline")}</p>

          <ul className="mt-6 space-y-3 text-sm">
            {settings?.contact_email && (
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-accent" />
                <a href={`mailto:${settings.contact_email}`} className="link-underline">{settings.contact_email}</a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-accent" />
              <span>{pick(settings, "address") || t("footer.location")}</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="eyebrow mb-4">{t("nav.services")}</h4>
          <ul className="space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.to}><Link to={s.to} className="link-underline">{s.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="eyebrow mb-4">{t("footer.company")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="link-underline">{t("nav.about")}</Link></li>
            <li><Link to="/industries" className="link-underline">{t("nav.industries")}</Link></li>
            <li><Link to="/case-studies" className="link-underline">{t("nav.cases")}</Link></li>
            <li><Link to="/contact" className="link-underline">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="eyebrow mb-4">{t("footer.explore")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/blog" className="link-underline">{t("nav.blog")}</Link></li>
            <li><Link to="/resources" className="link-underline">{t("nav.resources")}</Link></li>
            <li><Link to="/faq" className="link-underline">{t("nav.faq")}</Link></li>
            <li><a href="https://itroadgroup.com" target="_blank" rel="noopener noreferrer" className="link-underline">ITRoad Group</a></li>
          </ul>

          <h4 className="eyebrow mb-3 mt-6">{t("footer.legal")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/legal/privacy" className="link-underline">Privacy Policy</Link></li>
            <li><Link to="/legal/terms" className="link-underline">Terms of Service</Link></li>
            <li><Link to="/legal/cookies" className="link-underline">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      {(settings?.linkedin_url || settings?.facebook_url || settings?.instagram_url || settings?.twitter_url || settings?.tiktok_url || settings?.youtube_url) && (
        <div className="container-editorial pb-8 flex flex-wrap items-center gap-3">
          {[
            { url: settings?.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
            { url: settings?.facebook_url, Icon: Facebook, label: "Facebook" },
            { url: settings?.instagram_url, Icon: Instagram, label: "Instagram" },
            { url: settings?.twitter_url, Icon: Twitter, label: "X" },
            { url: settings?.tiktok_url, Icon: Music2, label: "TikTok" },
            { url: settings?.youtube_url, Icon: Youtube, label: "YouTube" },
          ].filter(s => s.url).map(({ url, Icon, label }) => (
            <a
              key={label}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}

      <div className="container-editorial border-t border-border py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-3">
        <p>© {year} Smartway. {t("footer.rights")}</p>
        <p>Agadir, Morocco · A subsidiary of <a href="https://itroadgroup.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">ITRoad Group</a></p>
      </div>
    </footer>
  );
}
