import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "facilities",
  title: "Fasilitas",
  singular: "fasilitas",
  description:
    "Kelola fasilitas sekolah untuk melengkapi kebutuhan ruangan belajar.",
  endpoint: "/v1/facilities",
  fields: [
    {
      name: "code",
      label: "Kode fasilitas",
      type: "text",
      required: true,
      maxLength: 30,
    },
    {
      name: "name",
      label: "Nama fasilitas",
      type: "text",
      required: true,
      maxLength: 120,
    },
  ],
  columns: [
    { key: "name", label: "Fasilitas" },
    { key: "code", label: "Kode" },
  ],
};
