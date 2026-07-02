import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "fr";

type Dict = Record<string, { en: string; fr: string }>;

const dict: Dict = {
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.about": { en: "About", fr: "À propos" },
  "nav.services": { en: "Services", fr: "Services" },
  "nav.industries": { en: "Industries", fr: "Secteurs" },
  "nav.cases": { en: "Case Studies", fr: "Références" },
  "nav.resources": { en: "Resources", fr: "Ressources" },
  "nav.faq": { en: "FAQ", fr: "FAQ" },
  "nav.blog": { en: "Blog", fr: "Blog" },
  "nav.contact": { en: "Contact", fr: "Contact" },
  "nav.admin": { en: "Admin", fr: "Admin" },

  "cta.explore": { en: "Explore Our Services", fr: "Découvrir nos services" },
  "cta.contact": { en: "Get in Touch", fr: "Nous contacter" },
  "cta.start": { en: "Start the Conversation", fr: "Démarrer la conversation" },
  "cta.discovery": { en: "Book a Free Discovery Call", fr: "Réserver un appel découverte gratuit" },
  "cta.consult": { en: "Book a Consultation", fr: "Réserver une consultation" },
  "cta.expert": { en: "Talk to an Expert", fr: "Parler à un expert" },
  "cta.send": { en: "Send Message", fr: "Envoyer le message" },
  "cta.subscribe": { en: "Subscribe for Free", fr: "S'abonner gratuitement" },
  "cta.read": { en: "Read article", fr: "Lire l'article" },
  "cta.learn": { en: "Learn more", fr: "En savoir plus" },
  "cta.viewall": { en: "View all", fr: "Voir tout" },
  "cta.download": { en: "Download", fr: "Télécharger" },

  "tag.tagline": { en: "Shaping the future", fr: "Façonner l'avenir" },

  "home.pillars.title": { en: "Why Smartway", fr: "Pourquoi Smartway" },
  "home.pillars.sub": { en: "A digital partner built for outcomes — not deliverables.", fr: "Un partenaire digital pensé pour les résultats — pas pour les livrables." },
  "home.services.title": { en: "Our Services", fr: "Nos services" },
  "home.services.sub": { en: "Seven interconnected service areas. One seamless team.", fr: "Sept pôles de services interconnectés. Une seule équipe." },
  "home.stats.title": { en: "By the numbers", fr: "En chiffres" },
  "home.industries.title": { en: "Industries we serve", fr: "Nos secteurs" },
  "home.industries.sub": { en: "Deep vertical expertise across regulated and fast-moving industries.", fr: "Une expertise sectorielle pointue, du régulé au fast-moving." },
  "home.method.title": { en: "Our methodology", fr: "Notre méthodologie" },
  "home.method.sub": { en: "A proven five-step approach that turns digital ambition into measurable outcomes.", fr: "Une approche éprouvée en cinq étapes pour transformer l'ambition digitale en résultats mesurables." },
  "home.tech.title": { en: "Technologies we master", fr: "Nos technologies" },
  "home.tech.sub": { en: "Certified expertise on the platforms that power modern digital businesses.", fr: "Expertise certifiée sur les plateformes qui font tourner le digital moderne." },
  "home.cases.title": { en: "Success stories", fr: "Nos réalisations" },
  "home.cases.sub": { en: "Real outcomes for real organizations across Morocco, Africa and Europe.", fr: "De vrais résultats pour de vraies organisations au Maroc, en Afrique et en Europe." },
  "home.faq.title": { en: "Frequently asked questions", fr: "Questions fréquentes" },
  "home.faq.sub": { en: "Everything you need to know about working with Smartway.", fr: "Tout ce qu'il faut savoir sur nos missions." },
  "home.cta.title": { en: "Ready to shape the future of your business?", fr: "Prêt à façonner l'avenir de votre entreprise ?" },
  "home.cta.sub": { en: "Let's talk about how Smartway can accelerate your digital transformation. No jargon, no pressure — just a real conversation.", fr: "Parlons de la manière dont Smartway peut accélérer votre transformation. Sans jargon, sans pression — juste une vraie conversation." },

  "newsletter.title": { en: "Stay Ahead of the Curve", fr: "Gardez une longueur d'avance" },
  "newsletter.sub": { en: "Get the latest insights on digital transformation, cloud strategy, AI trends, and tech best practices — delivered straight to your inbox.", fr: "Recevez les dernières analyses sur la transformation digitale, le cloud, l'IA et les bonnes pratiques tech — directement dans votre boîte mail." },
  "newsletter.placeholder": { en: "Enter your email address", fr: "Entrez votre adresse email" },
  "newsletter.privacy": { en: "We respect your privacy. Unsubscribe at any time.", fr: "Nous respectons votre vie privée. Désabonnement à tout moment." },
  "newsletter.success": { en: "You're in! Welcome to the Smartway community.", fr: "Bienvenue dans la communauté Smartway !" },

  "about.hero.title": { en: "We are Smartway — shaping the future, one solution at a time.", fr: "Nous sommes Smartway — façonner l'avenir, une solution à la fois." },
  "about.hero.sub": { en: "A technology partner built on expertise, agility, and a genuine passion for helping businesses transform.", fr: "Un partenaire technologique construit sur l'expertise, l'agilité et une vraie passion pour la transformation des entreprises." },
  "about.story": { en: "Our Story", fr: "Notre histoire" },
  "about.mission": { en: "Our Mission", fr: "Notre mission" },
  "about.vision": { en: "Our Vision", fr: "Notre vision" },
  "about.values": { en: "Our Values", fr: "Nos valeurs" },
  "about.different": { en: "What sets us apart", fr: "Ce qui nous distingue" },
  "about.team": { en: "Team & Culture", fr: "Équipe & culture" },

  "services.hero.title": { en: "Services that turn ideas into outcomes.", fr: "Des services qui transforment les idées en résultats." },
  "services.hero.sub": { en: "Seven interconnected service areas. One seamless team. Tailored solutions for where you are and where you're going.", fr: "Sept pôles interconnectés. Une équipe unique. Des solutions sur mesure pour où vous êtes — et où vous allez." },
  "services.detail.included": { en: "What's included", fr: "Ce qui est inclus" },
  "services.detail.bestfor": { en: "Best for", fr: "Idéal pour" },
  "services.detail.matters": { en: "Why it matters", fr: "Pourquoi c'est important" },
  "services.detail.subservices": { en: "Sub-services", fr: "Sous-services" },
  "services.notsure": { en: "Not sure which service you need?", fr: "Vous ne savez pas quel service il vous faut ?" },
  "services.notsure.sub": { en: "Let's figure it out together. A 30-minute discovery call is all it takes.", fr: "Trouvons-le ensemble. Un appel découverte de 30 minutes suffit." },

  "industries.hero.title": { en: "Industry expertise, engineered for outcomes.", fr: "Expertise sectorielle, orientée résultats." },
  "industries.hero.sub": { en: "We combine deep vertical knowledge with cross-industry technology mastery to accelerate transformation where it matters most.", fr: "Nous combinons connaissance sectorielle et maîtrise technologique transverse pour accélérer la transformation là où elle compte." },
  "industries.detail.challenges": { en: "Key challenges", fr: "Enjeux clés" },
  "industries.detail.solutions": { en: "How we help", fr: "Comment nous aidons" },

  "cases.hero.title": { en: "Real work. Real outcomes.", fr: "Des projets concrets. Des résultats mesurables." },
  "cases.hero.sub": { en: "A selection of client engagements delivered by Smartway across Morocco, Africa and Europe.", fr: "Une sélection de missions livrées par Smartway au Maroc, en Afrique et en Europe." },
  "cases.detail.challenge": { en: "The challenge", fr: "Le défi" },
  "cases.detail.solution": { en: "Our solution", fr: "Notre solution" },
  "cases.detail.results": { en: "Results", fr: "Résultats" },

  "resources.hero.title": { en: "Guides, whitepapers & tools.", fr: "Guides, livres blancs & outils." },
  "resources.hero.sub": { en: "Practical resources to help you plan, execute and measure your digital transformation.", fr: "Des ressources pratiques pour planifier, exécuter et mesurer votre transformation digitale." },

  "faq.hero.title": { en: "Frequently asked questions", fr: "Questions fréquentes" },
  "faq.hero.sub": { en: "Answers to the most common questions about our services, engagement model and expertise.", fr: "Réponses aux questions les plus fréquentes sur nos services et notre modèle d'engagement." },

  "blog.hero.title": { en: "Insights for the digital-first era.", fr: "Analyses pour l'ère du tout digital." },
  "blog.hero.sub": { en: "Expert perspectives on cloud, AI, software engineering, agile transformation, and the future of digital business.", fr: "Perspectives d'experts sur le cloud, l'IA, le software, la transformation agile et l'avenir du business digital." },
  "blog.empty": { en: "No articles yet — check back soon.", fr: "Aucun article pour l'instant — revenez bientôt." },

  "contact.hero.title": { en: "Let's build something great together.", fr: "Construisons quelque chose de grand ensemble." },
  "contact.hero.sub": { en: "Whether you have a project, a challenge, or just a question — we'd love to hear from you. We typically respond within one business day.", fr: "Que vous ayez un projet, un défi ou simplement une question — nous serions ravis d'échanger. Nous répondons généralement sous un jour ouvré." },
  "contact.form.name": { en: "Full name", fr: "Nom complet" },
  "contact.form.company": { en: "Company / Organization", fr: "Entreprise / Organisation" },
  "contact.form.email": { en: "Email address", fr: "Adresse email" },
  "contact.form.phone": { en: "Phone (optional)", fr: "Téléphone (optionnel)" },
  "contact.form.service": { en: "Service interest", fr: "Service qui vous intéresse" },
  "contact.form.message": { en: "Tell us about your project or challenge…", fr: "Parlez-nous de votre projet ou défi…" },
  "contact.form.success": { en: "Thank you! A member of the Smartway team will be in touch within one business day.", fr: "Merci ! Un membre de l'équipe Smartway vous contactera sous un jour ouvré." },
  "contact.form.privacy": { en: "Your information is safe with us and will never be shared.", fr: "Vos informations sont en sécurité et ne seront jamais partagées." },
  "contact.alt.email": { en: "General inquiries", fr: "Demandes générales" },
  "contact.alt.linkedin": { en: "Follow for updates", fr: "Suivez-nous pour les actualités" },

  "footer.tagline": { en: "Your partner for digital transformation, cloud, and AI. Headquartered in Agadir, Morocco. A subsidiary of ITRoad Group.", fr: "Votre partenaire pour la transformation digitale, le cloud et l'IA. Basé à Agadir, Maroc. Filiale d'ITRoad Group." },
  "footer.company": { en: "Company", fr: "Entreprise" },
  "footer.explore": { en: "Explore", fr: "Explorer" },
  "footer.legal": { en: "Legal", fr: "Mentions légales" },
  "footer.rights": { en: "All rights reserved.", fr: "Tous droits réservés." },
  "footer.location": { en: "Agadir, Morocco", fr: "Agadir, Maroc" },

  "bc.home": { en: "Home", fr: "Accueil" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  pick: <T extends Record<string, any>>(obj: T | null | undefined, base: string) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("smartway-lang") as Lang) || "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("smartway-lang", l);
  };

  const t = (key: string) => dict[key]?.[lang] ?? key;

  const pick = <T extends Record<string, any>>(obj: T | null | undefined, base: string) => {
    if (!obj) return "";
    const localized = obj[`${base}_${lang}`];
    if (localized) return localized;
    return obj[`${base}_en`] ?? "";
  };

  return <I18nContext.Provider value={{ lang, setLang, t, pick }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
