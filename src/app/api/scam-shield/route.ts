import { NextRequest, NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/scam-shield";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: "message too long (max 4000 chars)" }, { status: 400 });
    }
    const assessment = analyzeMessage(message);
    return NextResponse.json(assessment);
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}