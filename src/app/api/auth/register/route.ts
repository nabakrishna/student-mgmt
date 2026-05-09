import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username, password, name, regNo } = await req.json();

  if (!username || !password || !name || !regNo) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const db = await getDb();

  // Step 1: Verify the student exists in the pre-populated students table.
  // Both name AND reg_no must match — prevents guessing.
  const student = await db.get<{ id: number }>(
    "SELECT id FROM students WHERE reg_no = ? AND name = ?",
    [regNo, name]
  );

  if (!student) {
    return NextResponse.json(
      { error: "No student found with that Name and Registration Number. Please contact admin." },
      { status: 404 }
    );
  }

  // Step 2: Check if this student already has an account
  const existing = await db.get(
    "SELECT id FROM users WHERE student_id = ?",
    [student.id]
  );
  if (existing) {
    return NextResponse.json(
      { error: "An account already exists for this student." },
      { status: 409 }
    );
  }

  // Step 3: Check if the chosen username is taken
  const takenUsername = await db.get(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );
  if (takenUsername) {
    return NextResponse.json({ error: "Username already taken." }, { status: 409 });
  }

  // Step 4: Hash the password and create the user
  const passwordHash = await bcrypt.hash(password, 10);
  await db.run(
    "INSERT INTO users (username, password_hash, role, student_id) VALUES (?, ?, 'student', ?)",
    [username, passwordHash, student.id]
  );

  return NextResponse.json({ message: "Account created! You can now log in." }, { status: 201 });
}