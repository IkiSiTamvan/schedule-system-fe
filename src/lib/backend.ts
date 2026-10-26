import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { ApiResponse, CurrentUser, School } from "./api-types";

export const SESSION_COOKIE = "academy_session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function backend<T>(
  path: string,
  options: RequestInit = {},
  schoolId?: number,
  anonymous = false,
): Promise<ApiResponse<T>> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!anonymous && !token)
    throw new ApiError(401, "Silakan masuk terlebih dahulu");
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (!anonymous && token) headers.set("Authorization", `Bearer ${token}`);
  if (schoolId !== undefined) headers.set("X-School-ID", String(schoolId));
  let response: Response;
  try {
    const base = (
      process.env.ACADEMY_API_URL ?? "http://127.0.0.1:8081/api"
    ).replace(/\/$/, "");
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ApiError(
      503,
      "Backend belum dapat dihubungi. Pastikan Academy backend dan database sudah berjalan.",
    );
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.response?.success) {
    const message =
      response.status === 401
        ? "Sesi berakhir. Silakan masuk kembali."
        : response.status === 403
          ? "Akunmu tidak memiliki izin untuk tindakan ini."
          : (payload?.response?.message ??
            "Permintaan gagal diproses. Silakan coba lagi.");
    throw new ApiError(response.status, message);
  }
  return payload as ApiResponse<T>;
}

export function actionError(error: unknown) {
  if (error instanceof ApiError && error.status === 401)
    redirect("/login?reason=expired");
  return error instanceof ApiError
    ? error.message
    : "Terjadi kendala. Silakan coba lagi.";
}

export const getCurrentUser = cache(async () => {
  try {
    return (await backend<CurrentUser>("/v1/auth/me")).result;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");
    throw error;
  }
});

export const getSchools = cache(async () => {
  await getCurrentUser();
  try {
    return (await backend<School[]>("/v1/schools")).result;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      redirect("/login?reason=expired");
    throw error;
  }
});
