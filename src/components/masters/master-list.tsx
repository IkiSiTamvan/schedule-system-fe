"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { saveMaster, deleteMaster } from "@/lib/actions/masters";
import type { MasterConfig, MasterRecord } from "@/lib/masters/types";

function display(value: unknown, type?: string) {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "boolean") return value ? "Ya" : "Tidak";
  if (type === "date") {
    const date = new Date(String(value));
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(date)
      : "—";
  }
  if (type === "time") return String(value).slice(0, 5);
  if (Array.isArray(value))
    return (
      value
        .map((item) =>
          typeof item === "object" && item
            ? String(item.name ?? item.label ?? item.id)
            : String(item),
        )
        .join(", ") || "—"
    );
  return String(value);
}

export function MasterList({
  config,
  schoolId,
  rows,
  canManage,
  query,
  page,
  pageCount,
  total,
}: {
  config: MasterConfig;
  schoolId: number;
  rows: MasterRecord[];
  canManage: boolean;
  query: Record<string, string>;
  page: number;
  pageCount: number;
  total: number;
}) {
  const [editing, setEditing] = useState<MasterRecord | null | undefined>();
  const [deleting, setDeleting] = useState<MasterRecord | null>(null);
  const [notice, setNotice] = useState("");
  const path = `/schools/${schoolId}/${config.slug}`;
  const pageLink = (index: number) =>
    `${path}?${new URLSearchParams({ ...query, page: String(index) })}`;
  const filters = config.fields.filter(
    (field) => (field.lookup || field.filter) && field.type !== "multiselect",
  );
  const hasActive = config.fields.some(
    (field) => field.name === "active" && field.type === "checkbox",
  );
  const missing = config.fields.find(
    (field) => field.required && field.lookup && !field.options?.length,
  );
  const filtered =
    !!query.q || filters.some((field) => query[field.name]) || !!query.active;
  return (
    <>
      <div className="year-section-title">
        <div>
          <h2>
            Daftar {config.singular} <span>{total}</span>
          </h2>
          <p>
            {canManage
              ? `Kelola ${config.singular} sekolah dari satu tempat.`
              : "Kamu memiliki akses untuk melihat data ini."}
          </p>
        </div>
        {canManage && (
          <button
            className="button button-primary"
            onClick={() => setEditing(null)}
            disabled={!!missing}
          >
            <Plus size={16} />
            Tambah {config.singular}
          </button>
        )}
      </div>
      {missing && (
        <div className="master-prerequisite">
          <Layers3 size={18} />
          <p>
            Isi master <strong>{missing.label.toLowerCase()}</strong> terlebih
            dahulu agar {config.singular} bisa ditambahkan.
          </p>
          {missing.lookup && (
            <Link
              href={`/schools/${schoolId}/${missing.lookup.endpoint.split("/").pop()?.split("?")[0]}`}
            >
              Buka {missing.label.toLowerCase()}
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}
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
        <MasterFilters
          key={JSON.stringify(query)}
          config={config}
          query={query}
          path={path}
        />
        {rows.length ? (
          <div className="year-table-scroll">
            <table className="year-table">
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  {canManage && <th className="align-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {config.columns.map((column) => (
                      <td key={column.key}>
                        {column.key === "active" ? (
                          <span
                            className={`year-status ${row.active ? "is-active" : ""}`}
                          >
                            {row.active ? "Aktif" : "Tidak aktif"}
                          </span>
                        ) : column.key === "name" ? (
                          <strong>
                            {display(row[column.key], column.type)}
                          </strong>
                        ) : (
                          display(
                            config.fields
                              .find((field) => field.name === column.key)
                              ?.options?.find(
                                (option) =>
                                  option.value === String(row[column.key]),
                              )?.label ?? row[column.key],
                            column.type,
                          )
                        )}
                      </td>
                    ))}
                    {canManage && (
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit ${String(row.name ?? row.label ?? row.code ?? row.id)}`}
                            onClick={() => setEditing(row)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete-button"
                            aria-label={`Hapus ${String(row.name ?? row.label ?? row.code ?? row.id)}`}
                            onClick={() => setDeleting(row)}
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
            <Layers3 size={32} />
            <h3>
              {filtered
                ? "Belum ada yang cocok."
                : `Belum ada ${config.singular}.`}
            </h3>
            <p>
              {filtered
                ? "Coba ubah pencarian atau pilihan filter."
                : `Tambahkan ${config.singular} pertama untuk sekolah ini.`}
            </p>
          </div>
        )}
        <div className="year-pagination">
          <span>
            {total
              ? `Menampilkan ${page * 10 + 1}–${page * 10 + rows.length} dari ${total}`
              : `0 ${config.singular}`}
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
        Data hanya berlaku untuk sekolah ini. Data yang sudah dipakai pada
        master atau jadwal lain tidak bisa dihapus.
      </p>
      {editing !== undefined && (
        <MasterDialog
          config={config}
          schoolId={schoolId}
          row={editing}
          onClose={() => setEditing(undefined)}
          onSuccess={(message) => {
            setNotice(message);
            setEditing(undefined);
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          config={config}
          schoolId={schoolId}
          row={deleting}
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

function MasterDialog({
  config,
  schoolId,
  row,
  onClose,
  onSuccess,
}: {
  config: MasterConfig;
  schoolId: number;
  row: MasterRecord | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<
    Record<string, string | boolean | string[]>
  >(() =>
    Object.fromEntries(
      config.fields.map((field) => {
        const value = row?.[field.name] ?? field.defaultValue;
        if (field.type === "multiselect")
          return [field.name, Array.isArray(value) ? value.map(String) : []];
        if (field.type === "checkbox") return [field.name, Boolean(value)];
        return [
          field.name,
          value === null || value === undefined ? "" : String(value),
        ];
      }),
    ),
  );
  const [state, action, pending] = useActionState(
    saveMaster.bind(null, config.slug, schoolId, row?.id ?? null),
    { message: "" },
  );
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (state.success) onSuccess(state.message);
  }, [state, onSuccess]);
  const set = (name: string, value: string | boolean | string[]) =>
    setValues((previous) => ({ ...previous, [name]: value }));
  return (
    <dialog
      ref={ref}
      className="year-dialog master-dialog"
      aria-labelledby="master-dialog-title"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
    >
      <div className="dialog-heading">
        <div>
          <p className="eyebrow">MASTER AKADEMIK</p>
          <h2 id="master-dialog-title">
            {row ? "Edit" : "Tambah"} {config.singular}
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
      <p className="dialog-description">{config.description}</p>
      <form action={action}>
        <fieldset className="year-fields master-fields" disabled={pending}>
          {config.fields.map((field) => {
            const fieldId = `master-${field.name}`;
            const error = state.fieldErrors?.[field.name];
            if (field.type === "multiselect") {
              const selected = values[field.name] as string[];
              return (
                <fieldset className="master-multiselect" key={field.name}>
                  <legend>{field.label}</legend>
                  <div>
                    {field.options?.length ? (
                      field.options.map((option) => (
                        <label key={option.value}>
                          <input
                            type="checkbox"
                            name={field.name}
                            value={option.value}
                            checked={selected.includes(option.value)}
                            onChange={(event) =>
                              set(
                                field.name,
                                event.target.checked
                                  ? [...selected, option.value]
                                  : selected.filter(
                                      (value) => value !== option.value,
                                    ),
                              )
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))
                    ) : (
                      <p>
                        Belum ada pilihan. Kamu bisa melengkapi master ini
                        nanti.
                      </p>
                    )}
                  </div>
                  {field.description && (
                    <small className="master-field-hint">
                      {field.description}
                    </small>
                  )}
                  {error && <span className="field-error">{error}</span>}
                </fieldset>
              );
            }
            if (field.type === "checkbox")
              return (
                <label className="active-checkbox" key={field.name}>
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!values[field.name]}
                    onChange={(event) => set(field.name, event.target.checked)}
                  />
                  <span>
                    <strong>{field.label}</strong>
                    {field.description && <small>{field.description}</small>}
                  </span>
                </label>
              );
            return (
              <label key={field.name} htmlFor={fieldId}>
                {field.label}
                {field.type === "select" ? (
                  <select
                    id={fieldId}
                    name={field.name}
                    aria-label={field.label}
                    required={field.required}
                    value={values[field.name] as string}
                    onChange={(event) => set(field.name, event.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={
                      error
                        ? `${fieldId}-error`
                        : field.description
                          ? `${fieldId}-hint`
                          : undefined
                    }
                  >
                    <option value="">Pilih {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={fieldId}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    maxLength={field.maxLength}
                    value={values[field.name] as string}
                    onChange={(event) => set(field.name, event.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={
                      error
                        ? `${fieldId}-error`
                        : field.description
                          ? `${fieldId}-hint`
                          : undefined
                    }
                  />
                )}
                {field.description && (
                  <small className="master-field-hint" id={`${fieldId}-hint`}>
                    {field.description}
                  </small>
                )}
                {error && (
                  <span className="field-error" id={`${fieldId}-error`}>
                    {error}
                  </span>
                )}
              </label>
            );
          })}
        </fieldset>
        {state.message && !state.success && (
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
          <button className="button button-primary" disabled={pending}>
            {pending ? "Menyimpan…" : `Simpan ${config.singular}`}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DeleteDialog({
  config,
  schoolId,
  row,
  onClose,
  onSuccess,
}: {
  config: MasterConfig;
  schoolId: number;
  row: MasterRecord;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    deleteMaster.bind(null, config.slug, schoolId, row.id),
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
      className="year-dialog"
      aria-labelledby="delete-master-title"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onClose();
      }}
    >
      <h2 id="delete-master-title">Hapus {config.singular}?</h2>
      <p className="dialog-description">
        <strong>{String(row.name ?? row.label ?? row.code ?? row.id)}</strong>{" "}
        akan dihapus dari daftar. Data yang sudah dipakai pada master atau
        jadwal lain tidak bisa dihapus.
      </p>
      <form action={action}>
        {state.message && (
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
          <button className="button button-danger" disabled={pending}>
            {pending ? "Menghapus…" : "Ya, hapus"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function MasterFilters({
  config,
  query,
  path,
}: {
  config: MasterConfig;
  query: Record<string, string>;
  path: string;
}) {
  const [values, setValues] = useState(query);
  const filters = config.fields.filter(
    (field) => (field.lookup || field.filter) && field.type !== "multiselect",
  );
  const hasActive = config.fields.some(
    (field) => field.name === "active" && field.type === "checkbox",
  );
  const filtered =
    !!query.q || filters.some((field) => query[field.name]) || !!query.active;
  return (
    <form
      key={JSON.stringify(query)}
      className="year-filters master-filters"
      action={path}
    >
      <label className="search-field year-search">
        <Search size={17} />
        <span className="sr-only">Cari {config.singular}</span>
        <input
          name="q"
          placeholder={`Cari ${config.singular}…`}
          value={values.q ?? ""}
          onChange={(event) =>
            setValues((previous) => ({ ...previous, q: event.target.value }))
          }
          maxLength={100}
        />
      </label>
      {filters.map((field) => (
        <label key={field.name}>
          <span className="sr-only">Filter {field.label.toLowerCase()}</span>
          <select
            name={field.name}
            aria-label={`Filter ${field.label.toLowerCase()}`}
            value={values[field.name] ?? ""}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                [field.name]: event.target.value,
              }))
            }
          >
            <option value="">Semua {field.label.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {hasActive && (
        <label>
          <span className="sr-only">Status {config.singular}</span>
          <select
            name="active"
            aria-label={`Status ${config.singular}`}
            value={values.active ?? ""}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                active: event.target.value,
              }))
            }
          >
            <option value="">Semua status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak aktif</option>
          </select>
        </label>
      )}
      <button className="button button-secondary">Terapkan</button>
      {filtered && (
        <Link className="button button-ghost" href={path}>
          Reset
        </Link>
      )}
    </form>
  );
}
