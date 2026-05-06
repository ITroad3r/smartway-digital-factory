import { Link } from "react-router-dom";
import { Linkedin, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Music2 } from "lucide-react";
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
          </ul>
        </div>
      </div>

      {/* Social icons row */}
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

      <div className="container-editorial border-t border-border py-6 text-xs text-muted-foreground">
        <p>© {year} Smartway. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
