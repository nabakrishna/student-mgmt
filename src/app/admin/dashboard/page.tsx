// the  third once

//new code 3----------------------------------------------------------------------------------------------------------------------------
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: number;
  reg_no: string;
  name: string;
  class: string;
  section: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  username: string | null;
  password_hash: string | null;
}

interface Grade {
  id: number;
  subject: string;
  marks: number;
  grade: string;
  exam_type: string;
}

type Tab = "students" | "addStudent" | "grades";

function getField(s: Student, field: keyof Student): string {
  const val = s[field];
  return val == null ? "" : String(val);
}

export default function AdminDashboard() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const [sForm, setSForm] = useState({
    reg_no: "", name: "", class: "", section: "",
    address: "", dob: "", phone: "", email: "",
  });

  const [gForm, setGForm] = useState({
    student_id: "", subject: "", marks: "", grade: "", exam_type: "Final",
  });

  // ── Fetch students ─────────────────────────────────────────────────
  // We use a ref to track whether this is the initial mount so we can
  // run fetchStudents once on load without triggering the ESLint
  // "setState synchronously within an effect" warning.
  const hasMounted = useRef(false);

  const fetchStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterClass) params.append("class", filterClass);
    if (filterSection) params.append("section", filterSection);
    const res = await fetch(`/api/students?${params}`);
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    // setState is called inside an async callback, not synchronously in the
    // effect body — this is the correct pattern and avoids the ESLint error.
    setStudents(data);
  }, [filterClass, filterSection, router]);

  // Run once on mount only. Filter-based re-fetching is triggered explicitly
  // by the "Filter" button, keeping setState out of the synchronous effect body.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchStudents();
    }
  }, [fetchStudents]);

  // ── Fetch grades ───────────────────────────────────────────────────
  const loadGrades = useCallback(async (studentId: number) => {
    const res = await fetch(`/api/grades/${studentId}`);
    const data = await res.json();
    // setState inside async callback — correct pattern, no cascading render issue.
    setGrades(Array.isArray(data) ? data : []);
  }, []);

  // Run whenever selected student changes. The setState calls here are inside
  // an async callback (loadGrades) or an early-return guard, never synchronously
  // in the effect body — so there is no cascading-render problem.
  // useEffect(() => {
  //   if (!selected) return;//{
  //   //   setGrades([]);   // ← this early setGrades is fine: it's a guard, not async
  //   //   return;
  //   // }
  //   loadGrades(selected.id);
  // }, [selected, loadGrades]);
  useEffect(() => {
    if (!selected) return;
    (async () => {
      const res = await fetch(`/api/grades/${selected.id}`);
      const data = await res.json();
      setGrades(Array.isArray(data) ? data : []);
    })();
  }, [selected]);

  // ── Handlers ───────────────────────────────────────────────────────
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const selectStudent = (s: Student) => {
    setEditingGrade(null);
    setSelected(s);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sForm),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Student added successfully!");
    setSForm({ reg_no: "", name: "", class: "", section: "", address: "", dob: "", phone: "", email: "" });
    fetchStudents();
  };

  const handleUpdateStudent = async () => {
    if (!selected) return;
    setError(""); setSuccess("");
    const res = await fetch(`/api/students/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Student updated!");
    fetchStudents();
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Delete this student and all their grades?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    setSelected(null);
    fetchStudents();
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!selected) return;
    if (!confirm("Delete this grade entry?")) return;
    setError(""); setSuccess("");

    const res = await fetch(`/api/grades/${selected.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gradeId }),
    });

    // Safely parse — body may be empty on some responses
    let data: { error?: string; message?: string } = {};
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { /* ignore malformed */ }
    }

    if (!res.ok) {
      setError(data.error ?? "Failed to delete grade.");
      return;
    }

    setSuccess(data.message ?? "Grade deleted.");
    setEditingGrade(null);
    loadGrades(selected.id);
  };


  // BUG FIX: validate that the edited subject+exam_type combination doesn't
  // already exist in another grade row before hitting the API.
  const handleUpdateGrade = async () => {
    if (!editingGrade || !selected) return;
    setError(""); setSuccess("");

    // Duplicate check: is there another grade (different id) with the same
    // subject + exam_type for this student?
    const duplicate = grades.find(
      (g) =>
        g.id !== editingGrade.id &&
        g.subject.trim().toLowerCase() === editingGrade.subject.trim().toLowerCase() &&
        g.exam_type === editingGrade.exam_type
    );
    if (duplicate) {
      setError(
        `A grade for "${editingGrade.subject}" (${editingGrade.exam_type}) already exists for this student. ` +
        `Please edit that row instead, or choose a different subject/exam type.`
      );
      return;
    }

    const res = await fetch(`/api/grades/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gradeId: editingGrade.id,
        subject: editingGrade.subject.trim(),
        marks: Number(editingGrade.marks),
        grade: editingGrade.grade,
        exam_type: editingGrade.exam_type,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Grade updated!");
    setEditingGrade(null);
    loadGrades(selected.id);
  };

  // BUG FIX: validate that the new subject+exam_type doesn't duplicate an
  // existing entry for the selected student before posting to the API.
  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    // Client-side duplicate guard
    const targetStudentId = Number(gForm.student_id);
    if (selected && selected.id === targetStudentId) {
      const duplicate = grades.find(
        (g) =>
          g.subject.trim().toLowerCase() === gForm.subject.trim().toLowerCase() &&
          g.exam_type === gForm.exam_type
      );
      if (duplicate) {
        setError(
          `A grade for "${gForm.subject}" (${gForm.exam_type}) already exists for this student. ` +
          `Use the Edit button in the student panel to update it.`
        );
        return;
      }
    }

    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...gForm, marks: Number(gForm.marks) }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Surface DB-level UNIQUE constraint violation with a friendly message
      setError(
        res.status === 409
          ? `A grade for this subject and exam type already exists for the selected student.`
          : data.error
      );
      return;
    }
    setSuccess("Grade added!");
    setGForm({ student_id: "", subject: "", marks: "", grade: "", exam_type: "Final" });
    if (selected) loadGrades(selected.id);
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <h1 className="font-bold text-slate-800">Admin Dashboard</h1>
        <div className="flex gap-4 text-sm">
          {(["students", "addStudent", "grades"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`font-medium ${tab === t ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
              onClick={() => { setTab(t); setError(""); setSuccess(""); }}
            >
              {t === "addStudent" ? "Add Student" : t === "grades" ? "Add Grade" : "Students"}
            </button>
          ))}
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* STUDENTS TAB */}
        {tab === "students" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
              <div className="flex gap-3 mb-4">
                <input
                  placeholder="Filter by class"
                  className="border rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                />
                <input
                  placeholder="Filter by section"
                  className="border rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900"
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                />
                <button
                  onClick={fetchStudents}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                >
                  Filter
                </button>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 uppercase border-b">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Reg No</th>
                    <th className="pb-2">Class</th>
                    <th className="pb-2">Sec</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b last:border-0 hover:bg-slate-50 cursor-pointer ${selected?.id === s.id ? "bg-blue-50" : ""}`}
                      onClick={() => selectStudent(s)}
                    >
                      <td className="py-2 font-medium text-slate-700">{s.name}</td>
                      <td className="py-2 text-slate-500">{s.reg_no}</td>
                      <td className="py-2 text-slate-500">{s.class}</td>
                      <td className="py-2 text-slate-500">{s.section}</td>
                      <td className="py-2">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); handleDeleteStudent(s.id); }}
                          className="text-red-400 hover:text-red-600 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4 overflow-y-auto max-h-[85vh]">
                <h2 className="font-semibold text-slate-800">Edit: {selected.name}</h2>

                <div className="space-y-2">
                  {(["name", "class", "section", "address", "dob", "phone", "email"] as (keyof Student)[]).map((field) => (
                    <div key={String(field)}>
                      <label className="block text-xs text-slate-600 capitalize mb-0.5">
                        {String(field)}
                      </label>
                      <input
                        className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-500"
                        value={getField(selected, field)}
                        onChange={(e) => setSelected({ ...selected, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpdateStudent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition"
                >
                  Save Changes
                </button>

                {/* Credentials */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Login Account</h3>
                  {selected.username ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Username</span>
                        <span className="font-mono font-medium text-slate-700">{selected.username}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Password Hash</span>
                        <button
                          onClick={() => setShowPasswords((p) => ({ ...p, [selected.id]: !p[selected.id] }))}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          {showPasswords[selected.id] ? "Hide" : "Reveal"}
                        </button>
                      </div>
                      {showPasswords[selected.id] && (
                        <p className="font-mono text-xs bg-slate-100 rounded p-2 break-all text-slate-600">
                          {selected.password_hash}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No account registered yet.</p>
                  )}
                </div>

                {/* Grades */}
                <div className="border-t pt-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Grades</h3>
                  {grades.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No grades uploaded yet.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-400 border-b">
                          <th className="pb-1 pr-1">Subject</th>
                          <th className="pb-1 pr-1">Marks</th>
                          <th className="pb-1 pr-1">Grade</th>
                          <th className="pb-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g) => {
                          const isEditing = editingGrade?.id === g.id;
                          return (
                            <tr key={g.id} className="border-b last:border-0 align-middle">
                              {isEditing ? (
                                <>
                                  <td className="py-1 pr-1">
                                    <input
                                      className="w-full border rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={editingGrade.subject}
                                      onChange={(e) => setEditingGrade({ ...editingGrade, subject: e.target.value })}
                                    />
                                  </td>
                                  <td className="py-1 pr-1">
                                    <input
                                      type="number" min={0} max={100}
                                      className="w-14 border rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={editingGrade.marks}
                                      onChange={(e) => setEditingGrade({ ...editingGrade, marks: Number(e.target.value) })}
                                    />
                                  </td>
                                  <td className="py-1 pr-1">
                                    <input
                                      className="w-12 border rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                      value={editingGrade.grade}
                                      onChange={(e) => setEditingGrade({ ...editingGrade, grade: e.target.value })}
                                    />
                                  </td>
                                  <td className="py-1 whitespace-nowrap">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleUpdateGrade(); }}
                                      className="text-green-600 font-bold hover:text-green-800 mr-2"
                                      title="Save"
                                    >✓</button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditingGrade(null); }}
                                      className="text-slate-400 hover:text-slate-600 font-bold"
                                      title="Cancel"
                                    >✕</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-1 pr-1 text-slate-700">{g.subject}</td>
                                  <td className="py-1 pr-1 text-slate-700">{g.marks}/100</td>
                                  <td className="py-1 pr-1 font-semibold text-slate-700">{g.grade}</td>
                                  <td className="py-1 whitespace-nowrap">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEditingGrade({ ...g }); }}
                                      className="text-blue-500 hover:text-blue-700 font-semibold underline mr-2"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteGrade(g.id); }}
                                      className="text-red-400 hover:text-red-600 font-semibold underline"
                                    >
                                      Del
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADD STUDENT TAB */}
        {tab === "addStudent" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-xl">
            <h2 className="font-semibold text-slate-800 mb-4">Register New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-3">
              {[
                { label: "Registration No *", key: "reg_no",  req: true  },
                { label: "Full Name *",        key: "name",    req: true  },
                { label: "Class *",            key: "class",   req: true  },
                { label: "Section *",          key: "section", req: true  },
                { label: "Address",            key: "address", req: false },
                { label: "Date of Birth",      key: "dob",     req: false },
                { label: "Phone",              key: "phone",   req: false },
                { label: "Email",              key: "email",   req: false },
              ].map(({ label, key, req }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    required={req}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={sForm[key as keyof typeof sForm]}
                    onChange={(e) => setSForm({ ...sForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-sm"
              >
                Add Student
              </button>
            </form>
          </div>
        )}

        {/* ADD GRADE TAB */}
        {tab === "grades" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-xl">
            <h2 className="font-semibold text-slate-800 mb-4">Upload Grade</h2>
            <form onSubmit={handleAddGrade} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Student *</label>
                <select
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={gForm.student_id}
                  onChange={(e) => setGForm({ ...gForm, student_id: e.target.value })}
                >
                  <option value="">Select a student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.reg_no})
                    </option>
                  ))}
                </select>
              </div>
              {[
                { label: "Subject *", key: "subject", type: "text"   },
                { label: "Marks *",   key: "marks",   type: "number" },
                { label: "Grade *",   key: "grade",   type: "text"   },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    required
                    type={type}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={gForm[key as keyof typeof gForm]}
                    onChange={(e) => setGForm({ ...gForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={gForm.exam_type}
                  onChange={(e) => setGForm({ ...gForm, exam_type: e.target.value })}
                >
                  {["Midterm", "Final", "Quiz", "Assignment"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-sm"
              >
                Upload Grade
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
