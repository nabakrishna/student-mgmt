import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken, buildCookieHeader, JWTPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const db = await getDb();

  // Raw SQL: fetch user by username
  const user = await db.get<{
    id: number; username: string; password_hash: string;
    role: "student" | "admin"; student_id: number | null;
  }>(
    "SELECT id, username, password_hash, role, student_id FROM users WHERE username = ?",
    [username]
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // Compare submitted password against stored bcrypt hash
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    studentId: user.student_id,
  };

  const token = signToken(payload);

  const res = NextResponse.json({ role: user.role });
  res.headers.set("Set-Cookie", buildCookieHeader(token));
  return res;
}