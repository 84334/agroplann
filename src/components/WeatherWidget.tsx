import { Cloud, Droplets, Wind, Thermometer, MapPin } from "lucide-react";
import { WeatherData } from "@/hooks/useWeather";

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  coordinates?: { lat: number; lon: number } | null;
}

export default function WeatherWidget({ weather, loading, error, coordinates }: WeatherWidgetProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-8 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          Weather unavailable: {error}
        </p>
      </div>
    );
  }

  if (!weather) return null;

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold">
          {weather.city}, {weather.country}
        </h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <img src={iconUrl} alt={weather.description} className="h-16 w-16" />
        <div>
          <p className="text-3xl font-bold">{Math.round(weather.temp)}°C</p>
          <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Thermometer className="h-4 w-4 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Feels Like</p>
            <p className="text-sm font-medium">{Math.round(weather.feelsLike)}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Droplets className="h-4 w-4 text-sky" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-medium">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Wind className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="text-sm font-medium">{weather.windSpeed} m/s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
