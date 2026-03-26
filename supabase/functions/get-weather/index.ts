import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map WMO weather codes to descriptions and icon codes
function getWeatherInfo(code: number): { description: string; icon: string } {
  const map: Record<number, { description: string; icon: string }> = {
    0: { description: "clear sky", icon: "01d" },
    1: { description: "mainly clear", icon: "02d" },
    2: { description: "partly cloudy", icon: "03d" },
    3: { description: "overcast", icon: "04d" },
    45: { description: "fog", icon: "50d" },
    48: { description: "depositing rime fog", icon: "50d" },
    51: { description: "light drizzle", icon: "09d" },
    53: { description: "moderate drizzle", icon: "09d" },
    55: { description: "dense drizzle", icon: "09d" },
    61: { description: "slight rain", icon: "10d" },
    63: { description: "moderate rain", icon: "10d" },
    65: { description: "heavy rain", icon: "10d" },
    71: { description: "slight snow", icon: "13d" },
    73: { description: "moderate snow", icon: "13d" },
    75: { description: "heavy snow", icon: "13d" },
    80: { description: "slight rain showers", icon: "09d" },
    81: { description: "moderate rain showers", icon: "09d" },
    82: { description: "violent rain showers", icon: "09d" },
    95: { description: "thunderstorm", icon: "11d" },
    96: { description: "thunderstorm with slight hail", icon: "11d" },
    99: { description: "thunderstorm with heavy hail", icon: "11d" },
  };
  return map[code] || { description: "unknown", icon: "03d" };
}

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

    // Fetch weather and location name in parallel
    const [weatherRes, geoRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      ),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
        { headers: { 'User-Agent': 'AgroPlan/1.0' } }
      ),
    ]);

    const weatherData = await weatherRes.json();
    const geoData = await geoRes.json();

    if (!weatherRes.ok) {
      return new Response(JSON.stringify({ error: weatherData.reason || 'Weather API error' }), {
        status: weatherRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const current = weatherData.current;
    const { description, icon } = getWeatherInfo(current.weather_code);

    // Extract best location name from Nominatim
    const address = geoData.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county ||
      address.state_district ||
      geoData.name ||
      'Unknown';
    const country = address.country_code?.toUpperCase() || '';

    return new Response(JSON.stringify({
      temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      description,
      icon,
      windSpeed: current.wind_speed_10m,
      feelsLike: current.apparent_temperature,
      city,
      country,
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
