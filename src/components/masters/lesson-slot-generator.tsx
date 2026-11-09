"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { generateLessonSlots } from "@/lib/actions/lesson-slots";
import { lessonEnd } from "@/lib/lesson-time";
import type { MasterOption } from "@/lib/masters/types";

export function LessonSlotGenerator({
  schoolId,
  years,
}: {
  schoolId: number;
  years: MasterOption[];
}) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <>
      <div>
        <button
          className="button button-secondary"
          disabled={!years.length}
          onClick={() => setOpen(true)}
        >
          <Plus size={16} /> Buat beberapa JP
        </button>
        {notice && <p role="status">{notice}</p>}
      </div>
      {open && (
        <GeneratorDialog
          schoolId={schoolId}
          years={years}
          onClose={() => setOpen(false)}
          onSuccess={(message) => {
            setNotice(message);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function GeneratorDialog({
  schoolId,
  years,
  onClose,
  onSuccess,
}: {
  schoolId: number;
  years: MasterOption[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [yearId, setYearId] = useState(
    years.length === 1 ? years[0].value : "",
  );
  const [day, setDay] = useState("1");
  const [sequence, setSequence] = useState("1");
  const [start, setStart] = useState("07:00");
  const [count, setCount] = useState("4");
  const [state, action, pending] = useActionState(
    generateLessonSlots.bind(null, schoolId),
    { message: "" },
  );
  const minutes = years.find(
    (year) => year.value === yearId,
  )?.lessonDurationMinutes;
  const end = lessonEnd(start, minutes ?? 0, Number(count));
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [state, onSuccess]);
  return (
    <dialog
      ref={ref}
      className="year-dialog master-dialog"
      aria-labelledby="generate-jp-title"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id="generate-jp-title">Buat beberapa JP</h2>
        <button
          className="icon-button"
          disabled={pending}
          onClick={onClose}
          aria-label="Tutup formulir"
        >
          <X size={18} />
        </button>
      </div>
      <p className="dialog-description">
        Isi jam mulai sekali. Setiap JP menjadi satu slot pelajaran berurutan.
        Untuk istirahat, buat blok JP berikutnya mulai setelah istirahat.
      </p>
      <form action={action}>
        <fieldset className="year-fields master-fields" disabled={pending}>
          <label htmlFor="generate-year">
            Tahun ajaran
            <select
              id="generate-year"
              name="academicYearId"
              required
              value={yearId}
              onChange={(event) => setYearId(event.target.value)}
            >
              <option value="">Pilih tahun ajaran</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="generate-day">
            Hari
            <select
              id="generate-day"
              name="dayOfWeek"
              required
              value={day}
              onChange={(event) => setDay(event.target.value)}
            >
              {[
                "Senin",
                "Selasa",
                "Rabu",
                "Kamis",
                "Jumat",
                "Sabtu",
                "Minggu",
              ].map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="generate-sequence">
            Nomor urut pertama
            <input
              id="generate-sequence"
              name="firstSequenceNumber"
              type="number"
              min={1}
              max={32767}
              required
              value={sequence}
              onChange={(event) => setSequence(event.target.value)}
            />
          </label>
          <label htmlFor="generate-start">
            Jam mulai
            <input
              id="generate-start"
              name="startsAt"
              type="time"
              required
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </label>
          <label htmlFor="generate-count">
            Jumlah JP
            <input
              id="generate-count"
              name="count"
              type="number"
              min={1}
              max={48}
              required
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </label>
        </fieldset>
        <p className="dialog-description" role="status">
          {minutes && end
            ? `${count} JP × ${minutes} menit · ${start}–${end}`
            : "Pilih tahun ajaran dan rentang yang selesai pada hari yang sama."}
        </p>
        <p className="dialog-description">
          Jika ada nomor urut atau jam yang bentrok, seluruh pembuatan
          dibatalkan. Slot yang sudah ada tetap tersimpan.
        </p>
        {state.message && !state.success && (
          <p className="form-error" role="alert">
            {state.message}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="button button-secondary"
            disabled={pending}
            onClick={onClose}
          >
            Batal
          </button>
          <button className="button button-primary" disabled={pending || !end}>
            {pending ? "Membuat…" : "Buat slot pelajaran"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
