"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await login(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  redirect(from && from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}
