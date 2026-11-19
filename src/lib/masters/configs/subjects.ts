import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "subjects",
  title: "Mata pelajaran",
  singular: "mata pelajaran",
  description: "Susun katalog pelajaran sekolah sebagai fondasi pembelajaran.",
  endpoint: "/v1/subjects",
  fields: [
    {
      name: "code",
      label: "Kode mata pelajaran",
      type: "text",
      required: true,
      maxLength: 30,
    },
    {
      name: "name",
      label: "Nama mata pelajaran",
      type: "text",
      required: true,
      maxLength: 150,
    },
    {
      name: "majorIds",
      label: "Jurusan",
      type: "multiselect",
      lookup: { endpoint: "/v1/majors" },
      description:
        "Boleh pilih beberapa jurusan. Kosongkan untuk mata pelajaran umum.",
    },
  ],
  columns: [
    { key: "name", label: "Mata pelajaran" },
    { key: "code", label: "Kode" },
    { key: "majorNames", label: "Jurusan", type: "list", emptyLabel: "Umum" },
  ],
};
