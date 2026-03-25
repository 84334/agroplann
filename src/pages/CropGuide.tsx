import { useState } from "react";
import { crops } from "@/data/cropData";
import { Search } from "lucide-react";

export default function CropGuide() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("corn");

  const filtered = Object.entries(crops).filter(([, c]) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const info = crops[selected];

  return (
    <div className="container py-10 md:py-16 space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Crop Guide</h1>
        <p className="text-muted-foreground">Comprehensive farming guides for every crop in our database.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar list */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search crops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.map(([key, crop]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selected === key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span className="text-lg">{crop.emoji}</span>
                <span className="font-medium">{crop.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {info && (
          <div className="rounded-xl border bg-card p-6 md:p-8 animate-fade-in-up" key={selected}>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{info.emoji}</span>
              <div>
                <h2 className="font-display text-2xl font-bold">{info.name}</h2>
                <p className="text-sm text-muted-foreground">{info.season}</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{info.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Soil Type", value: info.soilType, icon: "🪨" },
                { label: "Water Requirements", value: info.waterReq, icon: "💧" },
                { label: "Fertilizer", value: info.fertilizer, icon: "🧪" },
                { label: "Growth Duration", value: `${info.growthDays} days`, icon: "⏱️" },
                { label: "Season", value: info.season, icon: "☀️" },
                { label: "Best Month to Plant", value: info.plantMonth, icon: "📅" },
                { label: "Expected Yield", value: `${info.yieldPerHectare} per hectare`, icon: "📦" },
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

            <div className="mt-6">
              <p className="text-sm font-medium mb-3">⚠️ Common Diseases</p>
              <div className="flex flex-wrap gap-2">
                {info.diseases.map((d) => (
                  <span key={d} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">{d}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
