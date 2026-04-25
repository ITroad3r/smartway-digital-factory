import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo-smartway.png";
import { useI18n, Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/services", label: t("nav.services") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "bg-paper/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      )}
    >
      <div className="container-editorial flex flex-col py-3 xl:py-0">
        {/* Top row: logo + language/CTA */}
        <div className="flex w-full items-center justify-between gap-3 xl:h-24">
          <Link to="/" className="flex items-center shrink-0" aria-label="Smartway home">
            <img src={logo} alt="Smartway" className="h-12 sm:h-14 md:h-16 w-auto" />
          </Link>

          {/* Desktop nav (centered) */}
          <nav className="hidden xl:flex flex-1 items-center justify-center gap-9">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "text-sm font-medium whitespace-nowrap transition-colors hover:text-accent relative",
                  location.pathname === l.to
                    ? "text-accent after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:bg-accent"
                    : "text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium border border-border rounded-full p-0.5">
              {(["en", "fr"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2 sm:px-3 py-1 rounded-full uppercase transition-colors",
                    lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Link
              to="/contact"
              className="hidden xl:inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-card transition-all hover:bg-accent hover:shadow-glow"
            >
              {t("cta.contact")}
            </Link>
          </div>
        </div>

        {/* Mobile nav row (below logo) */}
        <nav className="flex w-full basis-full items-center justify-center gap-3 border-t border-border/60 pt-3 mt-3 overflow-x-auto no-scrollbar sm:gap-6 xl:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-[13px] font-medium whitespace-nowrap transition-colors hover:text-accent relative py-1 sm:text-sm",
                location.pathname === l.to
                  ? "text-accent after:content-[''] after:absolute after:-bottom-0.5 after:left-1 after:right-1 after:h-0.5 after:bg-accent"
                  : "text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
