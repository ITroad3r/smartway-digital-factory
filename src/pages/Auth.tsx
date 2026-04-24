import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo-smartway.jpeg";
import Seo from "@/components/site/Seo";

export default function Auth() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can now sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Admin sign in — Smartway" />
      <div className="min-h-screen flex items-center justify-center bg-paper-soft p-6">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-elev p-8">
          <img src={logo} alt="Smartway" className="h-10 mx-auto mb-6" />
          <h1 className="display-serif text-2xl text-center mb-1">Backoffice</h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            {mode === "signin" ? "Sign in to manage your site" : "Create an admin account"}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-paper border border-border rounded-lg px-4 py-3 text-sm" />
            <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-paper border border-border rounded-lg px-4 py-3 text-sm" />
            <button disabled={busy} className="w-full rounded-full bg-foreground text-background py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
          {user && !isAdmin && (
            <p className="mt-6 p-3 rounded-lg bg-accent-soft text-xs text-foreground">
              You're signed in but don't have admin access yet. Use the Cloud dashboard to add your user to the <code>user_roles</code> table with role <code>admin</code>.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
