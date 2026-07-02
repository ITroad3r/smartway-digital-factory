import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!items?.length) return null;
  return (
    <div className="divide-y divide-border border-y border-border" itemScope itemType="https://schema.org/FAQPage">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="py-2"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-base md:text-lg" itemProp="name">
                {it.q}
              </span>
              {isOpen ? (
                <Minus className="h-5 w-5 text-accent shrink-0" />
              ) : (
                <Plus className="h-5 w-5 text-accent shrink-0" />
              )}
            </button>
            {isOpen && (
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="pb-6 pr-8"
              >
                <p
                  className="text-muted-foreground leading-relaxed"
                  itemProp="text"
                  dangerouslySetInnerHTML={{ __html: it.a }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
