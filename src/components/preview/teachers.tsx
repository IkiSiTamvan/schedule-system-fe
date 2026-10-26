import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  Mail,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { teachers, type Teacher } from "@/lib/demo-data";
import { Avatar, Badge, Button } from "@/components/ui/primitives";

export function Teachers() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [selected, setSelected] = useState<Teacher | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const filtered = teachers.filter(
    (teacher) =>
      `${teacher.name} ${teacher.subject} ${teacher.major}`
        .toLocaleLowerCase("id")
        .includes(query.toLocaleLowerCase("id")) &&
      (status === "Semua status" || teacher.status === status),
  );
  useEffect(() => {
    if (selected) dialogRef.current?.showModal();
  }, [selected]);
  function closeDialog() {
    dialogRef.current?.close();
    setSelected(null);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">ORANG-ORANG DI BALIK PEMBELAJARAN</p>
          <h1>
            Tim pengajar<span className="heading-dot">.</span>
          </h1>
          <p>
            Kenali keahlian, lihat beban mengajar, dan siapkan jadwal yang
            seimbang.
          </p>
        </div>
        <Badge tone="blue">
          <Users size={13} />6 guru contoh
        </Badge>
      </div>
      <section className="panel teachers-panel">
        <div className="table-toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              aria-label="Cari guru"
              placeholder="Cari nama, mapel, atau jurusan…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button aria-label="Hapus pencarian" onClick={() => setQuery("")}>
                <X size={14} />
              </button>
            )}
          </label>
          <label className="filter-select">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Filter status guru"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>Semua status</option>
              <option>Aktif</option>
              <option>Nonaktif</option>
            </select>
            <ChevronDown size={13} />
          </label>
        </div>
        <div className="table-scroll">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>
                  Nama guru <ArrowDown size={12} />
                </th>
                <th>Mata pelajaran</th>
                <th>Program keahlian</th>
                <th>Beban / minggu</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Detail</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <button
                      className="teacher-name"
                      onClick={() => setSelected(teacher)}
                    >
                      <Avatar
                        initials={teacher.initials}
                        color={teacher.color}
                      />
                      <span>
                        <strong>{teacher.name}</strong>
                        <small>{teacher.id}</small>
                      </span>
                    </button>
                  </td>
                  <td>{teacher.subject}</td>
                  <td>
                    <span className="major-cell">{teacher.major}</span>
                  </td>
                  <td>
                    <strong className="teacher-hours">{teacher.hours}</strong>
                    <span className="muted"> JP</span>
                  </td>
                  <td>
                    <Badge
                      tone={teacher.status === "Aktif" ? "success" : "neutral"}
                    >
                      {teacher.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="table-detail"
                      aria-label={`Lihat detail ${teacher.name}`}
                      onClick={() => setSelected(teacher)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={26} />
            <h2>Belum ketemu gurunya.</h2>
            <p>Coba nama atau mata pelajaran lain.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setStatus("Semua status");
              }}
            >
              Reset pencarian
            </Button>
          </div>
        )}
        <div className="table-footer">
          <span>
            Menampilkan <strong>{filtered.length}</strong> dari 6 guru contoh
          </span>
          <span className="table-demo-note">
            Klik nama untuk melihat profil
          </span>
        </div>
      </section>
      <div className="info-note">
        <span>
          <Users size={18} />
        </span>
        <p>
          <strong>Setiap guru punya ruang untuk berkembang.</strong> Kompetensi
          dan ketersediaan guru akan membantu kita membuat jadwal yang lebih
          seimbang.
        </p>
      </div>
      <dialog
        aria-labelledby="teacher-profile-title"
        ref={dialogRef}
        className="teacher-dialog"
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
              aria-label="Tutup profil"
              onClick={closeDialog}
            >
              <X size={20} />
            </button>
            <p className="eyebrow">PROFIL GURU · DATA CONTOH</p>
            <Avatar initials={selected.initials} color={selected.color} />
            <h2 id="teacher-profile-title">{selected.name}</h2>
            <p className="muted">
              {selected.type} · {selected.id}
            </p>
            <Badge tone={selected.status === "Aktif" ? "success" : "neutral"}>
              {selected.status}
            </Badge>
            <dl className="profile-details">
              <div>
                <dt>Mata pelajaran</dt>
                <dd>{selected.subject}</dd>
              </div>
              <div>
                <dt>Program keahlian</dt>
                <dd>{selected.major}</dd>
              </div>
              <div>
                <dt>Beban mengajar</dt>
                <dd>{selected.hours} JP / minggu</dd>
              </div>
              <div>
                <dt>
                  <Mail size={13} /> Email contoh
                </dt>
                <dd>{selected.email}</dd>
              </div>
            </dl>
            <Button variant="secondary" onClick={closeDialog}>
              Kembali ke daftar guru
            </Button>
          </>
        )}
      </dialog>
    </>
  );
}
