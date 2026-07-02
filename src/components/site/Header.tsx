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
    { to: "/industries", label: t("nav.industries") },
    { to: "/case-studies", label: t("nav.cases") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "bg-paper/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      )}
    >
      <div className="container-editorial py-3 md:py-0">
        <div className="flex lg:h-24 items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center" aria-label="Smartway home">
              <img src={logo} alt="Smartway — Digital transformation Morocco" className="h-12 sm:h-14 md:h-16 w-auto" width={220} height={64} />
            </Link>
            <span aria-hidden="true" className="block h-6 md:h-7 w-px bg-border" />
            <a
              href="https://itroadgroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col leading-tight font-light tracking-[0.16em] sm:tracking-[0.18em] text-[8px] sm:text-[9px] md:text-[10px] uppercase text-muted-foreground transition-colors hover:text-accent"
              aria-label="ITRoad Group — opens in a new tab"
            >
              <span className="opacity-70">by</span>
              <span className="text-foreground/80">ITRoad Group</span>
            </a>
          </div>

          <nav aria-label="Primary" className="hidden xl:flex flex-1 items-center justify-center gap-7">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "text-sm font-medium whitespace-nowrap transition-colors hover:text-accent relative",
                  isActive(l.to)
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
                  aria-label={`Switch to ${l === "en" ? "English" : "French"}`}
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

        <nav aria-label="Primary mobile" className="xl:hidden mt-3 flex w-full items-center justify-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 flex-wrap">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-colors hover:text-accent py-1",
                isActive(l.to) ? "text-accent" : "text-foreground"
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
