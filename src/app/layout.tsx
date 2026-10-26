import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academy — Ruang kerja akademik",
  description:
    "Ruang kerja untuk mengelola tahun ajaran dan pembelajaran sekolah.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
