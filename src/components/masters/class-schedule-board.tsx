"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import type {
  ExternalTeacherAvailability,
  ScheduleClass,
  ScheduleEntry,
  ScheduleRequirement,
  ScheduleRoom,
  ScheduleSlot,
  ScheduleTeacher,
  ScheduleVersion,
} from "@/lib/class-schedule";
import { ScheduleEntryForm } from "./class-schedule-forms";
import styles from "./class-schedule.module.css";

type Selection = { slotId: number; entryId?: number };

export function ClassScheduleBoard({
  schoolId,
  version,
  group,
  classGroups,
  slots,
  entries,
  requirements,
  teachers,
  availability,
  rooms,
}: {
  schoolId: number;
  version: ScheduleVersion;
  group: ScheduleClass;
  classGroups: ScheduleClass[];
  slots: ScheduleSlot[];
  entries: ScheduleEntry[];
  requirements: ScheduleRequirement[];
  teachers: ScheduleTeacher[];
  availability: ExternalTeacherAvailability;
  rooms: ScheduleRoom[];
}) {
  const [selection, setSelection] = useState<Selection>();
  const [notice, setNotice] = useState("");
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const gridHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (selection) editorHeading.current?.focus();
  }, [selection]);

  const sortedSlots = [...slots].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.startsAt.localeCompare(b.startsAt),
  );
  const weekdays = new Map<number, ScheduleSlot[]>();
  for (const slot of sortedSlots) {
    const day = weekdays.get(slot.dayOfWeek);
    if (day) day.push(slot);
    else weekdays.set(slot.dayOfWeek, [slot]);
  }
  const classEntries = entries.filter(
    (entry) => entry.classGroupId === group.id,
  );
  const entriesBySlot = new Map(
    classEntries.flatMap((entry) =>
      entry.timeSlotIds.map((id) => [id, entry] as const),
    ),
  );
  const requirementsById = new Map(
    requirements.map((row) => [row.requirementId, row]),
  );
  const teachersById = new Map(teachers.map((row) => [row.id, row]));
  const roomsById = new Map(rooms.map((row) => [row.id, row]));
  const selectedEntry = classEntries.find(
    (entry) => entry.id === selection?.entryId,
  );
  const canEdit = version.status === "DRAFT" && requirements.length > 0;
  const totalJp = requirements.reduce((sum, row) => sum + row.weeklyJp, 0);
  const remainingJp = requirements.reduce(
    (sum, row) => sum + Math.max(0, row.weeklyJp - row.scheduledJp),
    0,
  );
  const complete = requirements.filter(
    (row) => row.scheduledJp >= row.weeklyJp,
  ).length;
  const closeEditor = () => {
    setSelection(undefined);
    gridHeading.current?.focus({ preventScroll: true });
  };
  const openEditor = (next: Selection) => {
    setNotice("");
    setSelection(next);
  };

  return (
    <div className={styles.board}>
      <section
        className={"year-panel " + styles.progress}
        aria-labelledby="schedule-progress"
      >
        <div className={styles.progressHeader}>
          <div>
            <h2 id="schedule-progress">Target JP · {group.name}</h2>
            <p>
              {totalJp
                ? remainingJp +
                  " JP tersisa dari " +
                  totalJp +
                  " JP · " +
                  complete +
                  "/" +
                  requirements.length +
                  " mapel mencapai target"
                : "Belum ada kebutuhan mapel untuk kelas ini."}
            </p>
          </div>
          {totalJp > 0 && (
            <progress
              aria-label="Pemenuhan target JP"
              value={totalJp - remainingJp}
              max={totalJp}
            />
          )}
        </div>
        {requirements.length > 0 && (
          <details className={styles.requirementDetails}>
            <summary>Rincian per mapel</summary>
            <ul>
              {requirements.map((row) => {
                const difference = row.weeklyJp - row.scheduledJp;
                return (
                  <li key={row.requirementId}>
                    <span>{row.subjectName}</span>
                    <strong>
                      {row.scheduledJp}/{row.weeklyJp} JP
                    </strong>
                    <small>
                      {difference > 0
                        ? "Sisa " + difference + " JP"
                        : difference < 0
                          ? "Lebih " + -difference + " JP"
                          : "Terpenuhi"}
                    </small>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>

      <section aria-labelledby="schedule-week">
        <div className={styles.weekHeading}>
          <h2 id="schedule-week" ref={gridHeading} tabIndex={-1}>
            Jadwal mingguan
          </h2>
          {!canEdit && version.status !== "DRAFT" && <span>Hanya baca</span>}
        </div>
        {notice && (
          <p role="status" className={"success-notice " + styles.notice}>
            {notice}
          </p>
        )}
        {canEdit &&
          selection &&
          (selection.entryId === undefined || selectedEntry) && (
            <div className={"year-panel " + styles.editor}>
              <h3 ref={editorHeading} tabIndex={-1}>
                {selectedEntry ? "Edit pertemuan" : "Tambah pertemuan"}
              </h3>
              <ScheduleEntryForm
                key={(selectedEntry?.id ?? "new") + ":" + selection.slotId}
                schoolId={schoolId}
                versionId={version.id}
                classId={group.id}
                entry={selectedEntry}
                initialSlotId={selection.slotId}
                slots={sortedSlots}
                requirements={requirements}
                draftEntries={entries}
                classGroups={classGroups}
                teachers={teachers}
                availability={availability}
                rooms={rooms}
                onClose={closeEditor}
                onSaved={(message) => {
                  setNotice(message);
                  closeEditor();
                }}
              />
            </div>
          )}
        {!weekdays.size ? (
          <p className="empty-state">
            Belum ada slot waktu di tahun ajaran ini.
          </p>
        ) : (
          <div
            className={styles.weekScroll}
            role="region"
            aria-label="Grid jadwal mingguan"
            tabIndex={0}
          >
            <div className={styles.week}>
              {[...weekdays].map(([day, daySlots]) => (
                <section
                  key={day}
                  className={styles.day}
                  aria-label={daySlots[0].dayName}
                >
                  <h3>{daySlots[0].dayName}</h3>
                  {daySlots.map((slot) => {
                    const entry = entriesBySlot.get(slot.id);
                    const time =
                      slot.startsAt.slice(0, 5) + "–" + slot.endsAt.slice(0, 5);
                    if (entry) {
                      const subject =
                        requirementsById.get(entry.requirementId)
                          ?.subjectName ?? "Pertemuan";
                      const teacher = teachersById.get(entry.teacherId)?.name;
                      const room =
                        entry.roomId === null
                          ? undefined
                          : roomsById.get(entry.roomId)?.name;
                      const content = (
                        <>
                          <strong>{subject}</strong>
                          <span>
                            {slot.id === entry.timeSlotIds[0]
                              ? teacher
                              : "Lanjutan"}
                            {room ? " · " + room : ""}
                          </span>
                        </>
                      );
                      return (
                        <Slot key={slot.id} time={time} kind="meeting">
                          {canEdit ? (
                            <button
                              type="button"
                              className={styles.slotButton}
                              aria-label={
                                "Edit " +
                                subject +
                                ", " +
                                slot.dayName +
                                " " +
                                time
                              }
                              onClick={() =>
                                openEditor({
                                  entryId: entry.id,
                                  slotId: entry.timeSlotIds[0],
                                })
                              }
                            >
                              {content}
                            </button>
                          ) : (
                            content
                          )}
                        </Slot>
                      );
                    }
                    return (
                      <Slot
                        key={slot.id}
                        time={time}
                        kind={slot.kind === "LESSON" ? "lesson" : "activity"}
                      >
                        {slot.kind === "LESSON" && canEdit ? (
                          <button
                            type="button"
                            className={styles.slotButton}
                            aria-label={
                              "Tambah pertemuan, " + slot.dayName + " " + time
                            }
                            onClick={() => openEditor({ slotId: slot.id })}
                          >
                            <Plus size={14} aria-hidden="true" />
                            {slot.label}
                          </button>
                        ) : (
                          <span>{slot.label}</span>
                        )}
                      </Slot>
                    );
                  })}
                </section>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Slot({
  time,
  kind,
  children,
}: {
  time: string;
  kind: "meeting" | "lesson" | "activity";
  children: ReactNode;
}) {
  return (
    <div className={styles.slot + " " + styles[kind]}>
      <span className={styles.time}>{time}</span>
      {children}
    </div>
  );
}
