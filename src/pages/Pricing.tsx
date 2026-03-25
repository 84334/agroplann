import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const freeFeatures = [
  "Basic crop recommendations",
  "Crop guide & farmer tips",
  "Limited timetable (max 2 crops)",
  "Weather-based suggestions",
  "Yield predictions",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited timetable crops",
  "AI Farming Assistant chatbot",
  "Priority weather alerts",
  "Advanced rotation planning",
  "Save unlimited plans",
];

export default function Pricing() {
  const { user } = useAuth();
  const { isProUser, subscriptionEnd, checkSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to open portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Unlock the full potential of AgroPlan with Pro features including AI-powered farming assistance.
        </p>
        {isProUser && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Crown className="h-4 w-4" />
            You're a Pro member{subscriptionEnd && ` · Renews ${new Date(subscriptionEnd).toLocaleDateString()}`}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className={`rounded-2xl border bg-card p-8 space-y-6 ${!isProUser ? "ring-2 ring-primary" : ""}`}>
          <div>
            <h2 className="font-display text-xl font-bold">Free</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
          <ul className="space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {!isProUser && (
            <div className="rounded-lg border-2 border-primary bg-primary/5 px-4 py-2.5 text-center text-sm font-medium text-primary">
              Current Plan
            </div>
          )}
        </div>

        {/* Pro Plan */}
        <div className={`rounded-2xl border bg-card p-8 space-y-6 relative ${isProUser ? "ring-2 ring-primary" : ""}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              <Sparkles className="h-3 w-3" /> RECOMMENDED
            </span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Pro</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
          <ul className="space-y-3">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {isProUser ? (
            <button
              onClick={handleManage}
              disabled={loading}
              className="w-full rounded-lg border-2 border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              Manage Subscription
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Loading..." : user ? "Upgrade to Pro" : "Sign In to Upgrade"}
            </button>
          )}
        </div>
      </div>

      <div className="text-center mt-8">
        <button onClick={checkSubscription} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Refresh subscription status
        </button>
      </div>
    </div>
  );
}
