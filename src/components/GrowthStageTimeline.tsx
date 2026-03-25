import { GrowthStage } from "@/lib/cropStages";
import { CropInfo } from "@/data/cropData";
import { addDays, format } from "date-fns";

interface Props {
  crop: CropInfo;
  stages: GrowthStage[];
  plantingDate: Date;
}

export default function GrowthStageTimeline({ crop, stages, plantingDate }: Props) {
  const totalDays = stages[stages.length - 1]?.endDay ?? crop.growthDays;

  return (
    <div className="space-y-3">
      {/* Visual bar */}
      <div className="flex h-10 rounded-lg overflow-hidden border">
        {stages.map((stage, i) => {
          const width = ((stage.endDay - stage.startDay) / totalDays) * 100;
          return (
            <div
              key={i}
              className={`${stage.color} flex items-center justify-center text-xs font-medium text-white transition-all hover:brightness-110 relative group`}
              style={{ width: `${width}%` }}
              title={`${stage.name}: Day ${stage.startDay}–${stage.endDay} (${format(addDays(plantingDate, stage.startDay), "MMM d")} – ${format(addDays(plantingDate, stage.endDay), "MMM d")})`}
            >
              {width > 12 && (
                <span className="truncate px-1">
                  {stage.emoji} {stage.name}
                </span>
              )}
              {width <= 12 && width > 5 && <span>{stage.emoji}</span>}
            </div>
          );
        })}
      </div>

      {/* Detailed stages list */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage, i) => {
          const startDate = addDays(plantingDate, stage.startDay);
          const endDate = addDays(plantingDate, stage.endDay);
          const duration = stage.endDay - stage.startDay;
          const isLast = i === stages.length - 1;

          return (
            <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center text-sm shrink-0`}>
                {stage.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold flex items-center gap-1">
                  {stage.name}
                  {isLast && <span className="text-[10px] text-primary font-normal ml-1">🎉 Harvest</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">{stage.description}</p>
                <p className="text-[11px] font-medium mt-1">
                  Day {stage.startDay}–{stage.endDay} · {duration} days
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(startDate, "MMM d")} → {format(endDate, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
