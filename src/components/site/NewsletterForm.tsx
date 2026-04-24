import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success(t("newsletter.success"));
    setEmail("");
  };

  const isDark = variant === "dark";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className={`flex flex-col sm:flex-row gap-2 p-2 rounded-full border ${isDark ? "bg-white/10 border-white/20" : "bg-card border-border shadow-card"}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletter.placeholder")}
          className={`flex-1 bg-transparent px-5 py-3 text-sm outline-none ${isDark ? "text-white placeholder-white/60" : "text-foreground placeholder-muted-foreground"}`}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-all hover:shadow-glow disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("cta.subscribe")}
        </button>
      </div>
      <p className={`mt-3 text-xs ${isDark ? "text-white/60" : "text-muted-foreground"}`}>{t("newsletter.privacy")}</p>
    </form>
  );
}
