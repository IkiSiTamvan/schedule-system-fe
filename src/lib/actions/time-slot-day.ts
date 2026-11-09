"use server";
import { revalidatePath } from "next/cache";
import { backend, actionError } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type { MasterActionState } from "@/lib/masters/types";

async function access(
  schoolId: number,
  yearId: number,
  day: number,
  revision: string,
) {
  if (
    ![schoolId, yearId].every((id) => Number.isSafeInteger(id) && id > 0) ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 7 ||
    !/^[a-f0-9]{64}$/.test(revision)
  )
    return false;
  return (await getWorkspace(String(schoolId))).canManage;
}

export async function saveTimeSlotDay(
  schoolId: number,
  yearId: number,
  day: number,
  revision: string,
  previous: MasterActionState,
  data: FormData,
): Promise<MasterActionState> {
  if (!(await access(schoolId, yearId, day, revision)))
    return { message: "Sekolah, hari, atau akses pengubahan tidak valid." };
  const startsAt = String(data.get("startsAt") ?? "");
  let slots;
  try {
    const rows: unknown = JSON.parse(String(data.get("slots") ?? ""));
    if (
      !Array.isArray(rows) ||
      rows.length > 32767 ||
      rows.some(
        (row) =>
          !row ||
          typeof row !== "object" ||
          !Number.isSafeInteger(row.id) ||
          row.id <= 0 ||
          typeof row.label !== "string" ||
          !row.label.trim() ||
          row.label.length > 100 ||
          !Number.isInteger(row.durationMinutes) ||
          row.durationMinutes < 1 ||
          row.durationMinutes > 1439,
      )
    )
      throw new Error();
    slots = rows.map((row) => ({
      id: row.id,
      label: row.label.trim(),
      durationMinutes: row.durationMinutes,
    }));
  } catch {
    return { message: "Periksa nama dan durasi slot sebelum menyimpan." };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startsAt))
    return { message: "Isi jam mulai pertama yang valid." };
  try {
    await backend(
      "/v1/time-slots/day",
      {
        method: "PUT",
        body: JSON.stringify({
          academicYearId: yearId,
          dayOfWeek: day,
          revision,
          startsAt,
          slots,
        }),
      },
      schoolId,
    );
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(`/schools/${schoolId}`, "layout");
  return {
    success: true,
    message: "Urutan dan jam seluruh slot berhasil disimpan.",
  };
}

export async function appendTimeSlots(
  schoolId: number,
  yearId: number,
  day: number,
  revision: string,
  previous: MasterActionState,
  data: FormData,
): Promise<MasterActionState> {
  if (!(await access(schoolId, yearId, day, revision)))
    return { message: "Sekolah, hari, atau akses pengubahan tidak valid." };
  const kind = String(data.get("kind") ?? "");
  const label = String(data.get("label") ?? "").trim();
  const count = Number(data.get("count"));
  const duration = String(data.get("durationMinutes") ?? "");
  const durationMinutes = duration ? Number(duration) : null;
  const startsAt = String(data.get("startsAt") ?? "") || null;
  if (
    !["LESSON", "BREAK", "ACTIVITY", "OTHER"].includes(kind) ||
    !label ||
    label.length > 70 ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 48 ||
    (kind !== "LESSON" &&
      (count !== 1 ||
        durationMinutes === null ||
        !Number.isInteger(durationMinutes) ||
        durationMinutes < 1 ||
        durationMinutes > 1439)) ||
    (startsAt !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(startsAt))
  )
    return { message: "Periksa nama, jumlah JP, dan durasi slot." };
  try {
    await backend(
      "/v1/time-slots/append",
      {
        method: "POST",
        body: JSON.stringify({
          academicYearId: yearId,
          dayOfWeek: day,
          revision,
          kind,
          label,
          count,
          durationMinutes: kind === "LESSON" ? null : durationMinutes,
          startsAt,
        }),
      },
      schoolId,
    );
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(`/schools/${schoolId}`, "layout");
  return {
    success: true,
    message: `${count} slot ditambahkan; jam dan nomor urut mengikuti slot sebelumnya.`,
  };
}
