import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Settings, Briefcase, FileText, Mail, Users, Star, BarChart3, Heart } from "lucide-react";
import logo from "@/assets/logo-smartway.jpeg";
import Seo from "@/components/site/Seo";

function Sidebar() {
  const { signOut } = useAuth();
  const items = [
    { to: "/admin", label: "Site settings", icon: Settings, end: true },
    { to: "/admin/services", label: "Services", icon: Briefcase },
    { to: "/admin/blog", label: "Blog", icon: FileText },
    { to: "/admin/pillars", label: "Pillars & values", icon: Star },
    { to: "/admin/stats", label: "Stats", icon: BarChart3 },
    { to: "/admin/contacts", label: "Contact submissions", icon: Mail },
    { to: "/admin/newsletter", label: "Newsletter", icon: Users },
  ];
  return (
    <aside className="w-64 bg-paper-soft border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/"><img src={logo} alt="Smartway" className="h-9" /></Link>
        <p className="eyebrow mt-3">Backoffice</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-paper transition-colors">
            <i.icon className="h-4 w-4 text-muted-foreground" /> {i.label}
          </Link>
        ))}
      </nav>
      <button onClick={signOut} className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border border-border hover:bg-paper">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );
}

// ---------- Site settings ----------
function SettingsEditor() {
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setS(data)); }, []);
  if (!s) return <p>Loading…</p>;
  const fields: [string, string, boolean?][] = [
    ["contact_email", "Contact email"],
    ["contact_phone", "Contact phone"],
    ["linkedin_url", "LinkedIn URL"],
    ["address_en", "Address (EN)"],
    ["address_fr", "Address (FR)"],
    ["hero_headline_en", "Hero headline (EN)"],
    ["hero_headline_fr", "Hero headline (FR)"],
    ["hero_sub_en", "Hero sub (EN)", true],
    ["hero_sub_fr", "Hero sub (FR)", true],
    ["about_story_en", "About story (EN)", true],
    ["about_story_fr", "About story (FR)", true],
    ["mission_en", "Mission (EN)", true],
    ["mission_fr", "Mission (FR)", true],
    ["vision_en", "Vision (EN)", true],
    ["vision_fr", "Vision (FR)", true],
    ["differentiator_en", "Differentiator (EN)", true],
    ["differentiator_fr", "Differentiator (FR)", true],
    ["team_culture_en", "Team & culture (EN)", true],
    ["team_culture_fr", "Team & culture (FR)", true],
  ];
  const save = async () => {
    setBusy(true);
    const { id, updated_at, ...rest } = s;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };
  return (
    <div className="space-y-5">
      <h1 className="display-serif text-3xl">Site settings</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(([k, label, multi]) => (
          <div key={k} className={multi ? "md:col-span-2" : ""}>
            <label className="eyebrow block mb-2">{label}</label>
            {multi ? (
              <textarea rows={4} value={s[k] ?? ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm" />
            ) : (
              <input value={s[k] ?? ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm" />
            )}
          </div>
        ))}
      </div>
      <button onClick={save} disabled={busy} className="rounded-full bg-foreground text-background px-6 py-3 text-sm">Save changes</button>
    </div>
  );
}

// ---------- Generic CRUD list ----------
type FieldDef =
  | { key: string; label: string; type?: "text" | "textarea" | "number" | "bool" | "tags" | "url"; help?: string }
  | { type: "section"; label: string; key?: string };

function GenericTable({ title, table, columns, fields, orderBy = "sort_order" }: {
  title: string; table: string; columns: string[]; fields: FieldDef[]; orderBy?: string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const load = async () => {
    const { data } = await supabase.from(table as any).select("*").order(orderBy);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const { id, created_at, updated_at, ...rest } = editing;
    let res;
    if (id) res = await supabase.from(table as any).update(rest).eq("id", id);
    else res = await supabase.from(table as any).insert(rest);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Saved");
    setEditing(null);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="display-serif text-3xl">{title}</h1>
        <button onClick={() => setEditing({})} className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm">+ New</button>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-soft text-left">
            <tr>{columns.map((c) => <th key={c} className="p-3 font-medium">{c}</th>)}<th /></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border">
                {columns.map((c) => <td key={c} className="p-3">{String(it[c] ?? "").slice(0, 80)}</td>)}
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setEditing(it)} className="text-accent">Edit</button>
                  <button onClick={() => remove(it.id)} className="text-destructive">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-elev w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="display-serif text-2xl mb-6">{editing.id ? "Edit" : "Create"}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {fields.map((f, idx) => {
                if (f.type === "section") {
                  return (
                    <div key={`sec-${idx}`} className="md:col-span-2 mt-4 pt-4 border-t border-border">
                      <p className="eyebrow text-foreground">{f.label}</p>
                    </div>
                  );
                }
                const isWide = f.type === "textarea" || f.type === "tags" || f.type === "url";
                const val = editing[f.key];
                return (
                  <div key={f.key} className={isWide ? "md:col-span-2" : ""}>
                    <label className="eyebrow block mb-2">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea rows={4} value={val ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full bg-paper border border-border rounded-lg px-3 py-2 text-sm" />
                    ) : f.type === "bool" ? (
                      <input type="checkbox" checked={!!val} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} />
                    ) : f.type === "tags" ? (
                      <input
                        value={Array.isArray(val) ? val.join(", ") : (val ?? "")}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                        placeholder="comma, separated, tags"
                        className="w-full bg-paper border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                        value={val ?? ""}
                        onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                        className="w-full bg-paper border border-border rounded-lg px-3 py-2 text-sm"
                      />
                    )}
                    {f.help && <p className="text-[11px] text-muted-foreground mt-1">{f.help}</p>}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={save} className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesAdmin() {
  return <GenericTable title="Services" table="services" columns={["number", "slug", "title_en", "tagline_en"]}
    fields={[
      { key: "slug", label: "Slug" },
      { key: "number", label: "Number" },
      { key: "icon", label: "Icon (lucide name)" },
      { key: "sort_order", label: "Sort", type: "number" },
      { key: "title_en", label: "Title (EN)" },
      { key: "title_fr", label: "Title (FR)" },
      { key: "tagline_en", label: "Tagline (EN)", type: "textarea" },
      { key: "tagline_fr", label: "Tagline (FR)", type: "textarea" },
      { key: "description_en", label: "Description (EN)", type: "textarea" },
      { key: "description_fr", label: "Description (FR)", type: "textarea" },
    ]} />;
}
function BlogAdmin() {
  return <GenericTable title="Blog posts" table="blog_posts" columns={["slug", "title_en", "category", "published"]} orderBy="created_at"
    fields={[
      { key: "slug", label: "Slug" }, { key: "category", label: "Category" }, { key: "author", label: "Author" }, { key: "published", label: "Published", type: "bool" },
      { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
      { key: "excerpt_en", label: "Excerpt (EN)", type: "textarea" }, { key: "excerpt_fr", label: "Excerpt (FR)", type: "textarea" },
      { key: "content_en", label: "Content (EN)", type: "textarea" }, { key: "content_fr", label: "Content (FR)", type: "textarea" },
    ]} />;
}
function PillarsAdmin() {
  return <div className="space-y-12">
    <GenericTable title="Home pillars" table="home_pillars" columns={["sort_order", "title_en"]}
      fields={[
        { key: "sort_order", label: "Sort", type: "number" }, { key: "icon", label: "Icon" },
        { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
        { key: "description_en", label: "Description (EN)", type: "textarea" }, { key: "description_fr", label: "Description (FR)", type: "textarea" },
      ]} />
    <GenericTable title="About values" table="about_values" columns={["sort_order", "title_en"]}
      fields={[
        { key: "sort_order", label: "Sort", type: "number" }, { key: "icon", label: "Icon" },
        { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
        { key: "description_en", label: "Description (EN)", type: "textarea" }, { key: "description_fr", label: "Description (FR)", type: "textarea" },
      ]} />
  </div>;
}
function StatsAdmin() {
  return <GenericTable title="Stats" table="home_stats" columns={["sort_order", "value", "label_en"]}
    fields={[
      { key: "sort_order", label: "Sort", type: "number" },
      { key: "value", label: "Value (e.g. 50+)" },
      { key: "label_en", label: "Label (EN)" }, { key: "label_fr", label: "Label (FR)" },
    ]} />;
}
function ContactsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? [])); }, []);
  return (
    <div className="space-y-5">
      <h1 className="display-serif text-3xl">Contact submissions</h1>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{it.full_name} <span className="text-muted-foreground text-sm">· {it.email}</span></p>
                {it.company && <p className="text-xs text-muted-foreground">{it.company}</p>}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()}</p>
            </div>
            {it.service_interest && <p className="text-xs mt-2"><span className="eyebrow">Interested in</span> · {it.service_interest}</p>}
            <p className="mt-3 text-sm whitespace-pre-line">{it.message}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground">No submissions yet.</p>}
      </div>
    </div>
  );
}
function NewsletterAdmin() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? [])); }, []);
  return (
    <div className="space-y-5">
      <h1 className="display-serif text-3xl">Newsletter subscribers ({items.length})</h1>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {items.map((s) => (
          <div key={s.id} className="p-4 flex justify-between text-sm">
            <span>{s.email}</span>
            <span className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
        ))}
        {items.length === 0 && <p className="p-6 text-muted-foreground">No subscribers yet.</p>}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/auth" replace />;
  return (
    <>
      <Seo title="Admin — Smartway" />
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 p-10 max-w-5xl">
          <Routes>
            <Route index element={<SettingsEditor />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="blog" element={<BlogAdmin />} />
            <Route path="pillars" element={<PillarsAdmin />} />
            <Route path="stats" element={<StatsAdmin />} />
            <Route path="contacts" element={<ContactsAdmin />} />
            <Route path="newsletter" element={<NewsletterAdmin />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
