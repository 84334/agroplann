import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { CropInfo } from "@/data/cropData";
import { Progress } from "@/components/ui/progress";

interface GrowthAnimationStage {
  name: string;
  emoji: string;
  startPct: number;
  endPct: number;
  color: string;
}

const STAGES: GrowthAnimationStage[] = [
  { name: "Seed", emoji: "🫘", startPct: 0, endPct: 5, color: "bg-amber-600" },
  { name: "Sprout", emoji: "🌱", startPct: 5, endPct: 20, color: "bg-lime-500" },
  { name: "Young Plant", emoji: "🌿", startPct: 20, endPct: 55, color: "bg-green-500" },
  { name: "Mature", emoji: "🪴", startPct: 55, endPct: 85, color: "bg-primary" },
  { name: "Harvest Ready", emoji: "🎉", startPct: 85, endPct: 100, color: "bg-accent" },
];

interface Props {
  crop: CropInfo;
  plantingDate: Date;
  growthDays: number;
  /** 0.7 = slow (bad weather), 1.0 = normal, 1.3 = fast (ideal weather) */
  weatherMultiplier?: number;
}

export default function CropGrowthAnimation({
  crop,
  plantingDate,
  growthDays,
  weatherMultiplier = 1,
}: Props) {
  const { progress, currentStage, effectiveDaysPassed, adjustedTotalDays } = useMemo(() => {
    const now = new Date();
    const daysPassed = differenceInDays(now, plantingDate);
    // Weather multiplier speeds up or slows down effective progress
    const effectiveDays = Math.max(0, daysPassed * weatherMultiplier);
    const adjustedTotal = growthDays;
    const pct = Math.min(100, Math.max(0, (effectiveDays / adjustedTotal) * 100));

    const stage =
      [...STAGES].reverse().find((s) => pct >= s.startPct) ?? STAGES[0];

    return {
      progress: pct,
      currentStage: stage,
      effectiveDaysPassed: Math.round(effectiveDays),
      adjustedTotalDays: adjustedTotal,
    };
  }, [plantingDate, growthDays, weatherMultiplier]);

  const isFuture = differenceInDays(new Date(), plantingDate) < 0;
  const isComplete = progress >= 100;

  // Visual plant heights for the animated illustration
  const plantHeight = Math.min(100, progress);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">{crop.emoji}</span>
          Growth Progress
        </h4>
        {weatherMultiplier !== 1 && (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              weatherMultiplier > 1
                ? "bg-leaf/10 text-leaf"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {weatherMultiplier > 1 ? "⚡ Faster growth" : "🐌 Slower growth"} ({Math.round(weatherMultiplier * 100)}%)
          </span>
        )}
      </div>

      {/* Animated plant visual */}
      <div className="flex items-end justify-center gap-6 h-28 relative">
        {/* Soil line */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-earth/20 rounded-b-lg" />

        {/* Plant */}
        <div className="relative flex flex-col items-center justify-end z-10" style={{ height: "100%" }}>
          {isFuture ? (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <span className="text-3xl opacity-40">🫘</span>
              <span className="text-[10px]">Not planted yet</span>
            </div>
          ) : (
            <>
              {/* Growing stem */}
              <div
                className="w-1 bg-leaf/60 rounded-t-full transition-all duration-1000 ease-out origin-bottom"
                style={{ height: `${Math.max(0, plantHeight * 0.7)}%`, minHeight: progress > 5 ? 8 : 0 }}
              />
              {/* Plant emoji - grows */}
              <div
                className="transition-all duration-1000 ease-out"
                style={{
                  fontSize: `${Math.max(20, Math.min(48, 20 + plantHeight * 0.28))}px`,
                  transform: `translateY(-${Math.min(plantHeight * 0.5, 40)}px)`,
                  position: "absolute",
                  bottom: `${Math.max(16, plantHeight * 0.6)}px`,
                }}
              >
                {currentStage.emoji}
              </div>
            </>
          )}
        </div>

        {/* Stage indicators */}
        <div className="absolute bottom-5 right-3 flex flex-col gap-0.5">
          {STAGES.map((s) => {
            const isActive = s.name === currentStage.name;
            const isPast = progress > s.endPct;
            return (
              <div
                key={s.name}
                className={`flex items-center gap-1.5 text-[10px] transition-all duration-300 ${
                  isActive
                    ? "font-bold text-foreground scale-110 origin-left"
                    : isPast
                    ? "text-muted-foreground line-through opacity-60"
                    : "text-muted-foreground opacity-40"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>
            {isFuture
              ? "Starts soon"
              : isComplete
              ? "✅ Ready to harvest!"
              : `Day ${effectiveDaysPassed} of ${adjustedTotalDays}`}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Stage label */}
      <div
        className={`rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 ${currentStage.color}/10 border border-current/10`}
        style={{
          backgroundColor: `hsl(var(--${currentStage.color === "bg-primary" ? "primary" : currentStage.color === "bg-accent" ? "accent" : "leaf"}) / 0.08)`,
          borderColor: `hsl(var(--${currentStage.color === "bg-primary" ? "primary" : currentStage.color === "bg-accent" ? "accent" : "leaf"}) / 0.2)`,
        }}
      >
        <span className="text-lg">{currentStage.emoji}</span>
        <div>
          <p className="font-semibold text-foreground">
            {isFuture ? "Awaiting Planting" : isComplete ? "Harvest Time!" : `Stage: ${currentStage.name}`}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isFuture
              ? "This crop hasn't been planted yet"
              : isComplete
              ? "Your crop has reached full maturity"
              : `${currentStage.startPct}%–${currentStage.endPct}% of growth cycle`}
          </p>
        </div>
      </div>
    </div>
  );
}
