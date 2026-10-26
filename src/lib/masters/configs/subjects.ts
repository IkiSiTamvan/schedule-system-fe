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
    { name: "category", label: "Kategori", type: "text", maxLength: 30 },
  ],
  columns: [
    { key: "name", label: "Mata pelajaran" },
    { key: "code", label: "Kode" },
    { key: "category", label: "Kategori" },
  ],
};
