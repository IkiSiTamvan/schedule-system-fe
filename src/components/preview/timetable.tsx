import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DoorOpen,
  Info,
  Layers3,
  UserRound,
  X,
} from "lucide-react";
import { days, lessons, times, type Lesson } from "@/lib/demo-data";
import { Badge, Button } from "@/components/ui/primitives";

function weekDate(offset: number, day: number) {
  return new Date(Date.UTC(2026, 9, 26 + offset * 7 + day));
}

export function Timetable({ period }: { period: string }) {
  const [week, setWeek] = useState(0);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [activeDay, setActiveDay] = useState(0);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialogRef.current?.showModal();
  }, [selected]);
  function closeDialog() {
    dialogRef.current?.close();
    setSelected(null);
  }
  const start = weekDate(week, 0);
  const end = weekDate(week, 4);
  const dateFormat: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  };
  const weekLabel = `${start.toLocaleDateString("id-ID", dateFormat)} – ${end.toLocaleDateString("id-ID", { ...dateFormat, year: "numeric" })}`;
  const visibleDays = mode === "week" ? [0, 1, 2, 3, 4] : [activeDay];

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">ADA WAKTU UNTUK SETIAP PELAJARAN</p>
          <h1>
            Seminggu yang terencana<span className="heading-dot">.</span>
          </h1>
          <p>Susun ritme belajar yang memberi ruang untuk semua.</p>
        </div>
        <Badge tone="blue">
          <span className="status-dot" />
          Draft contoh
        </Badge>
      </div>
      <section className="panel timetable-panel">
        <div className="timetable-toolbar">
          <div className="class-context">
            <span className="class-icon">
              <Layers3 size={20} />
            </span>
            <span>
              <strong>X RPL 1</strong>
              <small>Rekayasa Perangkat Lunak · {period}</small>
            </span>
          </div>
          <div className="calendar-mode" aria-label="Tampilan kalender">
            <button
              aria-pressed={mode === "week"}
              onClick={() => setMode("week")}
            >
              Minggu
            </button>
            <button
              aria-pressed={mode === "day"}
              onClick={() => setMode("day")}
            >
              Hari
            </button>
          </div>
        </div>
        <div className="calendar-period-bar">
          <div className="calendar-date-controls">
            <button
              className="icon-button"
              aria-label="Minggu sebelumnya"
              onClick={() => setWeek(week - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <strong>{weekLabel}</strong>
            <button
              className="icon-button"
              aria-label="Minggu berikutnya"
              onClick={() => setWeek(week + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setWeek(0);
              setActiveDay(0);
            }}
          >
            Minggu ini
          </Button>
        </div>
        {mode === "day" && (
          <div className="day-tabs" aria-label="Hari pelajaran">
            {days.map((day, index) => (
              <button
                key={day}
                aria-pressed={activeDay === index}
                onClick={() => setActiveDay(index)}
              >
                {day}
              </button>
            ))}
          </div>
        )}
        <div className="calendar-scroll">
          <div
            className={`calendar-grid ${mode === "day" ? "calendar-grid-day" : ""}`}
            style={{
              gridTemplateColumns: `64px repeat(${visibleDays.length}, minmax(${mode === "day" ? 220 : 134}px, 1fr))`,
            }}
          >
            <div className="calendar-corner">
              <Clock3 size={14} />
            </div>
            {visibleDays.map((day, index) => (
              <div
                className={`calendar-day ${day === 0 && week === 0 ? "calendar-day-today" : ""}`}
                key={day}
                style={{ gridColumn: index + 2, gridRow: 1 }}
              >
                <span>{days[day]}</span>
                <strong>{weekDate(week, day).getUTCDate()}</strong>
              </div>
            ))}
            {times.map((time, index) => (
              <div
                className="calendar-time"
                key={time}
                style={{ gridColumn: 1, gridRow: index + 2 }}
              >
                <span>{time}</span>
                <small>{String(index + 1).padStart(2, "0")}</small>
              </div>
            ))}
            {visibleDays.flatMap((day, column) =>
              times.map((time, row) => (
                <div
                  aria-hidden="true"
                  className={`calendar-cell ${row === 2 ? "break-cell" : ""}`}
                  style={{ gridColumn: column + 2, gridRow: row + 2 }}
                  key={`${day}-${time}`}
                >
                  {row === 2 && <span>Istirahat</span>}
                </div>
              )),
            )}
            {lessons
              .filter((lesson) => visibleDays.includes(lesson.day))
              .map((lesson) => (
                <button
                  className={`calendar-lesson tone-${lesson.color}`}
                  style={{
                    gridColumn: visibleDays.indexOf(lesson.day) + 2,
                    gridRow: `${lesson.start + 2} / span ${lesson.duration}`,
                  }}
                  key={`${lesson.day}-${lesson.start}`}
                  onClick={() => setSelected(lesson)}
                  aria-label={`${days[lesson.day]}, ${lesson.subject}, ${lesson.teacher}, ${lesson.duration} JP`}
                >
                  <span className="calendar-lesson-time">
                    {times[lesson.start]} <span>· {lesson.duration} JP</span>
                  </span>
                  <strong>{lesson.subject}</strong>
                  <span className="calendar-lesson-teacher">
                    {lesson.teacher}
                  </span>
                  <span className="calendar-lesson-room">
                    <DoorOpen size={12} />
                    {lesson.room}
                  </span>
                </button>
              ))}
          </div>
        </div>
        <div className="calendar-footer">
          <span>
            <span className="calendar-legend-dot" />
            {lessons.length} sesi pelajaran<span className="bullet">·</span>
            {lessons.reduce((sum, lesson) => sum + lesson.duration, 0)} JP /
            minggu
          </span>
          <span>
            <Info size={13} /> Klik pelajaran untuk detail
          </span>
        </div>
      </section>
      <div className="info-note">
        <span>
          <CalendarDays size={18} />
        </span>
        <p>
          <strong>Ini contoh pola jadwal mingguan.</strong> Pergantian minggu
          menampilkan pola yang sama. Pembuatan dan validasi jadwal akan
          terhubung ke backend pada tahap berikutnya.
        </p>
      </div>
      <dialog
        aria-labelledby="lesson-detail-title"
        ref={dialogRef}
        className="teacher-dialog lesson-dialog"
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        {selected && (
          <>
            <button
              className="dialog-close icon-button"
              aria-label="Tutup detail pelajaran"
              onClick={closeDialog}
            >
              <X size={20} />
            </button>
            <p className="eyebrow">DETAIL PELAJARAN · DATA CONTOH</p>
            <span className={`lesson-detail-icon tone-${selected.color}`}>
              <CalendarDays size={27} />
            </span>
            <h2 id="lesson-detail-title">{selected.subject}</h2>
            <p className="muted">X RPL 1 · {period}</p>
            <dl className="profile-details">
              <div>
                <dt>
                  <CalendarDays size={14} /> Hari
                </dt>
                <dd>
                  {days[selected.day]},{" "}
                  {weekDate(week, selected.day).toLocaleDateString("id-ID", {
                    ...dateFormat,
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt>
                  <Clock3 size={14} /> Waktu mulai & durasi
                </dt>
                <dd>
                  {times[selected.start]} · {selected.duration} JP
                </dd>
              </div>
              <div>
                <dt>
                  <UserRound size={14} /> Guru
                </dt>
                <dd>{selected.teacher}</dd>
              </div>
              <div>
                <dt>
                  <DoorOpen size={14} /> Ruangan
                </dt>
                <dd>{selected.room}</dd>
              </div>
            </dl>
            <Button variant="secondary" onClick={closeDialog}>
              Kembali ke jadwal
            </Button>
          </>
        )}
      </dialog>
    </>
  );
}
