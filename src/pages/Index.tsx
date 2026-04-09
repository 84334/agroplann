import { Link } from "react-router-dom";
import { Lightbulb, CalendarDays, BookOpen, TrendingUp, Sprout, ArrowRight, Calculator } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";
import WeatherWidget from "@/components/WeatherWidget";
import { useGeolocation, useWeather } from "@/hooks/useWeather";

const features = [
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    desc: "Get science-backed next-crop suggestions based on soil science and rotation principles.",
    link: "/recommend",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CalendarDays,
    title: "Rotation Timetable",
    desc: "Visualize your yearly planting calendar with optimized crop sequences.",
    link: "/timetable",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BookOpen,
    title: "Crop Guide",
    desc: "Detailed farming guides with soil, water, fertilizer, and disease info.",
    link: "/guide",
    color: "bg-sky/10 text-sky",
  },
  {
    icon: Calculator,
    title: "Profit Predictions",
    desc: "Estimate yield, revenue, and profit from your crop and input costs.",
    link: "/predictions",
    color: "bg-leaf/10 text-leaf",
  },
];

export default function Index() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(location);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Lush farm landscape" className="h-full w-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="container relative z-10 flex min-h-[520px] items-center py-20">
          <div className="max-w-xl space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              <Sprout className="h-4 w-4" />
              Food Security Innovation
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Grow Smarter,<br />Harvest Better
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              AgroPlan is your intelligent farming companion. Plan crop rotations, get personalized recommendations, and maximize your harvest with data-driven insights.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/recommend"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground/20 backdrop-blur-sm px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/30"
              >
                Explore Crops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Weather + Features */}
      <section className="container py-16 md:py-24 space-y-12">
        {/* Weather Widget */}
        <div className="max-w-md">
          <h2 className="font-display text-2xl font-bold mb-4">🌤️ Local Weather</h2>
          <WeatherWidget
            weather={weather}
            loading={geoLoading || weatherLoading}
            error={geoError || weatherError}
            coordinates={location}
          />
        </div>

        {/* Features */}
        <div>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Everything You Need to Farm Smart</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From crop recommendations to harvest predictions, AgroPlan equips farmers with tools for sustainable and productive agriculture.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Link
                key={f.title}
                to={f.link}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`inline-flex rounded-lg p-3 mb-4 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Demo CTA */}
      <section className="bg-primary/5 border-y">
        <div className="container py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Ready to optimize your farm?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Try selecting "Corn" as your previous crop to see how AgroPlan recommends the best next crop for your soil.
          </p>
          <Link
            to="/recommend"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            Start Farming <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
