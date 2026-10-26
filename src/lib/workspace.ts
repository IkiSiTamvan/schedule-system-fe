import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser, getSchools } from "./backend";
import { canManageYears } from "./api-types";

export const getWorkspace = cache(async (value: string) => {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) notFound();
  const [user, schools] = await Promise.all([getCurrentUser(), getSchools()]);
  const school = schools.find((item) => item.id === id);
  if (!school) notFound();
  return { user, school, canManage: canManageYears(user, id) };
});
