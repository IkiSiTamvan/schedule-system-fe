"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  saveAcademicYear,
  deleteAcademicYear,
} from "@/lib/actions/academic-years";
import type { AcademicYear } from "@/lib/api-types";

const date = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

export function AcademicYearList({
  schoolId,
  years,
  current,
  canManage,
  q,
  active,
  page,
  pageCount,
  total,
}: {
  schoolId: number;
  years: AcademicYear[];
  current: AcademicYear | null;
  canManage: boolean;
  q: string;
  active: string;
  page: number;
  pageCount: number;
  total: number;
}) {
  const [editing, setEditing] = useState<AcademicYear | null | undefined>();
  const [deleting, setDeleting] = useState<AcademicYear | null>(null);
  const [notice, setNotice] = useState("");
  const pageLink = (index: number) =>
    `?${new URLSearchParams({ q, active, page: String(index) })}`;
  return (
    <>
      <div className="active-year-card">
        <span className="active-year-icon">
          <CalendarDays size={23} />
        </span>
        <div>
          <p className="eyebrow">TAHUN AJARAN AKTIF</p>
          <h2>{current?.name ?? "Belum ditentukan"}</h2>
          <p>
            {current
              ? `${date(current.startsOn)} — ${date(current.endsOn)}`
              : "Aktifkan satu tahun ajaran untuk menjadi acuan sekolah."}
          </p>
        </div>
        <span className={`year-status ${current ? "is-active" : ""}`}>
          {current ? (
            <>
              <Check size={12} />
              Aktif
            </>
          ) : (
            "Belum aktif"
          )}
        </span>
      </div>
      <div className="year-section-title">
        <div>
          <h2>
            Daftar tahun ajaran <span>{total}</span>
          </h2>
          <p>
            {canManage
              ? "Kelola rentang belajar sekolah dari satu tempat."
              : "Kamu memiliki akses untuk melihat tahun ajaran."}
          </p>
        </div>
        {canManage && (
          <button
            className="button button-primary"
            onClick={() => setEditing(null)}
          >
            <Plus size={16} />
            Tambah tahun ajaran
          </button>
        )}
      </div>
      {notice && (
        <div className="success-notice" role="status">
          <Check size={16} />
          {notice}
          <button
            className="icon-button"
            aria-label="Tutup notifikasi"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="year-panel">
        <form
          className="year-filters"
          action={`/schools/${schoolId}/academic-years`}
        >
          <label className="search-field year-search">
            <Search size={17} />
            <span className="sr-only">Cari tahun ajaran</span>
            <input
              name="q"
              placeholder="Cari kode atau nama tahun ajaran…"
              defaultValue={q}
              maxLength={100}
            />
          </label>
          <label>
            <span className="sr-only">Status tahun ajaran</span>
            <select name="active" defaultValue={active}>
              <option value="">Semua status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak aktif</option>
            </select>
          </label>
          <button className="button button-secondary">Terapkan</button>
          {(q || active) && (
            <Link
              className="button button-ghost"
              href={`/schools/${schoolId}/academic-years`}
            >
              Reset
            </Link>
          )}
        </form>
        {years.length ? (
          <div className="year-table-scroll">
            <table className="year-table">
              <thead>
                <tr>
                  <th>Tahun ajaran</th>
                  <th>Rentang tanggal</th>
                  <th>Status</th>
                  {canManage && <th className="align-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {years.map((year) => (
                  <tr key={year.id}>
                    <td>
                      <strong>{year.name}</strong>
                      <small>{year.code}</small>
                    </td>
                    <td>
                      {date(year.startsOn)}
                      <span className="date-separator">→</span>
                      {date(year.endsOn)}
                    </td>
                    <td>
                      <span
                        className={`year-status ${year.active ? "is-active" : ""}`}
                      >
                        {year.active && <span className="status-dot" />}
                        {year.active ? "Aktif" : "Tidak aktif"}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit ${year.name}`}
                            title="Edit tahun ajaran"
                            onClick={() => setEditing(year)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete-button"
                            aria-label={`Hapus ${year.name}`}
                            title={
                              year.active
                                ? "Nonaktifkan sebelum menghapus"
                                : "Hapus tahun ajaran"
                            }
                            disabled={year.active}
                            onClick={() => setDeleting(year)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CalendarDays size={32} />
            <h3>
              {q || active
                ? "Belum ada yang cocok."
                : "Rencana baru dimulai di sini."}
            </h3>
            <p>
              {q || active
                ? "Coba ubah pencarian atau filter status."
                : "Tambahkan tahun ajaran pertama untuk sekolah ini."}
            </p>
          </div>
        )}
        <div className="year-pagination">
          <span>
            {total === 0
              ? "0 tahun ajaran"
              : `Menampilkan ${page * 10 + 1}–${page * 10 + years.length} dari ${total}`}
          </span>
          <div>
            {page > 0 ? (
              <Link
                className="button button-secondary"
                href={pageLink(page - 1)}
              >
                <ChevronLeft size={14} />
                Sebelumnya
              </Link>
            ) : (
              <button className="button button-secondary" disabled>
                <ChevronLeft size={14} />
                Sebelumnya
              </button>
            )}
            <span>
              {pageCount ? page + 1 : 0} / {pageCount}
            </span>
            {page + 1 < pageCount ? (
              <Link
                className="button button-secondary"
                href={pageLink(page + 1)}
              >
                Berikutnya
                <ChevronRight size={14} />
              </Link>
            ) : (
              <button className="button button-secondary" disabled>
                Berikutnya
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="year-tip">
        Satu sekolah memiliki satu tahun ajaran aktif. Mengaktifkan tahun lain
        akan menonaktifkan tahun sebelumnya.
      </p>
      {editing !== undefined && (
        <YearDialog
          schoolId={schoolId}
          year={editing}
          onClose={() => setEditing(undefined)}
          onSuccess={(message) => {
            setNotice(message);
            setEditing(undefined);
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          schoolId={schoolId}
          year={deleting}
          onClose={() => setDeleting(null)}
          onSuccess={(message) => {
            setNotice(message);
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}

function YearDialog({
  schoolId,
  year,
  onClose,
  onSuccess,
}: {
  schoolId: number;
  year: AcademicYear | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<Record<string, string>>({
    code: year?.code ?? "",
    name: year?.name ?? "",
    startsOn: year?.startsOn ?? "",
    endsOn: year?.endsOn ?? "",
  });
  const [isActive, setIsActive] = useState(year?.active ?? false);
  const [state, action, pending] = useActionState(
    saveAcademicYear.bind(null, schoolId, year?.id ?? null),
    { message: "" },
  );
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [state, onSuccess]);
  const fields = [
    {
      name: "code",
      label: "Kode tahun ajaran",
      type: "text",
      placeholder: "TA-2026",
      max: 20,
      value: year?.code,
    },
    {
      name: "name",
      label: "Nama tahun ajaran",
      type: "text",
      placeholder: "Tahun Ajaran 2026/2027",
      max: 100,
      value: year?.name,
    },
    {
      name: "startsOn",
      label: "Tanggal mulai",
      type: "date",
      value: year?.startsOn,
    },
    {
      name: "endsOn",
      label: "Tanggal selesai",
      type: "date",
      value: year?.endsOn,
    },
  ];
  return (
    <dialog
      className="year-dialog"
      ref={ref}
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
      aria-labelledby="year-dialog-title"
    >
      <div className="dialog-heading">
        <div>
          <p className="eyebrow">MASTER AKADEMIK</p>
          <h2 id="year-dialog-title">
            {year ? "Edit tahun ajaran" : "Tambah tahun ajaran"}
          </h2>
        </div>
        <button
          className="icon-button"
          disabled={pending}
          aria-label="Tutup formulir"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <p className="dialog-description">
        Tentukan nama dan rentang belajar untuk sekolah ini.
      </p>
      <form action={action}>
        <fieldset disabled={pending} className="year-fields">
          {fields.map((field) => (
            <label
              key={field.name}
              htmlFor={field.name}
              className={field.type === "date" ? "date-field" : ""}
            >
              {field.label}
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required
                maxLength={field.max}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    [field.name]: event.target.value,
                  }))
                }
                aria-invalid={!!state.fieldErrors?.[field.name]}
                aria-describedby={
                  state.fieldErrors?.[field.name]
                    ? `${field.name}-error`
                    : undefined
                }
              />
              {state.fieldErrors?.[field.name] && (
                <span className="field-error" id={`${field.name}-error`}>
                  {state.fieldErrors[field.name]}
                </span>
              )}
            </label>
          ))}
          <label className="active-checkbox">
            <input
              type="checkbox"
              name="active"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <span>
              <strong>Jadikan tahun ajaran aktif</strong>
              <small>
                Tahun ajaran yang aktif sebelumnya akan dinonaktifkan.
              </small>
            </span>
          </label>
        </fieldset>
        {state.message && !state.success && (
          <p role="alert" className="form-error">
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
          <button className="button button-primary" disabled={pending}>
            {pending ? "Menyimpan…" : "Simpan tahun ajaran"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DeleteDialog({
  schoolId,
  year,
  onClose,
  onSuccess,
}: {
  schoolId: number;
  year: AcademicYear;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    deleteAcademicYear.bind(null, schoolId, year.id),
    { message: "" },
  );
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [state, onSuccess]);
  return (
    <dialog
      ref={ref}
      className="year-dialog delete-dialog"
      aria-labelledby="delete-title"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
    >
      <h2 id="delete-title">Hapus tahun ajaran?</h2>
      <p className="dialog-description">
        {year.name} akan dihapus dari daftar. Tahun ajaran yang sudah dipakai
        periode, kelas, atau jam belajar tidak bisa dihapus.
      </p>
      <form action={action}>
        {state.message && (
          <p className="form-error" role="alert">
            {state.message}
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={pending}
            onClick={onClose}
          >
            Batal
          </button>
          <button className="button button-danger" disabled={pending}>
            {pending ? "Menghapus…" : "Ya, hapus"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
