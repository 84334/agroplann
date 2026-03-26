import { useState } from "react";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { GrowthStage } from "@/lib/cropStages";
import { CropInfo } from "@/data/cropData";
import { ForecastDay } from "@/hooks/useForecast";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Wind, StickyNote, X } from "lucide-react";

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
  forecastDays?: ForecastDay[];
  notes?: Record<string, string>;
  onNoteChange?: (dateKey: string, note: string) => void;
}

function getWeatherIcon(code: number) {
  if (code === 0) return <Sun className="h-3.5 w-3.5 text-amber-500" />;
  if (code <= 3) return <Cloud className="h-3.5 w-3.5 text-muted-foreground" />;
  if (code <= 48) return <CloudFog className="h-3.5 w-3.5 text-muted-foreground" />;
  if (code <= 55) return <CloudDrizzle className="h-3.5 w-3.5 text-sky-400" />;
  if (code <= 65) return <CloudRain className="h-3.5 w-3.5 text-sky-500" />;
  if (code <= 75) return <CloudSnow className="h-3.5 w-3.5 text-blue-300" />;
  if (code <= 82) return <CloudRain className="h-3.5 w-3.5 text-sky-600" />;
  if (code >= 95) return <CloudLightning className="h-3.5 w-3.5 text-amber-600" />;
  return <Wind className="h-3.5 w-3.5 text-muted-foreground" />;
}

function getStageForDay(entry: CalendarEntry, day: Date): { stage: GrowthStage; isHarvest: boolean } | null {
  const dayOffset = Math.floor((day.getTime() - entry.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
  if (dayOffset < 0) return null;
  const lastStage = entry.stages[entry.stages.length - 1];
  if (dayOffset >= lastStage.endDay) return null;
  const isHarvest = dayOffset === lastStage.endDay - 1;
  for (const stage of entry.stages) {
    if (dayOffset >= stage.startDay && dayOffset < stage.endDay) {
      return { stage, isHarvest };
    }
  }
  return null;
}

export default function TimetableCalendar({ entries, month, onMonthChange, forecastDays, notes, onNoteChange }: Props) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  // Build forecast lookup by date string
  const forecastMap = new Map<string, ForecastDay>();
  forecastDays?.forEach((d) => forecastMap.set(d.date, d));

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

  const openNoteEditor = (dateKey: string) => {
    setEditingNote(dateKey);
    setNoteText(notes?.[dateKey] || "");
  };

  const saveNote = () => {
    if (editingNote && onNoteChange) {
      onNoteChange(editingNote, noteText.trim());
    }
    setEditingNote(null);
    setNoteText("");
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
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const today = isSameDay(day, new Date());
          const dateKey = format(day, "yyyy-MM-dd");
          const forecast = forecastMap.get(dateKey);
          const hasNote = notes?.[dateKey] && notes[dateKey].length > 0;

          const stageInfos = entries
            .map((e) => ({ entry: e, result: getStageForDay(e, day) }))
            .filter((s) => s.result !== null);

          const hasHarvest = stageInfos.some((s) => s.result?.isHarvest);

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square rounded-lg border text-xs flex flex-col items-center justify-start p-1 transition-all relative cursor-pointer group ${
                today ? "border-primary bg-primary/5 font-bold" : "border-transparent hover:border-border"
              } ${hasHarvest ? "ring-2 ring-primary ring-offset-1" : ""}`}
              onClick={() => openNoteEditor(dateKey)}
              title={hasNote ? `📝 ${notes![dateKey]}` : "Click to add note"}
            >
              {/* Date number + weather icon */}
              <div className="flex items-center gap-0.5 w-full justify-between">
                <span className={`text-[11px] ${today ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
                {forecast && (
                  <span title={`${forecast.tempMax}°/${forecast.tempMin}° · ${forecast.precipitation}mm`}>
                    {getWeatherIcon(forecast.weatherCode)}
                  </span>
                )}
              </div>

              {/* Crop stages */}
              <div className="flex flex-col gap-[2px] mt-0.5 items-center overflow-hidden w-full">
                {stageInfos.slice(0, 2).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 w-full justify-center"
                    title={`${s.entry.crop.emoji} ${s.entry.crop.name}: ${s.result!.stage.name}${s.result!.isHarvest ? " 🎉 HARVEST DAY" : ""}`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.result!.stage.color}`} />
                    <span className="text-[8px] text-muted-foreground truncate leading-tight">{s.result!.stage.name}</span>
                  </div>
                ))}
                {stageInfos.length > 2 && (
                  <span className="text-[8px] text-muted-foreground">+{stageInfos.length - 2}</span>
                )}
              </div>

              {hasHarvest && (
                <span className="text-[9px] mt-auto" title="Harvest day!">🎉</span>
              )}

              {/* Note indicator */}
              {hasNote && (
                <StickyNote className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 text-amber-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Note editor modal */}
      {editingNote && (
        <div className="rounded-lg border bg-card p-4 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Note for {format(new Date(editingNote + "T00:00:00"), "MMM d, yyyy")}
            </h4>
            <button onClick={() => setEditingNote(null)} className="rounded p-1 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Apply fertilizer today, Check irrigation..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px] resize-none"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            {notes?.[editingNote] && (
              <button
                onClick={() => { onNoteChange?.(editingNote, ""); setEditingNote(null); setNoteText(""); }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={saveNote}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

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
            🎉 = Harvest · 📝 = Note
          </div>
        </div>
      )}

      {/* Weather legend */}
      {forecastDays && forecastDays.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2 border-t text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Sun className="h-3 w-3 text-amber-500" /> Clear</span>
          <span className="flex items-center gap-1"><Cloud className="h-3 w-3" /> Cloudy</span>
          <span className="flex items-center gap-1"><CloudRain className="h-3 w-3 text-sky-500" /> Rain</span>
          <span className="flex items-center gap-1"><CloudLightning className="h-3 w-3 text-amber-600" /> Storm</span>
        </div>
      )}
    </div>
  );
}
