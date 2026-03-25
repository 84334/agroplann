import { useState } from "react";
import { crops, rotationRules } from "@/data/cropData";
import { getCropStages, GrowthStage } from "@/lib/cropStages";
import { CalendarDays, Plus, Trash2, ArrowRight, Lightbulb, CloudRain } from "lucide-react";
import { addDays, format } from "date-fns";
import { useGeolocation } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { checkCropWeatherSuitability, getSuitabilityLabel } from "@/lib/weatherCropEngine";
import GrowthStageTimeline from "@/components/GrowthStageTimeline";
import CropGrowthAnimation from "@/components/CropGrowthAnimation";
import TimetableCalendar from "@/components/TimetableCalendar";

interface PlannedCrop {
  id: string;
  cropKey: string;
  plantingDate: string; // ISO string
  growthDays: number; // allow user adjustment
}

const colorBars = ["bg-primary/80", "bg-leaf/80", "bg-sky/80", "bg-accent/80", "bg-earth/80"];

export default function Timetable() {
  const [planned, setPlanned] = useState<PlannedCrop[]>([]);
  const [addingCrop, setAddingCrop] = useState("");
  const [addingDate, setAddingDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { location: geoLoc } = useGeolocation();
  const { forecast } = useForecast(geoLoc);

  // Get suggestions based on last planned crop
  const lastPlanned = planned[planned.length - 1];
  const lastCropKey = lastPlanned?.cropKey;
  const rotationSuggestions = lastCropKey ? rotationRules[lastCropKey] ?? [] : [];

  const addCrop = () => {
    if (!addingCrop || !addingDate) return;
    const crop = crops[addingCrop];
    if (!crop) return;
    setPlanned((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        cropKey: addingCrop,
        plantingDate: addingDate,
        growthDays: crop.growthDays,
      },
    ]);
    // Auto-suggest next date
    const harvestDate = addDays(new Date(addingDate), crop.growthDays + 7); // +7 rest days
    setAddingDate(format(harvestDate, "yyyy-MM-dd"));
    setAddingCrop("");
  };

  const removeCrop = (id: string) => {
    setPlanned((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustDays = (id: string, delta: number) => {
    setPlanned((prev) =>
      prev.map((p) => (p.id === id ? { ...p, growthDays: Math.max(14, p.growthDays + delta) } : p))
    );
  };

  // Calendar entries for the calendar view
  const calendarEntries = planned.map((p) => {
    const crop = crops[p.cropKey];
    const stages = getCropStages({ ...crop, growthDays: p.growthDays });
    return {
      cropKey: p.cropKey,
      crop,
      plantingDate: new Date(p.plantingDate),
      stages,
    };
  });

  return (
    <div className="container py-10 md:py-16 space-y-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Crop Rotation Planner</h1>
        <p className="text-muted-foreground">
          Plan your crops, adjust growth periods, and preview growth stages on a calendar.
        </p>
      </div>

      {/* Add Crop Section */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Crop to Plan
        </h2>

        {/* Suggestions */}
        {rotationSuggestions.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Suggested after {crops[lastCropKey!].emoji} {crops[lastCropKey!].name}:
            </p>
            <div className="flex flex-wrap gap-2">
              {rotationSuggestions.map((s) => {
                const suitability = forecast ? checkCropWeatherSuitability(s.crop, forecast) : null;
                return (
                  <button
                    key={s.crop}
                    onClick={() => setAddingCrop(s.crop)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all hover:shadow-md ${
                      addingCrop === s.crop ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span>{crops[s.crop].emoji}</span>
                    <span className="font-medium">{crops[s.crop].name}</span>
                    {suitability && (
                      <span className="text-[10px] opacity-70">
                        {suitability.suitability === "excellent" ? "🟢" : suitability.suitability === "good" ? "🔵" : suitability.suitability === "fair" ? "🟡" : "🔴"}
                        {suitability.score}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{rotationSuggestions.find((s) => s.crop === addingCrop)?.reason}</p>
          </div>
        )}

        {/* Weather-based suggestions when no rotation context */}
        {!lastCropKey && forecast && (
          <div className="rounded-lg border border-sky/20 bg-sky/5 p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-sky" />
              Weather suggests these crops:
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(crops)
                .map(([key, crop]) => ({ key, crop, score: forecast ? checkCropWeatherSuitability(key, forecast) : null }))
                .filter((c) => c.score && (c.score.suitability === "excellent" || c.score.suitability === "good"))
                .sort((a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0))
                .slice(0, 5)
                .map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setAddingCrop(c.key)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all hover:shadow-md ${
                      addingCrop === c.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span>{c.crop.emoji}</span>
                    <span className="font-medium">{c.crop.name}</span>
                    <span className="text-[10px] text-leaf">🟢 {c.score?.score}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Crop picker + date */}
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium">Crop</label>
            <select
              value={addingCrop}
              onChange={(e) => setAddingCrop(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select a crop...</option>
              {Object.entries(crops).map(([key, crop]) => (
                <option key={key} value={key}>
                  {crop.emoji} {crop.name} ({crop.growthDays} days)
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Planting Date</label>
            <input
              type="date"
              value={addingDate}
              onChange={(e) => setAddingDate(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addCrop}
              disabled={!addingCrop || !addingDate}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add
            </button>
          </div>
        </div>

        {/* Weather suitability for selected crop */}
        {addingCrop && forecast && (() => {
          const suit = checkCropWeatherSuitability(addingCrop, forecast);
          if (!suit) return null;
          const isGood = suit.suitability === "excellent" || suit.suitability === "good";
          return (
            <div className={`rounded-lg border p-3 text-sm ${isGood ? "border-leaf/30 bg-leaf/5" : "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"}`}>
              <span className="font-medium">{getSuitabilityLabel(suit.suitability)}</span>
              <span className="text-muted-foreground"> · Score: {suit.score}/100 · Yield adjustment: {Math.round((suit.yieldMultiplier - 1) * 100) > 0 ? "+" : ""}{Math.round((suit.yieldMultiplier - 1) * 100)}%</span>
              {suit.warnings.length > 0 && <p className="text-xs mt-1">{suit.warnings[0]}</p>}
            </div>
          );
        })()}
      </div>

      {/* Planned Rotation Sequence */}
      {planned.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Your Rotation Plan ({planned.length} crop{planned.length > 1 ? "s" : ""})
          </h2>

          {/* Horizontal timeline bar */}
          <div className="rounded-xl border bg-card p-5 overflow-x-auto">
            <div className="flex gap-2 min-w-[500px]">
              {planned.map((p, i) => {
                const crop = crops[p.cropKey];
                const harvestDate = addDays(new Date(p.plantingDate), p.growthDays);
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className={`${colorBars[i % colorBars.length]} rounded-lg px-4 py-3 text-white flex-1 min-w-[120px]`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{crop.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm">{crop.name}</p>
                          <p className="text-[10px] opacity-80">{format(new Date(p.plantingDate), "MMM d")} → {format(harvestDate, "MMM d")}</p>
                          <p className="text-[10px] opacity-80">{p.growthDays} days</p>
                        </div>
                      </div>
                    </div>
                    {i < planned.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed cards with stages */}
          {planned.map((p, i) => {
            const crop = crops[p.cropKey];
            const stages = getCropStages({ ...crop, growthDays: p.growthDays });
            const harvestDate = addDays(new Date(p.plantingDate), p.growthDays);

            return (
              <div key={p.id} className="rounded-xl border bg-card p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold text-primary-foreground ${colorBars[i % colorBars.length]}`}>
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                        {crop.emoji} {crop.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(p.plantingDate), "MMM d, yyyy")} → {format(harvestDate, "MMM d, yyyy")} · {p.growthDays} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border p-1">
                      <button onClick={() => adjustDays(p.id, -7)} className="rounded px-2 py-1 text-xs font-medium hover:bg-muted transition-colors">-7d</button>
                      <span className="text-xs font-medium px-2">{p.growthDays}d</span>
                      <button onClick={() => adjustDays(p.id, 7)} className="rounded px-2 py-1 text-xs font-medium hover:bg-muted transition-colors">+7d</button>
                    </div>
                    <button onClick={() => removeCrop(p.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Growth stages timeline */}
                <GrowthStageTimeline crop={crop} stages={stages} plantingDate={new Date(p.plantingDate)} />

                {/* Live growth animation */}
                <CropGrowthAnimation
                  crop={crop}
                  plantingDate={new Date(p.plantingDate)}
                  growthDays={p.growthDays}
                  weatherMultiplier={
                    forecast
                      ? (() => {
                          const suit = checkCropWeatherSuitability(p.cropKey, forecast);
                          return suit ? suit.yieldMultiplier : 1;
                        })()
                      : 1
                  }
                />

                {/* Harvest highlight */}
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-primary">Estimated Harvest: {format(harvestDate, "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">After {p.growthDays} days of growth</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Calendar View */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Calendar View
            </h2>
            <TimetableCalendar
              entries={calendarEntries}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {planned.length === 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No crops planned yet</p>
          <p className="text-sm text-muted-foreground mt-1">Select a crop and planting date above to start building your rotation</p>
        </div>
      )}
    </div>
  );
}
