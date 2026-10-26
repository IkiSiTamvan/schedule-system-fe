"use client";

import Link from "next/link";

export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="recovery-page">
      <h1>Ruang kerja belum bisa dimuat.</h1>
      <p>Pastikan layanan Academy sudah berjalan, lalu coba lagi.</p>
      <button className="button button-primary" onClick={retry}>
        Coba lagi
      </button>
      <Link href="/login">Kembali ke halaman masuk</Link>
    </main>
  );
}
