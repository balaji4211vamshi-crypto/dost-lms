import client from "./client";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function isAdmin() {
  const user = getStoredUser();
  return !!user && user.role === "admin";
}

function persistSession(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function login(email, password) {
  const { data } = await client.post("/login", { email, password });
  return persistSession(data);
}

export async function register(payload) {
  const { data } = await client.post("/register", payload);
  return persistSession(data);
}

export async function logout() {
  try {
    await client.post("/logout");
  } catch {
    // ignore — we're clearing local session regardless
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function fetchMe() {
  const { data } = await client.get("/me");
  localStorage.setItem("user", JSON.stringify(data));
  return data;
}

export async function updateProfile(payload) {
  const { data } = await client.put("/me", payload);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function changePassword(payload) {
  const { data } = await client.put("/me/password", payload);
  return data;
}

export async function forgotPassword(email) {
  const { data } = await client.post("/forgot-password", { email });
  return data;
}

export async function resetPassword(payload) {
  const { data } = await client.post("/reset-password", payload);
  return data;
}
