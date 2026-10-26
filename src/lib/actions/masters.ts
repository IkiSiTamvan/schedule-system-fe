"use server";

import { revalidatePath } from "next/cache";
import { backend, actionError } from "@/lib/backend";
import { getWorkspace } from "@/lib/workspace";
import { masterConfig } from "@/lib/masters/registry";
import type { MasterActionState } from "@/lib/masters/types";

export async function saveMaster(
  slug: string,
  schoolId: number,
  id: number | null,
  previous: MasterActionState,
  formData: FormData,
): Promise<MasterActionState> {
  const config = masterConfig(slug);
  if (
    !config ||
    !Number.isSafeInteger(schoolId) ||
    schoolId <= 0 ||
    (id !== null && (!Number.isSafeInteger(id) || id <= 0))
  )
    return { message: "Data yang dipilih tidak valid." };
  const { canManage } = await getWorkspace(String(schoolId));
  if (!canManage)
    return { message: "Akunmu memiliki akses baca untuk master ini." };
  const body: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  for (const field of config.fields) {
    const raw = String(formData.get(field.name) ?? "").trim();
    if (field.type === "checkbox") {
      body[field.name] = raw === "on";
      continue;
    }
    if (field.type === "multiselect") {
      const values = formData.getAll(field.name).map(String);
      if (
        values.some(
          (value) =>
            !/^\d+$/.test(value) ||
            !Number.isSafeInteger(Number(value)) ||
            Number(value) <= 0,
        )
      )
        fieldErrors[field.name] = "Pilihan tidak valid.";
      body[field.name] = [...new Set(values.map(Number))];
      continue;
    }
    if (!raw) {
      if (field.required)
        fieldErrors[field.name] = `${field.label} wajib diisi.`;
      body[field.name] = null;
      continue;
    }
    if (field.maxLength && raw.length > field.maxLength)
      fieldErrors[field.name] = `Maksimal ${field.maxLength} karakter.`;
    if (field.options && !field.options.some((option) => option.value === raw))
      fieldErrors[field.name] = "Pilih nilai yang tersedia.";
    if (
      field.type === "number" ||
      field.lookup ||
      field.valueType === "number"
    ) {
      const value = Number(raw);
      if (
        !Number.isSafeInteger(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max) ||
        (field.lookup && value <= 0)
      )
        fieldErrors[field.name] =
          "Masukkan angka yang valid dalam rentang yang ditentukan.";
      body[field.name] = value;
    } else {
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw))
        fieldErrors[field.name] = "Masukkan alamat email yang valid.";
      if (
        field.type === "date" &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(raw) ||
          !Number.isFinite(Date.parse(raw)) ||
          new Date(raw).toISOString().slice(0, 10) !== raw)
      )
        fieldErrors[field.name] = "Pilih tanggal yang valid.";
      if (
        field.type === "time" &&
        !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(raw)
      )
        fieldErrors[field.name] = "Pilih jam yang valid.";
      if (
        field.options &&
        !field.options.some((option) => option.value === raw)
      )
        fieldErrors[field.name] = "Pilih nilai yang tersedia.";
      body[field.name] = raw;
    }
  }
  if (Object.keys(fieldErrors).length)
    return { message: "Periksa kembali isian formulir.", fieldErrors };
  try {
    await backend(
      `${config.endpoint}${id === null ? "" : `/${id}`}`,
      { method: id === null ? "POST" : "PUT", body: JSON.stringify(body) },
      schoolId,
    );
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(`/schools/${schoolId}`, "layout");
  return {
    success: true,
    message:
      id === null
        ? `${config.title} berhasil ditambahkan.`
        : `Perubahan ${config.singular} disimpan.`,
  };
}

export async function deleteMaster(
  slug: string,
  schoolId: number,
  id: number,
  previous: MasterActionState,
): Promise<MasterActionState> {
  const config = masterConfig(slug);
  if (
    !config ||
    !Number.isSafeInteger(schoolId) ||
    schoolId <= 0 ||
    !Number.isSafeInteger(id) ||
    id <= 0
  )
    return { message: "Data yang dipilih tidak valid." };
  const { canManage } = await getWorkspace(String(schoolId));
  if (!canManage)
    return { message: "Akunmu memiliki akses baca untuk master ini." };
  try {
    await backend(`${config.endpoint}/${id}`, { method: "DELETE" }, schoolId);
  } catch (error) {
    return { message: actionError(error) };
  }
  revalidatePath(`/schools/${schoolId}`, "layout");
  return { success: true, message: `${config.title} berhasil dihapus.` };
}
