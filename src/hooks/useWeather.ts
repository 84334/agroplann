import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  feelsLike: number;
  city: string;
  country: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return { location, error, loading };
}

export function useWeather(location: GeoLocation | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    setLoading(true);
    supabase.functions
      .invoke("get-weather", {
        body: { lat: location.lat, lon: location.lon },
      })
      .then(({ data, error: fnError }) => {
        if (fnError) {
          setError(fnError.message);
        } else if (data?.error) {
          setError(data.error);
        } else {
          setWeather(data as WeatherData);
        }
        setLoading(false);
      });
  }, [location]);

  return { weather, loading, error };
}
