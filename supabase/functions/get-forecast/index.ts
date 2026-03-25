import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: 'lat and lon are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Open-Meteo is completely free, no API key needed
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max&timezone=auto&forecast_days=16`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.reason || 'Forecast API error' }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const daily = data.daily;
    const days = daily.time.map((date: string, i: number) => ({
      date,
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      precipitation: daily.precipitation_sum[i],
      precipProbability: daily.precipitation_probability_max[i],
      weatherCode: daily.weathercode[i],
      windSpeed: daily.windspeed_10m_max[i],
    }));

    // Analyze weather patterns for farming advice
    const totalPrecip = days.reduce((sum: number, d: any) => sum + (d.precipitation || 0), 0);
    const avgPrecipProb = days.reduce((sum: number, d: any) => sum + (d.precipProbability || 0), 0) / days.length;
    const rainyDays = days.filter((d: any) => d.precipProbability > 60).length;
    const avgTempMax = days.reduce((sum: number, d: any) => sum + d.tempMax, 0) / days.length;
    const avgTempMin = days.reduce((sum: number, d: any) => sum + d.tempMin, 0) / days.length;
    const hotDays = days.filter((d: any) => d.tempMax > 35).length;
    const coldDays = days.filter((d: any) => d.tempMin < 10).length;

    const warnings: string[] = [];
    const tips: string[] = [];

    // Rain warnings
    if (rainyDays >= 10) {
      warnings.push(`Heavy rainy period ahead: ${rainyDays} of 16 days have >60% rain probability. Total expected rainfall: ${totalPrecip.toFixed(0)}mm.`);
      tips.push("Consider water-loving crops like rice or taro, or delay planting drought-sensitive crops.");
      tips.push("Ensure proper drainage in your fields to prevent waterlogging.");
    } else if (rainyDays >= 5) {
      warnings.push(`Moderate rainfall expected: ${rainyDays} rainy days in the next 16 days (~${totalPrecip.toFixed(0)}mm total).`);
      tips.push("Good conditions for most crops. Ensure fields have adequate drainage.");
    }

    // Drought warning
    if (totalPrecip < 5 && rainyDays < 2) {
      warnings.push("Very dry conditions ahead: minimal rainfall expected in the next 16 days.");
      tips.push("Plan irrigation carefully. Consider drought-resistant crops like cassava or millet.");
    }

    // Heat warnings
    if (hotDays >= 5) {
      warnings.push(`Extreme heat expected: ${hotDays} days above 35°C.`);
      tips.push("Provide shade for young plants. Increase watering frequency. Avoid midday planting.");
    }

    // Cold warnings
    if (coldDays >= 3) {
      warnings.push(`Cold snap ahead: ${coldDays} days dropping below 10°C.`);
      tips.push("Delay planting tropical crops. Use mulch or row covers to protect sensitive plants.");
    }

    // Good conditions
    if (warnings.length === 0) {
      tips.push("Weather looks favorable for planting most crops in the next 2 weeks!");
    }

    return new Response(JSON.stringify({
      days,
      summary: {
        totalPrecip: Math.round(totalPrecip),
        avgPrecipProbability: Math.round(avgPrecipProb),
        rainyDays,
        avgTempMax: Math.round(avgTempMax * 10) / 10,
        avgTempMin: Math.round(avgTempMin * 10) / 10,
        hotDays,
        coldDays,
      },
      warnings,
      tips,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
