import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-in-production-min-32-chars"
);
const COOKIE = "scribe_session";

export function hashPassword(p: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(p, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(p: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  const actualHex = scryptSync(p, salt, 64).toString("hex");
  const a = Buffer.from(expectedHex, "hex");
  const b = Buffer.from(actualHex, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createSession(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function readSession(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return String(payload.sub);
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  // Next.js 16 requires awaiting cookies() before setting
  import("next/headers").then(({ cookies }) => {
    cookies().then((cookieStore) => {
      cookieStore.set(COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    });
  });
}

export function clearSessionCookie() {
  import("next/headers").then(({ cookies }) => {
    cookies().then((cookieStore) => {
      cookieStore.set(COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
    });
  });
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  is_demo: number;
  is_admin: number;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await readSession();
  if (!userId) return null;
  const { db } = await import("./db");
  const res = await db().execute({
    sql: "SELECT id, name, email, is_demo, is_admin FROM users WHERE id = ?",
    args: [userId],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    is_demo: Number(r.is_demo),
    is_admin: Number(r.is_admin),
  };
}

export async function getUserBusinesses(userId: string) {
  const { db } = await import("./db");
  const res = await db().execute({
    sql: `SELECT b.id, b.name, b.business_type, b.location
          FROM businesses b
          JOIN business_members bm ON bm.business_id = b.id
          WHERE bm.user_id = ?
          ORDER BY b.created_at ASC`,
    args: [userId],
  });
  return res.rows.map(r => ({
    id: String(r.id),
    name: String(r.name),
    business_type: String(r.business_type),
    location: String(r.location),
  }));
}