// import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/lib/db";
// import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// function getUser(req: NextRequest) {
//   const token = req.cookies.get(COOKIE_NAME)?.value;
//   return token ? verifyToken(token) : null;
// }

// // GET /api/students/:id
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   const user = getUser(req);
//   if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

//   const studentId = Number(params.id);

//   // Students can only fetch their own profile
//   if (user.role === "student" && user.studentId !== studentId) {
//     return NextResponse.json({ error: "Forbidden." }, { status: 403 });
//   }

//   const db = await getDb();
//   const student = await db.get(
//     "SELECT id, reg_no, name, class, section, address, dob, phone, email FROM students WHERE id = ?",
//     [studentId]
//   );

//   if (!student) return NextResponse.json({ error: "Not found." }, { status: 404 });
//   return NextResponse.json(student);
// }

// // PUT /api/students/:id  (admin only)
// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   const user = getUser(req);
//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const { name, class: cls, section, address, dob, phone, email } = await req.json();
//   const db = await getDb();

//   await db.run(
//     `UPDATE students
//      SET name = ?, class = ?, section = ?, address = ?, dob = ?, phone = ?, email = ?
//      WHERE id = ?`,
//     [name, cls, section, address, dob, phone, email, Number(params.id)]
//   );

//   return NextResponse.json({ message: "Student updated." });
// }

// // DELETE /api/students/:id  (admin only)
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   const user = getUser(req);
//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const db = await getDb();
//   // CASCADE in the schema handles deleting grades automatically
//   await db.run("DELETE FROM students WHERE id = ?", [Number(params.id)]);
//   return NextResponse.json({ message: "Student deleted." });
// }

//new code ---------------------------------------------------------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

function getUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

// GET /api/students/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const studentId = Number(id);

  if (user.role === "student" && user.studentId !== studentId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const db = await getDb();
  const student = await db.get(
    "SELECT id, reg_no, name, class, section, address, dob, phone, email FROM students WHERE id = ?",
    [studentId]
  );

  if (!student) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(student);
}

// PUT /api/students/:id  (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const { name, class: cls, section, address, dob, phone, email } = await req.json();
  const db = await getDb();

  await db.run(
    `UPDATE students
     SET name = ?, class = ?, section = ?, address = ?, dob = ?, phone = ?, email = ?
     WHERE id = ?`,
    [name, cls, section, address, dob, phone, email, Number(id)]
  );

  return NextResponse.json({ message: "Student updated." });
}

// DELETE /api/students/:id  (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const db = await getDb();
  await db.run("DELETE FROM students WHERE id = ?", [Number(id)]);
  return NextResponse.json({ message: "Student deleted." });
}