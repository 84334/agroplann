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

  // Chilli Padi
  if (cropName === "Chilli Padi") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.12, description: "Seeds sprout in warm moist soil (7–14 days)", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.15, description: "True leaves develop, transplant ready", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.25, description: "Branching and leaf canopy growth", color: "bg-green-500" },
      { name: "Flowering", emoji: "🌸", pct: 0.15, description: "White flowers appear at nodes", color: "bg-yellow-500" },
      { name: "Fruiting", emoji: "🌶️", pct: 0.23, description: "Pods develop, turn from green to red", color: "bg-red-500" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Fruits fully colored, capsaicin peak", color: "bg-primary" },
    ];
  }

  // Okra
  if (cropName === "Okra") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.12, description: "Seeds swell and sprout in warm soil", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.18, description: "First true leaves and root establishment", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.25, description: "Rapid stem and leaf growth", color: "bg-green-500" },
      { name: "Flowering", emoji: "🌸", pct: 0.15, description: "Large yellow hibiscus-like flowers open", color: "bg-yellow-500" },
      { name: "Pod Development", emoji: "🫛", pct: 0.20, description: "Pods grow rapidly, harvest at 3–4 inches", color: "bg-orange-400" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Continuous picking every 2 days", color: "bg-primary" },
    ];
  }

  // Eggplant
  if (cropName === "Eggplant") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.10, description: "Seeds sprout in warm conditions (8–14 days)", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.15, description: "True leaves develop, hardening off", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.25, description: "Sturdy stem and broad leaf growth", color: "bg-green-500" },
      { name: "Flowering", emoji: "🌸", pct: 0.15, description: "Purple star-shaped flowers appear", color: "bg-purple-500" },
      { name: "Fruiting", emoji: "🍆", pct: 0.25, description: "Fruits develop, skin turns glossy", color: "bg-violet-500" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Fruits firm with glossy skin", color: "bg-primary" },
    ];
  }

  // Black Pepper (perennial, long cycle)
  if (cropName === "Black Pepper") {
    return [
      { name: "Establishment", emoji: "🌱", pct: 0.10, description: "Cuttings root and attach to support", color: "bg-amber-400" },
      { name: "Vine Growth", emoji: "🌿", pct: 0.25, description: "Vine climbs support, lateral branches form", color: "bg-lime-400" },
      { name: "Canopy Dev.", emoji: "🪴", pct: 0.25, description: "Dense foliage and aerial root development", color: "bg-green-500" },
      { name: "Spike Formation", emoji: "🌾", pct: 0.15, description: "Flower spikes emerge from nodes", color: "bg-yellow-500" },
      { name: "Berry Fill", emoji: "🫚", pct: 0.15, description: "Green berries develop on spikes", color: "bg-orange-400" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Berries turn red, dried for peppercorns", color: "bg-primary" },
    ];
  }

  // Pineapple (long cycle)
  if (cropName === "Pineapple") {
    return [
      { name: "Establishment", emoji: "🌱", pct: 0.10, description: "Crown/sucker planted, roots develop", color: "bg-amber-400" },
      { name: "Rosette Growth", emoji: "🌿", pct: 0.25, description: "Leaf rosette expands, plant gains mass", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.25, description: "Thick succulent leaves store water via CAM", color: "bg-green-500" },
      { name: "Flowering", emoji: "🌸", pct: 0.12, description: "Inflorescence emerges from center", color: "bg-pink-500" },
      { name: "Fruit Dev.", emoji: "🍍", pct: 0.18, description: "Fruitlets fuse into compound fruit", color: "bg-yellow-500" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Fruit turns golden, aromatic and sweet", color: "bg-primary" },
    ];
  }

  // Ginger (long cycle rhizome)
  if (cropName === "Ginger") {
    return [
      { name: "Sprouting", emoji: "🌱", pct: 0.10, description: "Rhizome buds break dormancy and sprout", color: "bg-amber-400" },
      { name: "Emergence", emoji: "🌿", pct: 0.12, description: "Pseudostem and first leaves emerge", color: "bg-lime-400" },
      { name: "Tillering", emoji: "🪴", pct: 0.25, description: "Multiple tillers form, rhizome branches", color: "bg-green-500" },
      { name: "Rhizome Bulking", emoji: "🫚", pct: 0.28, description: "Rapid underground rhizome expansion", color: "bg-orange-400" },
      { name: "Maturation", emoji: "🟤", pct: 0.15, description: "Leaves yellow, rhizome skin firms up", color: "bg-yellow-600" },
      { name: "Harvest", emoji: "✅", pct: 0.10, description: "Rhizomes fully developed, aromatic oils peak", color: "bg-primary" },
    ];
  }

  // Onion
  if (cropName === "Onion") {
    return [
      { name: "Germination", emoji: "🌱", pct: 0.10, description: "Seed sprouts, flag leaf emerges", color: "bg-amber-400" },
      { name: "Seedling", emoji: "🌿", pct: 0.15, description: "Loop stage, roots establish", color: "bg-lime-400" },
      { name: "Vegetative", emoji: "🪴", pct: 0.25, description: "Leaf growth increases, photosynthesis active", color: "bg-green-500" },
      { name: "Bulb Initiation", emoji: "🧅", pct: 0.15, description: "Triggered by day length, bulb scales form", color: "bg-yellow-500" },
      { name: "Bulb Expansion", emoji: "🧅", pct: 0.25, description: "Sugars translocate to bulb, rapid swelling", color: "bg-orange-400" },
      { name: "Maturity", emoji: "✅", pct: 0.10, description: "Tops fall over, bulb skin dries", color: "bg-primary" },
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
