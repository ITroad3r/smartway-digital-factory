import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Settings, Briefcase, FileText, Mail, Users, Star, BarChart3, Building2, Trophy, BookOpen, HelpCircle, Scale, Inbox } from "lucide-react";
import logo from "@/assets/logo-smartway.jpeg";
import Seo from "@/components/site/Seo";
import ImageUpload from "@/components/site/ImageUpload";
import RichTextEditor from "@/components/site/RichTextEditor";
import LeadsAdmin from "./admin/LeadsAdmin";
import { useI18n } from "@/lib/i18n";

function Sidebar() {
  const { signOut } = useAuth();
  const { lang } = useI18n();
  const items = [
    { to: "/admin", label: "Site settings", icon: Settings, end: true },
    { to: "/admin/leads", label: lang === "fr" ? "Demandes clients" : "Customer demands", icon: Inbox },
    { to: "/admin/services", label: "Services", icon: Briefcase },
    { to: "/admin/industries", label: "Industries", icon: Building2 },
    { to: "/admin/cases", label: "Case Studies", icon: Trophy },
    { to: "/admin/resources", label: "Resources", icon: BookOpen },
    { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    { to: "/admin/legal", label: "Legal pages", icon: Scale },
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
    ["facebook_url", "Facebook URL"],
    ["instagram_url", "Instagram URL"],
    ["twitter_url", "X (Twitter) URL"],
    ["tiktok_url", "TikTok URL"],
    ["youtube_url", "YouTube URL"],
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
    // SEO defaults
    ["site_name", "Site name (SEO)"],
    ["twitter_handle", "Twitter handle (e.g. @smartway)"],
    ["organization_name", "Organization name (JSON-LD)"],
    ["organization_logo", "Organization logo URL (JSON-LD)"],
    ["default_seo_title_en", "Default SEO title (EN)"],
    ["default_seo_title_fr", "Default SEO title (FR)"],
    ["default_seo_description_en", "Default meta description (EN)", true],
    ["default_seo_description_fr", "Default meta description (FR)", true],
    ["default_og_image", "Default Open Graph image URL"],
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
  | { key: string; label: string; type?: "text" | "textarea" | "richtext" | "number" | "bool" | "tags" | "url" | "image"; help?: string }
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
    // Auto-parse JSON strings (for JSONB columns edited as textarea)
    for (const k of Object.keys(rest)) {
      const v = rest[k];
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          try { rest[k] = JSON.parse(trimmed); } catch { /* leave as string */ }
        }
      }
    }
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
                const isWide = f.type === "textarea" || f.type === "richtext" || f.type === "tags" || f.type === "url" || f.type === "image";
                const val = editing[f.key];
                return (
                  <div key={f.key} className={isWide ? "md:col-span-2" : ""}>
                    <label className="eyebrow block mb-2">{f.label}</label>
                    {f.type === "image" ? (
                      <ImageUpload value={val} onChange={(url) => setEditing({ ...editing, [f.key]: url })} />
                    ) : f.type === "richtext" ? (
                      <RichTextEditor value={val ?? ""} onChange={(html) => setEditing({ ...editing, [f.key]: html })} />
                    ) : f.type === "textarea" ? (
                      <textarea rows={4}
                        value={typeof val === "string" ? val : val != null ? JSON.stringify(val, null, 2) : ""}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                        className="w-full bg-paper border border-border rounded-lg px-3 py-2 text-sm font-mono" />

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
      { type: "section", label: "Basics" },
      { key: "slug", label: "Slug", help: "URL identifier, e.g. my-post-title" },
      { key: "category", label: "Category" },
      { key: "author", label: "Author" },
      { key: "published", label: "Published", type: "bool" },
      { key: "cover_image", label: "Cover image (EN)", type: "image", help: "Shown on the English blog list & post page, and as the social share thumbnail when no OG image is set." },
      { key: "cover_image_fr", label: "Cover image (FR)", type: "image", help: "Shown on the French blog list & post page. Falls back to the English cover if empty." },
      { key: "reading_time_minutes", label: "Reading time (minutes)", type: "number" },

      { type: "section", label: "Content" },
      { key: "title_en", label: "Title (EN)", type: "richtext", help: "Plain text used for SEO meta, social previews, and image alt. Formatting (bold, italic, color) shows on the blog list and post page." },
      { key: "title_fr", label: "Title (FR)", type: "richtext" },
      { key: "h1_en", label: "H1 heading (EN)", type: "richtext", help: "Optional. Falls back to title." },
      { key: "h1_fr", label: "H1 heading (FR)", type: "richtext" },
      { key: "h2_en", label: "H2 subheading (EN)", type: "richtext" },
      { key: "h2_fr", label: "H2 subheading (FR)", type: "richtext" },
      { key: "excerpt_en", label: "Excerpt (EN)", type: "textarea" },
      { key: "excerpt_fr", label: "Excerpt (FR)", type: "textarea" },
      { key: "content_en", label: "Content (EN)", type: "richtext" },
      { key: "content_fr", label: "Content (FR)", type: "richtext" },

      { type: "section", label: "SEO — Search engines" },
      { key: "seo_title_en", label: "SEO title (EN)", help: "Browser tab & Google. Aim < 60 chars." },
      { key: "seo_title_fr", label: "SEO title (FR)" },
      { key: "seo_description_en", label: "Meta description (EN)", type: "textarea", help: "Aim < 160 chars." },
      { key: "seo_description_fr", label: "Meta description (FR)", type: "textarea" },
      { key: "focus_keyword", label: "Focus keyword" },
      { key: "seo_keywords", label: "Meta keywords", help: "Comma-separated" },
      { key: "tags", label: "Tags", type: "tags", help: "Comma-separated. Used in JSON-LD & UI." },
      { key: "canonical_url", label: "Canonical URL", type: "url", help: "Leave empty to use current URL." },
      { key: "meta_robots", label: "Robots", help: "e.g. index,follow or noindex,nofollow" },
      { key: "structured_data_type", label: "Schema.org type", help: "e.g. Article, BlogPosting, NewsArticle" },

      { type: "section", label: "Social sharing (Open Graph & Twitter)" },
      { key: "og_title_en", label: "OG title (EN)", help: "Falls back to SEO title." },
      { key: "og_title_fr", label: "OG title (FR)" },
      { key: "og_description_en", label: "OG description (EN)", type: "textarea" },
      { key: "og_description_fr", label: "OG description (FR)", type: "textarea" },
      { key: "og_image", label: "Social share image (Open Graph)", type: "image", help: "1200×630 recommended. Falls back to cover image if empty." },
      { key: "twitter_card", label: "Twitter card", help: "summary or summary_large_image" },
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


// ---------- New content admins ----------
function IndustriesAdmin() {
  return <GenericTable title="Industries" table="industries" columns={["sort_order", "slug", "title_en", "published"]}
    fields={[
      { type: "section", label: "Basics" },
      { key: "slug", label: "Slug" },
      { key: "sort_order", label: "Sort", type: "number" },
      { key: "icon", label: "Icon (lucide name)", help: "e.g. Landmark, Factory, Building2" },
      { key: "published", label: "Published", type: "bool" },
      { key: "cover_image", label: "Cover image", type: "image" },
      { type: "section", label: "Content" },
      { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
      { key: "tagline_en", label: "Tagline (EN)", type: "textarea" }, { key: "tagline_fr", label: "Tagline (FR)", type: "textarea" },
      { key: "description_en", label: "Description (EN)", type: "textarea" }, { key: "description_fr", label: "Description (FR)", type: "textarea" },
      { key: "challenges_en", label: "Challenges (EN) — JSON array of strings", type: "textarea", help: '["Legacy systems","Compliance"]' },
      { key: "challenges_fr", label: "Challenges (FR) — JSON array of strings", type: "textarea" },
      { key: "solutions_en", label: "Solutions (EN) — JSON array of strings", type: "textarea" },
      { key: "solutions_fr", label: "Solutions (FR) — JSON array of strings", type: "textarea" },
      { type: "section", label: "SEO" },
      { key: "seo_title_en", label: "SEO title (EN)" }, { key: "seo_title_fr", label: "SEO title (FR)" },
      { key: "seo_description_en", label: "SEO description (EN)", type: "textarea" }, { key: "seo_description_fr", label: "SEO description (FR)", type: "textarea" },
      { key: "seo_keywords", label: "Keywords" },
    ]} />;
}

function CasesAdmin() {
  return <GenericTable title="Case Studies" table="case_studies" columns={["sort_order", "slug", "title_en", "published"]}
    fields={[
      { type: "section", label: "Basics" },
      { key: "slug", label: "Slug" }, { key: "sort_order", label: "Sort", type: "number" },
      { key: "published", label: "Published", type: "bool" },
      { key: "client_name", label: "Client name" }, { key: "industry", label: "Industry" },
      { key: "services", label: "Services", type: "tags", help: "e.g. Cloud, AI" },
      { key: "cover_image", label: "Cover image", type: "image" },
      { type: "section", label: "Content" },
      { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
      { key: "summary_en", label: "Summary (EN)", type: "textarea" }, { key: "summary_fr", label: "Summary (FR)", type: "textarea" },
      { key: "challenge_en", label: "Challenge (EN)", type: "textarea" }, { key: "challenge_fr", label: "Challenge (FR)", type: "textarea" },
      { key: "solution_en", label: "Solution (EN)", type: "textarea" }, { key: "solution_fr", label: "Solution (FR)", type: "textarea" },
      { key: "results_en", label: "Results (EN) — JSON array of strings", type: "textarea" },
      { key: "results_fr", label: "Results (FR) — JSON array of strings", type: "textarea" },
      { key: "metrics", label: "Metrics — JSON array of {label,value}", type: "textarea", help: '[{"label":"Downtime","value":"-45%"}]' },
      { type: "section", label: "SEO" },
      { key: "seo_title_en", label: "SEO title (EN)" }, { key: "seo_title_fr", label: "SEO title (FR)" },
      { key: "seo_description_en", label: "SEO description (EN)", type: "textarea" }, { key: "seo_description_fr", label: "SEO description (FR)", type: "textarea" },
    ]} />;
}

function ResourcesAdmin() {
  return <GenericTable title="Resources" table="resources" columns={["sort_order", "slug", "resource_type", "title_en"]}
    fields={[
      { key: "slug", label: "Slug" }, { key: "sort_order", label: "Sort", type: "number" },
      { key: "resource_type", label: "Type", help: "guide | whitepaper | checklist | video | ebook" },
      { key: "category", label: "Category" },
      { key: "published", label: "Published", type: "bool" },
      { key: "cover_image", label: "Cover image", type: "image" },
      { key: "download_url", label: "Download URL", type: "url" },
      { key: "external_url", label: "External URL", type: "url" },
      { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
      { key: "description_en", label: "Description (EN)", type: "textarea" }, { key: "description_fr", label: "Description (FR)", type: "textarea" },
      { key: "cta_label_en", label: "CTA label (EN)" }, { key: "cta_label_fr", label: "CTA label (FR)" },
      { key: "seo_title_en", label: "SEO title (EN)" }, { key: "seo_title_fr", label: "SEO title (FR)" },
      { key: "seo_description_en", label: "SEO description (EN)", type: "textarea" }, { key: "seo_description_fr", label: "SEO description (FR)", type: "textarea" },
    ]} />;
}

function FaqsAdmin() {
  return <GenericTable title="FAQs" table="faqs" columns={["sort_order", "category", "question_en", "published"]}
    fields={[
      { key: "sort_order", label: "Sort", type: "number" },
      { key: "category", label: "Category", help: "general, ai, cloud, security, pricing…" },
      { key: "page_scope", label: "Page scope", help: "general, services, ai, cloud, contact…" },
      { key: "published", label: "Published", type: "bool" },
      { key: "question_en", label: "Question (EN)" }, { key: "question_fr", label: "Question (FR)" },
      { key: "answer_en", label: "Answer (EN)", type: "richtext" }, { key: "answer_fr", label: "Answer (FR)", type: "richtext" },
    ]} />;
}

function LegalAdmin() {
  return <GenericTable title="Legal pages" table="legal_pages" columns={["sort_order", "slug", "title_en", "published"]}
    fields={[
      { key: "slug", label: "Slug", help: "e.g. privacy, terms, cookies" },
      { key: "sort_order", label: "Sort", type: "number" },
      { key: "published", label: "Published", type: "bool" },
      { key: "effective_date", label: "Effective date (YYYY-MM-DD)" },
      { key: "title_en", label: "Title (EN)" }, { key: "title_fr", label: "Title (FR)" },
      { key: "content_en", label: "Content (EN)", type: "richtext" }, { key: "content_fr", label: "Content (FR)", type: "richtext" },
      { key: "seo_title_en", label: "SEO title (EN)" }, { key: "seo_title_fr", label: "SEO title (FR)" },
      { key: "seo_description_en", label: "SEO description (EN)", type: "textarea" }, { key: "seo_description_fr", label: "SEO description (FR)", type: "textarea" },
    ]} />;
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/auth" replace />;
  return (
    <>
      <Seo title="Admin — Smartway" robots="noindex,nofollow" />
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 p-10 max-w-5xl">
          <Routes>
            <Route index element={<SettingsEditor />} />
            <Route path="leads" element={<LeadsAdmin />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="industries" element={<IndustriesAdmin />} />
            <Route path="cases" element={<CasesAdmin />} />
            <Route path="resources" element={<ResourcesAdmin />} />
            <Route path="faqs" element={<FaqsAdmin />} />
            <Route path="legal" element={<LegalAdmin />} />
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

