import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  LogOut,
  School as SchoolIcon,
} from "lucide-react";
import { getCurrentUser, getSchools } from "@/lib/backend";
import { roleLabel } from "@/lib/api-types";
import { logoutAction } from "@/lib/actions/auth";
import { CreateSchool } from "@/components/schools/create-school";

export const metadata = { title: "Pilih sekolah — Academy" };

export default async function SchoolsPage() {
  const [user, schools] = await Promise.all([getCurrentUser(), getSchools()]);
  return (
    <main className="schools-page">
      <header className="schools-topbar">
        <Link href="/schools" className="explorer-brand">
          <GraduationCap size={25} />
          academy<span className="logo-period">.</span>
        </Link>
        <form action={logoutAction}>
          <button className="button button-secondary">
            <LogOut size={15} />
            Keluar
          </button>
        </form>
      </header>
      <div className="schools-content">
        <p className="eyebrow">RUANG KERJAMU</p>
        <h1>
          Halo, {user.username}
          <span>.</span>
        </h1>
        <p>Pilih sekolah untuk mulai menata tahun ajaran.</p>
        <div className="schools-section-heading">
          <h2>
            Sekolah yang bisa kamu akses <span>{schools.length}</span>
          </h2>
          {user.globalRoles.includes("PLATFORM_ADMIN") && <CreateSchool />}
        </div>
        <div className="school-grid">
          {schools.map((school) => (
            <Link
              className="school-card"
              href={`/schools/${school.id}/academic-years`}
              key={school.id}
            >
              <span className="school-card-icon">
                <SchoolIcon size={24} />
              </span>
              <span className="school-card-code">{school.code}</span>
              <h3>{school.name}</h3>
              <p>{roleLabel(user, school.id)}</p>
              <span className="school-card-bottom">
                Buka ruang kerja
                <ArrowUpRight size={17} />
              </span>
            </Link>
          ))}
        </div>
        {schools.length === 0 && (
          <div className="school-empty">
            <SchoolIcon size={32} />
            <h2>Ruang kerja belum tersedia.</h2>
            <p>
              {user.globalRoles.includes("PLATFORM_ADMIN")
                ? "Buat sekolah pertamamu melalui tombol Tambah sekolah."
                : "Akunmu belum memiliki membership sekolah aktif. Hubungi admin sekolah untuk mendapatkan undangan."}
            </p>
          </div>
        )}
        <footer className="schools-footer">
          Data ditampilkan sesuai akses akunmu. Kamu bisa mengganti sekolah
          kapan saja.
        </footer>
      </div>
    </main>
  );
}
