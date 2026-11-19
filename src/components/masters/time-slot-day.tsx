"use client";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { appendTimeSlots, saveTimeSlotDay } from "@/lib/actions/time-slot-day";
import { lessonEnd } from "@/lib/lesson-time";
import { previewDay, type DaySlot, type SlotDay } from "@/lib/time-slot-day";

type Context = {
  schoolId: number;
  yearId: number;
  day: number;
  data: SlotDay;
  canManage: boolean;
};

export function TimeSlotDay(props: Context & { lessonMinutes: number }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [editorBusy, setEditorBusy] = useState(false);
  const [appendBusy, setAppendBusy] = useState(false);
  const done = useCallback(
    (message: string) => {
      setNotice(message);
      router.refresh();
    },
    [router],
  );
  return (
    <>
      {notice && (
        <p className="success-notice" role="status">
          {notice}
        </p>
      )}
      <DayEditor
        {...props}
        onSuccess={done}
        onDirty={setDirty}
        onBusy={setEditorBusy}
        externalBusy={appendBusy}
      />
      {props.canManage && (
        <AppendForm
          {...props}
          onSuccess={done}
          onBusy={setAppendBusy}
          disabled={dirty || editorBusy}
        />
      )}
    </>
  );
}

function DayEditor({
  schoolId,
  yearId,
  day,
  data,
  canManage,
  onSuccess,
  onDirty,
  onBusy,
  externalBusy,
}: Context & {
  onSuccess: (message: string) => void;
  onDirty: (dirty: boolean) => void;
  onBusy: (busy: boolean) => void;
  externalBusy: boolean;
}) {
  const [draft, setDraft] = useState(data.slots);
  const [start, setStart] = useState(
    data.slots[0]?.startsAt.slice(0, 5) ?? "07:00",
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const dragId = useRef<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState(
    saveTimeSlotDay.bind(null, schoolId, yearId, day, data.revision),
    { message: "" },
  );
  const serialize = (rows: DaySlot[]) =>
    JSON.stringify(
      rows.map(({ id, label, durationMinutes }) => ({
        id,
        label,
        durationMinutes,
      })),
    );
  const dirty =
    serialize(draft) !== serialize(data.slots) ||
    start !== (data.slots[0]?.startsAt.slice(0, 5) ?? "07:00");
  const preview = dirty ? previewDay(draft, start) : draft;
  const valid =
    /^([01]\d|2[0-3]):[0-5]\d$/.test(start) &&
    preview.every(
      (slot) =>
        slot.startsAt &&
        slot.endsAt &&
        slot.label.trim() &&
        Number.isInteger(slot.durationMinutes) &&
        slot.durationMinutes >= 1 &&
        slot.durationMinutes <= 1439,
    );
  const disabled = pending || externalBusy || !canManage;
  const removed = data.slots.length - draft.length;
  useEffect(() => {
    setDraft(data.slots);
    setStart(data.slots[0]?.startsAt.slice(0, 5) ?? "07:00");
  }, [data.revision]);
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => {
    onBusy(pending);
  }, [pending, onBusy]);
  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [state, onSuccess]);
  function move(id: number, target: number) {
    setDraft((before) => {
      const from = before.findIndex((slot) => slot.id === id);
      if (from < 0 || target < 0 || target >= before.length || target === from)
        return before;
      const next = [...before];
      const [item] = next.splice(from, 1);
      next.splice(target, 0, item);
      return next;
    });
  }
  function change(id: number, fields: Partial<DaySlot>) {
    setDraft((before) =>
      before.map((slot) => (slot.id === id ? { ...slot, ...fields } : slot)),
    );
  }
  return (
    <form className="year-panel slot-day-panel" action={action}>
      <input type="hidden" name="slots" value={serialize(draft)} />
      <fieldset disabled={disabled} className="slot-day-fields">
        <div className="slot-day-heading">
          <div>
            <h2>Susunan slot hari ini</h2>
            <p>
              {draft.length} slot · geser pegangan atau gunakan tombol
              naik/turun. Jam dihitung berurutan tanpa jeda.
            </p>
          </div>
          {data.slots.length > 0 ? (
            <label htmlFor="day-first-start">
              Jam mulai pertama
              <input
                id="day-first-start"
                name="startsAt"
                type="time"
                required
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </label>
          ) : (
            <input type="hidden" name="startsAt" value={start} />
          )}
        </div>
        <div ref={list} className="slot-day-list">
          {preview.map((slot, index) => (
            <div
              className={`slot-day-row${dragging === slot.id ? " is-dragging" : ""}`}
              key={slot.id}
              data-slot-id={slot.id}
            >
              {canManage && (
                <button
                  className="icon-button slot-grip"
                  type="button"
                  aria-label={`Geser ${slot.label}`}
                  aria-pressed={dragging === slot.id}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    event.currentTarget.focus();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    dragId.current = slot.id;
                    setDragging(slot.id);
                  }}
                  onPointerMove={(event) => {
                    if (dragId.current === null) return;
                    const target = document
                      .elementFromPoint(event.clientX, event.clientY)
                      ?.closest<HTMLElement>("[data-slot-id]");
                    if (!target || !list.current?.contains(target)) return;
                    const targetIndex = draft.findIndex(
                      (item) => item.id === Number(target.dataset.slotId),
                    );
                    move(dragId.current, targetIndex);
                  }}
                  onPointerUp={() => {
                    dragId.current = null;
                    setDragging(null);
                  }}
                  onPointerCancel={() => {
                    dragId.current = null;
                    setDragging(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      event.preventDefault();
                      move(slot.id, index + (event.key === "ArrowUp" ? -1 : 1));
                    }
                  }}
                >
                  <GripVertical size={19} />
                </button>
              )}
              <span className="slot-day-number">{slot.sequenceNumber}</span>
              <span className="slot-day-time">
                <span>{slot.startsAt.slice(0, 5) || "—"}</span>
                <span>–</span>
                <span>{slot.endsAt.slice(0, 5) || "—"}</span>
              </span>
              <div className="slot-day-detail">
                {canManage ? (
                  <input
                    aria-label={`Nama slot ${slot.sequenceNumber}`}
                    value={slot.label}
                    maxLength={100}
                    required
                    onChange={(event) =>
                      change(slot.id, { label: event.target.value })
                    }
                  />
                ) : (
                  <strong>{slot.label}</strong>
                )}
                <small>
                  {slot.kindLabel}
                  {slot.kind === "LESSON" ? " · 1 JP" : ""}
                </small>
              </div>
              <div className="slot-day-duration">
                {slot.kind !== "LESSON" && canManage ? (
                  <input
                    aria-label={`Durasi ${slot.label} dalam menit`}
                    type="number"
                    min={1}
                    max={1439}
                    required
                    value={slot.durationMinutes}
                    onChange={(event) =>
                      change(slot.id, {
                        durationMinutes: Number(event.target.value),
                      })
                    }
                  />
                ) : (
                  <span>{slot.durationMinutes}</span>
                )}
                <small>menit</small>
              </div>
              {canManage && (
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-button"
                    disabled={disabled || index === 0}
                    aria-label={`Naikkan ${slot.label}`}
                    onClick={() => move(slot.id, index - 1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    disabled={disabled || index === draft.length - 1}
                    aria-label={`Turunkan ${slot.label}`}
                    onClick={() => move(slot.id, index + 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button delete-button"
                    aria-label={`Hapus ${slot.label} dari susunan`}
                    onClick={() =>
                      setDraft((before) =>
                        before.filter((item) => item.id !== slot.id),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {!preview.length && (
            <p className="empty-state">Belum ada slot pada susunan ini.</p>
          )}
        </div>
      </fieldset>
      {canManage && (
        <div className="slot-day-footer">
          <p role="status">
            {dirty
              ? `Ada perubahan belum disimpan.${removed > 0 ? ` ${removed} slot akan dihapus.` : ""}`
              : "Semua perubahan sudah tersimpan."}
          </p>
          {!valid && (
            <p className="form-error">
              Periksa nama, durasi, dan jam. Seluruh slot harus selesai pada
              hari yang sama.
            </p>
          )}
          {state.message && !state.success && (
            <p className="form-error" role="alert">
              {state.message}{" "}
              <button
                type="button"
                className="button button-secondary"
                onClick={() => window.location.reload()}
              >
                Muat ulang
              </button>
            </p>
          )}
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={disabled || !dirty}
              onClick={() => {
                setDraft(data.slots);
                setStart(data.slots[0]?.startsAt.slice(0, 5) ?? "07:00");
              }}
            >
              Batal
            </button>
            <button
              className="button button-primary"
              disabled={disabled || !dirty || !valid}
            >
              {pending ? "Menyimpan…" : "Simpan susunan"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

function AppendForm({
  schoolId,
  yearId,
  day,
  data,
  lessonMinutes,
  disabled,
  onSuccess,
  onBusy,
}: Context & {
  lessonMinutes: number;
  disabled: boolean;
  onSuccess: (message: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [kind, setKind] = useState("LESSON");
  const [label, setLabel] = useState("Pelajaran");
  const [count, setCount] = useState("1");
  const [duration, setDuration] = useState("15");
  const [firstStart, setFirstStart] = useState("07:00");
  const [state, action, pending] = useActionState(
    appendTimeSlots.bind(null, schoolId, yearId, day, data.revision),
    { message: "" },
  );
  const last = data.slots[data.slots.length - 1];
  const start = last?.endsAt.slice(0, 5) ?? firstStart;
  const amount = kind === "LESSON" ? Number(count) : 1;
  const minutes = kind === "LESSON" ? lessonMinutes : Number(duration);
  const end = lessonEnd(start, minutes, amount);
  const sequence = (last?.sequenceNumber ?? 0) + 1;
  useEffect(() => {
    onBusy(pending);
  }, [pending, onBusy]);
  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [state, onSuccess]);
  return (
    <form className="year-panel slot-day-panel" action={action}>
      <h2>Tambah slot berikutnya</h2>
      <p className="master-field-hint">
        Nomor urut otomatis {sequence}.{" "}
        {last
          ? `Melanjutkan jam ${start} dari slot terakhir.`
          : "Atur jam mulai untuk slot pertama."}
      </p>
      {disabled && (
        <p className="master-field-hint">
          Simpan atau batalkan perubahan susunan terlebih dahulu.
        </p>
      )}
      <fieldset
        className="year-fields master-fields"
        disabled={pending || disabled}
      >
        <label htmlFor="append-kind">
          Jenis slot
          <select
            id="append-kind"
            name="kind"
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setLabel(
                {
                  LESSON: "Pelajaran",
                  BREAK: "Istirahat",
                  ACTIVITY: "Kegiatan",
                  OTHER: "Lainnya",
                }[event.target.value] ?? "",
              );
            }}
          >
            <option value="LESSON">Pelajaran</option>
            <option value="BREAK">Istirahat</option>
            <option value="ACTIVITY">Kegiatan</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </label>
        <label htmlFor="append-label">
          Nama slot
          <input
            id="append-label"
            name="label"
            required
            maxLength={70}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        {!last && (
          <label htmlFor="append-start">
            Jam mulai pertama
            <input
              id="append-start"
              name="startsAt"
              type="time"
              required
              value={firstStart}
              onChange={(event) => setFirstStart(event.target.value)}
            />
          </label>
        )}
        {kind === "LESSON" ? (
          <label htmlFor="append-count">
            Jumlah JP
            <input
              id="append-count"
              name="count"
              type="number"
              min={1}
              max={48}
              required
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
            <small>1 JP = {lessonMinutes} menit</small>
          </label>
        ) : (
          <>
            <input type="hidden" name="count" value="1" />
            <label htmlFor="append-duration">
              Durasi (menit)
              <input
                id="append-duration"
                name="durationMinutes"
                type="number"
                min={1}
                max={1439}
                required
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </label>
          </>
        )}
      </fieldset>
      <p className="master-field-hint" role="status">
        {end
          ? `${amount} slot · ${start}–${end} · urutan ${sequence}${amount > 1 ? `–${sequence + amount - 1}` : ""}`
          : "Rentang harus selesai pada hari yang sama."}
      </p>
      {state.message && !state.success && (
        <p className="form-error" role="alert">
          {state.message}{" "}
          <button
            type="button"
            className="button button-secondary"
            onClick={() => window.location.reload()}
          >
            Muat ulang
          </button>
        </p>
      )}
      <div className="dialog-actions">
        <button
          className="button button-primary"
          disabled={pending || disabled || !end}
        >
          {pending ? "Menambahkan…" : "Tambah slot"}
        </button>
      </div>
    </form>
  );
}
