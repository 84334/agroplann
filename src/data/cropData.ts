export interface CropInfo {
  name: string;
  emoji: string;
  soilType: string;
  waterReq: string;
  fertilizer: string;
  growthDays: number;
  diseases: string[];
  yieldPerHectare: string;
  season: string;
  plantMonth: string;
  description: string;
}

export interface Recommendation {
  crop: string;
  reason: string;
}

export const crops: Record<string, CropInfo> = {
  corn: {
    name: "Corn",
    emoji: "🌽",
    soilType: "Well-drained loamy soil, pH 5.8–7.0",
    waterReq: "500–800mm per growing season",
    fertilizer: "NPK 10-10-10 at planting; side-dress with nitrogen at knee-high stage",
    growthDays: 90,
    diseases: ["Corn smut", "Gray leaf spot", "Northern corn leaf blight"],
    yieldPerHectare: "8–12 tons",
    season: "Spring–Summer",
    plantMonth: "March – May",
    description: "A warm-season cereal grain that thrives in full sun and is a staple food worldwide.",
  },
  soybean: {
    name: "Soybean",
    emoji: "🫘",
    soilType: "Fertile, well-drained loam, pH 6.0–7.0",
    waterReq: "450–700mm per growing season",
    fertilizer: "Inoculant at planting; low nitrogen, moderate P and K",
    growthDays: 100,
    diseases: ["Soybean rust", "Root rot", "Brown spot"],
    yieldPerHectare: "2–3.5 tons",
    season: "Late Spring–Fall",
    plantMonth: "May – June",
    description: "A nitrogen-fixing legume excellent for soil restoration after heavy feeders like corn.",
  },
  rice: {
    name: "Rice",
    emoji: "🌾",
    soilType: "Clay or clay-loam with good water retention, pH 5.5–6.5",
    waterReq: "1200–2000mm (flooded paddies)",
    fertilizer: "Urea and ammonium sulfate; split application",
    growthDays: 120,
    diseases: ["Rice blast", "Bacterial leaf blight", "Sheath blight"],
    yieldPerHectare: "4–8 tons",
    season: "Monsoon / Wet season",
    plantMonth: "June – August",
    description: "The world's most important food crop, grown in flooded paddy fields.",
  },
  spinach: {
    name: "Spinach",
    emoji: "🥬",
    soilType: "Rich, moist, well-drained soil, pH 6.5–7.5",
    waterReq: "300–450mm, consistent moisture",
    fertilizer: "Nitrogen-rich fertilizer every 2 weeks",
    growthDays: 45,
    diseases: ["Downy mildew", "Leaf spot", "Fusarium wilt"],
    yieldPerHectare: "10–15 tons",
    season: "Cool season (Fall–Spring)",
    plantMonth: "September – November",
    description: "A fast-growing leafy green packed with iron and vitamins.",
  },
  tomato: {
    name: "Tomato",
    emoji: "🍅",
    soilType: "Well-drained, sandy loam, pH 6.0–6.8",
    waterReq: "600–800mm, regular and even",
    fertilizer: "Balanced NPK; calcium supplement to prevent blossom end rot",
    growthDays: 75,
    diseases: ["Early blight", "Late blight", "Bacterial wilt"],
    yieldPerHectare: "40–80 tons",
    season: "Warm season",
    plantMonth: "April – June",
    description: "A versatile fruit crop popular in tropical and temperate regions.",
  },
  cassava: {
    name: "Cassava",
    emoji: "🥔",
    soilType: "Sandy loam, tolerates poor soil, pH 5.5–6.5",
    waterReq: "500–1000mm, drought tolerant",
    fertilizer: "NPK 15-15-15 at planting",
    growthDays: 270,
    diseases: ["Cassava mosaic", "Bacterial blight", "Root rot"],
    yieldPerHectare: "10–25 tons",
    season: "Year-round in tropics",
    plantMonth: "Year-round (start of rainy season preferred)",
    description: "A hardy root crop and staple food in tropical regions, very drought-resistant.",
  },
  peanut: {
    name: "Peanut",
    emoji: "🥜",
    soilType: "Sandy loam, well-drained, pH 5.9–7.0",
    waterReq: "400–600mm",
    fertilizer: "Low nitrogen; gypsum at pegging stage",
    growthDays: 120,
    diseases: ["Leaf spot", "Rust", "Aflatoxin contamination"],
    yieldPerHectare: "1.5–3 tons",
    season: "Warm season",
    description: "A nitrogen-fixing legume that enriches soil while providing high-protein harvests.",
  },
  cabbage: {
    name: "Cabbage",
    emoji: "🥗",
    soilType: "Fertile, moist clay-loam, pH 6.0–7.5",
    waterReq: "350–500mm, consistent",
    fertilizer: "Nitrogen-heavy; side-dress mid-season",
    growthDays: 70,
    diseases: ["Black rot", "Clubroot", "Downy mildew"],
    yieldPerHectare: "30–60 tons",
    season: "Cool season",
    description: "A cool-season brassica ideal for crop rotation after legumes.",
  },
  palm: {
    name: "Oil Palm",
    emoji: "🌴",
    soilType: "Deep, well-drained clay loam, pH 4.0–6.0",
    waterReq: "2000–2500mm annually",
    fertilizer: "NPK with magnesium; organic mulching",
    growthDays: 1095,
    diseases: ["Ganoderma basal stem rot", "Bud rot", "Leaf spot"],
    yieldPerHectare: "15–25 tons (fresh fruit bunches)",
    season: "Year-round in tropics",
    description: "A high-yield perennial oil crop dominant in Southeast Asian agriculture.",
  },
};

export const rotationRules: Record<string, Recommendation[]> = {
  corn: [
    { crop: "soybean", reason: "Corn depletes nitrogen heavily. Soybean is a legume that fixes nitrogen back into the soil, restoring fertility naturally." },
    { crop: "spinach", reason: "Spinach has shallow roots and benefits from residual nutrients. It also breaks pest cycles common in corn." },
    { crop: "peanut", reason: "Peanuts fix nitrogen and have different root depth, improving soil structure after corn." },
  ],
  soybean: [
    { crop: "corn", reason: "After soybean's nitrogen fixation, corn can take advantage of the enriched soil for higher yields." },
    { crop: "cabbage", reason: "Brassicas thrive in nitrogen-rich soil left by legumes and break soybean disease cycles." },
    { crop: "rice", reason: "Rice benefits from the improved soil structure and nutrient profile left by soybeans." },
  ],
  rice: [
    { crop: "soybean", reason: "Legumes restore nitrogen depleted by rice and improve soil aeration after waterlogged conditions." },
    { crop: "corn", reason: "Corn's deep roots help break up compacted paddy soil and utilize different nutrient profiles." },
    { crop: "peanut", reason: "Peanuts fix nitrogen and thrive in the well-drained conditions needed after rice paddies." },
  ],
  spinach: [
    { crop: "tomato", reason: "Tomatoes benefit from the organic matter left by spinach and have different pest profiles." },
    { crop: "corn", reason: "Corn's deep roots complement spinach's shallow root system, improving overall soil structure." },
    { crop: "cabbage", reason: "Alternating leafy greens with different families prevents disease buildup." },
  ],
  tomato: [
    { crop: "soybean", reason: "Legumes restore nutrients depleted by heavy-feeding tomatoes and break solanaceous disease cycles." },
    { crop: "spinach", reason: "Fast-growing spinach acts as a cover crop, preventing erosion and suppressing weeds." },
    { crop: "corn", reason: "Corn is from a completely different family, breaking tomato pest and disease cycles effectively." },
  ],
  cassava: [
    { crop: "peanut", reason: "Peanuts fix nitrogen depleted by cassava's long growth period and improve soil fertility." },
    { crop: "soybean", reason: "Soybeans restore soil nutrients and have a much shorter cycle, allowing soil recovery." },
    { crop: "spinach", reason: "Quick-growing spinach provides ground cover and adds organic matter to depleted soil." },
  ],
  peanut: [
    { crop: "corn", reason: "Corn benefits from nitrogen fixed by peanuts and has different root depth for soil balance." },
    { crop: "rice", reason: "Rice can utilize the improved nitrogen content and benefits from the rotation." },
    { crop: "cabbage", reason: "Brassicas thrive in nitrogen-enriched soil and are from a completely different plant family." },
  ],
  cabbage: [
    { crop: "tomato", reason: "Tomatoes break brassica disease cycles and utilize different soil nutrient profiles." },
    { crop: "soybean", reason: "Legumes restore nitrogen after heavy-feeding cabbage and improve soil structure." },
    { crop: "corn", reason: "Corn's tall growth and deep roots are completely different from cabbage, breaking pest cycles." },
  ],
  palm: [
    { crop: "cassava", reason: "Cassava can be intercropped or planted after palm clearing, tolerating similar acidic soils." },
    { crop: "peanut", reason: "Peanuts fix nitrogen and can serve as cover crops in replanting programs." },
    { crop: "soybean", reason: "Soybeans restore soil fertility after long-term palm cultivation." },
  ],
};

export const rotationTimeline = [
  { months: "Jan – Mar", crop: "corn", color: "primary" as const },
  { months: "Apr – Jun", crop: "soybean", color: "leaf" as const },
  { months: "Jul – Sep", crop: "spinach", color: "sky" as const },
  { months: "Oct – Dec", crop: "tomato", color: "accent" as const },
];

export const locations = [
  "Malaysia",
  "Indonesia",
  "Philippines",
  "Thailand",
  "Nigeria",
  "Kenya",
  "India",
  "Brazil",
];

export function getWeatherAdjustment(location: string): number {
  const adjustments: Record<string, number> = {
    Malaysia: 5,
    Indonesia: 7,
    Philippines: 3,
    Thailand: 4,
    Nigeria: -2,
    Kenya: -5,
    India: 6,
    Brazil: 3,
  };
  return adjustments[location] ?? 0;
}
