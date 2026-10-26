import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
} from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action } = await params;
  const route = action.join("/");

  // ─── REGISTER ───
  if (route === "register") {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const normalized = String(email).toLowerCase().trim();
    const existing = await db().execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [normalized],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Unable to create account with those details" }, { status: 400 });
    }
    const userId = uuid();
    await db().execute({
      sql: `INSERT INTO users (id, name, email, password_hash, email_verified_at, is_demo, is_admin, created_at)
            VALUES (?, ?, ?, ?, ?, 0, 0, ?)`,
      args: [userId, String(name).trim(), normalized, hashPassword(password), nowMs(), nowMs()],
    });
    const token = await createSession(userId);
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  }

  // ─── LOGIN ───
  if (route === "login") {
    const { email, password } = await req.json();
    const normalized = String(email || "").toLowerCase().trim();
    const res = await db().execute({
      sql: "SELECT id, password_hash FROM users WHERE email = ?",
      args: [normalized],
    });
    if (res.rows.length === 0 || !verifyPassword(password, String(res.rows[0].password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }
    const userId = String(res.rows[0].id);
    const token = await createSession(userId);
    setSessionCookie(token);
    return NextResponse.json({ ok: true });
  }

  // ─── LOGOUT ───
  if (route === "logout") {
    clearSessionCookie();
    return NextResponse.json({ ok: true });
  }

  // ─── PASSWORD RESET: REQUEST ───
  if (route === "password-reset/request") {
    const { email } = await req.json();
    const normalized = String(email || "").toLowerCase().trim();

    if (normalized) {
      const user = await db().execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [normalized],
      });

      if (user.rows.length > 0) {
        const userId = String(user.rows[0].id);
        const token = uuid();
        const expiresAt = nowMs() + 30 * 60 * 1000; // 30 minutes

        await db().execute({
          sql: "INSERT INTO password_resets (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
          args: [uuid(), userId, token, expiresAt, nowMs()],
        });

        // TODO: Send email with reset link.
        // For the demo, we return the token in the response so it can be tested manually.
        return NextResponse.json({
          ok: true,
          message: "If that email is registered, a reset link has been sent.",
          demo_token: token,
        });
      }
    }

    // Always return 202 with a generic message — never reveal whether the email exists
    return NextResponse.json({
      ok: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  // ─── PASSWORD RESET: CONFIRM ───
  if (route === "password-reset/confirm") {
    const { token, new_password } = await req.json();

    if (!token || !new_password || new_password.length < 8) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const resetRes = await db().execute({
      sql: "SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token = ?",
      args: [token],
    });

    if (resetRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const row = resetRes.rows[0];
    if (row.used_at) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }
    if (Number(row.expires_at) < nowMs()) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
    }

    await db().execute({
      sql: "UPDATE users SET password_hash = ? WHERE id = ?",
      args: [hashPassword(new_password), String(row.user_id)],
    });

    await db().execute({
      sql: "UPDATE password_resets SET used_at = ? WHERE id = ?",
      args: [nowMs(), String(row.id)],
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  const { action } = await params;

  if (action[0] === "me") {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}