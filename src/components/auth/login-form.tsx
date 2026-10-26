"use client";

import { useActionState, useState } from "react";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/primitives";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [state, action, pending] = useActionState(loginAction, { message: "" });
  return (
    <form action={action} className="auth-form">
      <label htmlFor="username">
        Username
        <span className="auth-input">
          <UserRound size={17} />
          <input
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Username akunmu"
            required
            maxLength={50}
            autoFocus
          />
        </span>
      </label>
      <label htmlFor="password">
        Password
        <span className="auth-input">
          <LockKeyhole size={17} />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            required
            maxLength={200}
          />
        </span>
      </label>
      {state.message && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Sedang masuk…" : "Masuk ke ruang kerja"}
        <ArrowRight size={17} />
      </Button>
    </form>
  );
}
