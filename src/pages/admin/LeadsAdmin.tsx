import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, Archive, UserPlus, Filter, PhoneCall, PhoneOff, CheckCircle2, Send, Trophy, XCircle } from "lucide-react";

const STATUSES = [
  "awaiting_sales_call", "awaiting_support", "assigned", "call_attempted", "contacted",
  "qualified", "proposal_sent", "won", "lost", "archived",
] as const;
type Status = typeof STATUSES[number];

const PRIORITIES = ["low", "normal", "high"] as const;

const STATUS_LABELS: Record<Status, { en: string; fr: string }> = {
  awaiting_sales_call: { en: "Awaiting call", fr: "En attente d'appel" },
  awaiting_support: { en: "Awaiting support", fr: "En attente d'assistance" },
  assigned: { en: "Assigned", fr: "Assignée" },
  call_attempted: { en: "Call attempted", fr: "Tentative d'appel" },
  contacted: { en: "Contacted", fr: "Contacté" },
  qualified: { en: "Qualified", fr: "Qualifié" },
  proposal_sent: { en: "Proposal sent", fr: "Proposition envoyée" },
  won: { en: "Won", fr: "Gagné" },
  lost: { en: "Lost", fr: "Perdu" },
  archived: { en: "Archived", fr: "Archivé" },
};

const SERVICE_LABEL: Record<string, string> = {
  software_development: "Software Dev.",
  cloud_devops: "Cloud & DevOps",
  data_ai: "Data & AI",
  ux_ui: "UX/UI",
  digital_strategy: "Digital Strategy",
  integration_modernization: "Integration",
  cybersecurity_compliance: "Cybersecurity",
  general_enquiry: "General",
};

const UI = {
  title: { en: "Customer demands", fr: "Demandes clients" },
  subtitle: { en: "Leads received via Waya", fr: "Demandes reçues via Waya" },
  search: { en: "Search", fr: "Rechercher" },
  searchPh: { en: "name, company, email, phone…", fr: "nom, société, email, téléphone…" },
  status: { en: "Status", fr: "Statut" },
  service: { en: "Service", fr: "Service" },
  priority: { en: "Priority", fr: "Priorité" },
  unassigned: { en: "Unassigned", fr: "Non assignées" },
  overdue: { en: "Overdue", fr: "En retard" },
  mine: { en: "Assigned to me", fr: "Mes demandes" },
  from: { en: "From", fr: "Du" },
  to: { en: "To", fr: "Au" },
  apply: { en: "Apply", fr: "Appliquer" },
  reset: { en: "Reset", fr: "Réinitialiser" },
  all: { en: "All", fr: "Toutes" },
  none: { en: "No demands.", fr: "Aucune demande." },
  loadErr: { en: "Could not load demands. Please retry.", fr: "Impossible de charger les demandes. Réessayez." },
  unauthorized: { en: "You don't have access to customer demands.", fr: "Vous n'avez pas accès aux demandes clients." },
  total: { en: "Total", fr: "Total" },
  awaiting: { en: "Awaiting call", fr: "En attente d'appel" },
  dueToday: { en: "Follow-ups today", fr: "Relances aujourd'hui" },
  overdueStat: { en: "Overdue", fr: "En retard" },
  qualifiedStat: { en: "Qualified", fr: "Qualifiées" },
  wonStat: { en: "Won", fr: "Gagnées" },
  unassignedStat: { en: "Unassigned", fr: "Non assignées" },
  columns: {
    en: ["Date", "Name", "Company", "Phone", "Email", "Service", "Main answer", "Status", "Assigned", "Next FU", ""],
    fr: ["Date", "Nom", "Société", "Téléphone", "Email", "Service", "Réponse", "Statut", "Assigné", "Relance", ""],
  },
};

type Lead = {
  id: string;
  name: string; email: string; phone: string; company: string;
  service_interest: string;
  status: Status;
  priority: string;
  region: string | null;
  assigned_to: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  archived_at: string | null;
  qualifying_answers: any;
  company_size: string | null;
  industry: string | null;
  locale: string;
  source_url: string | null;
  requires_human_followup: boolean;
  free_text: string | null;
  notes: string | null;
};

type Activity = {
  id: string; lead_id: string; actor: string | null; activity_type: string;
  message: string | null; metadata: any; created_at: string;
};

const PAGE_SIZE = 25;

const firstAnswer = (a: any): string => {
  if (!a || typeof a !== "object") return "—";
  const v = Object.values(a).find((x) => typeof x === "string" && x);
  return (v as string) ?? "—";
};

export default function LeadsAdmin() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const L = (k: keyof typeof UI) => (UI[k] as any)[lang];

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fService, setFService] = useState("");
  const [fPriority, setFPriority] = useState("");
  const [fUnassigned, setFUnassigned] = useState(false);
  const [fOverdue, setFOverdue] = useState(false);
  const [fMine, setFMine] = useState(false);
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [stats, setStats] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    let q = supabase.from("smartway_leads").select("*", { count: "exact" });
    if (fStatus) q = q.eq("status", fStatus);
    if (fService) q = q.eq("service_interest", fService);
    if (fPriority) q = q.eq("priority", fPriority);
    if (fUnassigned) q = q.is("assigned_to", null);
    if (fMine && user) q = q.eq("assigned_to", user.id);
    if (fOverdue) q = q.lt("next_follow_up_at", new Date().toISOString());
    if (fFrom) q = q.gte("created_at", new Date(fFrom).toISOString());
    if (fTo) q = q.lte("created_at", new Date(fTo + "T23:59:59").toISOString());
    if (search.trim()) {
      const s = `%${search.trim()}%`;
      q = q.or(`name.ilike.${s},company.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
    }
    const from = page * PAGE_SIZE;
    const { data, error, count } = await q.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
    setLoading(false);
    if (error) { setError(L("loadErr")); return; }
    setLeads((data as Lead[]) ?? []);
    setTotal(count ?? 0);
  };

  const loadStats = async () => {
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(); endToday.setHours(23, 59, 59, 999);
    const c = (b: any) => b.select("id", { count: "exact", head: true });
    const [total, awaiting, won, overdue, qualified, unassigned, dueToday] = await Promise.all([
      c(supabase.from("smartway_leads")),
      c(supabase.from("smartway_leads")).eq("status", "awaiting_sales_call"),
      c(supabase.from("smartway_leads")).eq("status", "won"),
      c(supabase.from("smartway_leads")).lt("next_follow_up_at", new Date().toISOString()).not("next_follow_up_at", "is", null),
      c(supabase.from("smartway_leads")).eq("status", "qualified"),
      c(supabase.from("smartway_leads")).is("assigned_to", null),
      c(supabase.from("smartway_leads")).gte("next_follow_up_at", startToday.toISOString()).lte("next_follow_up_at", endToday.toISOString()),
    ]);
    setStats({
      total: total.count ?? 0,
      awaiting: awaiting.count ?? 0,
      won: won.count ?? 0,
      overdue: overdue.count ?? 0,
      qualified: qualified.count ?? 0,
      unassigned: unassigned.count ?? 0,
      dueToday: dueToday.count ?? 0,
    });
  };

  useEffect(() => { load(); }, [page, fStatus, fService, fPriority, fUnassigned, fOverdue, fMine, fFrom, fTo]);
  useEffect(() => { loadStats(); }, []);

  const resetFilters = () => {
    setSearch(""); setFStatus(""); setFService(""); setFPriority("");
    setFUnassigned(false); setFOverdue(false); setFMine(false);
    setFFrom(""); setFTo(""); setPage(0);
  };

  const cols = UI.columns[lang];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display-serif text-3xl">{L("title")}</h1>
        <p className="text-sm text-muted-foreground">{L("subtitle")}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label={L("total")} value={stats.total} />
          <StatCard label={L("awaiting")} value={stats.awaiting} accent="blue" />
          <StatCard label={L("unassignedStat")} value={stats.unassigned} accent="amber" />
          <StatCard label={L("dueToday")} value={stats.dueToday} accent="indigo" />
          <StatCard label={L("overdueStat")} value={stats.overdue} accent="red" />
          <StatCard label={L("qualifiedStat")} value={stats.qualified} accent="emerald" />
          <StatCard label={L("wonStat")} value={stats.won} accent="green" />
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="eyebrow block mb-1">{L("search")}</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(0), load())}
            placeholder={L("searchPh")} className="border border-border rounded-lg px-3 py-2 text-sm w-64" />
        </div>
        <FilterSelect label={L("status")} allLabel={L("all")} value={fStatus} onChange={(v) => { setFStatus(v); setPage(0); }} options={STATUSES as any} formatter={(s) => STATUS_LABELS[s as Status]?.[lang] ?? s} />
        <FilterSelect label={L("service")} allLabel={L("all")} value={fService} onChange={(v) => { setFService(v); setPage(0); }} options={Object.keys(SERVICE_LABEL)} formatter={(k) => SERVICE_LABEL[k] ?? k} />
        <FilterSelect label={L("priority")} allLabel={L("all")} value={fPriority} onChange={(v) => { setFPriority(v); setPage(0); }} options={PRIORITIES as any} />
        <div>
          <label className="eyebrow block mb-1">{L("from")}</label>
          <input type="date" value={fFrom} onChange={(e) => { setFFrom(e.target.value); setPage(0); }} className="border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="eyebrow block mb-1">{L("to")}</label>
          <input type="date" value={fTo} onChange={(e) => { setFTo(e.target.value); setPage(0); }} className="border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={fUnassigned} onChange={(e) => { setFUnassigned(e.target.checked); setPage(0); }} /> {L("unassigned")}</label>
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={fOverdue} onChange={(e) => { setFOverdue(e.target.checked); setPage(0); }} /> {L("overdue")}</label>
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={fMine} onChange={(e) => { setFMine(e.target.checked); setPage(0); }} /> {L("mine")}</label>
        <button onClick={() => { setPage(0); load(); }} className="text-xs underline"><Filter className="inline w-3 h-3" /> {L("apply")}</button>
        <button onClick={resetFilters} className="text-xs underline text-muted-foreground">{L("reset")}</button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-soft text-left">
            <tr>{cols.map((h, i) => <th key={i} className="p-3 font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={cols.length} className="p-6 text-center"><Loader2 className="inline w-4 h-4 animate-spin" /></td></tr>}
            {!loading && error && <tr><td colSpan={cols.length} className="p-6 text-center text-red-600">{error}</td></tr>}
            {!loading && !error && leads.map((l) => (
              <tr key={l.id} onClick={() => setSelected(l)} className="border-t border-border cursor-pointer hover:bg-paper-soft">
                <td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleDateString()}</td>
                <td className="p-3">{l.name}</td>
                <td className="p-3">{l.company}</td>
                <td className="p-3 whitespace-nowrap">{l.phone}</td>
                <td className="p-3 truncate max-w-[180px]">{l.email}</td>
                <td className="p-3">{SERVICE_LABEL[l.service_interest] ?? l.service_interest}</td>
                <td className="p-3 truncate max-w-[180px] text-muted-foreground">{firstAnswer(l.qualifying_answers)}</td>
                <td className="p-3"><StatusPill value={l.status} lang={lang} /></td>
                <td className="p-3">{l.assigned_to ? l.assigned_to.slice(0, 8) : "—"}</td>
                <td className="p-3 whitespace-nowrap">{l.next_follow_up_at ? new Date(l.next_follow_up_at).toLocaleDateString() : "—"}</td>
                <td className="p-3 text-xs underline">Open</td>
              </tr>
            ))}
            {!loading && !error && leads.length === 0 && <tr><td colSpan={cols.length} className="p-6 text-center text-muted-foreground">{L("none")}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && <div className="p-6 text-center"><Loader2 className="inline w-4 h-4 animate-spin" /></div>}
        {!loading && error && <div className="p-6 text-center text-red-600 rounded-xl border">{error}</div>}
        {!loading && !error && leads.map((l) => (
          <button key={l.id} onClick={() => setSelected(l)} className="w-full text-left rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.company}</p>
              </div>
              <StatusPill value={l.status} lang={lang} />
            </div>
            <p className="text-xs">{SERVICE_LABEL[l.service_interest] ?? l.service_interest} · <span className="font-mono">{l.phone}</span></p>
            <p className="text-xs text-muted-foreground truncate">{firstAnswer(l.qualifying_answers)}</p>
            <p className="text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleString()}{l.next_follow_up_at ? ` · FU ${new Date(l.next_follow_up_at).toLocaleDateString()}` : ""}</p>
          </button>
        ))}
        {!loading && !error && leads.length === 0 && <div className="p-6 text-center text-muted-foreground rounded-xl border">{L("none")}</div>}
      </div>

      <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{total} total</p>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <span className="px-2">Page {page + 1}</span>
          <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>

      {selected && <LeadDetail lead={selected} lang={lang} onClose={() => { setSelected(null); load(); loadStats(); }} />}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const bg: Record<string, string> = {
    blue: "border-blue-200", amber: "border-amber-200", indigo: "border-indigo-200",
    red: "border-red-200", emerald: "border-emerald-200", green: "border-green-300",
  };
  return (
    <div className={`rounded-xl border ${accent ? bg[accent] : "border-border"} bg-card p-4`}>
      <p className="eyebrow">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function FilterSelect({ label, allLabel, value, onChange, options, formatter }: { label: string; allLabel: string; value: string; onChange: (v: string) => void; options: string[]; formatter?: (v: string) => string }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm">
        <option value="">{allLabel}</option>
        {options.map(o => <option key={o} value={o}>{formatter ? formatter(o) : o}</option>)}
      </select>
    </div>
  );
}

function StatusPill({ value, lang }: { value: string; lang: "en" | "fr" }) {
  const color: Record<string, string> = {
    awaiting_sales_call: "bg-blue-100 text-blue-800",
    assigned: "bg-indigo-100 text-indigo-800",
    call_attempted: "bg-yellow-100 text-yellow-800",
    contacted: "bg-teal-100 text-teal-800",
    qualified: "bg-emerald-100 text-emerald-800",
    proposal_sent: "bg-purple-100 text-purple-800",
    won: "bg-green-200 text-green-900",
    lost: "bg-red-100 text-red-800",
    archived: "bg-gray-200 text-gray-700",
  };
  const label = STATUS_LABELS[value as Status]?.[lang] ?? value;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap ${color[value] ?? "bg-gray-100"}`}>{label}</span>;
}
function PriorityPill({ value }: { value: string }) {
  const color: Record<string, string> = { high: "bg-red-100 text-red-800", normal: "bg-gray-100 text-gray-700", low: "bg-gray-50 text-gray-500" };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] ${color[value] ?? "bg-gray-100"}`}>{value}</span>;
}

function LeadDetail({ lead, lang, onClose }: { lead: Lead; lang: "en" | "fr"; onClose: () => void }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState<Lead>(lead);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState(current.next_follow_up_at?.slice(0, 16) ?? "");
  const [busy, setBusy] = useState(false);

  const T = {
    close: { en: "Close", fr: "Fermer" },
    service: { en: "Service", fr: "Service" },
    qualification: { en: "Qualification answers", fr: "Réponses de qualification" },
    additional: { en: "Additional message", fr: "Message additionnel" },
    language: { en: "Language", fr: "Langue" },
    submitted: { en: "Submitted", fr: "Soumis le" },
    source: { en: "Source page", fr: "Page source" },
    claim: { en: "Claim", fr: "Prendre" },
    assign: { en: "Assign / reassign", fr: "Assigner" },
    archive: { en: "Archive", fr: "Archiver" },
    status: { en: "Status", fr: "Statut" },
    priority: { en: "Priority", fr: "Priorité" },
    nextFU: { en: "Next follow-up", fr: "Prochaine relance" },
    save: { en: "Save", fr: "Enregistrer" },
    note: { en: "Add internal note", fr: "Note interne" },
    addNote: { en: "Add note", fr: "Ajouter" },
    history: { en: "Activity history", fr: "Historique" },
    noneAct: { en: "No activity yet.", fr: "Aucune activité." },
    quick: { en: "Quick actions", fr: "Actions rapides" },
  } as const;
  const t = (k: keyof typeof T) => T[k][lang];

  const loadAct = async () => {
    const { data } = await supabase.from("lead_activities").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false });
    setActivities((data as Activity[]) ?? []);
  };
  useEffect(() => { loadAct(); }, [lead.id]);

  const patch = async (updates: Partial<Lead>, activity: { type: string; message: string; metadata?: any }) => {
    setBusy(true);
    const { data, error } = await supabase.from("smartway_leads").update(updates).eq("id", lead.id).select("*").single();
    if (error) { setBusy(false); toast.error(error.message); return; }
    setCurrent(data as Lead);
    if (user) {
      await supabase.from("lead_activities").insert({
        lead_id: lead.id, actor: user.id, activity_type: activity.type,
        message: activity.message, metadata: activity.metadata ?? {},
      });
    }
    await loadAct();
    setBusy(false);
    toast.success("✓");
  };

  const claim = () => user && patch({ assigned_to: user.id, status: current.status === "awaiting_sales_call" ? "assigned" : current.status },
    { type: "claim", message: "Lead claimed" });
  const changeStatus = (s: Status) => patch({ status: s }, { type: "status_change", message: `Status → ${s}`, metadata: { from: current.status, to: s } });
  const changePriority = (p: string) => patch({ priority: p }, { type: "priority_change", message: `Priority → ${p}`, metadata: { to: p } });
  const setFU = () => patch({ next_follow_up_at: followUp ? new Date(followUp).toISOString() : null }, { type: "follow_up_set", message: `Follow-up: ${followUp || "cleared"}` });
  const addNote = async () => {
    if (!note.trim() || !user) return;
    setBusy(true);
    const { error } = await supabase.from("lead_activities").insert({
      lead_id: lead.id, actor: user.id, activity_type: "internal_note", message: note.trim(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setNote(""); loadAct();
  };
  const archive = () => patch({ archived_at: new Date().toISOString(), status: "archived" }, { type: "archived", message: "Lead archived" });
  const assignTo = async () => {
    const uid = prompt("Assign to user id (UUID)?", current.assigned_to ?? "");
    if (uid === null) return;
    patch({ assigned_to: uid || null }, { type: "assign", message: uid ? `Assigned to ${uid.slice(0, 8)}` : "Unassigned", metadata: { assignee: uid || null } });
  };

  const quickActions: { s: Status; icon: any; label: { en: string; fr: string } }[] = [
    { s: "call_attempted", icon: PhoneOff, label: { en: "Call attempted", fr: "Tentative d'appel" } },
    { s: "contacted", icon: PhoneCall, label: { en: "Contacted", fr: "Contacté" } },
    { s: "qualified", icon: CheckCircle2, label: { en: "Qualified", fr: "Qualifié" } },
    { s: "proposal_sent", icon: Send, label: { en: "Proposal sent", fr: "Proposition" } },
    { s: "won", icon: Trophy, label: { en: "Won", fr: "Gagné" } },
    { s: "lost", icon: XCircle, label: { en: "Lost", fr: "Perdu" } },
  ];

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-elev w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4 gap-3">
          <div>
            <h2 className="display-serif text-2xl">{current.name}</h2>
            <p className="text-sm text-muted-foreground">{current.company} · {current.email} · <span className="font-mono">{current.phone}</span></p>
          </div>
          <div className="flex gap-2 shrink-0">
            <StatusPill value={current.status} lang={lang} /> <PriorityPill value={current.priority} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="eyebrow">{t("service")}</p>
              <p className="text-sm">{SERVICE_LABEL[current.service_interest] ?? current.service_interest}</p>
            </div>
            <div>
              <p className="eyebrow">{t("qualification")}</p>
              <pre className="text-xs bg-paper p-3 rounded overflow-x-auto whitespace-pre-wrap">{JSON.stringify(current.qualifying_answers, null, 2)}</pre>
            </div>
            {current.free_text && <div><p className="eyebrow">{t("additional")}</p><p className="text-sm whitespace-pre-line">{current.free_text}</p></div>}
            <div className="grid grid-cols-3 text-xs gap-2">
              <div><p className="eyebrow">Size</p><p>{current.company_size ?? "—"}</p></div>
              <div><p className="eyebrow">Region</p><p>{current.region ?? "—"}</p></div>
              <div><p className="eyebrow">Industry</p><p>{current.industry ?? "—"}</p></div>
              <div><p className="eyebrow">{t("language")}</p><p className="uppercase">{current.locale}</p></div>
              <div><p className="eyebrow">Requires human</p><p>{current.requires_human_followup ? "Yes" : "No"}</p></div>
              <div><p className="eyebrow">Assigned</p><p className="truncate">{current.assigned_to?.slice(0, 12) ?? "—"}</p></div>
            </div>
            {current.source_url && <p className="text-xs text-muted-foreground truncate"><span className="eyebrow">{t("source")}:</span> {current.source_url}</p>}
            <p className="text-xs text-muted-foreground">{t("submitted")} {new Date(current.created_at).toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={claim} disabled={busy || current.assigned_to === user?.id} className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background inline-flex items-center gap-1 disabled:opacity-40"><UserPlus className="w-3 h-3" /> {t("claim")}</button>
              <button onClick={assignTo} disabled={busy} className="text-xs px-3 py-1.5 rounded-full border">{t("assign")}</button>
              <button onClick={archive} disabled={busy} className="text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1"><Archive className="w-3 h-3" /> {t("archive")}</button>
            </div>

            <div>
              <p className="eyebrow mb-1">{t("quick")}</p>
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map(({ s, icon: Icon, label }) => (
                  <button key={s} onClick={() => changeStatus(s)} disabled={busy || current.status === s}
                    className="text-[11px] px-2.5 py-1 rounded-full border inline-flex items-center gap-1 hover:bg-paper-soft disabled:opacity-40">
                    <Icon className="w-3 h-3" /> {label[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-1">{t("status")}</label>
              <select value={current.status} onChange={(e) => changeStatus(e.target.value as Status)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s][lang]}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow block mb-1">{t("priority")}</label>
              <select value={current.priority} onChange={(e) => changePriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow block mb-1">{t("nextFU")}</label>
              <div className="flex gap-2">
                <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <button onClick={setFU} disabled={busy} className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background">{t("save")}</button>
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-1">{t("note")}</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button onClick={addNote} disabled={busy || !note.trim()} className="mt-2 text-xs px-3 py-1.5 rounded-full bg-foreground text-background">{t("addNote")}</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="eyebrow mb-2">{t("history")}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.map(a => (
              <div key={a.id} className="border-l-2 border-accent pl-3 py-1 text-sm">
                <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()} · {a.activity_type}</p>
                {a.message && <p>{a.message}</p>}
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted-foreground">{t("noneAct")}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-5 py-2.5 text-sm">{t("close")}</button>
        </div>
      </div>
    </div>
  );
}
