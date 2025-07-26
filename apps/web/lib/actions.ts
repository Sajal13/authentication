import { authFetch } from "./authFetch";
import { BACKEND_URL } from "./constants";

export async function getProfile() {
  const response = await authFetch(`${BACKEND_URL}/auth/protected`)
  const result = await response.json();
  return result;
}