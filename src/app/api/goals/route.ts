import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";
import { authorizeBusiness } from "@/lib/guard";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

  // ─── HARDENING CHECK ───
  const { user, error } = await authorizeBusiness(businessId);
  if (error) return error;

  const res = await db().execute({
    sql: "SELECT * FROM goals WHERE business_id = ? ORDER BY created_at DESC",
    args: [businessId],
  });
  const tasksRes = await db().execute({
    sql: "SELECT * FROM tasks WHERE business_id = ? ORDER BY created_at DESC",
    args: [businessId],
  });

  const goals = res.rows.map(g => ({
    ...g,
    target_value: g.target_value != null ? Number(g.target_value) : null,
    current_value: g.current_value != null ? Number(g.current_value) : 0,
    target_date: g.target_date != null ? Number(g.target_date) : null,
    created_at: Number(g.created_at),
    tasks: tasksRes.rows.filter(t => t.goal_id === g.id).map(t => ({ ...t, created_at: Number(t.created_at) })),
  }));

  const unassignedTasks = tasksRes.rows.filter(t => !t.goal_id).map(t => ({ ...t, created_at: Number(t.created_at) }));

  return NextResponse.json({ goals, unassignedTasks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, business_id } = body;

    // ─── HARDENING CHECK ───
    const { user, error } = await authorizeBusiness(business_id);
    if (error) return error;

    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    // Verify the business actually exists before mutating
    const bizCheck = await db().execute({
      sql: "SELECT 1 FROM businesses WHERE id = ?",
      args: [business_id],
    });
    if (bizCheck.rows.length === 0) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (action === "create_goal") {
      const id = uuid();
      await db().execute({
        sql: "INSERT INTO goals (id, business_id, title, description, target_value, current_value, target_date, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
        args: [id, business_id, body.title, body.description || null, body.target_value || null, body.target_date || null, nowMs()],
      });
      return NextResponse.json({ ok: true, id });
    }

    if (action === "update_progress") {
      await db().execute({
        sql: "UPDATE goals SET current_value = ? WHERE id = ? AND business_id = ?",
        args: [body.current_value, body.id, business_id],
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "complete_task") {
      await db().execute({
        sql: "UPDATE tasks SET status = 'completed' WHERE id = ? AND business_id = ?",
        args: [body.task_id, business_id],
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete_task") {
      if (!body.task_id) return NextResponse.json({ error: "task_id required" }, { status: 400 });
      const result = await db().execute({
        sql: "DELETE FROM tasks WHERE id = ? AND business_id = ?",
        args: [body.task_id, business_id],
      });
      return NextResponse.json({ ok: true, deleted: result.rowsAffected });
    }

    if (action === "clear_completed") {
      const result = await db().execute({
        sql: "DELETE FROM tasks WHERE business_id = ? AND status = 'completed'",
        args: [business_id],
      });
      return NextResponse.json({ ok: true, deleted: result.rowsAffected });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[goals POST] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}