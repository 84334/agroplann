import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { crops } from "@/data/cropData";
import { toast } from "sonner";

interface PlannedCrop {
  id: string;
  cropKey: string;
  plantingDate: string;
  growthDays: number;
}

const TIMETABLE_PLAN_NAME = "__timetable_autosave__";

export function useTimetablePersistence() {
  const { user } = useAuth();
  const [planned, setPlanned] = useState<PlannedCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load on mount
  useEffect(() => {
    if (!user) {
      setPlanned([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("saved_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_name", TIMETABLE_PLAN_NAME)
        .maybeSingle();

      if (data && !error) {
        const seq = data.rotation_sequence;
        if (Array.isArray(seq)) {
          setPlanned(seq as unknown as PlannedCrop[]);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Debounced save
  const persist = useCallback(
    (crops: PlannedCrop[]) => {
      if (!user) return;
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const { data: existing } = await supabase
          .from("saved_plans")
          .select("id")
          .eq("user_id", user.id)
          .eq("plan_name", TIMETABLE_PLAN_NAME)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("saved_plans")
            .update({ rotation_sequence: crops as any, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabase.from("saved_plans").insert({
            user_id: user.id,
            plan_name: TIMETABLE_PLAN_NAME,
            previous_crop: crops[0]?.cropKey || "none",
            rotation_sequence: crops as any,
          });
        }
      }, 800);
    },
    [user]
  );

  const updatePlanned = useCallback(
    (updater: PlannedCrop[] | ((prev: PlannedCrop[]) => PlannedCrop[])) => {
      setPlanned((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { planned, setPlanned: updatePlanned, loading };
}
