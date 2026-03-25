import { useState } from "react";
import { crops, rotationRules, rotationTimeline } from "@/data/cropData";
import { CalendarDays, ArrowRight } from "lucide-react";

const colorMap: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  leaf: "bg-leaf text-leaf-foreground",
  sky: "bg-sky text-sky-foreground",
  accent: "bg-accent text-accent-foreground",
};

const barColorMap: Record<string, string> = {
  primary: "bg-primary/80",
  leaf: "bg-leaf/80",
  sky: "bg-sky/80",
  accent: "bg-accent/80",
};

export default function Timetable() {
  const [startCrop, setStartCrop] = useState("corn");
  const recs = rotationRules[startCrop] ?? [];
  const sequence = [
    { crop: startCrop, months: "Jan – Mar" },
    { crop: recs[0]?.crop ?? "soybean", months: "Apr – Jun" },
    { crop: recs[1]?.crop ?? "spinach", months: "Jul – Sep" },
    { crop: recs[2]?.crop ?? "tomato", months: "Oct – Dec" },
  ];

  const colors = ["primary", "leaf", "sky", "accent"] as const;

  return (
    <div className="container py-10 md:py-16 space-y-10">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Crop Rotation Timetable</h1>
        <p className="text-muted-foreground">Visualize a full-year rotation plan optimized for soil health and yield.</p>
      </div>

      {/* Starter crop selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Start with:</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(crops).map(([key, crop]) => (
            <button
              key={key}
              onClick={() => setStartCrop(key)}
              className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                startCrop === key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <span>{crop.emoji}</span> {crop.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline - Horizontal */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Year Plan
        </h2>

        {/* Horizontal bar timeline */}
        <div className="rounded-xl border bg-card p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Month labels */}
            <div className="grid grid-cols-12 mb-2">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                <div key={m} className="text-xs text-muted-foreground text-center">{m}</div>
              ))}
            </div>

            {/* Bar */}
            <div className="grid grid-cols-4 gap-1 h-16 rounded-lg overflow-hidden">
              {sequence.map((s, i) => {
                const crop = crops[s.crop];
                return (
                  <div
                    key={i}
                    className={`${colorMap[colors[i]]} flex items-center justify-center gap-2 rounded-md transition-all hover:scale-[1.02]`}
                  >
                    <span className="text-lg">{crop?.emoji}</span>
                    <span className="text-sm font-semibold">{crop?.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Quarter labels */}
            <div className="grid grid-cols-4 mt-2">
              {sequence.map((s, i) => (
                <div key={i} className="text-xs text-muted-foreground text-center">{s.months}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed card sequence */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Rotation Sequence</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sequence.map((s, i) => {
            const crop = crops[s.crop];
            if (!crop) return null;
            return (
              <div key={i} className="relative rounded-xl border bg-card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-xl ${barColorMap[colors[i]]}`} />
                <div className="flex items-center gap-3 mb-3 mt-1">
                  <span className="text-3xl">{crop.emoji}</span>
                  <div>
                    <h3 className="font-display font-semibold">{crop.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.months}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{crop.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{crop.growthDays} days</span>
                  <span className="font-medium text-primary">{crop.yieldPerHectare}/ha</span>
                </div>
                {i < sequence.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
