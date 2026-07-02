import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label="Breadcrumb" className="container-editorial pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-accent transition-colors">
            <Home className="h-3 w-3" />
            <span className="sr-only">{t("bc.home")}</span>
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 opacity-60" />
            {c.href && i !== items.length - 1 ? (
              <Link to={c.href} className="hover:text-accent transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground/80" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
