import Link from "next/link";

export default function NotFound() {
  return (
    <main className="recovery-page">
      <h1>Halaman tidak tersedia.</h1>
      <p>Alamatnya mungkin berubah atau sekolah ini belum bisa kamu akses.</p>
      <Link className="button button-primary" href="/schools">
        Pilih sekolah
      </Link>
    </main>
  );
}
