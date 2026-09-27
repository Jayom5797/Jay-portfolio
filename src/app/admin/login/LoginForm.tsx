"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="from" value={from} />

      <div>
        <label className="tech-label mb-2 block" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full border border-steel-700 bg-ink-900 px-3 py-2.5 text-sm text-paper focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="tech-label mb-2 block" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full border border-steel-700 bg-ink-900 px-3 py-2.5 text-sm text-paper focus:border-accent focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
