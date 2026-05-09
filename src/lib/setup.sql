-- =============================================================
--  Student Management System — Database Setup Script
--  Run with: sqlite3 database.sqlite < setup.sql
-- =============================================================

PRAGMA foreign_keys = ON;

-- ── 1. CREATE TABLES ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS students (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  reg_no      TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  class       TEXT    NOT NULL,
  section     TEXT    NOT NULL,
  address     TEXT,
  dob         TEXT,
  phone       TEXT,
  email       TEXT,
  created_at  TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK(role IN ('student', 'admin')),
  student_id    INTEGER REFERENCES students(id) ON DELETE SET NULL,
  created_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS grades (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject     TEXT    NOT NULL,
  marks       REAL    NOT NULL CHECK(marks >= 0 AND marks <= 100),
  grade       TEXT    NOT NULL,
  exam_type   TEXT    DEFAULT 'Final',
  created_at  TEXT    DEFAULT (datetime('now')),
  UNIQUE(student_id, subject, exam_type)
);

-- ── 2. SEED: SAMPLE STUDENTS ──────────────────────────────────

INSERT OR IGNORE INTO students (reg_no, name, class, section, address, dob, phone, email)
VALUES
  ('2024-CS-001', 'Ananya Sharma', '12', 'A',
   '42 MG Road, Guwahati, Assam', '2006-04-15', '9876543210', 'ananya@example.com'),

  ('2024-CS-002', 'Rohan Das', '12', 'B',
   '7 Zoo Road, Guwahati, Assam', '2006-08-22', '9123456780', 'rohan@example.com');

-- ── 3. SEED: ADMIN ACCOUNT ────────────────────────────────────
-- Password: admin123
-- Hash generated with bcrypt (cost factor 10)

INSERT OR IGNORE INTO users (username, password_hash, role, student_id)
VALUES (
  'admin',
  '$2a$10$Iu2OTbKRpBGSDu5n7A5The3RweJbRCNcWVYvUSDMaCREEzaZJDdbS',
  'admin',
  NULL
);

-- ── 4. SEED: GRADES ───────────────────────────────────────────

-- Ananya Sharma (2024-CS-001)
INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Mathematics',  92, 'A+', 'Final' FROM students s WHERE s.reg_no = '2024-CS-001';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Physics',      85, 'A',  'Final' FROM students s WHERE s.reg_no = '2024-CS-001';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Chemistry',    78, 'B+', 'Final' FROM students s WHERE s.reg_no = '2024-CS-001';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'English',      88, 'A',  'Final' FROM students s WHERE s.reg_no = '2024-CS-001';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Computer Sci', 95, 'A+', 'Final' FROM students s WHERE s.reg_no = '2024-CS-001';

-- Rohan Das (2024-CS-002)
INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Mathematics',  74, 'B',  'Final' FROM students s WHERE s.reg_no = '2024-CS-002';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Physics',      68, 'B-', 'Final' FROM students s WHERE s.reg_no = '2024-CS-002';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Chemistry',    81, 'A-', 'Final' FROM students s WHERE s.reg_no = '2024-CS-002';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'English',      79, 'B+', 'Final' FROM students s WHERE s.reg_no = '2024-CS-002';

INSERT OR IGNORE INTO grades (student_id, subject, marks, grade, exam_type)
SELECT s.id, 'Computer Sci', 88, 'A',  'Final' FROM students s WHERE s.reg_no = '2024-CS-002';

-- ── 5. VERIFY ─────────────────────────────────────────────────

SELECT '--- Students ---';
SELECT id, reg_no, name, class, section FROM students;

SELECT '--- Users ---';
SELECT id, username, role, student_id FROM users;

SELECT '--- Grades ---';
SELECT g.id, s.name, g.subject, g.marks, g.grade, g.exam_type
FROM grades g
JOIN students s ON g.student_id = s.id
ORDER BY s.name, g.subject;