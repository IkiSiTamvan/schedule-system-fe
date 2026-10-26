"use server";

import { revalidatePath } from "next/cache";
import { actionError, ApiError, backend } from "@/lib/backend";
import type { AcademicYear, ActionState } from "@/lib/api-types";

function validId(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}
function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export async function saveAcademicYear(
  schoolId: number,
  id: number | null,
  previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!validId(schoolId) || (id !== null && !validId(id)))
    return { message: "Sekolah atau tahun ajaran tidak valid." };
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const startsOn = String(formData.get("startsOn") ?? "");
  const endsOn = String(formData.get("endsOn") ?? "");
  const active = formData.get("active") === "on";
  const fieldErrors: Record<string, string> = {};
  if (!code || code.length > 20)
    fieldErrors.code = "Isi kode maksimal 20 karakter.";
  if (!name || name.length > 100)
    fieldErrors.name = "Isi nama maksimal 100 karakter.";
  if (!validDate(startsOn))
    fieldErrors.startsOn = "Pilih tanggal mulai yang valid.";
  if (!validDate(endsOn))
    fieldErrors.endsOn = "Pilih tanggal selesai yang valid.";
  else if (validDate(startsOn) && endsOn <= startsOn)
    fieldErrors.endsOn = "Tanggal selesai harus setelah tanggal mulai.";
  if (Object.keys(fieldErrors).length)
    return { message: "Periksa kembali isian tahun ajaran.", fieldErrors };
  try {
    await backend<AcademicYear>(
      `/v1/academic-years${id === null ? "" : `/${id}`}`,
      {
        method: id === null ? "POST" : "PUT",
        body: JSON.stringify({ code, name, startsOn, endsOn, active }),
      },
      schoolId,
    );
  } catch (error) {
    return {
      message: actionError(error),
      fieldErrors:
        error instanceof ApiError && error.status === 409
          ? { code: "Kode sudah digunakan. Coba kode lain." }
          : undefined,
    };
  }
  revalidatePath(`/schools/${schoolId}/academic-years`);
  return {
    success: true,
    message:
      id === null
        ? "Tahun ajaran berhasil ditambahkan."
        : "Perubahan tahun ajaran disimpan.",
  };
}

export async function deleteAcademicYear(
  schoolId: number,
  id: number,
  previous: ActionState,
): Promise<ActionState> {
  if (!validId(schoolId) || !validId(id))
    return { message: "Sekolah atau tahun ajaran tidak valid." };
  try {
    await backend<null>(
      `/v1/academic-years/${id}`,
      { method: "DELETE" },
      schoolId,
    );
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(`/schools/${schoolId}/academic-years`);
  return { success: true, message: "Tahun ajaran berhasil dihapus." };
}
