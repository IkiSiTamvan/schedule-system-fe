import type { MasterConfig } from "@/lib/masters/types";

export const config: MasterConfig = {
  slug: "class-subject-requirements",
  title: "Kebutuhan mapel per tingkat",
  singular: "kebutuhan mapel",
  description:
    "Atur target JP per minggu untuk setiap mata pelajaran menurut tingkat, jurusan, dan semester. Semua rombel yang sesuai memakai target yang sama.",
  endpoint: "/v1/class-subject-requirements",
  fields: [
    {
      name: "gradeLevel",
      label: "Tingkat",
      type: "select",
      required: true,
      valueType: "number",
      filter: true,
      options: [
        { value: "10", label: "X" },
        { value: "11", label: "XI" },
        { value: "12", label: "XII" },
      ],
    },
    {
      name: "majorId",
      label: "Jurusan",
      type: "select",
      required: true,
      filter: true,
      lookup: { endpoint: "/v1/majors" },
    },
    {
      name: "academicPeriodId",
      label: "Semester",
      type: "select",
      required: true,
      filter: true,
      lookup: {
        endpoint: "/v1/academic-periods",
        labelKeys: ["name", "academicYearName"],
      },
    },
    {
      name: "subjectId",
      label: "Mata pelajaran",
      type: "select",
      required: true,
      lookup: { endpoint: "/v1/subjects" },
    },
    {
      name: "weeklyJp",
      label: "Target JP per minggu",
      type: "number",
      required: true,
      min: 1,
      max: 2147483647,
      description:
        "Contoh: 3 JP per minggu. Saat menyusun jadwal, dapat dibagi menjadi 3 JP sekaligus atau 2 JP + 1 JP.",
    },
    {
      name: "requiresLab",
      label: "Memerlukan laboratorium",
      type: "checkbox",
      description: "Tandai jika pembelajaran memerlukan ruangan laboratorium.",
    },
  ],
  columns: [
    { key: "gradeLevel", label: "Tingkat" },
    { key: "majorName", label: "Jurusan" },
    { key: "academicYearName", label: "Tahun ajaran" },
    { key: "academicPeriodName", label: "Semester" },
    { key: "subjectName", label: "Mata pelajaran" },
    { key: "weeklyJp", label: "Target JP / minggu" },
    { key: "requiresLab", label: "Lab", type: "boolean" },
  ],
};
