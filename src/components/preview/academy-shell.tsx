import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Menu,
  School,
  Settings2,
  Users,
  X,
  PanelLeftClose,
} from "lucide-react";
import type { Design, View } from "@/lib/demo-data";
import { Avatar, Badge } from "@/components/ui/primitives";
import { Overview } from "./overview";
import { Teachers } from "./teachers";
import { Timetable } from "./timetable";

const navItems = [
  { id: "overview" as const, label: "Ringkasan", icon: LayoutDashboard },
  { id: "teachers" as const, label: "Master guru", icon: Users },
  { id: "timetable" as const, label: "Jadwal pelajaran", icon: CalendarDays },
];

export function AcademyShell({
  design,
  view,
  onViewChange,
}: {
  design: Design;
  view: View;
  onViewChange: (view: View) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState("Ganjil 2026/2027");
  const [schoolOpen, setSchoolOpen] = useState(false);
  const title = navItems.find((item) => item.id === view)!.label;
  return (
    <div className={`academy-shell theme-${design}`}>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`shell-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <GraduationCap size={28} strokeWidth={1.7} />
          <span>
            academy<span className="logo-period">.</span>
          </span>
          <button
            className="icon-button mobile-nav-close"
            aria-label="Tutup menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="school-switcher">
          <button
            className="school-selector"
            aria-expanded={schoolOpen}
            onClick={() => setSchoolOpen(!schoolOpen)}
          >
            <span className="school-symbol">
              <School size={19} />
            </span>
            <span>
              <strong>SMK Nusantara</strong>
              <small>Ruang kerja sekolah</small>
            </span>
            <ChevronDown size={14} />
          </button>
          {schoolOpen && (
            <div className="school-popover">
              <strong>Sekolah aktif</strong>
              <p>SMK Nusantara</p>
              <small>
                Contoh akun dengan satu sekolah. Pemilihan sekolah lain akan
                tersedia setelah integrasi.
              </small>
            </div>
          )}
        </div>
        <p className="nav-label">RUANG KERJA</p>
        <nav aria-label="Navigasi aplikasi" className="app-navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => {
                onViewChange(item.id);
                setMenuOpen(false);
              }}
            >
              <item.icon size={19} strokeWidth={1.7} />
              <span>{item.label}</span>
              {item.id === "timetable" && <span className="nav-count">5</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">
              <BookOpen size={19} />
            </span>
            <strong>
              Rencana yang baik,
              <br />
              belajar lebih tenang.
            </strong>
            <p>Mulai dari data yang rapi untuk jadwal yang lebih berarti.</p>
            <button
              onClick={() => {
                onViewChange("teachers");
                setMenuOpen(false);
              }}
            >
              Lengkapi data guru <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="sidebar-profile">
            <Avatar initials="MR" color="sand" small />
            <span>
              <strong>M. Rizky</strong>
              <small>Admin sekolah · Demo</small>
            </span>
            <Settings2 size={16} aria-hidden="true" />
          </div>
        </div>
      </aside>
      <div className="shell-main">
        <header className="app-topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu-toggle"
              aria-label="Buka menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <PanelLeftClose size={17} className="desktop-panel-icon" />
            <span className="breadcrumb-school">Ruang kerja</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <Badge tone="warning">Data demo</Badge>
            <span className="topbar-divider" />
            <Avatar initials="MR" color="sand" small />
          </div>
        </header>
        <div className="workspace-content">
          <div className="workspace-context">
            <span>
              <span className="context-dot" /> TAHUN AJARAN AKTIF
            </span>
            <label className="period-selector">
              <CalendarDays size={14} />
              <select
                aria-label="Periode akademik"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option>Ganjil 2026/2027</option>
                <option>Genap 2026/2027</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </div>
          {view === "overview" && (
            <Overview onViewChange={onViewChange} period={period} />
          )}
          {view === "teachers" && <Teachers />}
          {view === "timetable" && <Timetable period={period} />}
          <footer className="workspace-bottom">
            <span>
              SMK Nusantara <span>·</span> Tahun ajaran 2026/2027
            </span>
            <span>
              Dirancang untuk hari yang lebih teratur{" "}
              <span className="tiny-star">✳</span>
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
