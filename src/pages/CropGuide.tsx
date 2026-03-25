import { useState } from "react";
import { crops } from "@/data/cropData";
import { Search, ExternalLink, Play, BookOpen } from "lucide-react";

const farmerTips = [
  {
    emoji: "🧪",
    title: "Test Your Soil",
    description: "Know your soil pH and nutrient levels before planting. This helps you choose the right fertilizer and crops.",
    link: "https://www.almanac.com/how-test-soil",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "🌿",
    title: "Mulch Your Beds",
    description: "Add organic mulch around plants to retain moisture, suppress weeds, and regulate soil temperature.",
    link: "https://www.almanac.com/how-to-mulch",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "🐞",
    title: "Natural Pest Control",
    description: "Use companion planting, neem oil, or introduce beneficial insects instead of chemical pesticides.",
    link: "https://www.almanac.com/pest-control-natural-pesticides",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "💧",
    title: "Water Early Morning",
    description: "Watering in the early morning reduces evaporation and gives plants time to absorb moisture before the heat.",
    link: "https://www.almanac.com/watering-garden-tips",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "🔄",
    title: "Practice Crop Rotation",
    description: "Rotate crop families each season to prevent soil depletion and reduce pest and disease buildup.",
    link: "https://www.fao.org/conservation-agriculture/in-practice/crop-rotation/en/",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "🌱",
    title: "Start with Seedlings",
    description: "Beginners should start with seedlings instead of seeds for higher success rates on crops like tomatoes and peppers.",
    link: "https://www.almanac.com/starting-seeds-indoors",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "🪱",
    title: "Composting Basics",
    description: "Turn kitchen scraps and yard waste into nutrient-rich compost to feed your soil naturally and reduce waste.",
    link: "https://www.epa.gov/recycle/composting-home",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "☀️",
    title: "Understand Sunlight Needs",
    description: "Most vegetables need 6–8 hours of direct sunlight. Map your garden's sun exposure before planting.",
    link: "https://www.almanac.com/full-sun-partial-shade-full-shade",
    linkLabel: "Read Article",
    type: "article" as const,
  },
  {
    emoji: "📏",
    title: "Proper Plant Spacing",
    description: "Overcrowding leads to disease and competition for nutrients. Follow spacing guidelines for each crop.",
    link: "https://www.almanac.com/vegetable-garden-plant-spacing",
    linkLabel: "Read Article",
    type: "article" as const,
  },
];

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

      {/* Farmer Tips Section */}
      <div className="mt-12">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">🌾 Farmer Tips & Guidance</h2>
        <p className="text-muted-foreground mb-6">Simple, beginner-friendly advice to improve your farming. Click any tip for a detailed tutorial.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farmerTips.map((tip) => (
            <a
              key={tip.title}
              href={tip.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{tip.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tip.title}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{tip.description}</p>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                {tip.type === "video" ? <Play className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                <span>{tip.linkLabel}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
