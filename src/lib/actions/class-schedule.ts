"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/api-types";
import { actionError, backend } from "@/lib/backend";
import { schedulePath, type ScheduleVersion } from "@/lib/class-schedule";
import { getWorkspace } from "@/lib/workspace";

function validId(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}

export async function createScheduleDraft(
  schoolId: number,
  periodId: number,
  classId: number | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const name = String(form.get("name") ?? "").trim();
  if (![schoolId, periodId].every(validId) || !name || name.length > 120)
    return {
      message: "Pilih semester dan isi nama draft maksimal 120 karakter.",
    };
  if (!(await getWorkspace(String(schoolId))).canManage)
    return {
      message: "Akunmu tidak memiliki izin untuk membuat draft jadwal.",
    };

  let version: ScheduleVersion;
  try {
    version = (
      await backend<ScheduleVersion>(
        "/v1/schedule-versions",
        {
          method: "POST",
          body: JSON.stringify({ academicPeriodId: periodId, name }),
        },
        schoolId,
      )
    ).result;
  } catch (error) {
    return { message: actionError(error) };
  }
  const path = schedulePath(schoolId);
  const query = new URLSearchParams({
    academicPeriodId: String(periodId),
    versionId: String(version.id),
  });
  if (classId !== null && validId(classId))
    query.set("classGroupId", String(classId));
  revalidatePath(path);
  redirect(path + "?" + query);
}

export async function changeScheduleEntry(
  schoolId: number,
  versionId: number,
  classId: number,
  entryId: number | null,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (
    ![schoolId, versionId, classId].every(validId) ||
    (entryId !== null && !validId(entryId))
  )
    return { message: "Draft, kelas, atau pertemuan tidak valid." };
  if (!(await getWorkspace(String(schoolId))).canManage)
    return { message: "Akunmu tidak memiliki izin untuk mengubah jadwal." };

  const remove = form.get("intent") === "delete";
  if (remove && entryId === null)
    return { message: "Pertemuan tidak ditemukan." };
  const path =
    "/v1/schedule-versions/" +
    versionId +
    "/entries" +
    (entryId === null ? "" : "/" + entryId);
  try {
    if (remove) {
      await backend(path, { method: "DELETE" }, schoolId);
    } else {
      const requirementId = Number(form.get("requirementId"));
      const teacherId = Number(form.get("teacherId"));
      const roomId = form.get("roomId") ? Number(form.get("roomId")) : null;
      const timeSlotIds = form.getAll("timeSlotIds").map(Number);
      if (
        ![requirementId, teacherId, ...timeSlotIds].every(validId) ||
        (roomId !== null && !validId(roomId)) ||
        !timeSlotIds.length ||
        timeSlotIds.length > 1439 ||
        new Set(timeSlotIds).size !== timeSlotIds.length
      )
        return { message: "Lengkapi mapel, guru, dan slot pertemuan." };
      await backend(
        path,
        {
          method: entryId === null ? "POST" : "PUT",
          body: JSON.stringify({
            classGroupId: classId,
            requirementId,
            teacherId,
            roomId,
            timeSlotIds,
          }),
        },
        schoolId,
      );
    }
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(schedulePath(schoolId));
  return {
    success: true,
    message: remove
      ? "Pertemuan dihapus."
      : entryId === null
        ? "Pertemuan ditambahkan."
        : "Pertemuan diperbarui.",
  };
}
