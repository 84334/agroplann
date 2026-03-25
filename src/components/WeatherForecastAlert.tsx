import { AlertTriangle, CloudRain, Sun, Thermometer, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ForecastData } from "@/hooks/useForecast";

interface WeatherForecastAlertProps {
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
}

function getWeatherIcon(code: number) {
  if (code <= 3) return "☀️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

export default function WeatherForecastAlert({ forecast, loading, error }: WeatherForecastAlertProps) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (error || !forecast) return null;

  const hasWarnings = forecast.warnings.length > 0;
  const borderColor = hasWarnings ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : "border-primary/20 bg-primary/5";

  return (
    <div className={`rounded-xl border-2 ${borderColor} p-5 space-y-4 animate-fade-in-up`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {hasWarnings ? (
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <Sun className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className="font-display font-semibold text-base">
            {hasWarnings ? "⚠️ Weather Alerts for Next 16 Days" : "✅ 16-Day Weather Outlook"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Avg. highs: {forecast.summary.avgTempMax}°C · Lows: {forecast.summary.avgTempMin}°C · 
            {forecast.summary.rainyDays} rainy days · {forecast.summary.totalPrecip}mm total rain
          </p>
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="space-y-2">
          {forecast.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CloudRain className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="space-y-2">
        {forecast.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{tip}</span>
          </div>
        ))}
      </div>

      {/* Expandable daily forecast */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? "Hide" : "Show"} daily forecast
      </button>

      {expanded && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 animate-fade-in-up">
          {forecast.days.map((day) => (
            <div key={day.date} className="rounded-lg bg-background border p-2 text-center text-xs">
              <p className="font-medium">{new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              <p className="text-lg my-1">{getWeatherIcon(day.weatherCode)}</p>
              <p className="font-medium">{Math.round(day.tempMax)}°</p>
              <p className="text-muted-foreground">{Math.round(day.tempMin)}°</p>
              {day.precipProbability > 30 && (
                <p className="text-sky text-[10px] mt-1">💧{day.precipProbability}%</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
