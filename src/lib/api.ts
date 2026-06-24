import type { SiteContent } from "./types";

const TOKEN_KEY = "loft_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...init, headers });
  if (res.status === 401) {
    clearToken();
    throw new ApiError("Não autorizado", 401);
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(data.error ?? `Erro ${res.status}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// ----- Público -----
export function getContent() {
  return request<SiteContent>("/content");
}

// ----- Admin -----
export async function login(password: string): Promise<void> {
  const { token } = await request<{ token: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  setToken(token);
}

export function verifySession() {
  return request<{ ok: boolean }>("/admin/me");
}

export async function uploadImage(blob: Blob, ext: string): Promise<{ url: string; key: string }> {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", blob.type || "application/octet-stream");

  const res = await fetch(`/api/admin/upload?ext=${encodeURIComponent(ext)}`, {
    method: "POST",
    headers,
    body: blob,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(data.error ?? `Erro ${res.status}`, res.status);
  }
  return (await res.json()) as { url: string; key: string };
}

export function saveSetting(key: string, value: unknown) {
  return request(`/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export type TableName =
  | "rooms"
  | "highlights"
  | "amenities"
  | "testimonials"
  | "gallery"
  | "experiences"
  | "promotions"
  | "packages"
  | "posts";

export function listItems<T>(table: TableName) {
  return request<T[]>(`/admin/${table}`);
}
export function createItem(table: TableName, data: Record<string, unknown>) {
  return request<{ id: number }>(`/admin/${table}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function updateItem(table: TableName, id: number, data: Record<string, unknown>) {
  return request(`/admin/${table}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export function deleteItem(table: TableName, id: number) {
  return request(`/admin/${table}/${id}`, { method: "DELETE" });
}
export function reorderItems(table: TableName, ids: number[]) {
  return request(`/admin/${table}/reorder`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}
