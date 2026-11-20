"use client";

import { useActionState, useState } from "react";
import { saveTeacherAvailability } from "@/lib/actions/teacher-availability";
import type { TeacherAvailability } from "@/lib/teacher-availability";
import styles from "./teacher-availability-form.module.css";

export function TeacherAvailabilityForm({
  schoolId,
  teacherId,
  periodId,
  data,
  canManage,
}: {
  schoolId: number;
  teacherId: number;
  periodId: number;
  data: TeacherAvailability;
  canManage: boolean;
}) {
  const [selected, setSelected] = useState(
    () => new Set(data.availableSlotIds),
  );
  const [state, save, pending] = useActionState(
    saveTeacherAvailability.bind(null, schoolId, teacherId, periodId),
    { message: "" },
  );
  const days = Map.groupBy(data.slots, (slot) => slot.dayOfWeek);

  return (
    <form action={save} className={`year-panel ${styles.panel}`}>
      <div className={styles.week}>
        {[...days].map(([day, slots]) => (
          <fieldset
            key={day}
            disabled={!canManage || pending}
            className={styles.day}
          >
            <legend>{slots[0].dayName}</legend>
            {slots.map((slot) => (
              <label className={styles.slot} key={slot.id}>
                <input
                  type="checkbox"
                  name="timeSlotIds"
                  value={slot.id}
                  checked={selected.has(slot.id)}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setSelected((before) => {
                      const next = new Set(before);
                      if (checked) next.add(slot.id);
                      else next.delete(slot.id);
                      return next;
                    });
                  }}
                />
                <span>
                  {slot.startsAt.slice(0, 5)}–{slot.endsAt.slice(0, 5)}
                </span>
                <span className={styles.label}>{slot.label}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      {canManage && (
        <div className={styles.footer}>
          <button
            type="submit"
            className="button button-primary"
            disabled={pending}
          >
            {pending ? "Menyimpan…" : "Simpan jam tersedia"}
          </button>
          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              className={state.success ? undefined : "form-error"}
            >
              {state.message}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
