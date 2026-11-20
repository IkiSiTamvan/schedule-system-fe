"use server";

import { actionError, backend } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import type { ActionState } from "@/lib/api-types";

export async function saveTeacherAvailability(
  schoolId: number,
  teacherId: number,
  periodId: number,
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const validId = (id: number) => Number.isSafeInteger(id) && id > 0;
  if (![schoolId, teacherId, periodId].every(validId))
    return { message: "Guru atau semester tidak valid." };

  if (!(await getWorkspace(String(schoolId))).canManage)
    return {
      message: "Akunmu tidak memiliki izin untuk mengubah jam tersedia.",
    };

  const timeSlotIds = form.getAll("timeSlotIds").map(Number);
  if (!timeSlotIds.every(validId))
    return { message: "Periksa kembali slot yang dipilih." };

  try {
    await backend(
      `/v1/teachers/${teacherId}/availability?academicPeriodId=${periodId}`,
      { method: "PUT", body: JSON.stringify({ timeSlotIds }) },
      schoolId,
    );
    return { success: true, message: "Jam tersedia berhasil disimpan." };
  } catch (error) {
    return { message: actionError(error) };
  }
}
