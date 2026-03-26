import { useState } from "react";
import { crops } from "@/data/cropData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calculator, TrendingUp, DollarSign, Wheat, Save, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";

// Simple market prices per ton (USD) for estimation
const marketPrices: Record<string, number> = {
  corn: 250,
  soybean: 450,
  rice: 400,
  spinach: 800,
  tomato: 600,
  cassava: 150,
  peanut: 900,
  cabbage: 300,
  palm: 200,
};

export default function Predictions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [landSize, setLandSize] = useState("");
  const [seedCost, setSeedCost] = useState("");
  const [fertilizerCost, setFertilizerCost] = useState("");
  const [result, setResult] = useState<{
    yield: number;
    revenue: number;
    totalCost: number;
    profit: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const calculate = () => {
    if (!selectedCrop || !landSize) {
      toast.error("Please select a crop and enter land size");
      return;
    }

    const crop = crops[selectedCrop];
    if (!crop) return;

    const land = parseFloat(landSize);
    const seed = parseFloat(seedCost) || 0;
    const fert = parseFloat(fertilizerCost) || 0;

    // Parse yield range (e.g., "8–12 tons" → average)
    const yieldMatch = crop.yieldPerHectare.match(/(\d+\.?\d*)[\s–-]+(\d+\.?\d*)/);
    let avgYield = 5;
    if (yieldMatch) {
      avgYield = (parseFloat(yieldMatch[1]) + parseFloat(yieldMatch[2])) / 2;
    }

    const estimatedYield = avgYield * land;
    const pricePerTon = marketPrices[selectedCrop] || 300;
    const revenue = estimatedYield * pricePerTon;
    const totalCost = seed + fert;
    const profit = revenue - totalCost;

    setResult({ yield: estimatedYield, revenue, totalCost, profit });
  };

  const savePrediction = async () => {
    if (!user || !result) return;
    setSaving(true);

    const { error } = await supabase.from("predictions").insert({
      user_id: user.id,
      crop: selectedCrop,
      land_size_hectares: parseFloat(landSize),
      seed_cost: parseFloat(seedCost) || 0,
      fertilizer_cost: parseFloat(fertilizerCost) || 0,
      estimated_yield_tons: result.yield,
      estimated_revenue: result.revenue,
      estimated_profit: result.profit,
    });

    if (error) {
      toast.error("Failed to save prediction");
    } else {
      toast.success("Prediction saved!");
    }
    setSaving(false);
  };

  return (
    <div className="container py-10 md:py-16 space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Yield & Profit Predictions</h1>
        <p className="text-muted-foreground">Estimate your harvest yield, revenue, and profit based on crop and input costs.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Input Form */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Input Your Data
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Crop</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(crops).map(([key, crop]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCrop(key)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm transition-all ${
                    selectedCrop === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span>{crop.emoji}</span>
                  <span className="font-medium text-xs">{crop.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Wheat className="h-4 w-4 text-muted-foreground" /> Land Size (hectares)
            </label>
            <input
              type="number"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              placeholder="e.g., 2.5"
              min="0.1"
              step="0.1"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" /> Seed Cost (USD)
              </label>
              <input
                type="number"
                value={seedCost}
                onChange={(e) => setSeedCost(e.target.value)}
                placeholder="e.g., 200"
                min="0"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" /> Fertilizer Cost (USD)
              </label>
              <input
                type="number"
                value={fertilizerCost}
                onChange={(e) => setFertilizerCost(e.target.value)}
                placeholder="e.g., 150"
                min="0"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Calculate Prediction
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <div className="rounded-xl border bg-card p-6 space-y-5 animate-fade-in-up">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Prediction Results
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Yield</p>
                  <p className="text-2xl font-bold text-primary">{result.yield.toFixed(1)} tons</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Revenue</p>
                  <p className="text-2xl font-bold text-accent">${result.revenue.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-destructive">${result.totalCost.toLocaleString()}</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${result.profit >= 0 ? "bg-leaf/10" : "bg-destructive/10"}`}>
                  <p className="text-xs text-muted-foreground mb-1">Estimated Profit</p>
                  <p className={`text-2xl font-bold ${result.profit >= 0 ? "text-leaf" : "text-destructive"}`}>
                    ${result.profit.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedCrop && crops[selectedCrop] && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Based on</p>
                  <p className="text-sm">
                    <span className="font-medium">{crops[selectedCrop].emoji} {crops[selectedCrop].name}</span>
                    {" · "}Average yield {crops[selectedCrop].yieldPerHectare}/ha
                    {" · "}Growth: {crops[selectedCrop].growthDays} days
                  </p>
                </div>
              )}

              {user && (
                <button
                  onClick={savePrediction}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-4 py-2.5 font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Prediction"}
                </button>
              )}

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  Sign in to save your predictions
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Fill in the form and click calculate</p>
              <p className="text-sm text-muted-foreground mt-1">Your yield and profit estimates will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
