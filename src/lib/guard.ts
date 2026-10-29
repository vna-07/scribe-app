import { NextResponse } from "next/server";
import { db } from "./db";
import { getCurrentUser } from "./auth";

export async function authorizeBusiness(businessId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const access = await db().execute({
      sql: "SELECT 1 FROM business_members WHERE user_id = ? AND business_id = ?",
      args: [user.id, businessId],
    });

    if (access.rows.length === 0) {
      // Deliberately 404, not 403 — prevents enumeration of valid business IDs.
      return {
        error: NextResponse.json({ error: "Business not found" }, { status: 404 }),
      };
    }

    return { user };
  } catch (err) {
    console.error("[authorizeBusiness] failed:", err);
    return {
      error: NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
    };
  }
}