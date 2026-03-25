import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GeoLocation } from "@/hooks/useWeather";

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface ForecastSummary {
  totalPrecip: number;
  avgPrecipProbability: number;
  rainyDays: number;
  avgTempMax: number;
  avgTempMin: number;
  hotDays: number;
  coldDays: number;
}

export interface ForecastData {
  days: ForecastDay[];
  summary: ForecastSummary;
  warnings: string[];
  tips: string[];
}

export function useForecast(location: GeoLocation | null) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    setLoading(true);
    supabase.functions
      .invoke("get-forecast", {
        body: { lat: location.lat, lon: location.lon },
      })
      .then(({ data, error: fnError }) => {
        if (fnError) {
          setError(fnError.message);
        } else if (data?.error) {
          setError(data.error);
        } else {
          setForecast(data as ForecastData);
        }
        setLoading(false);
      });
  }, [location]);

  return { forecast, loading, error };
}
