import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "majors",
  title: "Jurusan",
  singular: "jurusan",
  description:
    "Kelola jurusan dan program keahlian sebagai fondasi kelas sekolah.",
  endpoint: "/v1/majors",
  fields: [
    {
      name: "code",
      label: "Kode jurusan",
      type: "text",
      required: true,
      maxLength: 30,
    },
    {
      name: "name",
      label: "Nama jurusan",
      type: "text",
      required: true,
      maxLength: 150,
    },
    {
      name: "programName",
      label: "Program keahlian",
      type: "text",
      maxLength: 150,
    },
    {
      name: "fieldName",
      label: "Bidang keahlian",
      type: "text",
      maxLength: 150,
    },
  ],
  columns: [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama jurusan" },
    { key: "programName", label: "Program keahlian" },
    { key: "fieldName", label: "Bidang keahlian" },
  ],
};
