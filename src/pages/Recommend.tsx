import { useState } from "react";
import CropIcon from "@/components/CropIcon";
import { crops, rotationRules, locations, getWeatherAdjustment } from "@/data/cropData";
import { Lightbulb, Calendar, MapPin, TrendingUp, Leaf, Cloud, Lock } from "lucide-react";
import { format, addDays } from "date-fns";
import { useGeolocation, useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import WeatherForecastAlert from "@/components/WeatherForecastAlert";
import WeatherCropRecommendations from "@/components/WeatherCropRecommendations";
import CropWeatherWarning from "@/components/CropWeatherWarning";
import { checkCropWeatherSuitability } from "@/lib/weatherCropEngine";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Recommend() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [previousCrop, setPreviousCrop] = useState("");
  const [selectedRec, setSelectedRec] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [location, setLocation] = useState("Malaysia");

  const { location: geoLoc } = useGeolocation();
  const { weather } = useWeather(geoLoc);
  const { forecast, loading: forecastLoading, error: forecastError } = useForecast(geoLoc);

  const recommendations = previousCrop ? rotationRules[previousCrop] ?? [] : [];
  const selectedCropInfo = selectedRec ? crops[selectedRec] : null;

  const weatherGrowthAdj = weather
    ? (weather.temp > 35 ? 10 : weather.temp < 15 ? 15 : 0) + (weather.humidity > 85 ? 5 : 0)
    : 0;

  // Weather-adjusted yield multiplier for selected crop
  const weatherYieldMultiplier = selectedRec && forecast
    ? checkCropWeatherSuitability(selectedRec, forecast)?.yieldMultiplier ?? 1
    : 1;

  const harvestInfo = selectedCropInfo && plantingDate
    ? (() => {
        const adj = getWeatherAdjustment(location) + weatherGrowthAdj;
        const totalDays = selectedCropInfo.growthDays + adj;
        const harvest = addDays(new Date(plantingDate), totalDays);
        return { totalDays, harvestDate: harvest };
      })()
    : null;

  return (
    <div className="container py-10 md:py-16 space-y-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Smart Crop Recommendation</h1>
        <p className="text-muted-foreground">Get AI-powered, weather-aware suggestions for what to plant next.</p>
      </div>

      {/* Live weather notice */}
      {weather && (
        <div className="rounded-lg bg-sky/10 border border-sky/20 p-4 flex items-center gap-3 animate-fade-in-up">
          <Cloud className="h-5 w-5 text-sky shrink-0" />
          <div className="text-sm">
            <span className="font-medium">Live weather from {weather.city}:</span>{" "}
            {Math.round(weather.temp)}°C, {weather.humidity}% humidity — {weather.description}.
            {weatherGrowthAdj > 0 && (
              <span className="text-muted-foreground"> Growth estimates adjusted by +{weatherGrowthAdj} days due to conditions.</span>
            )}
          </div>
        </div>
      )}

      {/* 16-Day Weather Forecast Alert */}
      <WeatherForecastAlert forecast={forecast} loading={forecastLoading} error={forecastError} />

      {/* Weather-Smart Crop Suggestions */}
      {forecast && (
        <WeatherCropRecommendations
          forecast={forecast}
          onSelectCrop={(key) => {
            setPreviousCrop("");
            setSelectedRec(key);
          }}
        />
      )}

      {/* Step 1: Previous crop selection */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
          What did you grow last?
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {Object.entries(crops).map(([key, crop]) => (
            <button
              key={key}
              onClick={() => { setPreviousCrop(key); setSelectedRec(""); }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                previousCrop === key
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <CropIcon cropKey={key} emoji={crop.emoji} size="lg" />
              <span className="text-xs font-medium">{crop.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Recommendations with weather suitability */}
      {recommendations.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
            Recommended Next Crops
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {recommendations.map((rec) => {
              const info = crops[rec.crop];
              const active = selectedRec === rec.crop;
              const weatherScore = forecast
                ? checkCropWeatherSuitability(rec.crop, forecast)
                : null;
              return (
                <button
                  key={rec.crop}
                  onClick={() => setSelectedRec(rec.crop)}
                  className={`text-left rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                    active ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <CropIcon cropKey={rec.crop} emoji={info.emoji} size="xl" />
                    <div>
                      <h3 className="font-display font-semibold text-lg">{info.name}</h3>
                      <p className="text-xs text-muted-foreground">{info.growthDays} days · {info.yieldPerHectare}/ha</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                    <span>{rec.reason}</span>
                  </div>
                  {/* Weather suitability badge */}
                  {weatherScore && (
                    <div className={`mt-2 rounded-md px-2 py-1 text-xs font-medium inline-flex items-center gap-1 ${
                      weatherScore.suitability === "excellent" || weatherScore.suitability === "good"
                        ? "bg-leaf/10 text-leaf"
                        : weatherScore.suitability === "fair"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {weatherScore.suitability === "excellent" ? "🟢" : weatherScore.suitability === "good" ? "🔵" : weatherScore.suitability === "fair" ? "🟡" : "🔴"}{" "}
                      Weather: {weatherScore.score}/100
                      {weatherScore.yieldMultiplier !== 1 && (
                        <span className="ml-1">
                          ({Math.round((weatherScore.yieldMultiplier - 1) * 100) > 0 ? "+" : ""}
                          {Math.round((weatherScore.yieldMultiplier - 1) * 100)}% yield)
                        </span>
                      )}
                    </div>
                  )}
                  {active && (
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                      <Leaf className="h-4 w-4" /> Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Weather warning for selected crop */}
      {selectedRec && forecast && (
        <CropWeatherWarning cropKey={selectedRec} forecast={forecast} />
      )}

      {/* Step 3: Harvest Prediction */}
      {selectedRec && selectedCropInfo && !user && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
            Harvest Prediction
          </h2>
          <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-8 text-center space-y-4">
            <Lock className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <h3 className="font-display text-lg font-semibold">Sign in to unlock Harvest Prediction</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Get personalized harvest dates, weather-adjusted yield estimates, and detailed farming guides by creating a free account.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in or Sign up
            </button>
          </div>
        </div>
      )}
      {selectedRec && selectedCropInfo && user && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
            Harvest Prediction
          </h2>
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Planting Date
                </label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {harvestInfo && (
              <div className="grid gap-4 sm:grid-cols-4 animate-fade-in-up">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Harvest</p>
                  <p className="text-lg font-bold text-primary">{format(harvestInfo.harvestDate, "MMM d, yyyy")}</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Growth Duration</p>
                  <p className="text-lg font-bold text-accent">{harvestInfo.totalDays} days</p>
                </div>
                <div className="rounded-lg bg-earth/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Base Yield</p>
                  <p className="text-lg font-bold text-earth">{selectedCropInfo.yieldPerHectare}/ha</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${
                  weatherYieldMultiplier >= 1 ? "bg-leaf/10" : "bg-destructive/10"
                }`}>
                  <p className="text-xs text-muted-foreground mb-1">Weather Yield Adj.</p>
                  <p className={`text-lg font-bold ${weatherYieldMultiplier >= 1 ? "text-leaf" : "text-destructive"}`}>
                    {weatherYieldMultiplier >= 1 ? "+" : ""}{Math.round((weatherYieldMultiplier - 1) * 100)}%
                  </p>
                </div>
              </div>
            )}

            {harvestInfo && (getWeatherAdjustment(location) !== 0 || weatherGrowthAdj > 0) && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Adjustments: {getWeatherAdjustment(location) !== 0 && `${location}: ${getWeatherAdjustment(location) > 0 ? "+" : ""}${getWeatherAdjustment(location)} days`}
                {weatherGrowthAdj > 0 && ` · Live weather: +${weatherGrowthAdj} days`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Farming Guide */}
      {selectedRec && selectedCropInfo && user && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
            Farming Guide: {selectedCropInfo.name} {selectedCropInfo.emoji}
          </h2>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-muted-foreground mb-5">{selectedCropInfo.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Soil Type", value: selectedCropInfo.soilType, icon: "🪨" },
                { label: "Water Requirements", value: selectedCropInfo.waterReq, icon: "💧" },
                { label: "Fertilizer", value: selectedCropInfo.fertilizer, icon: "🧪" },
                { label: "Growth Duration", value: `${selectedCropInfo.growthDays} days`, icon: "⏱️" },
                { label: "Season", value: selectedCropInfo.season, icon: "☀️" },
                { label: "Best Month to Plant", value: selectedCropInfo.plantMonth, icon: "📅" },
                { label: "Yield", value: `${selectedCropInfo.yieldPerHectare} per hectare`, icon: "📦" },
                { label: "Ideal Temp Range", value: `${selectedCropInfo.idealTempRange[0]}–${selectedCropInfo.idealTempRange[1]}°C`, icon: "🌡️" },
                { label: "Drought Tolerance", value: selectedCropInfo.droughtTolerance, icon: "☀️" },
                { label: "Flood Tolerance", value: selectedCropInfo.floodTolerance, icon: "🌊" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium capitalize">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">⚠️ Common Diseases</p>
              <div className="flex flex-wrap gap-2">
                {selectedCropInfo.diseases.map((d) => (
                  <span key={d} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
