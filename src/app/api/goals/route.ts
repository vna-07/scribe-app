import { NextRequest, NextResponse } from "next/server";
import { db, nowMs, uuid } from "@/lib/db";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("business_id");
  if (!businessId) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

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
    target_value: Number(g.target_value),
    current_value: Number(g.current_value),
    target_date: Number(g.target_date),
    created_at: Number(g.created_at),
    tasks: tasksRes.rows.filter(t => t.goal_id === g.id).map(t => ({ ...t, created_at: Number(t.created_at) }))
  }));

  const unassignedTasks = tasksRes.rows.filter(t => !t.goal_id).map(t => ({ ...t, created_at: Number(t.created_at) }));

  return NextResponse.json({ goals, unassignedTasks });
}

export async function POST(req: NextRequest) {
  try {
    const { action, business_id, ...body } = await req.json();
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 });

    if (action === "create_goal") {
      const id = uuid();
      await db().execute({
        sql: "INSERT INTO goals (id, business_id, title, description, target_value, current_value, target_date, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)",
        args: [id, business_id, body.title, body.description, body.target_value || null, body.target_date || null, nowMs()],
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
      await db().execute({
        sql: "DELETE FROM tasks WHERE id = ? AND business_id = ?",
        args: [body.task_id, business_id],
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}