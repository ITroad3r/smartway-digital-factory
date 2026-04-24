import { Link } from "react-router-dom";
import { Linkedin, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logo from "@/assets/logo-smartway.jpeg";

export default function Footer() {
  const { t, pick } = useI18n();
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-paper-soft">
      <div className="container-editorial py-16 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-md">
          <img src={logo} alt="Smartway" className="h-12 w-auto mb-4" width={160} height={48} />
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
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <a href={`mailto:${settings.contact_email}`} className="link-underline">{settings.contact_email}</a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>{pick(settings, "address") || t("footer.location")}</span>
            </li>
            {settings?.linkedin_url && (
              <li className="flex items-start gap-2">
                <Linkedin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <a href={settings.linkedin_url} target="_blank" rel="noopener" className="link-underline">LinkedIn</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container-editorial border-t border-border py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {year} Smartway. {t("footer.rights")}</p>
        <p className="font-display italic">{t("tag.tagline")}</p>
      </div>
    </footer>
  );
}
