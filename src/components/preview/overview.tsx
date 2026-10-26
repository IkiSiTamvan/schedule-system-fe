import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  DoorOpen,
  Layers3,
  Plus,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  SectionHeading,
} from "@/components/ui/primitives";
import { teachers, type View } from "@/lib/demo-data";

const stats = [
  {
    label: "Guru aktif",
    value: "48",
    icon: Users,
    detail: "+3 guru semester ini",
    color: "blue",
  },
  {
    label: "Kelas belajar",
    value: "24",
    icon: Layers3,
    detail: "Di 4 program keahlian",
    color: "lavender",
  },
  {
    label: "Mata pelajaran",
    value: "36",
    icon: BookOpen,
    detail: "Katalog sekolah",
    color: "peach",
  },
  {
    label: "Ruang tersedia",
    value: "18",
    icon: DoorOpen,
    detail: "Termasuk 4 laboratorium",
    color: "mint",
  },
];

export function Overview({
  onViewChange,
  period,
}: {
  onViewChange: (view: View) => void;
  period: string;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">Senin, 26 Oktober 2026</p>
          <h1>
            Selamat pagi, Rizky{" "}
            <span className="greeting-sun" aria-hidden="true">
              ☀
            </span>
          </h1>
          <p>
            Semua yang kamu butuhkan untuk menyiapkan hari belajar yang baik.
          </p>
        </div>
        <Button variant="secondary" onClick={() => onViewChange("timetable")}>
          <CalendarDays size={16} />
          Lihat jadwal
          <ArrowUpRight size={15} />
        </Button>
      </div>
      <section className="stat-grid" aria-label="Ringkasan sekolah">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-label">
              <span>{stat.label}</span>
              <span className={`stat-icon tone-${stat.color}`}>
                <stat.icon size={17} />
              </span>
            </div>
            <div className="stat-value">
              {stat.value}
              <span>
                {stat.label === "Guru aktif"
                  ? "guru"
                  : stat.label === "Kelas belajar"
                    ? "kelas"
                    : stat.label === "Mata pelajaran"
                      ? "mapel"
                      : "ruang"}
              </span>
            </div>
            <p>
              {stat.label === "Guru aktif" && (
                <ArrowUpRight size={13} className="positive" />
              )}
              {stat.detail}
            </p>
          </article>
        ))}
      </section>
      <div className="overview-columns">
        <section className="panel schedule-summary">
          <SectionHeading
            title="Belajar hari ini"
            eyebrow="SENIN, 26 OKTOBER"
            action="Jadwal lengkap"
            onAction={() => onViewChange("timetable")}
          />
          <div className="today-label">
            <span>
              <Layers3 size={15} />X RPL 1
            </span>
            <Badge tone="blue">{period.split(" ")[0]}</Badge>
          </div>
          <div className="today-lessons">
            <div className="today-lesson">
              <div className="lesson-time">
                <strong>07.00</strong>
                <span>08.30</span>
              </div>
              <span className="lesson-timeline lavender-line" />
              <div className="lesson-summary">
                <span className="lesson-kicker">01 — 02 · 2 JAM PELAJARAN</span>
                <h3>Matematika</h3>
                <p>
                  <span className="tiny-avatar tone-lavender">RK</span>Rina
                  Kartika<span className="bullet">·</span>Ruang 201
                </p>
              </div>
              <Badge tone="neutral">Selesai</Badge>
            </div>
            <div className="lesson-break">
              <Clock3 size={13} />
              <span>08.30 — 09.30</span>
              <span>Istirahat & kegiatan sekolah</span>
            </div>
            <div className="today-lesson">
              <div className="lesson-time">
                <strong>09.30</strong>
                <span>11.45</span>
              </div>
              <span className="lesson-timeline blue-line" />
              <div className="lesson-summary">
                <span className="lesson-kicker">04 — 06 · 3 JAM PELAJARAN</span>
                <h3>Pemrograman Web</h3>
                <p>
                  <span className="tiny-avatar tone-blue">AF</span>Ahmad Fauzi
                  <span className="bullet">·</span>Lab Komputer 1
                </p>
              </div>
              <Badge tone="blue">Berikutnya</Badge>
            </div>
          </div>
          <div className="schedule-summary-footer">
            <span className="avatar-stack">
              <Avatar initials="RK" color="lavender" small />
              <Avatar initials="AF" color="blue" small />
              <Avatar initials="FR" color="mint" small />
            </span>
            <p>
              <strong>32 guru</strong> mengajar hari ini
            </p>
            <ArrowUpRight size={16} />
          </div>
        </section>
        <section className="setup-panel">
          <div className="setup-top">
            <span className="setup-icon">
              <Layers3 size={21} />
            </span>
            <Badge tone="success">Sedang disiapkan</Badge>
          </div>
          <h2>
            Semester baru,
            <br />
            awal yang terencana.
          </h2>
          <p>Lengkapi fondasi akademik sebelum menyusun jadwal pelajaran.</p>
          <div className="setup-progress-label">
            <span>Kesiapan data</span>
            <strong>3 dari 4 langkah</strong>
          </div>
          <div className="progress-track">
            <span />
          </div>
          <ul className="setup-checklist">
            <li>
              <span>
                <Check size={12} />
              </span>
              Tahun ajaran & periode
            </li>
            <li>
              <span>
                <Check size={12} />
              </span>
              Data kelas & mata pelajaran
            </li>
            <li>
              <span>
                <Check size={12} />
              </span>
              Data guru & kompetensi
            </li>
            <li className="checklist-pending">
              <span>4</span>Ketersediaan waktu guru
            </li>
          </ul>
          <button
            className="setup-link"
            onClick={() => onViewChange("teachers")}
          >
            Lanjutkan persiapan
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="panel recent-teachers">
        <SectionHeading
          title="Kenalan dengan tim pengajar"
          action="Semua guru"
          onAction={() => onViewChange("teachers")}
        />
        <div className="teacher-preview-grid">
          {teachers.slice(0, 4).map((teacher) => (
            <button
              className="teacher-preview"
              key={teacher.id}
              onClick={() => onViewChange("teachers")}
            >
              <Avatar initials={teacher.initials} color={teacher.color} />
              <span>
                <strong>{teacher.name}</strong>
                <small>{teacher.subject}</small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
        <button className="add-team" onClick={() => onViewChange("teachers")}>
          <Plus size={14} />
          Kelola tim pengajar sekolah
        </button>
      </section>
    </>
  );
}
