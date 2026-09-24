import { SignJWT, jwtVerify } from "jose";
const key = () => new TextEncoder().encode(process.env.JWT_SECRET!);
export const COOKIE = "admin_session";
export const signSession = () =>
  new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(key());
export async function verifySession(t?: string) {
  if (!t) return false;
  try { await jwtVerify(t, key()); return true; } catch { return false; }
}