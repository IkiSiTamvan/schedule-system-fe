import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "academic-periods",
  title: "Periode / semester",
  singular: "periode",
  description: "Atur semester dan rentang belajarnya di setiap tahun ajaran.",
  endpoint: "/v1/academic-periods",
  fields: [
    {
      name: "academicYearId",
      label: "Tahun ajaran",
      type: "select",
      required: true,
      lookup: { endpoint: "/v1/academic-years", labelKey: "name" },
    },
    {
      name: "code",
      label: "Kode periode",
      type: "text",
      required: true,
      maxLength: 30,
    },
    {
      name: "name",
      label: "Nama periode",
      type: "text",
      required: true,
      maxLength: 100,
    },
    {
      name: "startsOn",
      label: "Tanggal mulai",
      type: "date",
      required: true,
      description: "Tanggal periode harus berada dalam rentang tahun ajaran.",
    },
    { name: "endsOn", label: "Tanggal selesai", type: "date", required: true },
  ],
  columns: [
    { key: "name", label: "Periode" },
    { key: "code", label: "Kode" },
    { key: "academicYearName", label: "Tahun ajaran" },
    { key: "startsOn", label: "Tanggal mulai", type: "date" },
    { key: "endsOn", label: "Tanggal selesai", type: "date" },
  ],
};
