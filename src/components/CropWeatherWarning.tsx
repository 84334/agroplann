import { ForecastData } from "@/hooks/useForecast";
import { checkCropWeatherSuitability, getSuitabilityLabel } from "@/lib/weatherCropEngine";
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  cropKey: string;
  forecast: ForecastData;
}

export default function CropWeatherWarning({ cropKey, forecast }: Props) {
  const result = checkCropWeatherSuitability(cropKey, forecast);
  if (!result) return null;

  const pct = Math.round((result.yieldMultiplier - 1) * 100);
  const isGood = result.suitability === "excellent" || result.suitability === "good";

  return (
    <div className={`rounded-lg border p-4 space-y-2 animate-fade-in-up ${
      isGood
        ? "border-leaf/30 bg-leaf/5"
        : result.suitability === "fair"
        ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
        : "border-destructive/30 bg-destructive/5"
    }`}>
      <div className="flex items-center gap-2">
        {isGood ? (
          <CheckCircle2 className="h-4 w-4 text-leaf shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <span className="text-sm font-medium">
          Weather Suitability: {getSuitabilityLabel(result.suitability)} (Score: {result.score}/100)
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {pct > 0 ? (
          <span className="inline-flex items-center gap-1 text-leaf font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> +{pct}% expected yield increase
          </span>
        ) : pct < 0 ? (
          <span className="inline-flex items-center gap-1 text-destructive font-medium">
            <TrendingDown className="h-3.5 w-3.5" /> {pct}% expected yield decrease
          </span>
        ) : (
          <span className="text-muted-foreground">Normal yield expected</span>
        )}
      </div>

      {result.reasons.length > 0 && (
        <div className="space-y-1">
          {result.reasons.map((r, i) => (
            <p key={i} className="text-xs text-muted-foreground">{r}</p>
          ))}
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-xs font-medium">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
