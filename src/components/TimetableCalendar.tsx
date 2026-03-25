import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay } from "date-fns";
import { GrowthStage } from "@/lib/cropStages";
import { CropInfo } from "@/data/cropData";

interface CalendarEntry {
  cropKey: string;
  crop: CropInfo;
  plantingDate: Date;
  stages: GrowthStage[];
}

interface Props {
  entries: CalendarEntry[];
  month: Date;
  onMonthChange: (date: Date) => void;
}

function getStageForDay(entry: CalendarEntry, day: Date): { stage: GrowthStage; isHarvest: boolean } | null {
  const dayOffset = Math.floor((day.getTime() - entry.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
  if (dayOffset < 0) return null;

  const lastStage = entry.stages[entry.stages.length - 1];
  if (dayOffset >= lastStage.endDay) return null;

  // Check if it's the harvest day (last day of last stage)
  const isHarvest = dayOffset === lastStage.endDay - 1;

  for (const stage of entry.stages) {
    if (dayOffset >= stage.startDay && dayOffset < stage.endDay) {
      return { stage, isHarvest };
    }
  }
  return null;
}

export default function TimetableCalendar({ entries, month, onMonthChange }: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for start of week (Sunday = 0)
  const startPadding = getDay(monthStart);

  const prevMonth = () => {
    const d = new Date(month);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };
  const nextMonth = () => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
          ← Prev
        </button>
        <h3 className="font-display font-semibold text-lg">{format(month, "MMMM yyyy")}</h3>
        <button onClick={nextMonth} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
          Next →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground text-center py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty padding cells */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const today = isSameDay(day, new Date());
          const stageInfos = entries
            .map((e) => ({ entry: e, result: getStageForDay(e, day) }))
            .filter((s) => s.result !== null);

          const hasHarvest = stageInfos.some((s) => s.result?.isHarvest);

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square rounded-lg border text-xs flex flex-col items-center justify-start p-1 transition-all relative ${
                today ? "border-primary bg-primary/5 font-bold" : "border-transparent hover:border-border"
              } ${hasHarvest ? "ring-2 ring-primary ring-offset-1" : ""}`}
            >
              <span className={`text-[11px] ${today ? "text-primary" : "text-foreground"}`}>
                {format(day, "d")}
              </span>

              <div className="flex flex-wrap gap-[2px] mt-0.5 justify-center">
                {stageInfos.map((s, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${s.result!.stage.color}`}
                    title={`${s.entry.crop.emoji} ${s.entry.crop.name}: ${s.result!.stage.name}${s.result!.isHarvest ? " 🎉 HARVEST DAY" : ""}`}
                  />
                ))}
              </div>

              {hasHarvest && (
                <span className="text-[9px] mt-auto" title="Harvest day!">🎉</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2 border-t">
          {entries.map((e) => {
            const harvestDate = addDays(e.plantingDate, e.stages[e.stages.length - 1].endDay);
            return (
              <div key={e.cropKey} className="flex items-center gap-1.5 text-xs">
                <span>{e.crop.emoji}</span>
                <span className="font-medium">{e.crop.name}</span>
                <span className="text-muted-foreground">· Harvest: {format(harvestDate, "MMM d")}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            🎉 = Harvest day
          </div>
        </div>
      )}
    </div>
  );
}
