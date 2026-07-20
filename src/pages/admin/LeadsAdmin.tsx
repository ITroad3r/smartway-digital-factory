import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Archive, UserPlus, Filter } from "lucide-react";

const STATUSES = [
  "awaiting_sales_call", "assigned", "call_attempted", "contacted",
  "qualified", "proposal_sent", "won", "lost", "archived",
] as const;
type Status = typeof STATUSES[number];

const PRIORITIES = ["low", "normal", "high"] as const;

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

export default function LeadsAdmin() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState<string>("");
  const [fService, setFService] = useState<string>("");
  const [fPriority, setFPriority] = useState<string>("");
  const [fUnassigned, setFUnassigned] = useState(false);
  const [fOverdue, setFOverdue] = useState(false);
  const [fMine, setFMine] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [stats, setStats] = useState<{ total: number; awaiting: number; overdue: number; won: number } | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("smartway_leads").select("*", { count: "exact" });
    if (fStatus) q = q.eq("status", fStatus);
    if (fService) q = q.eq("service_interest", fService);
    if (fPriority) q = q.eq("priority", fPriority);
    if (fUnassigned) q = q.is("assigned_to", null);
    if (fMine && user) q = q.eq("assigned_to", user.id);
    if (fOverdue) q = q.lt("next_follow_up_at", new Date().toISOString());
    if (search.trim()) {
      const s = `%${search.trim()}%`;
      q = q.or(`name.ilike.${s},company.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
    }
    const from = page * PAGE_SIZE;
    const { data, error, count } = await q
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setLeads((data as Lead[]) ?? []);
    setTotal(count ?? 0);
  };

  const loadStats = async () => {
    const [total, awaiting, won, overdue] = await Promise.all([
      supabase.from("smartway_leads").select("id", { count: "exact", head: true }),
      supabase.from("smartway_leads").select("id", { count: "exact", head: true }).eq("status", "awaiting_sales_call"),
      supabase.from("smartway_leads").select("id", { count: "exact", head: true }).eq("status", "won"),
      supabase.from("smartway_leads").select("id", { count: "exact", head: true }).lt("next_follow_up_at", new Date().toISOString()).not("next_follow_up_at", "is", null),
    ]);
    setStats({
      total: total.count ?? 0,
      awaiting: awaiting.count ?? 0,
      won: won.count ?? 0,
      overdue: overdue.count ?? 0,
    });
  };

  useEffect(() => { load(); }, [page, fStatus, fService, fPriority, fUnassigned, fOverdue, fMine]);
  useEffect(() => { loadStats(); }, []);

  return (
    <div className="space-y-5">
      <h1 className="display-serif text-3xl">Leads (Waya)</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Awaiting sales call" value={stats.awaiting} />
          <StatCard label="Overdue follow-ups" value={stats.overdue} />
          <StatCard label="Won" value={stats.won} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="eyebrow block mb-1">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(0), load())}
            placeholder="name, company, email, phone…" className="border border-border rounded-lg px-3 py-2 text-sm w-64" />
        </div>
        <FilterSelect label="Status" value={fStatus} onChange={(v) => { setFStatus(v); setPage(0); }} options={STATUSES as any} />
        <FilterSelect label="Service" value={fService} onChange={(v) => { setFService(v); setPage(0); }} options={Object.keys(SERVICE_LABEL)} formatter={(k) => SERVICE_LABEL[k] ?? k} />
        <FilterSelect label="Priority" value={fPriority} onChange={(v) => { setFPriority(v); setPage(0); }} options={PRIORITIES as any} />
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={fUnassigned} onChange={(e) => { setFUnassigned(e.target.checked); setPage(0); }} /> Unassigned</label>
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={fOverdue} onChange={(e) => { setFOverdue(e.target.checked); setPage(0); }} /> Overdue</label>
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={fMine} onChange={(e) => { setFMine(e.target.checked); setPage(0); }} /> Assigned to me</label>
        <button onClick={() => { setPage(0); load(); }} className="text-xs underline"><Filter className="inline w-3 h-3" /> Apply</button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-soft text-left">
            <tr>
              {["Name", "Company", "Service", "Phone", "Region", "Status", "Priority", "Assigned", "Created", "Next FU"].map(h => <th key={h} className="p-3 font-medium whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10} className="p-6 text-center"><Loader2 className="inline w-4 h-4 animate-spin" /></td></tr>}
            {!loading && leads.map((l) => (
              <tr key={l.id} onClick={() => setSelected(l)} className="border-t border-border cursor-pointer hover:bg-paper-soft">
                <td className="p-3">{l.name}</td>
                <td className="p-3">{l.company}</td>
                <td className="p-3">{SERVICE_LABEL[l.service_interest] ?? l.service_interest}</td>
                <td className="p-3 whitespace-nowrap">{l.phone}</td>
                <td className="p-3">{l.region ?? "—"}</td>
                <td className="p-3"><StatusPill value={l.status} /></td>
                <td className="p-3"><PriorityPill value={l.priority} /></td>
                <td className="p-3">{l.assigned_to ? l.assigned_to.slice(0, 8) : "—"}</td>
                <td className="p-3">{new Date(l.created_at).toLocaleDateString()}</td>
                <td className="p-3">{l.next_follow_up_at ? new Date(l.next_follow_up_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {!loading && leads.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No leads.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{total} total</p>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <span className="px-2">Page {page + 1}</span>
          <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>

      {selected && (
        <LeadDetail lead={selected} onClose={() => { setSelected(null); load(); loadStats(); }} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="eyebrow">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, formatter }: { label: string; value: string; onChange: (v: string) => void; options: string[]; formatter?: (v: string) => string }) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm">
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{formatter ? formatter(o) : o}</option>)}
      </select>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
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
  return <span className={`px-2 py-0.5 rounded-full text-[11px] ${color[value] ?? "bg-gray-100"}`}>{value}</span>;
}
function PriorityPill({ value }: { value: string }) {
  const color: Record<string, string> = { high: "bg-red-100 text-red-800", normal: "bg-gray-100 text-gray-700", low: "bg-gray-50 text-gray-500" };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] ${color[value] ?? "bg-gray-100"}`}>{value}</span>;
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState<Lead>(lead);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState(current.next_follow_up_at?.slice(0, 16) ?? "");
  const [busy, setBusy] = useState(false);

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
    toast.success("Updated");
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

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-elev w-full max-w-4xl max-h-[92vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="display-serif text-2xl">{current.name}</h2>
            <p className="text-sm text-muted-foreground">{current.company} · {current.email} · <span className="font-mono">{current.phone}</span></p>
          </div>
          <div className="flex gap-2">
            <StatusPill value={current.status} /> <PriorityPill value={current.priority} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="eyebrow">Service</p>
              <p className="text-sm">{SERVICE_LABEL[current.service_interest] ?? current.service_interest}</p>
            </div>
            <div>
              <p className="eyebrow">Qualification</p>
              <pre className="text-xs bg-paper p-3 rounded overflow-x-auto">{JSON.stringify(current.qualifying_answers, null, 2)}</pre>
            </div>
            {current.free_text && <div><p className="eyebrow">Free-text</p><p className="text-sm whitespace-pre-line">{current.free_text}</p></div>}
            <div className="grid grid-cols-3 text-xs gap-2">
              <div><p className="eyebrow">Size</p><p>{current.company_size ?? "—"}</p></div>
              <div><p className="eyebrow">Region</p><p>{current.region ?? "—"}</p></div>
              <div><p className="eyebrow">Industry</p><p>{current.industry ?? "—"}</p></div>
              <div><p className="eyebrow">Locale</p><p>{current.locale}</p></div>
              <div><p className="eyebrow">Requires human</p><p>{current.requires_human_followup ? "Yes" : "No"}</p></div>
              <div><p className="eyebrow">Assigned</p><p className="truncate">{current.assigned_to?.slice(0, 12) ?? "—"}</p></div>
            </div>
            {current.source_url && <p className="text-xs text-muted-foreground truncate">Source: {current.source_url}</p>}
            <p className="text-xs text-muted-foreground">Submitted {new Date(current.created_at).toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={claim} disabled={busy || current.assigned_to === user?.id} className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background inline-flex items-center gap-1"><UserPlus className="w-3 h-3" /> Claim</button>
              <button onClick={assignTo} disabled={busy} className="text-xs px-3 py-1.5 rounded-full border">Assign / reassign</button>
              <button onClick={archive} disabled={busy} className="text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1"><Archive className="w-3 h-3" /> Archive</button>
            </div>
            <div>
              <label className="eyebrow block mb-1">Status</label>
              <select value={current.status} onChange={(e) => changeStatus(e.target.value as Status)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow block mb-1">Priority</label>
              <select value={current.priority} onChange={(e) => changePriority(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow block mb-1">Next follow-up</label>
              <div className="flex gap-2">
                <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <button onClick={setFU} disabled={busy} className="text-xs px-3 py-1.5 rounded-full bg-foreground text-background">Save</button>
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-1">Add internal note</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button onClick={addNote} disabled={busy || !note.trim()} className="mt-2 text-xs px-3 py-1.5 rounded-full bg-foreground text-background">Add note</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="eyebrow mb-2">Activity history</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.map(a => (
              <div key={a.id} className="border-l-2 border-accent pl-3 py-1 text-sm">
                <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()} · {a.activity_type}</p>
                {a.message && <p>{a.message}</p>}
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-5 py-2.5 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
