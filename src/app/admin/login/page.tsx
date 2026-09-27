import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="blueprint-grid grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center border border-steel-600 font-display text-lg font-bold">
            J
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            Admin
          </h1>
          <p className="mt-1 text-sm text-steel-400">Sign in to manage projects</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
