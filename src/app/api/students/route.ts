// import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/lib/db";
// import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// // Helper: extract and verify JWT from cookies
// function getUser(req: NextRequest) {
//   const token = req.cookies.get(COOKIE_NAME)?.value;
//   return token ? verifyToken(token) : null;
// }

// // GET /api/students?class=12&section=A  (admin only)
// export async function GET(req: NextRequest) {
//   const user = getUser(req);
//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const classFilter   = searchParams.get("class");
//   const sectionFilter = searchParams.get("section");

//   const db = await getDb();

//   // Dynamically build WHERE clause based on provided filters
//   const conditions: string[] = [];
//   const params: string[]     = [];

//   if (classFilter)   { conditions.push("class = ?");   params.push(classFilter);   }
//   if (sectionFilter) { conditions.push("section = ?"); params.push(sectionFilter); }

//   const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

//   const students = await db.all(
//     `SELECT id, reg_no, name, class, section, address, dob, phone, email, created_at
//      FROM students ${whereClause} ORDER BY name ASC`,
//     params
//   );

//   return NextResponse.json(students);
// }

// // POST /api/students — create a new student record (admin only)
// export async function POST(req: NextRequest) {
//   const user = getUser(req);
//   if (!user || user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const { reg_no, name, class: cls, section, address, dob, phone, email } = await req.json();

//   if (!reg_no || !name || !cls || !section) {
//     return NextResponse.json({ error: "reg_no, name, class, and section are required." }, { status: 400 });
//   }

//   const db = await getDb();

//   try {
//     const result = await db.run(
//       `INSERT INTO students (reg_no, name, class, section, address, dob, phone, email)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [reg_no, name, cls, section, address ?? null, dob ?? null, phone ?? null, email ?? null]
//     );
//     return NextResponse.json({ id: result.lastID, message: "Student created." }, { status: 201 });
//   } catch (e: unknown) {
//     if ((e as NodeJS.ErrnoException).message?.includes("UNIQUE")) {
//       return NextResponse.json({ error: "Registration number already exists." }, { status: 409 });
//     }
//     throw e;
//   }
// }

//new code---------------------------------------------------------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Helper: extract and verify JWT from cookies
function getUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

// GET /api/students?class=12&section=A  (admin only)
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classFilter   = searchParams.get("class");
  const sectionFilter = searchParams.get("section");

  const db = await getDb();

  // Dynamically build WHERE clause based on provided filters
  const conditions: string[] = [];
  const params: string[]     = [];

  if (classFilter)   { conditions.push("s.class = ?");   params.push(classFilter);   }
  if (sectionFilter) { conditions.push("s.section = ?"); params.push(sectionFilter); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // LEFT JOIN users so admin can see each student's login credentials.
  // LEFT JOIN (not INNER) so students without an account still appear.
  const students = await db.all(
    `SELECT s.id, s.reg_no, s.name, s.class, s.section,
            s.address, s.dob, s.phone, s.email, s.created_at,
            u.username, u.password_hash
     FROM students s
     LEFT JOIN users u ON u.student_id = s.id AND u.role = 'student'
     ${whereClause}
     ORDER BY s.name ASC`,
    params
  );

  return NextResponse.json(students);
}

// POST /api/students — create a new student record (admin only)
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { reg_no, name, class: cls, section, address, dob, phone, email } = await req.json();

  if (!reg_no || !name || !cls || !section) {
    return NextResponse.json({ error: "reg_no, name, class, and section are required." }, { status: 400 });
  }

  const db = await getDb();

  try {
    const result = await db.run(
      `INSERT INTO students (reg_no, name, class, section, address, dob, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reg_no, name, cls, section, address ?? null, dob ?? null, phone ?? null, email ?? null]
    );
    return NextResponse.json({ id: result.lastID, message: "Student created." }, { status: 201 });
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Registration number already exists." }, { status: 409 });
    }
    throw e;
  }
}