import axios from "axios";

// Points at the Laravel backend started via `php artisan serve`
// (see dost-lms-backend/README.md / setup-and-run.command). Relative by
// default so requests stay same-origin with the React dev server, which
// proxies them to the backend itself (see the "proxy" field in
// package.json) — this avoids the browser ever making a cross-origin
// call from :3000 to :8000 directly.
export const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Pull the first validation/message error out of an Axios error for display. */
export function apiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (data.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first)) return first[0];
  }
  return data.message || fallback;
}

export default client;
