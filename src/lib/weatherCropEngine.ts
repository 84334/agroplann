import { crops, CropInfo } from "@/data/cropData";
import { ForecastData, ForecastSummary } from "@/hooks/useForecast";

export interface WeatherCropScore {
  cropKey: string;
  crop: CropInfo;
  score: number; // 0-100
  yieldMultiplier: number; // e.g. 0.7 = 30% decrease, 1.2 = 20% increase
  reasons: string[];
  warnings: string[];
  suitability: "excellent" | "good" | "fair" | "poor";
}

/**
 * Analyze how well a specific crop matches the upcoming weather forecast
 */
export function scoreCropForWeather(
  cropKey: string,
  crop: CropInfo,
  forecast: ForecastData
): WeatherCropScore {
  const { summary } = forecast;
  let score = 50; // baseline
  let yieldMultiplier = 1.0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  const currentMonth = new Date().getMonth() + 1;

  // 1. Season suitability (±20 points)
  if (crop.bestSeasonMonths.includes(currentMonth)) {
    score += 20;
    reasons.push(`✅ Great planting season for ${crop.name} right now`);
    yieldMultiplier += 0.1;
  } else {
    score -= 15;
    warnings.push(`⚠️ Not the ideal season — best months: ${crop.plantMonth}`);
    yieldMultiplier -= 0.1;
  }

  // 2. Rainfall analysis (±20 points)
  // Extrapolate 16-day rain to growth period
  const dailyRain = summary.totalPrecip / 16;
  const projectedGrowthRain = dailyRain * crop.growthDays;
  const [minRain, maxRain] = crop.idealRainfall;

  if (projectedGrowthRain >= minRain && projectedGrowthRain <= maxRain) {
    score += 20;
    reasons.push(`🌧️ Projected rainfall (~${Math.round(projectedGrowthRain)}mm) is ideal for ${crop.name}`);
    yieldMultiplier += 0.1;
  } else if (projectedGrowthRain > maxRain * 1.5) {
    // Very heavy rain
    if (crop.floodTolerance === "high") {
      score += 10;
      reasons.push(`🌧️ Heavy rain expected — ${crop.name} handles flooding well`);
    } else if (crop.floodTolerance === "low") {
      score -= 20;
      warnings.push(`🚨 Excessive rainfall projected (~${Math.round(projectedGrowthRain)}mm) — ${crop.name} has low flood tolerance`);
      yieldMultiplier -= 0.25;
    } else {
      score -= 10;
      warnings.push(`⚠️ Above-ideal rainfall expected — monitor drainage closely`);
      yieldMultiplier -= 0.1;
    }
  } else if (projectedGrowthRain < minRain * 0.5) {
    // Very dry
    if (crop.droughtTolerance === "high") {
      score += 5;
      reasons.push(`☀️ Dry conditions ahead — ${crop.name} is drought-tolerant`);
    } else if (crop.droughtTolerance === "low") {
      score -= 20;
      warnings.push(`🚨 Very low rainfall projected (~${Math.round(projectedGrowthRain)}mm) — ${crop.name} needs ${minRain}–${maxRain}mm`);
      yieldMultiplier -= 0.25;
    } else {
      score -= 10;
      warnings.push(`⚠️ Below-ideal rainfall — plan for supplemental irrigation`);
      yieldMultiplier -= 0.1;
    }
  } else {
    score += 5;
    reasons.push(`🌧️ Rainfall is close to acceptable range for ${crop.name}`);
  }

  // 3. Temperature analysis (±20 points)
  const avgTemp = (summary.avgTempMax + summary.avgTempMin) / 2;
  const [minTemp, maxTemp] = crop.idealTempRange;

  if (avgTemp >= minTemp && avgTemp <= maxTemp) {
    score += 20;
    reasons.push(`🌡️ Temperature range (${summary.avgTempMin}–${summary.avgTempMax}°C) is ideal`);
    yieldMultiplier += 0.1;
  } else if (avgTemp > maxTemp) {
    if (crop.heatTolerance === "high") {
      score += 5;
      reasons.push(`🌡️ Warm conditions — ${crop.name} handles heat well`);
    } else if (crop.heatTolerance === "low") {
      score -= 20;
      warnings.push(`🔥 Too hot for ${crop.name} — avg ${avgTemp.toFixed(1)}°C exceeds ideal max of ${maxTemp}°C`);
      yieldMultiplier -= 0.2;
    } else {
      score -= 10;
      warnings.push(`⚠️ Temperatures slightly above ideal — consider shade or mulching`);
      yieldMultiplier -= 0.1;
    }
  } else if (avgTemp < minTemp) {
    if (crop.coldTolerance === "high") {
      score += 5;
      reasons.push(`❄️ Cool conditions — ${crop.name} thrives in cooler weather`);
    } else if (crop.coldTolerance === "low") {
      score -= 20;
      warnings.push(`❄️ Too cold for ${crop.name} — avg ${avgTemp.toFixed(1)}°C below ideal min of ${minTemp}°C`);
      yieldMultiplier -= 0.2;
    } else {
      score -= 10;
      warnings.push(`⚠️ Cooler than ideal — growth may be slower`);
      yieldMultiplier -= 0.1;
    }
  }

  // 4. Extreme weather days (±10 points)
  if (summary.hotDays >= 5 && crop.heatTolerance === "low") {
    score -= 10;
    warnings.push(`🔥 ${summary.hotDays} extreme heat days (>35°C) expected`);
    yieldMultiplier -= 0.1;
  }
  if (summary.coldDays >= 3 && crop.coldTolerance === "low") {
    score -= 10;
    warnings.push(`❄️ ${summary.coldDays} cold days (<10°C) expected`);
    yieldMultiplier -= 0.1;
  }

  // 5. Rainy days frequency
  if (summary.rainyDays >= 10 && crop.floodTolerance === "high") {
    score += 10;
    reasons.push(`💧 Frequent rain (${summary.rainyDays} days) suits ${crop.name}'s water needs`);
  }

  // Clamp values
  score = Math.max(0, Math.min(100, score));
  yieldMultiplier = Math.max(0.4, Math.min(1.4, yieldMultiplier));

  let suitability: WeatherCropScore["suitability"];
  if (score >= 75) suitability = "excellent";
  else if (score >= 55) suitability = "good";
  else if (score >= 35) suitability = "fair";
  else suitability = "poor";

  return { cropKey, crop, score, yieldMultiplier, reasons, warnings, suitability };
}

/**
 * Get weather-based crop recommendations ranked by suitability
 */
export function getWeatherRecommendations(forecast: ForecastData): WeatherCropScore[] {
  return Object.entries(crops)
    .map(([key, crop]) => scoreCropForWeather(key, crop, forecast))
    .sort((a, b) => b.score - a.score);
}

/**
 * Check if a specific crop from rotation is suitable for current weather
 */
export function checkCropWeatherSuitability(
  cropKey: string,
  forecast: ForecastData
): WeatherCropScore | null {
  const crop = crops[cropKey];
  if (!crop) return null;
  return scoreCropForWeather(cropKey, crop, forecast);
}

export function getSuitabilityColor(suitability: WeatherCropScore["suitability"]) {
  switch (suitability) {
    case "excellent": return "text-leaf bg-leaf/10 border-leaf/30";
    case "good": return "text-primary bg-primary/10 border-primary/30";
    case "fair": return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800";
    case "poor": return "text-destructive bg-destructive/10 border-destructive/30";
  }
}

export function getSuitabilityLabel(suitability: WeatherCropScore["suitability"]) {
  switch (suitability) {
    case "excellent": return "🟢 Excellent Match";
    case "good": return "🔵 Good Match";
    case "fair": return "🟡 Fair Match";
    case "poor": return "🔴 Poor Match";
  }
}
