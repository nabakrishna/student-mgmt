// import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/lib/db";
// import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// function getUser(req: NextRequest) {
//   const token = req.cookies.get(COOKIE_NAME)?.value;
//   return token ? verifyToken(token) : null;
// }

// // GET /api/grades/:studentId — fetch grades with a JOIN
// export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
//   const user = getUser(req);
//   if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

//   const studentId = Number(params.studentId);

//   if (user.role === "student" && user.studentId !== studentId) {
//     return NextResponse.json({ error: "Forbidden." }, { status: 403 });
//   }

//   const db = await getDb();

//   // JOIN to enrich grades with student name and reg_no
//   const grades = await db.all(
//     `SELECT g.id, g.subject, g.marks, g.grade, g.exam_type,
//             s.name AS student_name, s.reg_no
//      FROM grades g
//      JOIN students s ON g.student_id = s.id
//      WHERE g.student_id = ?
//      ORDER BY g.subject ASC`,
//     [studentId]
//   );

//   return NextResponse.json(grades);
// }

// // PUT /api/grades/:studentId — update a specific grade (admin only)
// export async function PUT(req: NextRequest, { params }: { params: { studentId: string } }) {
//   const user = getUser(req);
//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const { gradeId, subject, marks, grade, exam_type } = await req.json();
//   const db = await getDb();

//   await db.run(
//     `UPDATE grades SET subject = ?, marks = ?, grade = ?, exam_type = ?
//      WHERE id = ? AND student_id = ?`,
//     [subject, marks, grade, exam_type, gradeId, Number(params.studentId)]
//   );

//   return NextResponse.json({ message: "Grade updated." });
// }

//new----------------------------------------------------------------------------------------------------------------------------------
// import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/lib/db";
// import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// function getUser(req: NextRequest) {
//   const token = req.cookies.get(COOKIE_NAME)?.value;
//   return token ? verifyToken(token) : null;
// }

// // GET /api/grades/:studentId — fetch grades with a JOIN
// export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
//   const user = getUser(req);
//   if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

//   const { studentId: rawId } = await params;
//   const studentId = Number(rawId);

//   if (isNaN(studentId)) {
//     return NextResponse.json({ error: "Invalid student ID." }, { status: 400 });
//   }

//   if (user.role === "student" && user.studentId !== studentId) {
//     return NextResponse.json({ error: "Forbidden." }, { status: 403 });
//   }

//   const db = await getDb();

//   const grades = await db.all(
//     `SELECT g.id, g.subject, g.marks, g.grade, g.exam_type,
//             s.name AS student_name, s.reg_no
//      FROM grades g
//      JOIN students s ON g.student_id = s.id
//      WHERE g.student_id = ?
//      ORDER BY g.subject ASC`,
//     [studentId]
//   );

//   return NextResponse.json(grades);
// }

// // PUT /api/grades/:studentId — update a specific grade (admin only)
// export async function PUT(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
//   const user = getUser(req);
//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const { studentId: rawId } = await params;
//   const studentId = Number(rawId);

//   const { gradeId, subject, marks, grade, exam_type } = await req.json();
//   const db = await getDb();

//   await db.run(
//     `UPDATE grades SET subject = ?, marks = ?, grade = ?, exam_type = ?
//      WHERE id = ? AND student_id = ?`,
//     [subject, marks, grade, exam_type, gradeId, studentId]
//   );

//   return NextResponse.json({ message: "Grade updated." });
// }





//new code--------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

function getUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

// GET /api/grades/:studentId — fetch grades with a JOIN
export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { studentId: rawId } = await params;
  const studentId = Number(rawId);

  if (isNaN(studentId)) {
    return NextResponse.json({ error: "Invalid student ID." }, { status: 400 });
  }

  if (user.role === "student" && user.studentId !== studentId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const db = await getDb();

  const grades = await db.all(
    `SELECT g.id, g.subject, g.marks, g.grade, g.exam_type,
            s.name AS student_name, s.reg_no
     FROM grades g
     JOIN students s ON g.student_id = s.id
     WHERE g.student_id = ?
     ORDER BY g.subject ASC`,
    [studentId]
  );

  return NextResponse.json(grades);
}

// PUT /api/grades/:studentId — update a specific grade (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { studentId: rawId } = await params;
  const studentId = Number(rawId);

  const { gradeId, subject, marks, grade, exam_type } = await req.json();

  if (!gradeId || !subject || marks == null || !grade) {
    return NextResponse.json({ error: "gradeId, subject, marks, and grade are required." }, { status: 400 });
  }

  const db = await getDb();

  // Check for duplicate subject+exam_type for this student (excluding the row being edited)
  const conflict = await db.get(
    `SELECT id FROM grades
     WHERE student_id = ? AND LOWER(subject) = LOWER(?) AND exam_type = ? AND id != ?`,
    [studentId, subject.trim(), exam_type, gradeId]
  );
  if (conflict) {
    return NextResponse.json(
      { error: `A grade for "${subject}" (${exam_type}) already exists for this student.` },
      { status: 409 }
    );
  }

  await db.run(
    `UPDATE grades SET subject = ?, marks = ?, grade = ?, exam_type = ?
     WHERE id = ? AND student_id = ?`,
    [subject.trim(), marks, grade, exam_type, gradeId, studentId]
  );

  return NextResponse.json({ message: "Grade updated." });
}

// DELETE /api/grades/:studentId — delete a specific grade row (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { studentId: rawId } = await params;
  const studentId = Number(rawId);

  const { gradeId } = await req.json();

  if (!gradeId) {
    return NextResponse.json({ error: "gradeId is required." }, { status: 400 });
  }

  const db = await getDb();

  const result = await db.run(
    "DELETE FROM grades WHERE id = ? AND student_id = ?",
    [gradeId, studentId]
  );

  if (result.changes === 0) {
    return NextResponse.json({ error: "Grade not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Grade deleted." });
}