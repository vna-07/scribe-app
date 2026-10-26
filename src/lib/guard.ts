import { db } from "./db";
import { getCurrentUser } from "./auth";
import { NextResponse } from "next/server";

export async function authorizeBusiness(businessId: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Check if the user is a member of this business
  const access = await db().execute({
    sql: "SELECT 1 FROM business_members WHERE user_id = ? AND business_id = ?",
    args: [user.id, businessId],
  });

  if (access.rows.length === 0) {
    // Return 404 instead of 403 to prevent attackers from enumerating valid business IDs
    return { error: NextResponse.json({ error: "Business not found" }, { status: 404 }) };
  }

  return { user };
}