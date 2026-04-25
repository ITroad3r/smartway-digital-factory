import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-smartway.png";
import { useI18n, Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
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
      <div className="container-editorial flex h-24 items-center justify-between gap-6">
        <Link to="/" className="flex items-center" aria-label="Smartway home">
          <img src={logo} alt="Smartway" className="h-14 md:h-16 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent relative",
                location.pathname === l.to
                  ? "text-accent after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:bg-accent"
                  : "text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium border border-border rounded-full p-0.5">
            {(["en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "px-3 py-1 rounded-full uppercase transition-colors",
                  lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-card transition-all hover:bg-accent hover:shadow-glow"
          >
            {t("cta.contact")}
          </Link>
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-paper border-t border-border animate-fade-in">
          <nav className="container-editorial py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-lg font-medium py-2">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 mt-2">
              {(["en", "fr"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium uppercase rounded-full border",
                    lang === l ? "bg-foreground text-background border-foreground" : "border-border"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
