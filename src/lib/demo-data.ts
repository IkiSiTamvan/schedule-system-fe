export type Design = "classic" | "minimal" | "schedule";
export type View = "overview" | "teachers" | "timetable";

export const designs: {
  id: Design;
  letter: string;
  name: string;
  description: string;
  note: string;
}[] = [
  {
    id: "classic",
    letter: "A",
    name: "The familiar one",
    description: "Terinspirasi Next.js Learn",
    note: "Biru yang familiar, judul serif, dan ruang yang lega. Dekat dengan dashboard Next.js yang sudah kamu kenal.",
  },
  {
    id: "minimal",
    letter: "B",
    name: "A little more space",
    description: "Minimal, tenang, modern",
    note: "Sidebar ringan, aksen biru secukupnya, dan hierarki yang jelas. Dibuat untuk pekerjaan sekolah sehari-hari.",
  },
  {
    id: "schedule",
    letter: "C",
    name: "Make room for time",
    description: "Jadwal jadi pusat perhatian",
    note: "Navigasi gelap yang kontras dan kalender yang lapang. Cocok untuk fokus menyusun jadwal mingguan.",
  },
];

export const teachers = [
  {
    id: "GR-001",
    name: "Rina Kartika",
    initials: "RK",
    subject: "Matematika",
    major: "Semua jurusan",
    hours: 24,
    status: "Aktif",
    color: "lavender",
    email: "rina.kartika@example.test",
    type: "Guru tetap",
  },
  {
    id: "GR-002",
    name: "Ahmad Fauzi",
    initials: "AF",
    subject: "Pemrograman Web",
    major: "Rekayasa Perangkat Lunak",
    hours: 28,
    status: "Aktif",
    color: "blue",
    email: "ahmad.fauzi@example.test",
    type: "Guru tetap",
  },
  {
    id: "GR-003",
    name: "Dewi Lestari",
    initials: "DL",
    subject: "Bahasa Indonesia",
    major: "Semua jurusan",
    hours: 20,
    status: "Aktif",
    color: "peach",
    email: "dewi.lestari@example.test",
    type: "Guru tetap",
  },
  {
    id: "GR-004",
    name: "Bagas Pratama",
    initials: "BP",
    subject: "Desain Grafis",
    major: "Desain Komunikasi Visual",
    hours: 24,
    status: "Aktif",
    color: "mint",
    email: "bagas.pratama@example.test",
    type: "Guru tetap",
  },
  {
    id: "GR-005",
    name: "Siti Nurhaliza",
    initials: "SN",
    subject: "Bahasa Inggris",
    major: "Semua jurusan",
    hours: 18,
    status: "Nonaktif",
    color: "rose",
    email: "siti.nurhaliza@example.test",
    type: "Guru tidak tetap",
  },
  {
    id: "GR-006",
    name: "Fajar Ramadhan",
    initials: "FR",
    subject: "Basis Data",
    major: "Rekayasa Perangkat Lunak",
    hours: 22,
    status: "Aktif",
    color: "sand",
    email: "fajar.ramadhan@example.test",
    type: "Guru tetap",
  },
] as const;

export type Teacher = (typeof teachers)[number];
export type Lesson = {
  day: number;
  start: number;
  duration: number;
  subject: string;
  teacher: string;
  room: string;
  color: string;
};
export const lessons: Lesson[] = [
  {
    day: 0,
    start: 0,
    duration: 2,
    subject: "Matematika",
    teacher: "Rina Kartika",
    room: "Ruang 201",
    color: "lavender",
  },
  {
    day: 0,
    start: 3,
    duration: 3,
    subject: "Pemrograman Web",
    teacher: "Ahmad Fauzi",
    room: "Lab Komputer 1",
    color: "blue",
  },
  {
    day: 1,
    start: 0,
    duration: 2,
    subject: "Basis Data",
    teacher: "Fajar Ramadhan",
    room: "Lab Komputer 2",
    color: "mint",
  },
  {
    day: 1,
    start: 4,
    duration: 2,
    subject: "Bahasa Indonesia",
    teacher: "Dewi Lestari",
    room: "Ruang 201",
    color: "peach",
  },
  {
    day: 2,
    start: 0,
    duration: 2,
    subject: "Bahasa Inggris",
    teacher: "Nadia Putri",
    room: "Ruang 201",
    color: "sand",
  },
  {
    day: 2,
    start: 3,
    duration: 3,
    subject: "Pemrograman Web",
    teacher: "Ahmad Fauzi",
    room: "Lab Komputer 1",
    color: "blue",
  },
  {
    day: 3,
    start: 0,
    duration: 2,
    subject: "Matematika",
    teacher: "Rina Kartika",
    room: "Ruang 201",
    color: "lavender",
  },
  {
    day: 3,
    start: 3,
    duration: 3,
    subject: "Basis Data",
    teacher: "Fajar Ramadhan",
    room: "Lab Komputer 2",
    color: "mint",
  },
  {
    day: 4,
    start: 0,
    duration: 2,
    subject: "Pendidikan Agama",
    teacher: "Hasan Basri",
    room: "Ruang 201",
    color: "rose",
  },
  {
    day: 4,
    start: 3,
    duration: 2,
    subject: "Bahasa Indonesia",
    teacher: "Dewi Lestari",
    room: "Ruang 201",
    color: "peach",
  },
];

export const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
export const times = ["07.00", "07.45", "08.30", "09.30", "10.15", "11.00"];
