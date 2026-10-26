import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "rooms",
  title: "Ruangan",
  singular: "ruangan",
  description: "Siapkan ruang kelas dan laboratorium beserta fasilitasnya.",
  endpoint: "/v1/rooms",
  fields: [
    {
      name: "code",
      label: "Kode ruangan",
      type: "text",
      required: true,
      maxLength: 30,
    },
    {
      name: "name",
      label: "Nama ruangan",
      type: "text",
      required: true,
      maxLength: 120,
    },
    {
      name: "roomType",
      label: "Jenis ruangan",
      type: "select",
      required: true,
      defaultValue: "CLASSROOM",
      options: [
        { value: "CLASSROOM", label: "Ruang kelas" },
        { value: "LAB", label: "Laboratorium" },
        { value: "OTHER", label: "Lainnya" },
      ],
    },
    {
      name: "capacity",
      label: "Kapasitas siswa",
      type: "number",
      min: 1,
      max: 2147483647,
    },
    {
      name: "facilityIds",
      label: "Fasilitas ruangan",
      type: "multiselect",
      lookup: { endpoint: "/v1/facilities", labelKey: "name" },
      description:
        "Opsional. Pilih fasilitas yang tersedia di ruangan ini. Kapasitas, jenis, dan fasilitas terkunci jika ruangan sudah dipakai jadwal.",
    },
  ],
  columns: [
    { key: "code", label: "Kode" },
    { key: "name", label: "Ruangan" },
    { key: "roomType", label: "Jenis" },
    { key: "capacity", label: "Kapasitas" },
    { key: "facilityNames", label: "Fasilitas", type: "list" },
  ],
};
