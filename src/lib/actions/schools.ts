"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { actionError, ApiError, backend, getCurrentUser } from "@/lib/backend";
import type { ActionState, School } from "@/lib/api-types";

export async function createSchoolAction(
  previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user.globalRoles.includes("PLATFORM_ADMIN"))
    return { message: "Hanya admin platform yang dapat membuat sekolah." };
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!code || code.length > 30 || !name || name.length > 160)
    return {
      message:
        "Kode (maks. 30 karakter) dan nama sekolah (maks. 160 karakter) wajib diisi.",
    };
  let school: School;
  try {
    school = (
      await backend<School>("/v1/schools", {
        method: "POST",
        body: JSON.stringify({ code, name, timeZone: "Asia/Jakarta" }),
      })
    ).result;
  } catch (error) {
    return {
      message:
        error instanceof ApiError && error.status === 409
          ? "Kode sekolah sudah dipakai. Gunakan kode lain."
          : actionError(error),
    };
  }
  revalidatePath("/schools");
  redirect(`/schools/${school.id}/academic-years`);
}
