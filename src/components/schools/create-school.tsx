"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createSchoolAction } from "@/lib/actions/schools";
import { Button } from "@/components/ui/primitives";

export function CreateSchool() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createSchoolAction, {
    message: "",
  });
  return (
    <section className="create-school">
      <Button
        variant="secondary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? <X size={16} /> : <Plus size={16} />}
        {open ? "Tutup form" : "Tambah sekolah"}
      </Button>
      {open && (
        <form action={action} className="school-create-form">
          <h2>Buat ruang kerja sekolah</h2>
          <p>Setelah tersimpan, kamu bisa langsung menambahkan tahun ajaran.</p>
          <label>
            Kode sekolah
            <input
              name="code"
              placeholder="Contoh: SMK-NUSANTARA"
              maxLength={30}
              required
              autoFocus
            />
          </label>
          <label>
            Nama sekolah
            <input
              name="name"
              placeholder="Contoh: SMK Nusantara"
              maxLength={160}
              required
            />
          </label>
          {state.message && (
            <p className="form-error" role="alert">
              {state.message}
            </p>
          )}
          <Button disabled={pending} type="submit">
            {pending ? "Menyimpan…" : "Buat sekolah"}
          </Button>
        </form>
      )}
    </section>
  );
}
