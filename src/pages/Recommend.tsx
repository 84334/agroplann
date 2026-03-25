import { useState } from "react";
import { crops, rotationRules, locations, getWeatherAdjustment } from "@/data/cropData";
import { Lightbulb, Calendar, MapPin, TrendingUp, Leaf, Cloud } from "lucide-react";
import { format, addDays } from "date-fns";
import { useGeolocation, useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import WeatherForecastAlert from "@/components/WeatherForecastAlert";

export default function Recommend() {
  const [previousCrop, setPreviousCrop] = useState("");
  const [selectedRec, setSelectedRec] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [location, setLocation] = useState("Malaysia");

  const { location: geoLoc } = useGeolocation();
  const { weather } = useWeather(geoLoc);

  const recommendations = previousCrop ? rotationRules[previousCrop] ?? [] : [];
  const selectedCropInfo = selectedRec ? crops[selectedRec] : null;

  // Weather-based adjustment: if live weather available, use temp/humidity to tweak growth days
  const weatherGrowthAdj = weather
    ? (weather.temp > 35 ? 10 : weather.temp < 15 ? 15 : 0) + (weather.humidity > 85 ? 5 : 0)
    : 0;

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
        <p className="text-muted-foreground">Select your previous crop and get science-backed suggestions for what to plant next.</p>
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

      {/* Step 1: Select previous crop */}
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
              <span className="text-2xl">{crop.emoji}</span>
              <span className="text-xs font-medium">{crop.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Recommendations */}
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
              return (
                <button
                  key={rec.crop}
                  onClick={() => setSelectedRec(rec.crop)}
                  className={`text-left rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                    active ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{info.emoji}</span>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{info.name}</h3>
                      <p className="text-xs text-muted-foreground">{info.growthDays} days · {info.yieldPerHectare}/ha</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                    <span>{rec.reason}</span>
                  </div>
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

      {/* Step 3: Harvest Prediction */}
      {selectedRec && selectedCropInfo && (
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
              <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Harvest</p>
                  <p className="text-lg font-bold text-primary">{format(harvestInfo.harvestDate, "MMM d, yyyy")}</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Growth Duration</p>
                  <p className="text-lg font-bold text-accent">{harvestInfo.totalDays} days</p>
                </div>
                <div className="rounded-lg bg-earth/10 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Expected Yield</p>
                  <p className="text-lg font-bold text-earth">{selectedCropInfo.yieldPerHectare}/ha</p>
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

      {/* Farming Guide for selected crop */}
      {selectedRec && selectedCropInfo && (
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
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
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
