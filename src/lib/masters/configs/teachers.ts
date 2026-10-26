import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "teachers",
  title: "Guru",
  singular: "guru",
  description:
    "Kelola data guru sekolah sebelum menyiapkan pembelajaran dan jadwal.",
  endpoint: "/v1/teachers",
  fields: [
    {
      name: "employeeCode",
      label: "Kode / nomor pegawai",
      type: "text",
      maxLength: 40,
      description: "Opsional. Jika diisi, kode harus unik di sekolah ini.",
    },
    {
      name: "name",
      label: "Nama guru",
      type: "text",
      required: true,
      maxLength: 150,
    },
    { name: "email", label: "Email", type: "email", maxLength: 255 },
    { name: "phone", label: "Nomor telepon", type: "text", maxLength: 40 },
    {
      name: "active",
      label: "Guru aktif",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "external",
      label: "Guru dari luar sekolah",
      type: "checkbox",
      defaultValue: false,
      description: "Tandai untuk guru tamu atau guru dari luar sekolah.",
    },
  ],
  columns: [
    { key: "name", label: "Nama guru" },
    { key: "employeeCode", label: "Kode pegawai" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telepon" },
    { key: "active", label: "Aktif", type: "boolean" },
    { key: "external", label: "Guru luar", type: "boolean" },
  ],
};
