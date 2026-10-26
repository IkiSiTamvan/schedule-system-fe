"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  LogOut,
  Menu,
  PanelLeftClose,
  School as SchoolIcon,
  X,
} from "lucide-react";
import type { CurrentUser, School } from "@/lib/api-types";
import { roleLabel } from "@/lib/api-types";
import { logoutAction } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/primitives";

export function AppShell({
  user,
  school,
  children,
}: {
  user: CurrentUser;
  school: School;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const initials = user.username.slice(0, 2).toUpperCase();
  return (
    <div className="live-workspace">
      <div className="academy-shell theme-minimal">
        {open && (
          <button
            className="sidebar-backdrop"
            aria-label="Tutup navigasi"
            onClick={() => setOpen(false)}
          />
        )}
        <aside className={`shell-sidebar ${open ? "sidebar-open" : ""}`}>
          <Link href="/schools" className="sidebar-brand">
            <GraduationCap size={28} strokeWidth={1.7} />
            <span>
              academy<span className="logo-period">.</span>
            </span>
          </Link>
          <button
            className="icon-button mobile-nav-close live-nav-close"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
          <Link href="/schools" className="school-selector">
            <span className="school-symbol">
              <SchoolIcon size={19} />
            </span>
            <span>
              <strong>{school.name}</strong>
              <small>Ganti sekolah</small>
            </span>
            <ChevronRight size={14} />
          </Link>
          <p className="nav-label live-nav-label">MASTER AKADEMIK</p>
          <nav className="app-navigation" aria-label="Navigasi aplikasi">
            <Link
              href={`/schools/${school.id}/academic-years`}
              aria-current="page"
              onClick={() => setOpen(false)}
            >
              <CalendarDays size={19} />
              <span>Tahun ajaran</span>
            </Link>
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <span className="note-icon">
                <CalendarDays size={19} />
              </span>
              <strong>
                Fondasi untuk
                <br />
                rencana selanjutnya.
              </strong>
              <p>
                Kelola tahun ajaran sekolah, lalu siapkan periode dan
                pembelajarannya.
              </p>
            </div>
            <div className="sidebar-profile">
              <Avatar initials={initials} color="sand" small />
              <span>
                <strong>{user.username}</strong>
                <small>{roleLabel(user, school.id)}</small>
              </span>
              <form action={logoutAction}>
                <button className="icon-button" aria-label="Keluar dari akun">
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </aside>
        <div className="shell-main">
          <header className="app-topbar">
            <div className="breadcrumbs">
              <button
                className="icon-button mobile-menu-toggle"
                aria-label="Buka menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <Menu size={20} />
              </button>
              <PanelLeftClose size={17} className="desktop-panel-icon" />
              <Link href="/schools" className="breadcrumb-school">
                Sekolah
              </Link>
              <ChevronRight size={13} />
              <strong>Tahun ajaran</strong>
            </div>
            <div className="topbar-right">
              <span className="live-connection">
                <span />
                Data sekolah
              </span>
              <span className="topbar-divider" />
              <Avatar initials={initials} color="sand" small />
            </div>
          </header>
          <main className="workspace-content live-content">
            <a href="#academic-year-content" className="skip-link">
              Lewati ke konten
            </a>
            {children}
            <footer className="workspace-bottom">
              <span>
                {school.name}
                <span>·</span>
                {school.timeZone}
              </span>
              <Link href="/schools">
                Ganti sekolah
                <ArrowUpRight size={12} />
              </Link>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
