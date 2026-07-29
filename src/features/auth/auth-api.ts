import { apiFetch } from "@/lib/api-client";
import type {
  ChangePasswordPayload,
  LoginCredentials,
  LoginResponse,
  UpdateProfilePayload,
  User,
} from "./types";

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/logout", { method: "POST" });
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiFetch<{ data: User }>("/me");

  return data;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  const { data } = await apiFetch<{ data: User }>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return data;
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return apiFetch<void>("/me/password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
