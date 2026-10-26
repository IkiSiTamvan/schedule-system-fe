import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "time-slots",
  title: "Slot waktu",
  singular: "slot waktu",
  description:
    "Atur jam pelajaran, istirahat, dan kegiatan pada setiap hari sekolah.",
  endpoint: "/v1/time-slots",
  fields: [
    {
      name: "academicYearId",
      label: "Tahun ajaran",
      type: "select",
      required: true,
      lookup: { endpoint: "/v1/academic-years" },
    },
    {
      name: "dayOfWeek",
      label: "Hari",
      type: "select",
      valueType: "number",
      filter: true,
      required: true,
      options: [
        { value: "1", label: "Senin" },
        { value: "2", label: "Selasa" },
        { value: "3", label: "Rabu" },
        { value: "4", label: "Kamis" },
        { value: "5", label: "Jumat" },
        { value: "6", label: "Sabtu" },
        { value: "7", label: "Minggu" },
      ],
    },
    {
      name: "sequenceNumber",
      label: "Nomor urut",
      type: "number",
      required: true,
      min: 1,
      max: 32767,
      description:
        "Unik untuk setiap hari dan tahun ajaran. Sertakan urutan istirahat dan kegiatan.",
    },
    {
      name: "label",
      label: "Nama slot",
      type: "text",
      required: true,
      maxLength: 100,
    },
    { name: "startsAt", label: "Jam mulai", type: "time", required: true },
    {
      name: "endsAt",
      label: "Jam selesai",
      type: "time",
      required: true,
      description:
        "Harus setelah jam mulai pada hari yang sama. Durasi dihitung otomatis dalam menit.",
    },
    {
      name: "kind",
      label: "Jenis slot",
      type: "select",
      required: true,
      defaultValue: "LESSON",
      options: [
        { value: "LESSON", label: "Pelajaran" },
        { value: "BREAK", label: "Istirahat" },
        { value: "ACTIVITY", label: "Kegiatan" },
        { value: "OTHER", label: "Lainnya" },
      ],
    },
  ],
  columns: [
    { key: "label", label: "Slot waktu" },
    { key: "academicYearName", label: "Tahun ajaran" },
    { key: "dayName", label: "Hari" },
    { key: "sequenceNumber", label: "Urutan" },
    { key: "startsAt", label: "Jam mulai", type: "time" },
    { key: "endsAt", label: "Jam selesai", type: "time" },
    { key: "kindLabel", label: "Jenis" },
    { key: "durationMinutes", label: "Durasi (menit)" },
  ],
};
