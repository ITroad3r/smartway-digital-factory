import { Link } from "react-router-dom";
import { Linkedin, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const { t, pick } = useI18n();
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-paper-soft overflow-hidden">
      {/* Subtle brand blue accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      <div className="container-editorial py-16 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-md">
          <p className="display-serif text-2xl mb-4">
            Smart<span className="text-accent">way</span>
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">{t("footer.tagline")}</p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">{t("nav.services")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="link-underline">{t("nav.services")}</Link></li>
            <li><Link to="/about" className="link-underline">{t("nav.about")}</Link></li>
            <li><Link to="/blog" className="link-underline">{t("nav.blog")}</Link></li>
            <li><Link to="/contact" className="link-underline">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">{t("nav.contact")}</h4>
          <ul className="space-y-3 text-sm">
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
            {settings?.linkedin_url && (
              <li className="flex items-start gap-2">
                <Linkedin className="h-4 w-4 mt-0.5 text-accent" />
                <a href={settings.linkedin_url} target="_blank" rel="noopener" className="link-underline">LinkedIn</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container-editorial border-t border-border py-6 text-xs text-muted-foreground">
        <p>© {year} Smartway. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
