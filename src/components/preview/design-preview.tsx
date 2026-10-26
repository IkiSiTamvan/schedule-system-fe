"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCheck,
  GraduationCap,
  Monitor,
  Smartphone,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { designs, type Design, type View } from "@/lib/demo-data";
import { AcademyShell } from "./academy-shell";
import { Button } from "@/components/ui/primitives";

export function DesignPreview() {
  const [design, setDesign] = useState<Design>("minimal");
  const [view, setView] = useState<View>("overview");
  const [mobile, setMobile] = useState(false);
  const [saved, setSaved] = useState<Design | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const value = localStorage.getItem("academy-design");
      if (designs.some((item) => item.id === value)) {
        setSaved(value as Design);
        setDesign(value as Design);
      }
    } catch {
      /* Preview still works when browser storage is unavailable. */
    }
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  const selected = designs.find((item) => item.id === design)!;

  function saveDesign() {
    try {
      localStorage.setItem("academy-design", design);
      setSaved(design);
      setMessage(
        `Desain ${selected.letter} disimpan di browser ini. Pilihan yang bagus untuk mulai!`,
      );
    } catch {
      setMessage(
        "Penyimpanan browser tidak tersedia. Kamu tetap bisa membandingkan semua desain.",
      );
    }
  }

  return (
    <div className="design-explorer">
      <a className="skip-link" href="#workspace-preview">
        Lewati ke preview aplikasi
      </a>
      <header className="explorer-masthead">
        <a
          href="/preview"
          className="explorer-brand"
          aria-label="Academy design explorer"
        >
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>
          academy
          <span className="brand-divider" />{" "}
          <span className="masthead-label">Design explorer</span>
        </a>
        <span className="prototype-label">
          <span /> Playground 01{" "}
          <span className="prototype-label-extra">
            / Belum terhubung ke backend
          </span>
        </span>
      </header>
      <main className="explorer-main">
        <div className="explorer-intro">
          <div>
            <p className="eyebrow">SATU APLIKASI. TIGA KARAKTER.</p>
            <h1>
              Ruang yang pas untuk rencana besar<span>.</span>
            </h1>
            <p>
              Pilih suasananya. Coba alurnya. Kita bangun dari yang paling kamu
              suka.
            </p>
          </div>
          <span className="intro-hint">
            <ArrowDown size={16} /> Coba langsung di bawah
          </span>
        </div>
        <section className="design-options" aria-label="Pilihan desain">
          {designs.map((option) => (
            <button
              key={option.id}
              aria-label={`${option.letter} ${option.name}`}
              className={`design-option ${design === option.id ? "is-selected" : ""}`}
              aria-pressed={design === option.id}
              onClick={() => {
                setDesign(option.id);
                setView(option.id === "schedule" ? "timetable" : "overview");
              }}
            >
              <span
                className={`design-thumbnail thumbnail-${option.id}`}
                aria-hidden="true"
              >
                <i />
                <span>
                  <b />
                  <b />
                  <b />
                </span>
              </span>
              <span className="design-option-copy">
                <span className="option-name">
                  <span>{option.letter}</span>
                  {option.name}
                  {option.id === "minimal" && (
                    <span className="recommended">Pilihan kami</span>
                  )}
                </span>
                <span className="option-description">{option.description}</span>
              </span>
              <span
                className={`option-check ${design === option.id ? "checked" : ""}`}
                aria-hidden="true"
              >
                {design === option.id && <Check size={12} />}
              </span>
            </button>
          ))}
        </section>
        <div className="preview-utility">
          <p>
            <span className="preview-live-dot" /> Preview interaktif{" "}
            <span className="utility-divider">/</span>
            <span className="preview-utility-description">
              Buka menu, cari guru, atau jelajahi jadwal.
            </span>
          </p>
          <div className="device-switch" aria-label="Ukuran preview">
            <button
              aria-label="Preview desktop"
              aria-pressed={!mobile}
              onClick={() => setMobile(false)}
            >
              <Monitor size={16} />
              <span>Desktop</span>
            </button>
            <button
              aria-label="Preview mobile"
              aria-pressed={mobile}
              onClick={() => setMobile(true)}
            >
              <Smartphone size={15} />
              <span>Mobile</span>
            </button>
          </div>
        </div>
        <div className={`preview-stage ${mobile ? "stage-mobile" : ""}`}>
          <div
            className={`workspace-frame ${mobile ? "device-mobile" : ""}`}
            id="workspace-preview"
            tabIndex={-1}
          >
            <AcademyShell design={design} view={view} onViewChange={setView} />
          </div>
        </div>
        <footer className="preview-footer">
          <div>
            <span className="footer-sparkle">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>
                {selected.letter} — {selected.name}
              </strong>
              <p>{selected.note}</p>
            </div>
          </div>
          <Button
            onClick={saveDesign}
            variant={saved === design ? "secondary" : "primary"}
          >
            {saved === design ? <CheckCheck size={17} /> : <Check size={17} />}
            {saved === design ? "Pilihanmu tersimpan" : "Aku pilih desain ini"}
          </Button>
        </footer>
        <p className="demo-footnote">
          Semua nama, angka, dan jadwal adalah data contoh. Pilihan desain
          disimpan hanya di browser ini.
        </p>
      </main>
      <div
        className={`toast ${message ? "toast-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message && (
          <>
            <CheckCheck size={18} />
            <span>{message}</span>
          </>
        )}
      </div>
    </div>
  );
}
