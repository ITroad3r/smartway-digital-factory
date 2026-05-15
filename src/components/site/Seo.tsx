import { useEffect } from "react";

interface Props {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  twitterCard?: string;
  twitterHandle?: string;
  robots?: string;
  structuredData?: Record<string, any>;
  siteName?: string;
}

const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export default function Seo({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogTitle,
  ogDescription,
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterHandle,
  robots = "index,follow",
  structuredData,
  siteName = "Smartway",
}: Props) {
  useEffect(() => {
    document.title = title;

    if (description) setMeta('meta[name="description"]', "name", "description", description);
    if (keywords) setMeta('meta[name="keywords"]', "name", "keywords", keywords);
    setMeta('meta[name="robots"]', "name", "robots", robots);

    const canonicalHref = canonical || window.location.href;
    setLink("canonical", canonicalHref);

    // Open Graph
    setMeta('meta[property="og:title"]', "property", "og:title", ogTitle || title);
    if (ogDescription || description) {
      setMeta('meta[property="og:description"]', "property", "og:description", ogDescription || description!);
    }
    setMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalHref);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", siteName);
    if (ogImage) {
      setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      setMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200");
      setMeta('meta[property="og:image:height"]', "property", "og:image:height", "630");
      setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", ogTitle || title);
    }

    // Twitter
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", twitterCard);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", ogTitle || title);
    if (ogDescription || description) {
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", ogDescription || description!);
    }
    if (ogImage) setMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    if (twitterHandle) setMeta('meta[name="twitter:site"]', "name", "twitter:site", twitterHandle);

    // Structured data (JSON-LD)
    const ldId = "seo-jsonld";
    let ld = document.getElementById(ldId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!ld) {
        ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.id = ldId;
        document.head.appendChild(ld);
      }
      ld.text = JSON.stringify(structuredData);
    } else if (ld) {
      ld.remove();
    }
  }, [title, description, keywords, canonical, ogImage, ogTitle, ogDescription, ogType, twitterCard, twitterHandle, robots, structuredData, siteName]);

  return null;
}
