import { useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, RotateCcw, ChevronLeft, Send, Check, Briefcase, Headset, ChevronRight } from "lucide-react";
import wayaAsset from "@/assets/waya-avatar.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

const WAYA_AVATAR = wayaAsset.url;

type Lang = "fr" | "en";

const WHATSAPP_NUMBER = "212702074045";

const SERVICES = [
  { value: "software_development",      fr: "Développement & Ingénierie logicielle",  en: "Software Development & Engineering" },
  { value: "cloud_devops",              fr: "Cloud & DevOps",                          en: "Cloud & DevOps Services" },
  { value: "data_ai",                   fr: "Data & IA",                               en: "Data & AI Services" },
  { value: "ux_ui",                     fr: "Design UX/UI",                            en: "UX/UI Design" },
  { value: "digital_strategy",          fr: "Stratégie digitale & Conseil Agile",      en: "Digital Strategy & Agile Consulting" },
  { value: "integration_modernization", fr: "Intégration & Modernisation",             en: "Integration & Modernization" },
  { value: "cybersecurity_compliance",  fr: "Cybersécurité & Conformité",              en: "Cybersecurity & Compliance" },
  { value: "general_enquiry",           fr: "Je ne suis pas sûr / Demande générale",   en: "Not sure / General enquiry" },
] as const;

type Opt = { value: string; fr: string; en: string };

const Q1_OPTIONS: Record<string, Opt[]> = {
  software_development: [
    { value: "web_app",       fr: "Application web",                    en: "Web application" },
    { value: "mobile_app",    fr: "Application mobile",                 en: "Mobile application" },
    { value: "business_app",  fr: "Application métier sur mesure",      en: "Custom business application" },
    { value: "modernization", fr: "Modernisation d'un produit existant", en: "Modernization of an existing product" },
  ],
  cloud_devops: [
    { value: "migration",    fr: "Migration cloud",             en: "Cloud migration" },
    { value: "automation",   fr: "Automatisation & CI/CD",       en: "Automation & CI/CD" },
    { value: "reliability",  fr: "Fiabilité & monitoring",       en: "Reliability & monitoring" },
    { value: "cost_opt",     fr: "Optimisation des coûts cloud", en: "Cloud cost optimization" },
  ],
  data_ai: [
    { value: "bi",              fr: "BI & tableaux de bord", en: "BI & dashboards" },
    { value: "data_engineering", fr: "Data engineering",     en: "Data engineering" },
    { value: "machine_learning", fr: "Machine learning",     en: "Machine learning" },
    { value: "gen_ai",           fr: "IA générative",        en: "Generative AI" },
  ],
  ux_ui: [
    { value: "user_research",  fr: "Recherche utilisateur",    en: "User research" },
    { value: "prototyping",    fr: "Wireframing & prototypage", en: "Wireframing & prototyping" },
    { value: "design_system",  fr: "Design system",             en: "Design system" },
    { value: "redesign",       fr: "Refonte d'interface",       en: "Interface redesign" },
  ],
  digital_strategy: [
    { value: "agile_coaching",     fr: "Coaching agile",              en: "Agile coaching" },
    { value: "product_mgmt",       fr: "Product management",          en: "Product management" },
    { value: "process_automation", fr: "Automatisation des processus", en: "Process automation" },
    { value: "alignment",          fr: "Alignement tech & business",   en: "Tech & business alignment" },
  ],
  integration_modernization: [
    { value: "legacy_modern",      fr: "Modernisation du legacy", en: "Legacy modernization" },
    { value: "system_integration", fr: "Intégration de systèmes", en: "System integration" },
    { value: "api_platform",       fr: "Plateforme d'API",        en: "API platform" },
    { value: "erp_crm",            fr: "Intégration ERP / CRM",   en: "ERP / CRM integration" },
  ],
  cybersecurity_compliance: [
    { value: "secure_sdlc", fr: "SDLC sécurisé",              en: "Secure SDLC" },
    { value: "iam",         fr: "Gestion des identités (IAM)", en: "Identity & access management" },
    { value: "sec_testing", fr: "Tests de sécurité",           en: "Security testing" },
    { value: "compliance",  fr: "Accompagnement conformité",   en: "Compliance support" },
  ],
};

const Q2_OPTIONS: Opt[] = [
  { value: "idea",     fr: "J'ai une idée ou un besoin à définir",       en: "I have an idea or need to define" },
  { value: "prep",     fr: "Le projet est en préparation",                en: "The project is being prepared" },
  { value: "evolve",   fr: "Une solution existe déjà et doit évoluer",   en: "An existing solution needs to evolve" },
  { value: "advice",   fr: "Je souhaite simplement être conseillé",       en: "I am mainly looking for advice" },
];

type Intent = "service_enquiry" | "support_request";

type Step =
  | "intent"
  | "service" | "q1" | "q2" | "free_text" | "contact"
  | "support_desc" | "support_choice" | "support_contact"
  | "done";

type State = {
  step: Step;
  intent?: Intent;
  service?: string;
  answers: { main?: string; stage?: string };
  free_text: string;
  support_desc: string;
  contact: { name: string; email: string; phone: string; company: string; message: string };
  lead_id?: string;
  done_kind?: Intent;
};

const initialState: State = {
  step: "intent",
  answers: {},
  free_text: "",
  support_desc: "",
  contact: { name: "", email: "", phone: "", company: "", message: "" },
};

const T = {
  headerTitle: { fr: "Waya", en: "Waya" },
  headerSub: { fr: "L'assistant Smartway", en: "Smartway Assistant" },
  intentPrompt: {
    fr: "Bonjour 👋 Je m’appelle Waya, l’assistant Smartway. Comment puis-je vous aider aujourd’hui ?",
    en: "Hello 👋 My name is Waya, the Smartway assistant. How can I help you today?",
  },
  intentService: {
    fr: "Je suis intéressé par l'un de vos services",
    en: "I'm interested in one of your services",
  },
  intentSupport: {
    fr: "J'ai besoin d'assistance",
    en: "I need support",
  },
  chooseService: { fr: "Choisissez un service :", en: "Pick a service:" },
  q1: { fr: "Quel est votre besoin principal ?", en: "What is your main need?" },
  q2: { fr: "Où en êtes-vous actuellement ?", en: "Where are you today?" },
  freeTextPrompt: { fr: "Décrivez brièvement votre besoin.", en: "Briefly describe what you need." },
  supportDescPrompt: {
    fr: "Décrivez brièvement le problème ou l'assistance dont vous avez besoin.",
    en: "Briefly describe the issue or support you need.",
  },
  supportChoicePrompt: {
    fr: "Comment souhaitez-vous être aidé ?",
    en: "How would you like to be helped?",
  },
  supportOnWhatsapp: { fr: "Contacter le support sur WhatsApp", en: "Contact support on WhatsApp" },
  supportLeaveContact: { fr: "Laisser mes coordonnées", en: "Leave my contact details" },
  contactIntro: {
    fr: "Laissez-nous vos coordonnées, un conseiller Smartway vous rappellera.",
    en: "Share your contact details and a Smartway advisor will call you back.",
  },
  supportContactIntro: {
    fr: "Laissez vos coordonnées, un membre de l'équipe Smartway vous contactera.",
    en: "Share your contact details and a Smartway team member will contact you.",
  },
  name: { fr: "Nom complet", en: "Full name" },
  email: { fr: "Email professionnel", en: "Professional email" },
  phone: { fr: "Téléphone", en: "Phone" },
  company: { fr: "Entreprise (optionnel)", en: "Company (optional)" },
  message: { fr: "Message complémentaire (optionnel)", en: "Additional message (optional)" },
  consent: {
    fr: "En envoyant, vous acceptez que Smartway vous contacte au sujet de votre demande. Voir notre",
    en: "By submitting, you agree that Smartway may contact you about your request. See our",
  },
  privacyLink: { fr: "politique de confidentialité", en: "privacy policy" },
  yourRequest: { fr: "Votre demande", en: "Your request" },
  edit: { fr: "Modifier", en: "Edit" },
  submit: { fr: "Envoyer ma demande", en: "Send my request" },
  back: { fr: "Retour", en: "Back" },
  restart: { fr: "Recommencer", en: "Restart" },
  next: { fr: "Suivant", en: "Next" },
  minimize: { fr: "Réduire", en: "Minimize" },
  close: { fr: "Fermer", en: "Close" },
  open: { fr: "Ouvrir Waya", en: "Open Waya" },
  openWhatsapp: { fr: "Contacter sur WhatsApp", en: "Contact on WhatsApp" },
  submitError: {
    fr: "Impossible d'envoyer maintenant. Vérifiez votre connexion et réessayez.",
    en: "Could not send right now. Please check your connection and try again.",
  },
  invalidEmail: { fr: "Email invalide", en: "Invalid email" },
  invalidPhone: { fr: "Téléphone invalide", en: "Invalid phone" },
  required: { fr: "Requis", en: "Required" },
  confirmService: (name: string, phone: string, lang: Lang) => lang === "fr"
    ? `Merci, ${name} 👋 Votre demande a bien été enregistrée. Un conseiller commercial Smartway vous contactera prochainement au ${phone} afin d'échanger sur votre projet.`
    : `Thank you, ${name} 👋 Your request has been recorded. A Smartway sales representative will contact you shortly at ${phone} to discuss your project.`,
  confirmSupport: (name: string, lang: Lang) => lang === "fr"
    ? `Merci, ${name} 👋 Votre demande d'assistance a bien été enregistrée. Un membre de l'équipe Smartway vous contactera prochainement.`
    : `Thank you, ${name} 👋 Your support request has been recorded. A Smartway team member will contact you shortly.`,
} as const;

const STORAGE_KEY = "waya-state-v3";
const LANG_KEY = "waya-lang";

const BRAND = {
  navy: "#1B2A4A",
  blue: "#29ABE2",
  text: "#1B2A4A",
  muted: "#64748B",
  btnBg: "#F4FBFE",
  btnBorder: "#B7E3F5",
  btnHover: "#E5F7FD",
  selBg: "#DDF4FC",
  selBorder: "#29ABE2",
  chatBg: "#F7FAFC",
  white: "#FFFFFF",
  whatsapp: "#25D366",
};

function useWayaState() {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return { ...initialState, ...JSON.parse(raw) };
    } catch {}
    return initialState;
  });
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);
  const reset = () => setState(initialState);
  return { state, setState, reset };
}

// WhatsApp icon (official glyph)
const WhatsAppIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <path fill="#fff" d="M16.001 3C9.373 3 4 8.373 4 15c0 2.383.71 4.6 1.928 6.457L4 29l7.72-1.892A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm0 21.6c-1.87 0-3.62-.51-5.12-1.398l-.367-.217-4.582 1.123 1.145-4.462-.24-.377A9.556 9.556 0 0 1 6.4 15c0-5.293 4.308-9.6 9.6-9.6s9.6 4.307 9.6 9.6-4.308 9.6-9.6 9.6zm5.264-7.198c-.29-.145-1.72-.849-1.985-.945-.266-.096-.46-.145-.653.146-.194.29-.75.945-.919 1.14-.17.194-.339.218-.63.073-.29-.146-1.223-.451-2.328-1.437-.86-.767-1.44-1.714-1.61-2.005-.169-.29-.018-.447.127-.593.13-.13.29-.339.436-.508.146-.169.194-.29.29-.484.096-.194.048-.363-.024-.508-.073-.145-.653-1.574-.895-2.156-.236-.567-.475-.49-.653-.5-.169-.008-.363-.01-.556-.01a1.07 1.07 0 0 0-.775.363c-.266.29-1.014.99-1.014 2.415s1.038 2.8 1.183 2.994c.145.194 2.043 3.117 4.95 4.372.692.299 1.232.478 1.653.612.694.221 1.325.19 1.825.115.556-.083 1.72-.703 1.963-1.383.242-.68.242-1.263.17-1.383-.073-.121-.266-.194-.556-.339z"/>
  </svg>
);

export default function WayaChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    return (localStorage.getItem(LANG_KEY) as Lang) || "fr";
  });
  useEffect(() => { localStorage.setItem(LANG_KEY, lang); }, [lang]);

  const { state, setState, reset } = useWayaState();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLElement | null>(null);

  const t = (k: keyof typeof T) => (T[k] as any)[lang] as string;

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => firstFocusRef.current?.focus(), 30);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 40);
    }
  }, [open, minimized, state.step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const currentQ1: Opt[] = useMemo(
    () => (state.service && state.service !== "general_enquiry") ? (Q1_OPTIONS[state.service] ?? []) : [],
    [state.service],
  );

  const pickIntent = (intent: Intent) => {
    setState((s) => ({
      ...s,
      intent,
      step: intent === "service_enquiry" ? "service" : "support_desc",
    }));
  };

  const chooseService = (value: string) => {
    setState((s) => ({
      ...s, service: value, answers: {},
      step: value === "general_enquiry" ? "free_text" : "q1",
    }));
  };

  const goBack = () => {
    setState((s) => {
      switch (s.step) {
        case "service": return { ...s, step: "intent" };
        case "q1":
        case "free_text": return { ...s, step: "service" };
        case "q2": return { ...s, step: "q1" };
        case "contact":
          return { ...s, step: s.service === "general_enquiry" ? "free_text" : "q2" };
        case "support_choice": return { ...s, step: "support_desc" };
        case "support_contact": return { ...s, step: "support_choice" };
        case "support_desc": return { ...s, step: "intent" };
        default: return s;
      }
    });
  };

  const validateContact = (requirePhone = true) => {
    const errs: Record<string, string> = {};
    const { name, email, phone } = state.contact;
    if (!name.trim()) errs.name = t("required");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t("invalidEmail");
    if (requirePhone && (!phone.trim() || phone.replace(/[^\d+]/g, "").length < 6)) errs.phone = t("invalidPhone");
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  };

  const submitService = async () => {
    if (submitting) return;
    if (!validateContact()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        request_type: "service_enquiry",
        name: state.contact.name.trim(),
        email: state.contact.email.trim(),
        phone: state.contact.phone.trim(),
        company: state.contact.company.trim() || null,
        service_interest: state.service,
        qualifying_answers: state.answers,
        free_text: [state.free_text, state.contact.message].filter(Boolean).join("\n\n") || undefined,
        locale: lang,
        source_url: typeof window !== "undefined" ? window.location.href : undefined,
      };
      const { data, error: fnError } = await supabase.functions.invoke("submit-lead", { body: payload });
      if (fnError || !data?.ok) throw fnError || new Error("submit failed");
      setState((s) => ({ ...s, step: "done", lead_id: data.lead_id, done_kind: "service_enquiry" }));
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (e) {
      console.error(e);
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitSupport = async () => {
    if (submitting) return;
    if (!validateContact()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        request_type: "support_request",
        name: state.contact.name.trim(),
        email: state.contact.email.trim(),
        phone: state.contact.phone.trim(),
        company: state.contact.company.trim() || null,
        service_interest: "support",
        qualifying_answers: {},
        free_text: state.support_desc.trim() || undefined,
        locale: lang,
        source_url: typeof window !== "undefined" ? window.location.href : undefined,
      };
      const { data, error: fnError } = await supabase.functions.invoke("submit-lead", { body: payload });
      if (fnError || !data?.ok) throw fnError || new Error("submit failed");
      setState((s) => ({ ...s, step: "done", lead_id: data.lead_id, done_kind: "support_request" }));
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (e) {
      console.error(e);
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const openSupportWhatsApp = () => {
    const desc = state.support_desc.trim();
    const msg = lang === "fr"
      ? `Bonjour Smartway, j'ai besoin d'assistance. Voici mon problème : ${desc}`
      : `Hello Smartway, I need support. Here is my issue: ${desc}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ---------- UI atoms ----------
  const BotBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2 max-w-[92%]">
      <img src={WAYA_AVATAR} alt="" aria-hidden
        className="rounded-full flex-shrink-0"
        style={{ width: 32, height: 32, objectFit: "contain", background: BRAND.white }} />
      <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{ background: BRAND.white, color: BRAND.text, border: `1px solid ${BRAND.btnBorder}` }}>
        {children}
      </div>
    </div>
  );

  const ChoiceButton = ({
    selected, onClick, children, focusRef,
  }: {
    selected?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    focusRef?: (el: HTMLButtonElement | null) => void;
  }) => (
    <button
      ref={focusRef}
      onClick={onClick}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = BRAND.btnHover; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = BRAND.btnBg; }}
      className="w-full text-left transition-colors focus:outline-none focus-visible:ring-2 flex items-center justify-between gap-2"
      style={{
        minHeight: 42,
        padding: "10px 16px",
        borderRadius: 12,
        background: selected ? BRAND.selBg : BRAND.btnBg,
        border: `1px solid ${selected ? BRAND.selBorder : BRAND.btnBorder}`,
        color: BRAND.text,
        fontSize: 14,
      }}
    >
      <span>{children}</span>
      {selected && <Check className="w-4 h-4" style={{ color: BRAND.blue }} />}
    </button>
  );

  const IntentButton = ({
    variant,
    selected,
    onClick,
    children,
    focusRef,
  }: {
    variant: "service" | "support";
    selected?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    focusRef?: (el: HTMLButtonElement | null) => void;
  }) => {
    const isService = variant === "service";
    const Icon = isService ? Briefcase : Headset;
    return (
      <button
        ref={focusRef}
        onClick={onClick}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:ring-offset-1 transition-all flex items-center justify-between gap-3"
        style={{
          minHeight: 52,
          height: "auto",
          padding: "12px 16px",
          borderRadius: 12,
          background: selected ? BRAND.selBg : (isService ? BRAND.btnBg : BRAND.white),
          border: `1.5px solid ${selected ? BRAND.selBorder : (isService ? BRAND.blue : BRAND.btnBorder)}`,
          color: BRAND.text,
          fontSize: 14,
          fontWeight: 500,
          transform: "translateY(0)",
          boxShadow: selected ? "0 4px 12px rgba(41,171,226,0.12)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.background = isService ? "#E5F7FD" : "#F4FBFE";
            e.currentTarget.style.borderColor = BRAND.blue;
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(27,42,74,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.background = isService ? BRAND.btnBg : BRAND.white;
            e.currentTarget.style.borderColor = isService ? BRAND.blue : BRAND.btnBorder;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <span className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" style={{ color: BRAND.blue }} />
          <span>{children}</span>
        </span>
        {selected ? (
          <Check className="w-5 h-5 flex-shrink-0" style={{ color: BRAND.blue }} />
        ) : (
          <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: BRAND.blue }} />
        )}
      </button>
    );
  };

  const PrimaryBtn = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...props}
      className={"rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-50 " + (props.className ?? "")}
      style={{ background: BRAND.blue, ...(props.style ?? {}) }}
    />
  );

  const focusRefFor = (isFirst: boolean) => (el: HTMLElement | null) => {
    if (isFirst && el) firstFocusRef.current = el;
  };

  const summary = () => {
    const svc = SERVICES.find((s) => s.value === state.service);
    let main = "";
    if (state.service === "general_enquiry") {
      main = state.free_text.length > 80 ? state.free_text.slice(0, 77) + "…" : state.free_text;
    } else if (state.answers.main) {
      const opt = currentQ1.find((o) => o.value === state.answers.main);
      main = opt ? opt[lang] : "";
    }
    return `${svc?.[lang] ?? ""}${main ? " — " + main : ""}`;
  };

  // ---------- Contact block used by both flows ----------
  // NOTE: This is a plain function that returns JSX (NOT a nested React component).
  // Declaring it as a component inside WayaChat would give it a new identity on every
  // render, causing inputs to unmount/remount on each keystroke and lose focus.
  const setContactField = (name: keyof State["contact"], value: string) =>
    setState((s) => ({ ...s, contact: { ...s.contact, [name]: value } }));

  const renderContactInput = (
    name: keyof State["contact"], label: string, type = "text", maxLength = 160,
    isFirst = false, required = false,
  ) => (
    <div key={name}>
      <label className="block text-xs mb-1" style={{ color: BRAND.muted }}>
        {label}{required && <span style={{ color: BRAND.blue }}> *</span>}
      </label>
      <input
        ref={isFirst ? (focusRefFor(true) as any) : undefined}
        type={type}
        name={name}
        autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : name === "name" ? "name" : name === "company" ? "organization" : "off"}
        value={state.contact[name]}
        maxLength={maxLength}
        onChange={(e) => setContactField(name, e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
        className="w-full text-sm focus:outline-none"
        style={{
          minHeight: 42,
          padding: "10px 14px",
          borderRadius: 12,
          border: `1px solid ${fieldError[name] ? "#ef4444" : BRAND.btnBorder}`,
          background: BRAND.white,
          color: BRAND.text,
          width: "100%",
          boxShadow: "none",
          outline: "none",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = BRAND.blue; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND.selBg}`; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = fieldError[name] ? "#ef4444" : BRAND.btnBorder; e.currentTarget.style.boxShadow = "none"; }}
      />
      {fieldError[name] && <p className="text-xs mt-1 text-red-600">{fieldError[name]}</p>}
    </div>
  );

  const renderContactForm = (intro: string, onSubmit: () => void) => (
    <div className="flex flex-col gap-3">
      <BotBubble>{intro}</BotBubble>
      <div className="grid gap-3">
        {renderContactInput("name", t("name"), "text", 120, true, true)}
        {renderContactInput("phone", t("phone"), "tel", 40, false, true)}
        {renderContactInput("email", t("email"), "email", 254, false, true)}
        {renderContactInput("company", t("company"), "text", 160)}
        <div>
          <label className="block text-xs mb-1" style={{ color: BRAND.muted }}>{t("message")}</label>
          <textarea
            name="message"
            value={state.contact.message}
            maxLength={2000}
            rows={3}
            onChange={(e) => setContactField("message", e.target.value)}
            className="w-full text-sm focus:outline-none"
            style={{
              minHeight: 42,
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid ${BRAND.btnBorder}`,
              background: BRAND.white,
              color: BRAND.text,
              width: "100%",
              resize: "vertical",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = BRAND.blue; e.currentTarget.style.boxShadow = `0 0 0 2px ${BRAND.selBg}`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BRAND.btnBorder; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {state.intent === "service_enquiry" && (
        <div className="rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2"
          style={{ background: BRAND.selBg, border: `1px solid ${BRAND.btnBorder}`, color: BRAND.text }}>
          <p className="leading-snug">
            <span className="font-semibold">{t("yourRequest")} :</span> {summary()}
          </p>
          <button
            onClick={() => setState((s) => ({ ...s, step: s.service === "general_enquiry" ? "free_text" : "q1" }))}
            className="underline flex-shrink-0"
            style={{ color: BRAND.blue }}
          >{t("edit")}</button>
        </div>
      )}

      <p className="text-xs" style={{ color: BRAND.muted }}>
        {t("consent")} <a href="/legal/privacy" target="_blank" rel="noopener" className="underline" style={{ color: BRAND.blue }}>{t("privacyLink")}</a>.
      </p>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" onChange={() => {}} />
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex sm:justify-end">
        <PrimaryBtn onClick={onSubmit} disabled={submitting} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto">
          <Send className="w-4 h-4" /> {t("submit")}
        </PrimaryBtn>
      </div>
    </div>
  );


  // ---------- Steps ----------
  const renderStep = () => {
    switch (state.step) {
      case "intent":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("intentPrompt")}</BotBubble>
            <div className="flex flex-col gap-3">
              <IntentButton
                variant="service"
                focusRef={focusRefFor(true)}
                selected={state.intent === "service_enquiry"}
                onClick={() => pickIntent("service_enquiry")}
              >{t("intentService")}</IntentButton>
              <IntentButton
                variant="support"
                selected={state.intent === "support_request"}
                onClick={() => pickIntent("support_request")}
              >{t("intentSupport")}</IntentButton>
            </div>
          </div>
        );

      case "service":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("chooseService")}</BotBubble>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {SERVICES.map((s, i) => (
                <ChoiceButton
                  key={s.value}
                  focusRef={focusRefFor(i === 0)}
                  selected={state.service === s.value}
                  onClick={() => chooseService(s.value)}
                >
                  {s[lang]}
                </ChoiceButton>
              ))}
            </div>
          </div>
        );

      case "q1":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("q1")}</BotBubble>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {currentQ1.map((o, i) => (
                <ChoiceButton
                  key={o.value}
                  focusRef={focusRefFor(i === 0)}
                  selected={state.answers.main === o.value}
                  onClick={() => setState((s) => ({ ...s, answers: { ...s.answers, main: o.value }, step: "q2" }))}
                >
                  {o[lang]}
                </ChoiceButton>
              ))}
            </div>
          </div>
        );

      case "q2":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("q2")}</BotBubble>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {Q2_OPTIONS.map((o, i) => (
                <ChoiceButton
                  key={o.value}
                  focusRef={focusRefFor(i === 0)}
                  selected={state.answers.stage === o.value}
                  onClick={() => setState((s) => ({ ...s, answers: { ...s.answers, stage: o.value }, step: "contact" }))}
                >
                  {o[lang]}
                </ChoiceButton>
              ))}
            </div>
          </div>
        );

      case "free_text":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("freeTextPrompt")}</BotBubble>
            <textarea
              ref={focusRefFor(true) as any}
              value={state.free_text}
              maxLength={2000}
              onChange={(e) => setState((s) => ({ ...s, free_text: e.target.value }))}
              rows={4}
              className="w-full p-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderRadius: 12, border: `1px solid ${BRAND.btnBorder}`, background: BRAND.white, color: BRAND.text }}
            />
            <div className="flex justify-end">
              <PrimaryBtn
                disabled={state.free_text.trim().length < 3}
                onClick={() => setState((s) => ({ ...s, step: "contact" }))}
              >{t("next")}</PrimaryBtn>
            </div>
          </div>
        );

      case "contact":
        return renderContactForm(t("contactIntro"), submitService);

      case "support_desc":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("supportDescPrompt")}</BotBubble>
            <textarea
              ref={focusRefFor(true) as any}
              value={state.support_desc}
              maxLength={1000}
              onChange={(e) => setState((s) => ({ ...s, support_desc: e.target.value }))}
              rows={5}
              className="w-full p-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderRadius: 12, border: `1px solid ${BRAND.btnBorder}`, background: BRAND.white, color: BRAND.text }}
            />
            <p className="text-[11px] text-right" style={{ color: BRAND.muted }}>
              {state.support_desc.length}/1000
            </p>
            <div className="flex justify-end">
              <PrimaryBtn
                disabled={state.support_desc.trim().length < 3}
                onClick={() => setState((s) => ({ ...s, step: "support_choice" }))}
              >{t("next")}</PrimaryBtn>
            </div>
          </div>
        );

      case "support_choice":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("supportChoicePrompt")}</BotBubble>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <button
                ref={focusRefFor(true) as any}
                onClick={openSupportWhatsApp}
                className="w-full text-left transition-colors focus:outline-none focus-visible:ring-2 flex items-center gap-2 text-white"
                style={{
                  minHeight: 42, padding: "10px 16px", borderRadius: 12,
                  background: BRAND.whatsapp, border: `1px solid ${BRAND.whatsapp}`, fontSize: 14,
                }}
              >
                <WhatsAppIcon size={18} />
                <span>{t("supportOnWhatsapp")}</span>
              </button>
              <ChoiceButton onClick={() => setState((s) => ({ ...s, step: "support_contact" }))}>
                {t("supportLeaveContact")}
              </ChoiceButton>
            </div>
          </div>
        );

      case "support_contact":
        return renderContactForm(t("supportContactIntro"), submitSupport);

      case "done": {
        const isSupport = state.done_kind === "support_request";
        const firstName = state.contact.name.split(" ")[0] || state.contact.name;
        const message = isSupport
          ? T.confirmSupport(firstName, lang)
          : T.confirmService(firstName, state.contact.phone, lang);
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{message}</BotBubble>
            <button
              ref={focusRefFor(true) as any}
              onClick={() => { reset(); setOpen(false); }}
              className="self-start rounded-full px-5 py-2 text-sm text-white"
              style={{ background: BRAND.navy }}
            >
              {lang === "fr" ? "Fermer" : "Close"}
            </button>
          </div>
        );
      }
    }
  };

  const whatsappDefaultMsg = lang === "fr"
    ? "Bonjour Smartway, je souhaite discuter avec votre équipe."
    : "Hello Smartway, I would like to speak with your team.";
  const floatingWhatsAppHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappDefaultMsg)}`;

  return (
    <>
      {/* Floating buttons container (hidden when panel is open to avoid overlap) */}
      {!open && (
        <div
          className="fixed z-40 flex flex-col items-end"
          style={{
            right: "max(16px, env(safe-area-inset-right))",
            bottom: "max(16px, env(safe-area-inset-bottom))",
            gap: 12,
          }}
        >
          <a
            href={floatingWhatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("openWhatsapp")}
            className="rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none focus-visible:ring-4 flex items-center justify-center"
            style={{
              width: 54, height: 54,
              background: BRAND.whatsapp,
              boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
            }}
          >
            <WhatsAppIcon size={30} />
          </a>
          <button
            aria-label={t("open")}
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none focus-visible:ring-4"
            style={{
              width: 60, height: 60,
              background: BRAND.white,
              boxShadow: "0 8px 24px rgba(27,42,74,0.25)",
            }}
          >
            <img src={WAYA_AVATAR} alt="Waya" className="w-full h-full rounded-full" style={{ objectFit: "contain" }} />
          </button>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="waya-title"
          className="fixed z-50 shadow-2xl flex flex-col overflow-hidden"
          style={{
            right: "max(8px, env(safe-area-inset-right))",
            bottom: "max(8px, env(safe-area-inset-bottom))",
            width: "min(420px, calc(100vw - 16px))",
            height: minimized ? 64 : state.step === "intent" ? "auto" : "min(680px, calc(100dvh - 16px))",
            minHeight: state.step === "intent" ? 300 : undefined,
            maxHeight: state.step === "intent" ? "min(560px, calc(100dvh - 16px))" : "calc(100dvh - 16px)",
            background: BRAND.chatBg,
            borderRadius: 16,
            border: `1px solid ${BRAND.btnBorder}`,
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 text-white flex-shrink-0" style={{ background: BRAND.navy }}>
            <img src={WAYA_AVATAR} alt="" aria-hidden className="rounded-full flex-shrink-0"
              style={{ width: 44, height: 44, objectFit: "contain", background: BRAND.white }} />
            <div className="flex-1 min-w-0">
              <p id="waya-title" className="font-semibold leading-tight">{t("headerTitle")}</p>
              <p className="text-xs opacity-80 leading-tight truncate">{t("headerSub")}</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button onClick={() => setLang("fr")} aria-pressed={lang === "fr"}
                className={"px-2 py-1 rounded " + (lang === "fr" ? "bg-white/20" : "opacity-70")}>FR</button>
              <button onClick={() => setLang("en")} aria-pressed={lang === "en"}
                className={"px-2 py-1 rounded " + (lang === "en" ? "bg-white/20" : "opacity-70")}>EN</button>
              <button onClick={() => { reset(); setError(""); setFieldError({}); }} aria-label={t("restart")} className="p-1.5 rounded hover:bg-white/10">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => setMinimized((m) => !m)} aria-label={t("minimize")} className="p-1.5 rounded hover:bg-white/10">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} aria-label={t("close")} className="p-1.5 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div ref={scrollRef} aria-live="polite" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
                {renderStep()}
              </div>
              {state.step !== "intent" && state.step !== "done" && (
                <div className="flex justify-between items-center px-4 py-2 border-t text-xs flex-shrink-0"
                  style={{ borderColor: BRAND.btnBorder, color: BRAND.muted, background: BRAND.white }}>
                  <button onClick={goBack} className="inline-flex items-center gap-1 hover:underline">
                    <ChevronLeft className="w-3.5 h-3.5" /> {t("back")}
                  </button>
                  <button onClick={() => { reset(); setError(""); setFieldError({}); }} className="hover:underline">{t("restart")}</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
