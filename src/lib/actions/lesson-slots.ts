"use server";

import { revalidatePath } from "next/cache";
import { backend, actionError } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type { MasterActionState } from "@/lib/masters/types";

export async function generateLessonSlots(
  schoolId: number,
  previous: MasterActionState,
  data: FormData,
): Promise<MasterActionState> {
  if (!Number.isSafeInteger(schoolId) || schoolId <= 0)
    return { message: "Sekolah tidak valid." };
  const { canManage } = await getWorkspace(String(schoolId));
  if (!canManage)
    return { message: "Akunmu memiliki akses baca untuk slot waktu." };
  const body = {
    academicYearId: Number(data.get("academicYearId")),
    dayOfWeek: Number(data.get("dayOfWeek")),
    firstSequenceNumber: Number(data.get("firstSequenceNumber")),
    count: Number(data.get("count")),
    startsAt: String(data.get("startsAt") ?? ""),
  };
  if (
    !Number.isSafeInteger(body.academicYearId) ||
    body.academicYearId <= 0 ||
    !Number.isInteger(body.dayOfWeek) ||
    body.dayOfWeek < 1 ||
    body.dayOfWeek > 7 ||
    !Number.isInteger(body.firstSequenceNumber) ||
    body.firstSequenceNumber < 1 ||
    body.firstSequenceNumber > 32767 ||
    !Number.isInteger(body.count) ||
    body.count < 1 ||
    body.count > 48 ||
    body.firstSequenceNumber + body.count - 1 > 32767 ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.startsAt)
  )
    return {
      message:
        "Periksa tahun ajaran, hari, nomor urut, jam mulai, dan jumlah JP (1–48).",
    };
  try {
    await backend(
      "/v1/time-slots/generate-lessons",
      { method: "POST", body: JSON.stringify(body) },
      schoolId,
    );
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(`/schools/${schoolId}`, "layout");
  return {
    success: true,
    message: `${body.count} slot pelajaran berhasil dibuat.`,
  };
}
