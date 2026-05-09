"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Types that mirror the DB rows
interface Student {
  id: number; reg_no: string; name: string; class: string;
  section: string; address: string; dob: string; phone: string; email: string;
}
interface Grade {
  id: number; subject: string; marks: number; grade: string; exam_type: string;
}

// Returns a Tailwind color class based on grade letter
const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-green-600 bg-green-50";
  if (g.startsWith("B")) return "text-blue-600  bg-blue-50";
  if (g.startsWith("C")) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [grades,  setGrades]  = useState<Grade[]>([]);
  const [error,   setError]   = useState("");

  useEffect(() => {
    // Fetch the student's own profile — the API resolves identity from the JWT cookie
    fetch("/api/students/me")
      .then(r => { if (r.status === 401) router.push("/login"); return r.json(); })
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setStudent(data.student);
        setGrades(data.grades);
      });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (error)   return <p className="p-8 text-red-500">{error}</p>;
  if (!student) return <p className="p-8 text-slate-400">Loading…</p>;

  const avg = grades.length
    ? (grades.reduce((s, g) => s + g.marks, 0) / grades.length).toFixed(1)
    : "—";

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Student Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">{student.name}</p>
              <p className="text-sm text-slate-500">Reg No: {student.reg_no}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Class / Section", `${student.class} – ${student.section}`],
              ["Date of Birth",   student.dob   || "N/A"],
              ["Phone",           student.phone || "N/A"],
              ["Email",           student.email || "N/A"],
              ["Address",         student.address || "N/A"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-slate-700 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Academic Results</h2>
            <span className="text-sm text-slate-500">Average: <strong>{avg}</strong></span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase border-b">
                <th className="pb-2">Subject</th>
                <th className="pb-2">Exam</th>
                <th className="pb-2">Marks</th>
                <th className="pb-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(g => (
                <tr key={g.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 font-medium text-slate-700">{g.subject}</td>
                  <td className="py-2 text-slate-500">{g.exam_type}</td>
                  <td className="py-2 text-slate-700">{g.marks}/100</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gradeColor(g.grade)}`}>
                      {g.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}