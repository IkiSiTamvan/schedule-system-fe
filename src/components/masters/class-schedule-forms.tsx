"use client";

import { startTransition, useActionState, useState } from "react";
import {
  changeScheduleEntry,
  createScheduleDraft,
} from "@/lib/actions/class-schedule";
import type {
  ExternalTeacherAvailability,
  ScheduleClass,
  ScheduleEntry,
  ScheduleRequirement,
  ScheduleRoom,
  ScheduleSlot,
  ScheduleTeacher,
} from "@/lib/class-schedule";
import styles from "./class-schedule.module.css";

export function ScheduleDraftForm({
  schoolId,
  periodId,
  classId,
  initiallyOpen,
}: {
  schoolId: number;
  periodId: number;
  classId: number;
  initiallyOpen: boolean;
}) {
  const [state, submit, pending] = useActionState(
    createScheduleDraft.bind(null, schoolId, periodId, classId),
    { message: "" },
  );
  const [name, setName] = useState("");
  return (
    <details className={styles.draft} open={initiallyOpen}>
      <summary>Buat draft baru</summary>
      <form action={submit} className={styles.draftFields}>
        <label>
          <span>Nama draft</span>
          <input
            name="name"
            maxLength={120}
            required
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            placeholder="Contoh: Draft semester genap"
          />
        </label>
        <button className="button button-primary" disabled={pending}>
          {pending ? "Membuat…" : "Buat draft"}
        </button>
      </form>
      {state.message && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
    </details>
  );
}

export function ScheduleEntryForm({
  schoolId,
  versionId,
  classId,
  entry,
  initialSlotId,
  slots,
  requirements,
  draftEntries,
  classGroups,
  teachers,
  availability,
  rooms,
  onClose,
  onSaved,
}: {
  schoolId: number;
  versionId: number;
  classId: number;
  entry?: ScheduleEntry;
  initialSlotId: number;
  slots: ScheduleSlot[];
  requirements: ScheduleRequirement[];
  draftEntries: ScheduleEntry[];
  classGroups: ScheduleClass[];
  teachers: ScheduleTeacher[];
  availability: ExternalTeacherAvailability;
  rooms: ScheduleRoom[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [requirementId, setRequirementId] = useState(entry?.requirementId ?? 0);
  const [teacherId, setTeacherId] = useState(entry?.teacherId ?? 0);
  const [roomId, setRoomId] = useState(entry?.roomId ?? 0);
  const [slotId, setSlotId] = useState(initialSlotId);
  const [duration, setDuration] = useState(entry?.timeSlotIds.length ?? 1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [state, submit, pending] = useActionState(
    async (previous: { message: string }, form: FormData) => {
      const next = await changeScheduleEntry(
        schoolId,
        versionId,
        classId,
        entry?.id ?? null,
        previous,
        form,
      );
      if (next.success) onSaved(next.message);
      return next;
    },
    { message: "" },
  );

  const requirement = requirements.find(
    (row) => row.requirementId === requirementId,
  );
  const eligibleTeachers = teachers.filter(
    (row) =>
      row.active &&
      requirement &&
      row.subjectIds.includes(requirement.subjectId),
  );
  const eligibleRooms = rooms.filter(
    (room) =>
      !requirement?.requiresLab || room.roomType.toUpperCase() === "LAB",
  );
  const lessonSlots = slots.filter((slot) => slot.kind === "LESSON");
  const start = lessonSlots.findIndex((slot) => slot.id === slotId);
  const run = start === -1 ? [] : [lessonSlots[start]];
  for (
    let index = start + 1;
    run.length && index < lessonSlots.length && run.length < 1439;
    index++
  ) {
    const previous = run[run.length - 1];
    const next = lessonSlots[index];
    if (
      previous.dayOfWeek !== next.dayOfWeek ||
      previous.endsAt !== next.startsAt
    )
      break;
    run.push(next);
  }
  const selectedSlots = run.slice(0, duration);
  const selectedSlotsById = new Map(
    selectedSlots.map((slot) => [slot.id, slot]),
  );
  const classesById = new Map(
    classGroups.map((group) => [group.id, group.name]),
  );
  const conflicts = new Map<number, string>();
  for (const booking of draftEntries) {
    if (booking.id === entry?.id || conflicts.has(booking.teacherId)) continue;
    const collisionId = booking.timeSlotIds.find((id) =>
      selectedSlotsById.has(id),
    );
    if (collisionId === undefined) continue;
    const slot = selectedSlotsById.get(collisionId);
    if (!slot) continue;
    const className =
      classesById.get(booking.classGroupId) ??
      "Rombel #" + booking.classGroupId;
    conflicts.set(
      booking.teacherId,
      "Bentrok · " + className + " · " + slotTime(slot),
    );
  }

  const teacherOptions = eligibleTeachers.map((teacher) => {
    let reason = conflicts.get(teacher.id);
    if (!reason && teacher.external) {
      const availableSlots = availability[teacher.id];
      if (!availableSlots) {
        reason =
          "Jam tersedia gagal dimuat. Muat ulang halaman untuk mencoba lagi.";
      } else {
        const unavailable = selectedSlots.find(
          (slot) => !availableSlots.includes(slot.id),
        );
        if (unavailable)
          reason = "Di luar jam tersedia · " + slotTime(unavailable);
      }
    }
    return { teacher, reason };
  });
  const blockedTeachers = teacherOptions.filter((option) => option.reason);
  const selectedTeacher = teacherOptions.find(
    (option) => option.teacher.id === teacherId,
  );
  const teacherAvailable = selectedTeacher && !selectedTeacher.reason;
  const canSave = Boolean(
    requirement &&
    teacherAvailable &&
    selectedSlots.length === duration &&
    (!requirement.requiresLab ||
      eligibleRooms.some((room) => room.id === roomId)),
  );

  return (
    <form
      aria-label={entry ? "Edit pertemuan" : "Tambah pertemuan"}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const form = new FormData(
          event.currentTarget,
          event.nativeEvent.submitter,
        );
        if (form.get("intent") !== "delete" && !canSave) return;
        startTransition(() => submit(form));
      }}
    >
      <fieldset disabled={pending} className={styles.editorFields}>
        <label>
          <span>Mata pelajaran</span>
          {entry ? (
            <>
              <input
                type="hidden"
                name="requirementId"
                value={entry.requirementId}
              />
              <strong>{requirement?.subjectName ?? "Mapel pertemuan"}</strong>
            </>
          ) : (
            <select
              name="requirementId"
              required
              value={requirementId || ""}
              onChange={(event) => {
                setRequirementId(Number(event.currentTarget.value));
                setTeacherId(0);
                setRoomId(0);
              }}
            >
              <option value="">Pilih mapel</option>
              {requirements.map((row) => (
                <option key={row.requirementId} value={row.requirementId}>
                  {row.subjectName} · {row.scheduledJp}/{row.weeklyJp} JP
                </option>
              ))}
            </select>
          )}
        </label>
        <label>
          <span>Slot mulai</span>
          <select
            value={slotId}
            onChange={(event) => {
              setSlotId(Number(event.currentTarget.value));
              setDuration(1);
            }}
          >
            {lessonSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.dayName} · {slot.startsAt.slice(0, 5)} · {slot.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Durasi</span>
          <select
            value={duration}
            onChange={(event) => setDuration(Number(event.currentTarget.value))}
          >
            {run.map((slot, index) => (
              <option key={slot.id} value={index + 1}>
                {index + 1} JP · sampai {slot.endsAt.slice(0, 5)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Guru</span>
          <select
            name="teacherId"
            required
            disabled={!teacherOptions.length}
            value={teacherAvailable ? teacherId : ""}
            onChange={(event) =>
              setTeacherId(Number(event.currentTarget.value))
            }
          >
            <option value="">
              {requirement ? "Pilih guru" : "Pilih mapel dulu"}
            </option>
            {teacherOptions.map(({ teacher, reason }) => (
              <option
                key={teacher.id}
                value={teacher.id}
                disabled={Boolean(reason)}
              >
                {teacher.name} · {reason ?? "Tersedia · " + duration + " JP"}
                {teacher.external ? " · Guru luar" : ""}
              </option>
            ))}
          </select>
          {requirement && !teacherOptions.length && (
            <small>Belum ada guru aktif untuk mapel ini.</small>
          )}
        </label>
        <label>
          <span>
            {requirement?.requiresLab ? "Laboratorium" : "Ruangan (opsional)"}
          </span>
          <select
            name="roomId"
            value={roomId || ""}
            required={requirement?.requiresLab}
            onChange={(event) => setRoomId(Number(event.currentTarget.value))}
          >
            <option value="">
              {requirement?.requiresLab
                ? "Pilih laboratorium"
                : "Tanpa ruangan"}
            </option>
            {eligibleRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          {requirement?.requiresLab && !eligibleRooms.length && (
            <small>Belum ada laboratorium di Master Ruangan.</small>
          )}
        </label>
        {selectedSlots.map((slot) => (
          <input
            key={slot.id}
            type="hidden"
            name="timeSlotIds"
            value={slot.id}
          />
        ))}
      </fieldset>
      <div className={styles.teacherAvailability}>
        <p aria-live="polite">
          {selectedTeacher?.reason
            ? selectedTeacher.teacher.name + " · " + selectedTeacher.reason
            : teacherOptions.length > 0
              ? teacherOptions.length -
                blockedTeachers.length +
                " dari " +
                teacherOptions.length +
                " guru tersedia untuk " +
                duration +
                " JP."
              : ""}
        </p>
        {blockedTeachers.length > 0 && (
          <details>
            <summary>Lihat alasan guru tidak tersedia</summary>
            <ul>
              {blockedTeachers.map(({ teacher, reason }) => (
                <li key={teacher.id}>
                  <strong>{teacher.name}</strong> · {reason}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      {state.message && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
      {confirmDelete && (
        <p className={styles.confirmation}>Hapus pertemuan ini dari draft?</p>
      )}
      <div className={styles.editorActions}>
        {entry &&
          (confirmDelete ? (
            <button
              key="confirm-delete"
              type="submit"
              className="button button-danger"
              name="intent"
              value="delete"
              formNoValidate
              disabled={pending}
            >
              Ya, hapus pertemuan
            </button>
          ) : (
            <button
              key="request-delete"
              type="button"
              className="button button-danger"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              Hapus pertemuan
            </button>
          ))}
        <button
          type="button"
          className="button button-secondary"
          disabled={pending}
          onClick={confirmDelete ? () => setConfirmDelete(false) : onClose}
        >
          Batal
        </button>
        {!confirmDelete && (
          <button
            type="submit"
            className="button button-primary"
            disabled={pending || !canSave}
          >
            {pending ? "Menyimpan…" : "Simpan pertemuan"}
          </button>
        )}
      </div>
    </form>
  );
}

function slotTime(slot: ScheduleSlot) {
  return (
    slot.dayName +
    " " +
    slot.startsAt.slice(0, 5) +
    "–" +
    slot.endsAt.slice(0, 5)
  );
}
