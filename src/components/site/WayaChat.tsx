import { useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, RotateCcw, ChevronLeft, Send } from "lucide-react";
import wayaAsset from "@/assets/waya-avatar.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

const WAYA_AVATAR = wayaAsset.url;

type Lang = "fr" | "en";

const SERVICES = [
  { value: "software_development", fr: "Développement logiciel & Ingénierie", en: "Software Development & Engineering" },
  { value: "cloud_devops",         fr: "Cloud & DevOps",                       en: "Cloud & DevOps Services" },
  { value: "data_ai",              fr: "Data & IA",                            en: "Data & AI Services" },
  { value: "ux_ui",                fr: "UX/UI Design",                         en: "UX/UI Design" },
  { value: "digital_strategy",     fr: "Stratégie digitale & Conseil agile",   en: "Digital Strategy & Agile Consulting" },
  { value: "integration_modernization", fr: "Intégration & Modernisation",     en: "Integration & Modernization" },
  { value: "cybersecurity_compliance",  fr: "Cybersécurité & Conformité",      en: "Cybersecurity & Compliance" },
  { value: "general_enquiry",      fr: "Je ne suis pas sûr / Demande générale", en: "Not sure / General enquiry" },
] as const;

type ChoiceOpt = { value: string; fr: string; en: string };
type Question = { key: string; fr: string; en: string; options: ChoiceOpt[] };
type QuestionSet = Question[];

const QUESTIONS: Record<string, QuestionSet> = {
  software_development: [
    { key: "project_type", fr: "Type de projet ?", en: "Project type?", options: [
      { value: "web_platform", fr: "Plateforme web", en: "Web platform" },
      { value: "mobile_app", fr: "Application mobile", en: "Mobile app" },
      { value: "business_app", fr: "Application métier", en: "Business application" },
      { value: "api_backend", fr: "API / Backend", en: "API or backend" },
      { value: "modernization", fr: "Modernisation d'un produit existant", en: "Modernization of an existing product" },
    ]},
    { key: "current_stage", fr: "État actuel ?", en: "Current stage?", options: [
      { value: "idea", fr: "Idée", en: "Idea" },
      { value: "specs", fr: "Cahier des charges disponible", en: "Specifications available" },
      { value: "existing", fr: "Produit existant", en: "Existing product" },
      { value: "maintenance", fr: "Maintenance et évolutions", en: "Maintenance and evolution" },
    ]},
    { key: "timeline", fr: "Échéance ?", en: "Timeline?", options: [
      { value: "urgent", fr: "Urgent", en: "Urgent" },
      { value: "1_3_months", fr: "1 à 3 mois", en: "Next 1–3 months" },
      { value: "later", fr: "Plus tard", en: "Later" },
      { value: "exploring", fr: "Exploration", en: "Exploring" },
    ]},
  ],
  cloud_devops: [
    { key: "current_env", fr: "Environnement actuel ?", en: "Current environment?", options: [
      { value: "on_prem", fr: "On-premise", en: "On-premises" },
      { value: "cloud", fr: "Cloud", en: "Cloud" },
      { value: "hybrid", fr: "Hybride", en: "Hybrid" },
      { value: "undecided", fr: "Non décidé", en: "Not decided" },
    ]},
    { key: "need", fr: "Besoin principal ?", en: "Primary need?", options: [
      { value: "migration", fr: "Migration cloud", en: "Cloud migration" },
      { value: "cicd_devops", fr: "CI/CD & DevOps", en: "CI-CD and DevOps" },
      { value: "automation", fr: "Automatisation d'infrastructure", en: "Infrastructure automation" },
      { value: "reliability", fr: "Fiabilité & monitoring", en: "Reliability and monitoring" },
      { value: "cost_opt", fr: "Optimisation des coûts cloud", en: "Cloud cost optimization" },
    ]},
    { key: "platform", fr: "Plateforme préférée ?", en: "Preferred platform?", options: [
      { value: "azure", fr: "Azure", en: "Azure" },
      { value: "aws", fr: "AWS", en: "AWS" },
      { value: "other_undecided", fr: "Autre / non décidé", en: "Other or not decided" },
    ]},
  ],
  data_ai: [
    { key: "need", fr: "Besoin ?", en: "Need?", options: [
      { value: "bi_dashboards", fr: "BI & dashboards", en: "BI and dashboards" },
      { value: "data_engineering", fr: "Data engineering", en: "Data engineering" },
      { value: "predictive", fr: "Analyses prédictives", en: "Predictive analytics" },
      { value: "gen_ai", fr: "IA générative / chatbot", en: "Generative AI or chatbot" },
      { value: "data_strategy", fr: "Stratégie data", en: "Data strategy" },
    ]},
    { key: "data_readiness", fr: "État des données ?", en: "Data readiness?", options: [
      { value: "structured", fr: "Structurées", en: "Structured" },
      { value: "fragmented", fr: "Fragmentées / désordonnées", en: "Fragmented or messy" },
      { value: "little_none", fr: "Peu ou pas de données", en: "Little or no usable data" },
    ]},
    { key: "timeline", fr: "Échéance ?", en: "Timeline?", options: [
      { value: "urgent", fr: "Urgent", en: "Urgent" },
      { value: "1_3_months", fr: "1 à 3 mois", en: "Next 1–3 months" },
      { value: "later", fr: "Plus tard", en: "Later" },
      { value: "exploring", fr: "Exploration", en: "Exploring" },
    ]},
  ],
  ux_ui: [
    { key: "need", fr: "Besoin ?", en: "Need?", options: [
      { value: "new_design", fr: "Nouveau design produit", en: "New product design" },
      { value: "redesign", fr: "Refonte", en: "Redesign" },
      { value: "ux_audit", fr: "Audit UX", en: "UX audit" },
      { value: "design_system", fr: "Design system", en: "Design system" },
      { value: "research_prototype", fr: "Recherche utilisateur & prototypage", en: "User research and prototyping" },
    ]},
    { key: "current_stage", fr: "Où en êtes-vous ?", en: "Current stage?", options: [
      { value: "idea", fr: "Idée", en: "Idea" },
      { value: "wireframes", fr: "Wireframes", en: "Wireframes" },
      { value: "existing_ui", fr: "Interface existante", en: "Existing interface" },
      { value: "live", fr: "Produit déjà en ligne", en: "Product already live" },
    ]},
    { key: "timeline", fr: "Échéance du livrable ?", en: "Deliverable timing?", options: [
      { value: "urgent", fr: "Urgent", en: "Urgent" },
      { value: "1_3_months", fr: "1 à 3 mois", en: "Next 1–3 months" },
      { value: "later", fr: "Plus tard", en: "Later" },
      { value: "exploring", fr: "Exploration", en: "Exploring" },
    ]},
  ],
  digital_strategy: [
    { key: "need", fr: "Besoin ?", en: "Need?", options: [
      { value: "roadmap", fr: "Roadmap digitale", en: "Digital roadmap" },
      { value: "agile_transfo", fr: "Transformation agile", en: "Agile transformation" },
      { value: "product_mgmt", fr: "Product management", en: "Product management" },
      { value: "process_automation", fr: "Automatisation & workflows", en: "Process automation and digital workflows" },
      { value: "operating_model", fr: "Amélioration de l'operating model", en: "Operating-model improvement" },
    ]},
    { key: "maturity", fr: "Maturité actuelle ?", en: "Current maturity?", options: [
      { value: "starting", fr: "Démarrage", en: "Starting" },
      { value: "in_progress", fr: "Initiatives en cours", en: "Initiatives already running" },
      { value: "optimize", fr: "Établi, à optimiser", en: "Established but needs optimization" },
    ]},
    { key: "timeline", fr: "Échéance ?", en: "Timeline?", options: [
      { value: "urgent", fr: "Urgent", en: "Urgent" },
      { value: "next_quarter", fr: "Trimestre prochain", en: "Next quarter" },
      { value: "later", fr: "Plus tard", en: "Later" },
      { value: "exploring", fr: "Exploration", en: "Exploring" },
    ]},
  ],
  integration_modernization: [
    { key: "need", fr: "Besoin ?", en: "Need?", options: [
      { value: "legacy_modern", fr: "Modernisation legacy", en: "Legacy modernization" },
      { value: "system_integration", fr: "Intégration de systèmes", en: "System integration" },
      { value: "api_platform", fr: "Plateforme API", en: "API platform" },
      { value: "erp_crm", fr: "Intégration ERP / CRM", en: "ERP or CRM integration" },
      { value: "app_migration", fr: "Migration applicative", en: "Application migration" },
    ]},
    { key: "landscape", fr: "Paysage actuel ?", en: "Current landscape?", options: [
      { value: "one_legacy", fr: "Une application legacy", en: "One legacy application" },
      { value: "disconnected", fr: "Plusieurs systèmes déconnectés", en: "Several disconnected systems" },
      { value: "partly_integrated", fr: "Partiellement intégré", en: "Partly integrated" },
      { value: "not_assessed", fr: "Pas encore évalué", en: "Not yet assessed" },
    ]},
    { key: "timeline", fr: "Échéance ?", en: "Timeline?", options: [
      { value: "urgent", fr: "Urgent", en: "Urgent" },
      { value: "1_3_months", fr: "1 à 3 mois", en: "Next 1–3 months" },
      { value: "later", fr: "Plus tard", en: "Later" },
      { value: "exploring", fr: "Exploration", en: "Exploring" },
    ]},
  ],
  cybersecurity_compliance: [
    { key: "need", fr: "Besoin ?", en: "Need?", options: [
      { value: "assessment", fr: "Évaluation de sécurité", en: "Security assessment" },
      { value: "sdlc_appsec", fr: "SDLC sécurisé / AppSec", en: "Secure SDLC or application security" },
      { value: "iam", fr: "Gestion des identités (IAM)", en: "IAM" },
      { value: "pentest", fr: "Test d'intrusion", en: "Penetration or security testing" },
      { value: "compliance", fr: "Accompagnement conformité", en: "Compliance support" },
      { value: "incident_concern", fr: "Préoccupation d'incident", en: "Incident concern" },
    ]},
    { key: "capability", fr: "Équipe sécurité interne ?", en: "Internal security capability?", options: [
      { value: "dedicated", fr: "Équipe dédiée", en: "Dedicated team" },
      { value: "small", fr: "Petite équipe", en: "Small team" },
      { value: "none", fr: "Aucune", en: "None" },
    ]},
    { key: "urgency", fr: "Urgence ?", en: "Urgency?", options: [
      { value: "active_concern", fr: "Préoccupation active", en: "Active concern" },
      { value: "planned", fr: "Initiative planifiée", en: "Planned initiative" },
      { value: "exploratory", fr: "Exploration", en: "Exploratory" },
    ]},
  ],
};

type State = {
  step: "greeting" | "service" | "qualify" | "free_text" | "size" | "region" | "industry" | "contact" | "review" | "submitting" | "done";
  service?: string;
  qIndex: number;
  answers: Record<string, string>;
  free_text: string;
  size: string;
  region: string;
  industry: string;
  contact: { name: string; email: string; phone: string; company: string };
  lead_id?: string;
};

const initialState: State = {
  step: "greeting",
  qIndex: 0,
  answers: {},
  free_text: "",
  size: "",
  region: "",
  industry: "",
  contact: { name: "", email: "", phone: "", company: "" },
};

const T = {
  headerTitle: { fr: "Waya", en: "Waya" },
  headerSub: { fr: "L'assistant Smartway", en: "Smartway Assistant" },
  greeting: {
    fr: "Bonjour 👋 Je suis Waya, l'assistant Smartway. Je vais vous aider à identifier l'équipe adaptée à votre projet. Quel service recherchez-vous ?",
    en: "Hi 👋 I'm Waya, the Smartway assistant. I'll help you find the right team for your project. Which service are you looking for?",
  },
  chooseService: { fr: "Choisissez un service :", en: "Pick a service:" },
  freeTextPrompt: { fr: "Décrivez brièvement votre besoin.", en: "Briefly describe what you need." },
  sizeQ: { fr: "Taille de votre entreprise ?", en: "Company size?" },
  regionQ: { fr: "Région ?", en: "Region?" },
  industryQ: { fr: "Secteur (optionnel)", en: "Industry (optional)" },
  contactIntro: {
    fr: "Pour que nos équipes vous rappellent, laissez-nous vos coordonnées :",
    en: "So our team can call you back, share your contact details:",
  },
  name: { fr: "Nom complet", en: "Full name" },
  email: { fr: "Email professionnel", en: "Professional email" },
  phone: { fr: "Téléphone (obligatoire — nous vous rappellerons)", en: "Phone (required — we'll call you)" },
  company: { fr: "Entreprise", en: "Company" },
  consent: {
    fr: "En envoyant, vous acceptez que Smartway vous contacte au sujet de votre demande. Voir notre",
    en: "By submitting, you agree that Smartway may contact you about your request. See our",
  },
  privacyLink: { fr: "politique de confidentialité", en: "privacy policy" },
  reviewTitle: { fr: "Récapitulatif", en: "Review" },
  edit: { fr: "Modifier", en: "Edit" },
  submit: { fr: "Envoyer ma demande", en: "Send my request" },
  back: { fr: "Retour", en: "Back" },
  restart: { fr: "Recommencer", en: "Restart" },
  next: { fr: "Suivant", en: "Next" },
  skip: { fr: "Passer", en: "Skip" },
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
  service: { fr: "Service", en: "Service" },
  companySize: { fr: "Taille", en: "Size" },
  region2: { fr: "Région", en: "Region" },
  industry2: { fr: "Secteur", en: "Industry" },
  yourAnswers: { fr: "Vos réponses", en: "Your answers" },
  yourContact: { fr: "Vos coordonnées", en: "Your contact" },
} as const;

const SIZES = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-250", label: "51–250" },
  { value: "250+", label: "250+" },
];
const REGIONS = [
  { value: "morocco", fr: "Maroc", en: "Morocco" },
  { value: "africa", fr: "Reste de l'Afrique", en: "Rest of Africa" },
  { value: "europe", fr: "Europe", en: "Europe" },
  { value: "other", fr: "Autre", en: "Other" },
];

const STORAGE_KEY = "waya-state-v1";
const LANG_KEY = "waya-lang";

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
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLElement | null>(null);

  const t = (k: keyof typeof T) => (T[k] as any)[lang] as string;

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => firstFocusRef.current?.focus(), 30);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 40);
    }
  }, [open, minimized, state.step, state.qIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const currentQuestions: QuestionSet = useMemo(
    () => (state.service && state.service !== "general_enquiry") ? QUESTIONS[state.service] : [],
    [state.service],
  );

  const startFlow = () => setState((s) => ({ ...s, step: "service" }));

  const chooseService = (value: string) => {
    setState((s) => ({
      ...s, service: value, qIndex: 0, answers: {},
      step: value === "general_enquiry" ? "free_text" : "qualify",
    }));
  };

  const answerQuestion = (opt: string) => {
    const q = currentQuestions[state.qIndex];
    setState((s) => {
      const nextAnswers = { ...s.answers, [q.key]: opt };
      const nextIndex = s.qIndex + 1;
      if (nextIndex >= currentQuestions.length) {
        return { ...s, answers: nextAnswers, qIndex: 0, step: "size" };
      }
      return { ...s, answers: nextAnswers, qIndex: nextIndex };
    });
  };

  const goBack = () => {
    setState((s) => {
      if (s.step === "service") return { ...s, step: "greeting" };
      if (s.step === "qualify") {
        if (s.qIndex > 0) return { ...s, qIndex: s.qIndex - 1 };
        return { ...s, step: "service" };
      }
      if (s.step === "free_text") return { ...s, step: "service" };
      if (s.step === "size") {
        if (s.service === "general_enquiry") return { ...s, step: "free_text" };
        return { ...s, step: "qualify", qIndex: currentQuestions.length - 1 };
      }
      if (s.step === "region") return { ...s, step: "size" };
      if (s.step === "industry") return { ...s, step: "region" };
      if (s.step === "contact") return { ...s, step: "industry" };
      if (s.step === "review") return { ...s, step: "contact" };
      return s;
    });
  };

  const validateContact = () => {
    const errs: Record<string, string> = {};
    const { name, email, phone, company } = state.contact;
    if (!name.trim()) errs.name = t("required");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t("invalidEmail");
    if (!phone.trim() || phone.replace(/[^\d+]/g, "").length < 6) errs.phone = t("invalidPhone");
    if (!company.trim()) errs.company = t("required");
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: state.contact.name.trim(),
        email: state.contact.email.trim(),
        phone: state.contact.phone.trim(),
        company: state.contact.company.trim(),
        service_interest: state.service,
        qualifying_answers: state.answers,
        free_text: state.free_text || undefined,
        company_size: state.size || undefined,
        region: state.region || undefined,
        industry: state.industry || undefined,
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

  // ---------- Rendering helpers ----------
  const brand = {
    navy: "#1B2A4A",
    blue: "#29ABE2",
    light: "#EAF8FD",
    bg: "#F7FAFC",
    muted: "#64748B",
  };

  const BotBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2 max-w-[92%]">
      <img src={WAYA_AVATAR} alt="" aria-hidden className="w-8 h-8 rounded-full object-contain bg-white flex-shrink-0" style={{ objectFit: "contain" }} />
      <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed" style={{ background: brand.light, color: brand.navy }}>
        {children}
      </div>
    </div>
  );

  const UserBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="self-end rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]" style={{ background: brand.navy, color: "white" }}>
      {children}
    </div>
  );

  const OptionButton = (props: { onClick: () => void; children: React.ReactNode; focusRef?: (el: HTMLButtonElement | null) => void }) => (
    <button
      ref={props.focusRef}
      onClick={props.onClick}
      className="w-full text-left rounded-xl border px-4 py-2.5 text-sm hover:bg-white transition-colors focus:outline-none focus:ring-2"
      style={{ borderColor: "rgba(41,171,226,0.35)", color: brand.navy }}
    >
      {props.children}
    </button>
  );

  // Small helper to attach the first-focus ref to the first interactive control in the current step
  const focusRefFor = (isFirst: boolean) => (el: HTMLElement | null) => {
    if (isFirst && el) firstFocusRef.current = el;
  };

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
              style={{ background: brand.blue }}
            >
              {lang === "fr" ? "C'est parti" : "Let's go"}
            </button>
          </div>
        );

      case "service":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("chooseService")}</BotBubble>
            <div className="flex flex-col gap-2">
              {SERVICES.map((s, i) => (
                <OptionButton key={s.value} focusRef={focusRefFor(i === 0)} onClick={() => chooseService(s.value)}>
                  {s[lang]}
                </OptionButton>
              ))}
            </div>
          </div>
        );

      case "qualify": {
        const q = currentQuestions[state.qIndex];
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>
              <span className="block text-xs opacity-70 mb-1">{state.qIndex + 1} / {currentQuestions.length}</span>
              {q[lang]}
            </BotBubble>
            <div className="flex flex-col gap-2">
              {q.options.map((o, i) => (
                <OptionButton key={o.value} focusRef={focusRefFor(i === 0)} onClick={() => answerQuestion(o.value)}>
                  {o[lang]}
                </OptionButton>
              ))}
            </div>
          </div>
        );
      }

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
              className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "rgba(41,171,226,0.35)" }}
            />
            <div className="flex justify-end">
              <button
                disabled={state.free_text.trim().length < 3}
                onClick={() => setState((s) => ({ ...s, step: "size" }))}
                className="rounded-full px-5 py-2 text-sm text-white disabled:opacity-50"
                style={{ background: brand.blue }}
              >{t("next")}</button>
            </div>
          </div>
        );

      case "size":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("sizeQ")}</BotBubble>
            <div className="flex flex-col gap-2">
              {SIZES.map((o, i) => (
                <OptionButton key={o.value} focusRef={focusRefFor(i === 0)}
                  onClick={() => setState((s) => ({ ...s, size: o.value, step: "region" }))}>
                  {o.label}
                </OptionButton>
              ))}
            </div>
          </div>
        );

      case "region":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("regionQ")}</BotBubble>
            <div className="flex flex-col gap-2">
              {REGIONS.map((o, i) => (
                <OptionButton key={o.value} focusRef={focusRefFor(i === 0)}
                  onClick={() => setState((s) => ({ ...s, region: o.value, step: "industry" }))}>
                  {o[lang]}
                </OptionButton>
              ))}
            </div>
          </div>
        );

      case "industry":
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("industryQ")}</BotBubble>
            <input
              ref={focusRefFor(true) as any}
              value={state.industry}
              maxLength={120}
              onChange={(e) => setState((s) => ({ ...s, industry: e.target.value }))}
              placeholder={lang === "fr" ? "Ex. Banque, retail, santé…" : "e.g. Banking, retail, healthcare…"}
              className="w-full rounded-xl border p-3 text-sm"
              style={{ borderColor: "rgba(41,171,226,0.35)" }}
            />
            <div className="flex justify-between">
              <button onClick={() => setState((s) => ({ ...s, industry: "", step: "contact" }))} className="text-sm underline" style={{ color: brand.muted }}>{t("skip")}</button>
              <button onClick={() => setState((s) => ({ ...s, step: "contact" }))}
                className="rounded-full px-5 py-2 text-sm text-white" style={{ background: brand.blue }}>{t("next")}</button>
            </div>
          </div>
        );

      case "contact": {
        const c = state.contact;
        const setC = (patch: Partial<State["contact"]>) => setState((s) => ({ ...s, contact: { ...s.contact, ...patch } }));
        const inp = (name: keyof State["contact"], label: string, type = "text", maxLength = 160, isFirst = false) => (
          <div>
            <label className="block text-xs mb-1" style={{ color: brand.muted }}>{label}</label>
            <input
              ref={isFirst ? (focusRefFor(true) as any) : undefined}
              type={type}
              value={c[name]}
              maxLength={maxLength}
              onChange={(e) => setC({ [name]: e.target.value } as any)}
              className="w-full rounded-xl border p-2.5 text-sm"
              style={{ borderColor: fieldError[name] ? "#ef4444" : "rgba(41,171,226,0.35)" }}
            />
            {fieldError[name] && <p className="text-xs mt-1 text-red-600">{fieldError[name]}</p>}
          </div>
        );
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("contactIntro")}</BotBubble>
            <div className="grid gap-3">
              {inp("name", t("name"), "text", 120, true)}
              {inp("email", t("email"), "email", 254)}
              {inp("phone", t("phone"), "tel", 40)}
              {inp("company", t("company"), "text", 160)}
            </div>
            <p className="text-xs" style={{ color: brand.muted }}>
              {t("consent")} <a href="/legal/privacy" target="_blank" rel="noopener" className="underline">{t("privacyLink")}</a>.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => { if (validateContact()) setState((s) => ({ ...s, step: "review" })); }}
                className="rounded-full px-5 py-2 text-sm text-white"
                style={{ background: brand.blue }}
              >{t("next")}</button>
            </div>
          </div>
        );
      }

      case "review": {
        const svc = SERVICES.find((s) => s.value === state.service);
        const answerLabel = (qKey: string, val: string) => {
          const q = currentQuestions.find((x) => x.key === qKey);
          const opt = q?.options.find((o) => o.value === val);
          return opt?.[lang] ?? val;
        };
        const regionLabel = REGIONS.find((r) => r.value === state.region)?.[lang] ?? state.region;
        return (
          <div className="flex flex-col gap-3">
            <BotBubble>{t("reviewTitle")}</BotBubble>
            <div className="rounded-2xl border p-4 text-sm space-y-2" style={{ borderColor: "rgba(41,171,226,0.35)", background: "white" }}>
              <p><span className="font-medium" style={{ color: brand.navy }}>{t("service")}:</span> {svc?.[lang]}</p>
              {Object.keys(state.answers).length > 0 && (
                <div>
                  <p className="font-medium mt-2" style={{ color: brand.navy }}>{t("yourAnswers")}:</p>
                  <ul className="list-disc ml-5">
                    {Object.entries(state.answers).map(([k, v]) => (
                      <li key={k}>{answerLabel(k, v)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {state.free_text && <p><span className="font-medium" style={{ color: brand.navy }}>—</span> {state.free_text}</p>}
              <p><span className="font-medium" style={{ color: brand.navy }}>{t("companySize")}:</span> {state.size}</p>
              <p><span className="font-medium" style={{ color: brand.navy }}>{t("region2")}:</span> {regionLabel}</p>
              {state.industry && <p><span className="font-medium" style={{ color: brand.navy }}>{t("industry2")}:</span> {state.industry}</p>}
              <div className="pt-2 mt-2 border-t" style={{ borderColor: "rgba(41,171,226,0.2)" }}>
                <p className="font-medium" style={{ color: brand.navy }}>{t("yourContact")}:</p>
                <p>{state.contact.name} · {state.contact.company}</p>
                <p>{state.contact.email} · {state.contact.phone}</p>
              </div>
              <button onClick={() => setState((s) => ({ ...s, step: "contact" }))} className="text-xs underline mt-2" style={{ color: brand.blue }}>
                {t("edit")}
              </button>
            </div>
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off"
              className="hidden" onChange={() => {}} />
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <div className="flex justify-end">
              <button
                ref={focusRefFor(true) as any}
                onClick={submit}
                disabled={submitting}
                className="rounded-full px-5 py-2.5 text-sm text-white inline-flex items-center gap-2 disabled:opacity-60"
                style={{ background: brand.blue }}
              >
                <Send className="w-4 h-4" /> {t("submit")}
              </button>
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
              style={{ background: brand.navy }}
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
            background: "white",
            boxShadow: "0 8px 24px rgba(27,42,74,0.25)",
            ringColor: brand.blue,
          }}
        >
          <img src={WAYA_AVATAR} alt="Waya" className="w-full h-full rounded-full" style={{ objectFit: "contain" }} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="waya-title"
          className="fixed z-50 shadow-2xl flex flex-col overflow-hidden bottom-0 right-0 sm:bottom-5 sm:right-5"
          style={{
            width: "min(400px, 100vw)",
            height: minimized ? 64 : "min(640px, calc(100vh - 32px))",
            background: brand.bg,
            borderRadius: "16px",
            border: `1px solid ${brand.light}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: brand.navy }}>
            <img src={WAYA_AVATAR} alt="" aria-hidden className="rounded-full bg-white flex-shrink-0"
              style={{ width: 44, height: 44, objectFit: "contain" }} />
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
              <div ref={scrollRef} aria-live="polite" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {renderStep()}
              </div>
              {state.step !== "greeting" && state.step !== "done" && (
                <div className="flex justify-between items-center px-4 py-2 border-t text-xs" style={{ borderColor: brand.light, color: brand.muted }}>
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
