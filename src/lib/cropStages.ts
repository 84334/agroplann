import { CropInfo } from "@/data/cropData";

export interface GrowthStage {
  name: string;
  emoji: string;
  startDay: number;
  endDay: number;
  description: string;
  color: string;
}

/** 
 * Returns crop-specific growth stages scaled to actual growth days.
 * Stages are percentage-based then converted to day ranges.
 */
export function getCropStages(crop: CropInfo): GrowthStage[] {
  const d = crop.growthDays;

  // Generic stages with percentage splits
  const stageTemplates = getStageTemplates(crop.name);

  let currentDay = 0;
  return stageTemplates.map((s) => {
    const days = Math.round(d * s.pct);
    const stage: GrowthStage = {
      name: s.name,
      emoji: s.emoji,
      startDay: currentDay,
      endDay: currentDay + days,
      description: s.description,
      color: s.color,
    };
    currentDay += days;
    return stage;
  });
}

interface StageTemplate {
  name: string;
  emoji: string;
  pct: number;
  description: string;
  color: string;
}

function getStageTemplates(cropName: string): StageTemplate[] {
  // Corn-specific stages
  if (cropName === "Corn") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.1, description: "Seed absorbs water, radicle emerges", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.15, description: "First leaves appear, root system develops", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.30, description: "Rapid leaf and stalk growth", color: "bg-green-500" },
      { name: "Tasseling", emoji: "🌾", pct: 0.15, description: "Tassel emerges, pollination begins", color: "bg-yellow-500" },
      { name: "Grain Fill", emoji: "🌽", pct: 0.20, description: "Kernels develop and fill with starch", color: "bg-orange-400" },
      { name: "Maturity", emoji: "✅", pct: 0.10, description: "Grain dries down, ready for harvest", color: "bg-primary" },
    ];
  }

  // Rice-specific stages
  if (cropName === "Rice") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.08, description: "Seed soaking and sprouting", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.15, description: "Transplanting to paddy", color: "bg-lime-400" },
      { name: "Tillering", emoji: "🪴", pct: 0.25, description: "Side shoots develop, plant thickens", color: "bg-green-500" },
      { name: "Booting", emoji: "🌾", pct: 0.12, description: "Panicle develops inside stem", color: "bg-teal-500" },
      { name: "Heading", emoji: "🌾", pct: 0.15, description: "Panicle emerges, flowering occurs", color: "bg-yellow-500" },
      { name: "Grain Fill", emoji: "🍚", pct: 0.15, description: "Grains fill with starch", color: "bg-orange-400" },
      { name: "Maturity", emoji: "✅", pct: 0.10, description: "Grains harden, ready to harvest", color: "bg-primary" },
    ];
  }

  // Tomato-specific
  if (cropName === "Tomato") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.10, description: "Seeds sprout in warm soil", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.15, description: "True leaves develop", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.25, description: "Stem and leaf growth", color: "bg-green-500" },
      { name: "Flowering", emoji: "🌸", pct: 0.15, description: "Yellow flowers appear", color: "bg-yellow-500" },
      { name: "Fruiting", emoji: "🍅", pct: 0.25, description: "Fruits develop and ripen", color: "bg-red-400" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Fruits fully ripe", color: "bg-primary" },
    ];
  }

  // Default generic stages
  return [
    { name: "Germination", emoji: "🌱", pct: 0.10, description: "Seed sprouts and root emerges", color: "bg-amber-400" },
    { name: "Seedling", emoji: "🌿", pct: 0.15, description: "Early leaf development", color: "bg-lime-400" },
    { name: "Vegetative", emoji: "🪴", pct: 0.30, description: "Rapid growth phase", color: "bg-green-500" },
    { name: "Flowering", emoji: "🌸", pct: 0.15, description: "Reproductive phase begins", color: "bg-yellow-500" },
    { name: "Fruiting/Fill", emoji: "🫘", pct: 0.20, description: "Fruit or grain development", color: "bg-orange-400" },
    { name: "Maturity", emoji: "✅", pct: 0.10, description: "Ready for harvest", color: "bg-primary" },
  ];
}
