import { useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, RotateCcw, ChevronLeft, Send, Check } from "lucide-react";
import wayaAsset from "@/assets/waya-avatar.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

const WAYA_AVATAR = wayaAsset.url;

type Lang = "fr" | "en";

// Service titles match the current published services in the Smartway website
// (see `services` table: title_fr / title_en).
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

// Q1 options are derived strictly from each service's existing title / tagline /
// description already published on the Smartway website.
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

type State = {
  step: "greeting" | "service" | "q1" | "q2" | "free_text" | "contact" | "submitting" | "done";
  service?: string;
  answers: { main?: string; stage?: string };
  free_text: string;
  contact: { name: string; email: string; phone: string; company: string; message: string };
  lead_id?: string;
};

const initialState: State = {
  step: "greeting",
  answers: {},
  free_text: "",
  contact: { name: "", email: "", phone: "", company: "", message: "" },
};

const T = {
  headerTitle: { fr: "Waya", en: "Waya" },
  headerSub: { fr: "L'assistant Smartway", en: "Smartway Assistant" },
  greeting: {
    fr: "Bonjour 👋 Je suis Waya, l'assistant Smartway. Je vais vous aider à identifier l'équipe adaptée à votre projet. Quel service recherchez-vous ?",
    en: "Hi 👋 I'm Waya, the Smartway assistant. I'll help you find the right team for your project. Which service are you looking for?",
  },
  chooseService: { fr: "Choisissez un service :", en: "Pick a service:" },
  q1: { fr: "Quel est votre besoin principal ?", en: "What is your main need?" },
  q2: { fr: "Où en êtes-vous actuellement ?", en: "Where are you today?" },
  freeTextPrompt: { fr: "Décrivez brièvement votre besoin.", en: "Briefly describe what you need." },
  contactIntro: {
    fr: "Laissez-nous vos coordonnées, un conseiller Smartway vous rappellera.",
    en: "Share your contact details and a Smartway advisor will call you back.",
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
  submitError: {
    fr: "Impossible d'envoyer maintenant. Vérifiez votre connexion et réessayez.",
    en: "Could not send right now. Please check your connection and try again.",
  },
  invalidEmail: { fr: "Email invalide", en: "Invalid email" },
  invalidPhone: { fr: "Téléphone invalide", en: "Invalid phone" },
  required: { fr: "Requis", en: "Required" },
  confirm: (name: string, phone: string, lang: Lang) => lang === "fr"
    ? `Merci, ${name} 👋 Votre demande a bien été enregistrée. Un conseiller commercial Smartway vous contactera prochainement au ${phone} afin d'échanger sur votre projet.`
    : `Thank you, ${name} 👋 Your request has been recorded. A Smartway sales representative will contact you shortly at ${phone} to discuss your project.`,
} as const;

const STORAGE_KEY = "waya-state-v2";
const LANG_KEY = "waya-lang";

// Brand palette (per updated spec)
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

  const startFlow = () => setState((s) => ({ ...s, step: "service" }));

  const chooseService = (value: string) => {
    setState((s) => ({
      ...s, service: value, answers: {},
      step: value === "general_enquiry" ? "free_text" : "q1",
    }));
  };

  const goBack = () => {
    setState((s) => {
      if (s.step === "service") return { ...s, step: "greeting" };
      if (s.step === "q1" || s.step === "free_text") return { ...s, step: "service" };
      if (s.step === "q2") return { ...s, step: "q1" };
      if (s.step === "contact") {
        if (s.service === "general_enquiry") return { ...s, step: "free_text" };
        return { ...s, step: "q2" };
      }
      return s;
    });
  };

  const validateContact = () => {
    const errs: Record<string, string> = {};
    const { name, email, phone } = state.contact;
    if (!name.trim()) errs.name = t("required");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t("invalidEmail");
    if (!phone.trim() || phone.replace(/[^\d+]/g, "").length < 6) errs.phone = t("invalidPhone");
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (submitting) return;
    if (!validateContact()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: state.contact.name.trim(),
        email: state.contact.email.trim(),
        phone: state.contact.phone.trim(),
        company: state.contact.company.trim() || "—",
        service_interest: state.service,
        qualifying_answers: state.answers,
        free_text: [state.free_text, state.contact.message].filter(Boolean).join("\n\n") || undefined,
        locale: lang,
        source_url: typeof window !== "undefined" ? window.location.href : undefined,
      };
      const { data, error: fnError } = await supabase.functions.invoke("submit-lead", { body: payload });
      if (fnError || !data?.ok) throw fnError || new Error("submit failed");
      setState((s) => ({ ...s, step: "done", lead_id: data.lead_id }));
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    } catch (e) {
      console.error(e);
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
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

  // ---------- Steps ----------
  const renderStep = () => {
    switch (state.step) {
      case "greeting":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("greeting")}</BotBubble>
            <button
              ref={focusRefFor(true) as any}
              onClick={startFlow}
              className="self-start rounded-full px-5 py-2 text-sm font-medium text-white"
              style={{ background: BRAND.blue }}
            >
              {lang === "fr" ? "C'est parti" : "Let's go"}
            </button>
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

      case "contact": {
        const c = state.contact;
        const setC = (patch: Partial<State["contact"]>) => setState((s) => ({ ...s, contact: { ...s.contact, ...patch } }));
        const inp = (
          name: keyof State["contact"], label: string, type = "text", maxLength = 160,
          isFirst = false, required = false,
        ) => (
          <div>
            <label className="block text-xs mb-1" style={{ color: BRAND.muted }}>
              {label}{required && <span style={{ color: BRAND.blue }}> *</span>}
            </label>
            <input
              ref={isFirst ? (focusRefFor(true) as any) : undefined}
              type={type}
              value={c[name]}
              maxLength={maxLength}
              onChange={(e) => setC({ [name]: e.target.value } as any)}
              className="w-full p-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderRadius: 12,
                border: `1px solid ${fieldError[name] ? "#ef4444" : BRAND.btnBorder}`,
                background: BRAND.white,
                color: BRAND.text,
              }}
            />
            {fieldError[name] && <p className="text-xs mt-1 text-red-600">{fieldError[name]}</p>}
          </div>
        );
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("contactIntro")}</BotBubble>
            <div className="grid gap-3">
              {inp("name", t("name"), "text", 120, true, true)}
              {inp("phone", t("phone"), "tel", 40, false, true)}
              {inp("email", t("email"), "email", 254, false, true)}
              {inp("company", t("company"), "text", 160)}
              <div>
                <label className="block text-xs mb-1" style={{ color: BRAND.muted }}>{t("message")}</label>
                <textarea
                  value={c.message}
                  maxLength={2000}
                  rows={3}
                  onChange={(e) => setC({ message: e.target.value })}
                  className="w-full p-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderRadius: 12, border: `1px solid ${BRAND.btnBorder}`, background: BRAND.white, color: BRAND.text }}
                />
              </div>
            </div>

            {/* Compact summary + edit */}
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

            <p className="text-xs" style={{ color: BRAND.muted }}>
              {t("consent")} <a href="/legal/privacy" target="_blank" rel="noopener" className="underline" style={{ color: BRAND.blue }}>{t("privacyLink")}</a>.
            </p>

            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" onChange={() => {}} />
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

            <div className="flex justify-end">
              <PrimaryBtn onClick={submit} disabled={submitting} className="inline-flex items-center gap-2">
                <Send className="w-4 h-4" /> {t("submit")}
              </PrimaryBtn>
            </div>
          </div>
        );
      }

      case "done":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{T.confirm(state.contact.name.split(" ")[0] || state.contact.name, state.contact.phone, lang)}</BotBubble>
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
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          aria-label={t("open")}
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-5 right-5 z-40 rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-4"
          style={{
            width: "clamp(56px, 8vw, 64px)",
            height: "clamp(56px, 8vw, 64px)",
            background: BRAND.white,
            boxShadow: "0 8px 24px rgba(27,42,74,0.25)",
          }}
        >
          <img src={WAYA_AVATAR} alt="Waya" className="w-full h-full rounded-full" style={{ objectFit: "contain" }} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="waya-title"
          className="fixed z-50 shadow-2xl flex flex-col overflow-hidden"
          style={{
            // Desktop dims (sm+): 420 wide, min(680, calc(100vh-48px)), 24px from edges.
            // Mobile (<sm): applied via inline style using media-agnostic values that also work on mobile.
            right: "max(8px, env(safe-area-inset-right))",
            bottom: "max(8px, env(safe-area-inset-bottom))",
            width: "min(420px, calc(100vw - 16px))",
            height: minimized ? 64 : "min(680px, calc(100dvh - 16px))",
            background: BRAND.chatBg,
            borderRadius: 16,
            border: `1px solid ${BRAND.btnBorder}`,
          }}
        >
          {/* Header (fixed) */}
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
              {/* Only this central area scrolls */}
              <div ref={scrollRef} aria-live="polite" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
                {renderStep()}
              </div>
              {/* Fixed bottom nav */}
              {state.step !== "greeting" && state.step !== "done" && (
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
