// import path from "path";
// import { open } from "sqlite";
// import sqlite3 from "sqlite3";
// import bcrypt from "bcryptjs";

// async function setup() {
//   const db = await open({
//     filename: path.join(process.cwd(), "database.sqlite"),
//     driver: sqlite3.Database,
//   });

//   await db.run("PRAGMA foreign_keys = ON");

//   // ── 1. CREATE TABLES ──────────────────────────────────────────────

//   // Students table: the "source of truth" for enrolled students.
//   // Admins pre-populate this before students can register.
//   await db.run(`
//     CREATE TABLE IF NOT EXISTS students (
//       id              INTEGER PRIMARY KEY AUTOINCREMENT,
//       reg_no          TEXT    NOT NULL UNIQUE,         -- e.g. "2024-CS-001"
//       name            TEXT    NOT NULL,
//       class           TEXT    NOT NULL,                -- e.g. "10", "12"
//       section         TEXT    NOT NULL,                -- e.g. "A", "B"
//       address         TEXT,
//       dob             TEXT,                            -- stored as "YYYY-MM-DD"
//       phone           TEXT,
//       email           TEXT,
//       created_at      TEXT    DEFAULT (datetime('now'))
//     )
//   `);

//   // Users table: authentication accounts linked to students (or admins).
//   await db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//       id              INTEGER PRIMARY KEY AUTOINCREMENT,
//       username        TEXT    NOT NULL UNIQUE,
//       password_hash   TEXT    NOT NULL,
//       role            TEXT    NOT NULL CHECK(role IN ('student','admin')),
//       -- NULL for admin accounts; points to students.id for student accounts
//       student_id      INTEGER REFERENCES students(id) ON DELETE SET NULL,
//       created_at      TEXT    DEFAULT (datetime('now'))
//     )
//   `);

//   // Grades table: academic results per student per subject.
//   await db.run(`
//     CREATE TABLE IF NOT EXISTS grades (
//       id              INTEGER PRIMARY KEY AUTOINCREMENT,
//       student_id      INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
//       subject         TEXT    NOT NULL,
//       marks           REAL    NOT NULL CHECK(marks >= 0 AND marks <= 100),
//       grade           TEXT    NOT NULL,                -- e.g. "A+", "B", "C"
//       exam_type       TEXT    DEFAULT 'Final',         -- "Midterm", "Final", etc.
//       created_at      TEXT    DEFAULT (datetime('now'))
//     )
//   `);

//   // ── 2. SEED DATA ──────────────────────────────────────────────────

//   // Check if already seeded to keep the script idempotent
//   const existing = await db.get("SELECT id FROM users WHERE username = 'admin'");
//   if (existing) {
//     console.log("✅ Database already seeded. Skipping.");
//     await db.close();
//     return;
//   }

//   // --- Seed: 2 sample students ---
//   await db.run(`
//     INSERT INTO students (reg_no, name, class, section, address, dob, phone, email)
//     VALUES ('2024-CS-001', 'Ananya Sharma', '12', 'A',
//             '42 MG Road, Guwahati, Assam', '2006-04-15', '9876543210', 'ananya@example.com')
//   `);
//   await db.run(`
//     INSERT INTO students (reg_no, name, class, section, address, dob, phone, email)
//     VALUES ('2024-CS-002', 'Rohan Das', '12', 'B',
//             '7 Zoo Road, Guwahati, Assam', '2006-08-22', '9123456780', 'rohan@example.com')
//   `);

//   // --- Seed: admin account (password: "admin123") ---
//   const adminHash = await bcrypt.hash("admin123", 10);
//   await db.run(`
//     INSERT INTO users (username, password_hash, role, student_id)
//     VALUES ('admin', ?, 'admin', NULL)
//   `, [adminHash]);

//   // --- Seed: grades for both students ---
//   // Get student IDs dynamically (never hard-code IDs)
//   const ananya = await db.get("SELECT id FROM students WHERE reg_no = '2024-CS-001'");
//   const rohan  = await db.get("SELECT id FROM students WHERE reg_no = '2024-CS-002'");

//   const ananyaGrades = [
//     { subject: "Mathematics",  marks: 92, grade: "A+" },
//     { subject: "Physics",      marks: 85, grade: "A"  },
//     { subject: "Chemistry",    marks: 78, grade: "B+" },
//     { subject: "English",      marks: 88, grade: "A"  },
//     { subject: "Computer Sci", marks: 95, grade: "A+" },
//   ];
//   for (const g of ananyaGrades) {
//     await db.run(
//       "INSERT INTO grades (student_id, subject, marks, grade) VALUES (?, ?, ?, ?)",
//       [ananya.id, g.subject, g.marks, g.grade]
//     );
//   }

//   const rohanGrades = [
//     { subject: "Mathematics",  marks: 74, grade: "B"  },
//     { subject: "Physics",      marks: 68, grade: "B-" },
//     { subject: "Chemistry",    marks: 81, grade: "A-" },
//     { subject: "English",      marks: 79, grade: "B+" },
//     { subject: "Computer Sci", marks: 88, grade: "A"  },
//   ];
//   for (const g of rohanGrades) {
//     await db.run(
//       "INSERT INTO grades (student_id, subject, marks, grade) VALUES (?, ?, ?, ?)",
//       [rohan.id, g.subject, g.marks, g.grade]
//     );
//   }

//   console.log("✅ Database initialized and seeded successfully!");
//   console.log("   Admin credentials  → username: admin   | password: admin123");
//   console.log("   Sample students    → Ananya Sharma (2024-CS-001), Rohan Das (2024-CS-002)");
//   await db.close();
// }

// setup().catch(console.error);



//new code----------------------------------------------------------------------------------------------------------------------------
import path from "path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

async function setup() {
  const db = await open({
    filename: path.join(process.cwd(), "database.sqlite"),
    driver: sqlite3.Database,
  });

  await db.run("PRAGMA foreign_keys = ON");

  // ── 1. CREATE TABLES ──────────────────────────────────────────────

  // Students table: the "source of truth" for enrolled students.
  // Admins pre-populate this before students can register.
  await db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      reg_no          TEXT    NOT NULL UNIQUE,         -- e.g. "2024-CS-001"
      name            TEXT    NOT NULL,
      class           TEXT    NOT NULL,                -- e.g. "10", "12"
      section         TEXT    NOT NULL,                -- e.g. "A", "B"
      address         TEXT,
      dob             TEXT,                            -- stored as "YYYY-MM-DD"
      phone           TEXT,
      email           TEXT,
      created_at      TEXT    DEFAULT (datetime('now'))
    )
  `);

  // Users table: authentication accounts linked to students (or admins).
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT    NOT NULL UNIQUE,
      password_hash   TEXT    NOT NULL,
      role            TEXT    NOT NULL CHECK(role IN ('student','admin')),
      -- NULL for admin accounts; points to students.id for student accounts
      student_id      INTEGER REFERENCES students(id) ON DELETE SET NULL,
      created_at      TEXT    DEFAULT (datetime('now'))
    )
  `);

  // Grades table: academic results per student per subject.
  // UNIQUE(student_id, subject, exam_type) prevents duplicate entries
  // for the same subject+exam combination — enforced at the DB level.
  await db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id      INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      subject         TEXT    NOT NULL,
      marks           REAL    NOT NULL CHECK(marks >= 0 AND marks <= 100),
      grade           TEXT    NOT NULL,                -- e.g. "A+", "B", "C"
      exam_type       TEXT    DEFAULT 'Final',         -- "Midterm", "Final", etc.
      created_at      TEXT    DEFAULT (datetime('now')),
      UNIQUE(student_id, subject, exam_type)           -- ← bug fix: no duplicate subject+exam per student
    )
  `);

  // ── 2. SEED DATA ──────────────────────────────────────────────────

  // Check if already seeded to keep the script idempotent
  const existing = await db.get("SELECT id FROM users WHERE username = 'admin'");
  if (existing) {
    console.log("✅ Database already seeded. Skipping.");
    await db.close();
    return;
  }

  // --- Seed: 2 sample students ---
  await db.run(`
    INSERT INTO students (reg_no, name, class, section, address, dob, phone, email)
    VALUES ('2024-CS-001', 'Ananya Sharma', '12', 'A',
            '42 MG Road, Guwahati, Assam', '2006-04-15', '9876543210', 'ananya@example.com')
  `);
  await db.run(`
    INSERT INTO students (reg_no, name, class, section, address, dob, phone, email)
    VALUES ('2024-CS-002', 'Rohan Das', '12', 'B',
            '7 Zoo Road, Guwahati, Assam', '2006-08-22', '9123456780', 'rohan@example.com')
  `);

  // --- Seed: admin account (password: "admin123") ---
  const adminHash = await bcrypt.hash("admin123", 10);
  await db.run(`
    INSERT INTO users (username, password_hash, role, student_id)
    VALUES ('admin', ?, 'admin', NULL)
  `, [adminHash]);

  // --- Seed: grades for both students ---
  // Get student IDs dynamically (never hard-code IDs)
  const ananya = await db.get("SELECT id FROM students WHERE reg_no = '2024-CS-001'");
  const rohan  = await db.get("SELECT id FROM students WHERE reg_no = '2024-CS-002'");

  const ananyaGrades = [
    { subject: "Mathematics",  marks: 92, grade: "A+" },
    { subject: "Physics",      marks: 85, grade: "A"  },
    { subject: "Chemistry",    marks: 78, grade: "B+" },
    { subject: "English",      marks: 88, grade: "A"  },
    { subject: "Computer Sci", marks: 95, grade: "A+" },
  ];
  for (const g of ananyaGrades) {
    await db.run(
      "INSERT INTO grades (student_id, subject, marks, grade) VALUES (?, ?, ?, ?)",
      [ananya.id, g.subject, g.marks, g.grade]
    );
  }

  const rohanGrades = [
    { subject: "Mathematics",  marks: 74, grade: "B"  },
    { subject: "Physics",      marks: 68, grade: "B-" },
    { subject: "Chemistry",    marks: 81, grade: "A-" },
    { subject: "English",      marks: 79, grade: "B+" },
    { subject: "Computer Sci", marks: 88, grade: "A"  },
  ];
  for (const g of rohanGrades) {
    await db.run(
      "INSERT INTO grades (student_id, subject, marks, grade) VALUES (?, ?, ?, ?)",
      [rohan.id, g.subject, g.marks, g.grade]
    );
  }

  console.log("✅ Database initialized and seeded successfully!");
  console.log("   Admin credentials  → username: admin   | password: admin123");
  console.log("   Sample students    → Ananya Sharma (2024-CS-001), Rohan Das (2024-CS-002)");
  await db.close();
}

setup().catch(console.error);