import { useState, useEffect, useRef } from "react";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { GrowthStage } from "@/lib/cropStages";
import { CropInfo } from "@/data/cropData";
import { ForecastDay } from "@/hooks/useForecast";
import { CalendarReminder } from "@/hooks/useCalendarReminders";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Wind, StickyNote, X, Pencil, Bell, BellRing, Trash2, Clock } from "lucide-react";

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
  reminders?: CalendarReminder[];
  onAddReminder?: (date: string, time: string, message: string) => void;
  onDeleteReminder?: (id: string) => void;
  getRemindersForDate?: (dateKey: string) => CalendarReminder[];
}

function getWeatherIcon(code: number) {
  // Larger, bolder icons with colored backgrounds
  if (code === 0) return <Sun className="h-4.5 w-4.5 text-amber-500 drop-shadow-sm" />;
  if (code <= 3) return <Cloud className="h-4.5 w-4.5 text-slate-400 drop-shadow-sm" />;
  if (code <= 48) return <CloudFog className="h-4.5 w-4.5 text-slate-400 drop-shadow-sm" />;
  if (code <= 55) return <CloudDrizzle className="h-4.5 w-4.5 text-sky-400 drop-shadow-sm" />;
  if (code <= 65) return <CloudRain className="h-4.5 w-4.5 text-sky-500 drop-shadow-sm" />;
  if (code <= 75) return <CloudSnow className="h-4.5 w-4.5 text-blue-400 drop-shadow-sm" />;
  if (code <= 82) return <CloudRain className="h-4.5 w-4.5 text-sky-600 drop-shadow-sm" />;
  if (code >= 95) return <CloudLightning className="h-4.5 w-4.5 text-amber-600 drop-shadow-sm" />;
  return <Wind className="h-4.5 w-4.5 text-slate-400 drop-shadow-sm" />;
}

function getWeatherBg(code: number) {
  if (code === 0) return "bg-amber-50 dark:bg-amber-950/30";
  if (code <= 3) return "bg-slate-50 dark:bg-slate-900/30";
  if (code <= 48) return "bg-slate-100 dark:bg-slate-900/40";
  if (code <= 65) return "bg-sky-50 dark:bg-sky-950/30";
  if (code <= 75) return "bg-blue-50 dark:bg-blue-950/30";
  if (code <= 82) return "bg-sky-100 dark:bg-sky-950/40";
  if (code >= 95) return "bg-amber-50 dark:bg-amber-950/30";
  return "";
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

export default function TimetableCalendar({ entries, month, onMonthChange, forecastDays, notes, onNoteChange, reminders, onAddReminder, onDeleteReminder, getRemindersForDate }: Props) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderMsg, setReminderMsg] = useState("");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

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

  const openNoteEditor = (dateKey: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const calendarRect = calendarRef.current?.getBoundingClientRect();
    if (calendarRect) {
      const top = rect.bottom - calendarRect.top + 8;
      let left = rect.left - calendarRect.left;
      // Keep popup within calendar bounds
      left = Math.max(0, Math.min(left, calendarRect.width - 280));
      setPopupPosition({ top, left });
    }
    setEditingNote(dateKey);
    setNoteText(notes?.[dateKey] || "");
  };

  const saveNote = () => {
    if (editingNote && onNoteChange) {
      onNoteChange(editingNote, noteText.trim());
    }
    setEditingNote(null);
    setNoteText("");
    setPopupPosition(null);
  };

  const closePopup = () => {
    setEditingNote(null);
    setNoteText("");
    setPopupPosition(null);
  };

  // Close popup on outside click
  useEffect(() => {
    if (!editingNote) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        closePopup();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editingNote]);

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 relative" ref={calendarRef}>
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
          const noteContent = notes?.[dateKey];
          const hasNote = noteContent && noteContent.length > 0;
          const weatherBg = forecast ? getWeatherBg(forecast.weatherCode) : "";

          const stageInfos = entries
            .map((e) => ({ entry: e, result: getStageForDay(e, day) }))
            .filter((s) => s.result !== null);

          const hasHarvest = stageInfos.some((s) => s.result?.isHarvest);

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square rounded-lg border text-xs flex flex-col items-center justify-start p-1 transition-all relative cursor-pointer group ${weatherBg} ${
                today ? "border-primary bg-primary/5 font-bold" : "border-transparent hover:border-border"
              } ${hasHarvest ? "ring-2 ring-primary ring-offset-1" : ""}`}
              onClick={(e) => openNoteEditor(dateKey, e)}
            >
              {/* Date number */}
              <div className="flex items-center w-full justify-between">
                <span className={`text-[11px] ${today ? "text-primary" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
                {/* Add note icon on hover */}
                <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>

              {/* Weather icon - prominent */}
              {forecast && (
                <div
                  className="flex items-center justify-center my-0.5"
                  title={`${forecast.tempMax}°/${forecast.tempMin}° · ${forecast.precipitation}mm rain`}
                >
                  {getWeatherIcon(forecast.weatherCode)}
                </div>
              )}

              {/* Crop stages */}
              <div className="flex flex-col gap-[2px] items-center overflow-hidden w-full">
                {stageInfos.slice(0, 1).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-0.5 w-full justify-center"
                    title={`${s.entry.crop.emoji} ${s.entry.crop.name}: ${s.result!.stage.name}${s.result!.isHarvest ? " 🎉 HARVEST DAY" : ""}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.result!.stage.color}`} />
                    <span className="text-[7px] text-muted-foreground truncate leading-tight">{s.result!.stage.name}</span>
                  </div>
                ))}
                {stageInfos.length > 1 && (
                  <span className="text-[7px] text-muted-foreground">+{stageInfos.length - 1}</span>
                )}
              </div>

              {hasHarvest && (
                <span className="text-[9px] mt-auto" title="Harvest day!">🎉</span>
              )}

              {/* Note preview badge - visible without clicking */}
              {hasNote && (
                <div className="absolute bottom-0 left-0 right-0 bg-amber-100 dark:bg-amber-900/50 rounded-b-lg px-1.5 py-1 flex items-center gap-1 overflow-hidden">
                  <StickyNote className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-[9px] font-medium text-amber-700 dark:text-amber-300 truncate leading-snug">{noteContent}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Popup note editor */}
      {editingNote && popupPosition && (
        <div
          ref={popupRef}
          className="absolute z-50 w-[280px] rounded-xl border bg-card shadow-xl p-4 space-y-3 animate-fade-in-up"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-500" />
              {format(new Date(editingNote + "T00:00:00"), "MMM d, yyyy")}
            </h4>
            <button onClick={closePopup} className="rounded p-1 hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Show forecast in popup too */}
          {forecastMap.get(editingNote) && (() => {
            const f = forecastMap.get(editingNote)!;
            return (
              <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-muted/50 px-2.5 py-1.5">
                {getWeatherIcon(f.weatherCode)}
                <span>{f.tempMax}°/{f.tempMin}°</span>
                <span>·</span>
                <span>{f.precipitation}mm rain</span>
              </div>
            );
          })()}

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Apply fertilizer, Check irrigation..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px] resize-none"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            {notes?.[editingNote] && (
              <button
                onClick={() => { onNoteChange?.(editingNote, ""); closePopup(); }}
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
            🎉 Harvest · 📝 Note
          </div>
        </div>
      )}

      {/* Weather legend */}
      {forecastDays && forecastDays.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-2 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-amber-500" /> Clear</span>
          <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5 text-slate-400" /> Cloudy</span>
          <span className="flex items-center gap-1.5"><CloudRain className="h-3.5 w-3.5 text-sky-500" /> Rain</span>
          <span className="flex items-center gap-1.5"><CloudLightning className="h-3.5 w-3.5 text-amber-600" /> Storm</span>
        </div>
      )}
    </div>
  );
}
