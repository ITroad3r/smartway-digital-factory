// Structured data (JSON-LD) helpers

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://smartways.ma";

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE_URL}/#organization`,
  name: "Smartway",
  alternateName: "SmartWay",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-smartway.png`,
  image: `${SITE_URL}/logo-smartway.png`,
  description:
    "Smartway is a Moroccan digital factory and subsidiary of ITRoad Group, delivering digital transformation, AI, cloud, data, automation and cybersecurity consulting across Morocco, Africa and Europe.",
  parentOrganization: {
    "@type": "Organization",
    name: "ITRoad Group",
    url: "https://itroadgroup.com",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Agadir",
    addressCountry: "MA",
  },
  areaServed: ["MA", "FR", "TN", "DZ", "SN", "EU"],
  sameAs: [] as string[],
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Smartway",
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: ["en", "fr"],
});

export const breadcrumbJsonLd = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
  })),
});

export const faqJsonLd = (items: Array<{ q: string; a: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
});

export const serviceJsonLd = (opts: {
  name: string;
  description: string;
  slug: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: opts.name,
  name: opts.name,
  description: opts.description,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: ["MA", "Africa", "Europe"],
  url: `${SITE_URL}/services/${opts.slug}`,
});

export const articleJsonLd = (opts: {
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  slug: string;
  tags?: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: opts.title,
  description: opts.description,
  image: opts.image ? [opts.image] : undefined,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified || opts.datePublished,
  author: { "@type": "Person", name: opts.author || "Smartway Editorial" },
  publisher: { "@id": `${SITE_URL}/#organization` },
  mainEntityOfPage: `${SITE_URL}/blog/${opts.slug}`,
  keywords: opts.tags?.join(", "),
});

export const stripHtml = (s: string) =>
  s?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
