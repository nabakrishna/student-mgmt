import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Convenience endpoint: students call /api/students/me to get their
// own profile + grades without needing to know their own ID.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user  = token ? verifyToken(token) : null;

  if (!user || user.role !== "student" || !user.studentId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = await getDb();

  const student = await db.get(
    "SELECT id, reg_no, name, class, section, address, dob, phone, email FROM students WHERE id = ?",
    [user.studentId]
  );

  const grades = await db.all(
    `SELECT id, subject, marks, grade, exam_type FROM grades
     WHERE student_id = ? ORDER BY subject ASC`,
    [user.studentId]
  );

  return NextResponse.json({ student, grades });
}