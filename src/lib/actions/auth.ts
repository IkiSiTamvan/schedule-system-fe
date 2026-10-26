"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, backend, SESSION_COOKIE } from "@/lib/backend";
import type { ActionState } from "@/lib/api-types";

export async function loginAction(
  previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password || username.length > 50 || password.length > 200)
    return { message: "Isi username dan password dengan benar." };
  let auth: { accessToken: string; expiresInSeconds: number };
  try {
    auth = (
      await backend<typeof auth>(
        "/v1/auth/login",
        { method: "POST", body: JSON.stringify({ username, password }) },
        undefined,
        true,
      )
    ).result;
  } catch (error) {
    return {
      message:
        error instanceof ApiError && error.status === 401
          ? "Username atau password belum cocok."
          : error instanceof ApiError
            ? error.message
            : "Tidak dapat masuk. Coba lagi.",
    };
  }
  const secure =
    process.env.SESSION_COOKIE_SECURE !== undefined
      ? process.env.SESSION_COOKIE_SECURE === "true"
      : process.env.NODE_ENV === "production";
  (await cookies()).set(SESSION_COOKIE, auth.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: auth.expiresInSeconds,
  });
  redirect("/schools");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
