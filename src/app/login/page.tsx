import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  GraduationCap,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { ApiError, backend, SESSION_COOKIE } from "@/lib/backend";
import type { CurrentUser } from "@/lib/api-types";

export const metadata = { title: "Masuk — Academy" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  if ((await cookies()).has(SESSION_COOKIE)) {
    let valid = false;
    try {
      await backend<CurrentUser>("/v1/auth/me");
      valid = true;
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
    if (valid) redirect("/schools");
  }
  const { reason } = await searchParams;
  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="login-brand">
          <GraduationCap size={30} />
          academy<span>.</span>
        </Link>
        <div>
          <p className="eyebrow">RUANG KERJA AKADEMIK</p>
          <h1>
            Hari belajar yang baik
            <br />
            dimulai dari rencana
            <br />
            yang teratur<span>.</span>
          </h1>
          <p>
            Satu ruang untuk menata tahun ajaran, menyiapkan pembelajaran, dan
            memberi tempat untuk setiap rencana.
          </p>
          <div className="login-feature">
            <span>
              <CalendarDays size={18} />
            </span>
            <div>
              <strong>Mulai dari fondasi yang tepat</strong>
              <p>Tahun ajaran yang rapi untuk langkah berikutnya.</p>
            </div>
          </div>
          <div className="login-feature">
            <span>
              <Layers3 size={18} />
            </span>
            <div>
              <strong>Setiap sekolah, ruangnya sendiri</strong>
              <p>Akun yang sama, konteks sekolah yang jelas.</p>
            </div>
          </div>
        </div>
        <footer>Lebih terencana. Lebih tenang.</footer>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="login-symbol">
            <GraduationCap size={28} />
          </span>
          <p className="eyebrow">SELAMAT DATANG KEMBALI</p>
          <h2>
            Masuk, lalu mulai
            <br />
            merencanakan.
          </h2>
          <p>Gunakan akun Academy yang sudah terdaftar.</p>
          {reason === "expired" && (
            <p className="form-notice">
              Sesi sebelumnya berakhir. Silakan masuk kembali.
            </p>
          )}
          <LoginForm />
          <p className="login-help">
            <ShieldCheck size={15} />
            Akses mengikuti sekolah dan role akunmu.
          </p>
        </div>
        <p className="auth-footnote">
          Belum punya akses? Hubungi admin sekolahmu.
        </p>
      </section>
    </main>
  );
}
