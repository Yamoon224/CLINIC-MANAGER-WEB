import { apiFetch } from "@/lib/api-client";
import type { LoginCredentials, LoginResponse, User } from "./types";

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/logout", { method: "POST" });
}

export function fetchCurrentUser(): Promise<User> {
  return apiFetch<User>("/me");
}
