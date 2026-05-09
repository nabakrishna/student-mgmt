import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user  = token ? verifyToken(token) : null;

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { student_id, subject, marks, grade, exam_type } = await req.json();

  if (!student_id || !subject || marks == null || !grade) {
    return NextResponse.json({ error: "student_id, subject, marks, and grade are required." }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.run(
    "INSERT INTO grades (student_id, subject, marks, grade, exam_type) VALUES (?, ?, ?, ?, ?)",
    [student_id, subject, marks, grade, exam_type ?? "Final"]
  );

  return NextResponse.json({ id: result.lastID, message: "Grade added." }, { status: 201 });
}

