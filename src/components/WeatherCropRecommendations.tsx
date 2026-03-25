import { ForecastData } from "@/hooks/useForecast";
import { getWeatherRecommendations, getSuitabilityColor, getSuitabilityLabel, WeatherCropScore } from "@/lib/weatherCropEngine";
import { TrendingUp, TrendingDown, Minus, CloudRain } from "lucide-react";

interface Props {
  forecast: ForecastData;
  onSelectCrop?: (cropKey: string) => void;
}

function YieldBadge({ multiplier }: { multiplier: number }) {
  const pct = Math.round((multiplier - 1) * 100);
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-leaf">
        <TrendingUp className="h-3 w-3" />+{pct}% yield
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown className="h-3 w-3" />{pct}% yield
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="h-3 w-3" />Normal yield
    </span>
  );
}

export default function WeatherCropRecommendations({ forecast, onSelectCrop }: Props) {
  const recommendations = getWeatherRecommendations(forecast);
  const top = recommendations.slice(0, 5);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <CloudRain className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">
          Weather-Smart Crop Suggestions
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Based on the 16-day forecast: {forecast.summary.totalPrecip}mm rain, {forecast.summary.avgTempMin}–{forecast.summary.avgTempMax}°C, {forecast.summary.rainyDays} rainy days
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((rec) => (
          <CropCard key={rec.cropKey} rec={rec} onSelect={onSelectCrop} />
        ))}
      </div>

      {/* Show poor-match crops as a warning */}
      {recommendations.filter(r => r.suitability === "poor").length > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive mb-2">⚠️ Crops to avoid in current conditions:</p>
          <div className="flex flex-wrap gap-2">
            {recommendations
              .filter(r => r.suitability === "poor")
              .map(r => (
                <span key={r.cropKey} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  {r.crop.emoji} {r.crop.name} — {r.warnings[0]?.replace(/^[🚨⚠️🔥❄️]\s*/, '')}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CropCard({ rec, onSelect }: { rec: WeatherCropScore; onSelect?: (key: string) => void }) {
  const colorClass = getSuitabilityColor(rec.suitability);

  return (
    <button
      onClick={() => onSelect?.(rec.cropKey)}
      className={`text-left rounded-xl border-2 p-4 transition-all hover:shadow-lg ${colorClass}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{rec.crop.emoji}</span>
          <div>
            <h4 className="font-display font-semibold">{rec.crop.name}</h4>
            <p className="text-[10px] opacity-70">{rec.crop.growthDays} days · {rec.crop.season}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{rec.score}</div>
          <div className="text-[10px] opacity-70">score</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="h-2 rounded-full bg-background/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-current transition-all"
            style={{ width: `${rec.score}%` }}
          />
        </div>
      </div>

      <p className="text-xs font-medium mb-2">{getSuitabilityLabel(rec.suitability)}</p>

      <YieldBadge multiplier={rec.yieldMultiplier} />

      {rec.reasons.slice(0, 2).map((r, i) => (
        <p key={i} className="text-[11px] opacity-80 mt-1">{r}</p>
      ))}
      {rec.warnings.slice(0, 1).map((w, i) => (
        <p key={i} className="text-[11px] font-medium mt-1">{w}</p>
      ))}
    </button>
  );
}
