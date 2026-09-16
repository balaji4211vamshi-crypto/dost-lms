import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Courses, Assignments as AssignmentsApi, Submissions } from "../api/resources";
import { apiErrorMessage } from "../api/client";

const emptyForm = {
  course_id: "",
  title: "",
  description: "",
  type: "assignment",
  due_date: "",
  status: "open",
  max_score: 100,
  quizText: "",
};

/** Parse "Question | OptA | OptB | OptC | correctIndex" lines into quiz_questions JSON. */
function parseQuizText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const correct_index = parseInt(parts[parts.length - 1], 10) || 0;
      const options = parts.slice(1, parts.length - 1);
      return { question: parts[0], options, correct_index };
    });
}

function ManageAssignmentsPage() {
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const coursesRes = await Courses.list({ per_page: 100 });
      const courseList = coursesRes.data || [];
      setCourses(courseList);

      const perCourse = await Promise.all(
        courseList.map((c) =>
          AssignmentsApi.listForCourse(c.course_id)
            .then((list) => list.map((a) => ({ ...a, courseTitle: c.title })))
            .catch(() => [])
        )
      );
      const flat = perCourse.flat();

      const withCounts = await Promise.all(
        flat.map((a) =>
          Submissions.forAssignment(a.assignment_id, { per_page: 1 })
            .then((res) => ({ ...a, submissionsCount: res.total || 0 }))
            .catch(() => ({ ...a, submissionsCount: 0 }))
        )
      );

      setAssignments(withCounts);
    } catch (err) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, course_id: courses[0]?.course_id || "" });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (assignment) => {
    setEditingId(assignment.assignment_id);
    setForm({
      course_id: assignment.course_id,
      title: assignment.title,
      description: assignment.description || "",
      type: assignment.type,
      due_date: assignment.due_date || "",
      status: assignment.status,
      max_score: assignment.max_score,
      quizText: (assignment.quiz_questions || [])
        .map((q) => [q.question, ...(q.options || []), q.correct_index].join(" | "))
        .join("\n"),
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        due_date: form.due_date || null,
        status: form.status,
        max_score: Number(form.max_score) || 100,
      };
      if (form.type === "quiz") {
        payload.quiz_questions = parseQuizText(form.quizText);
      }

      if (editingId) {
        await AssignmentsApi.update(editingId, payload);
      } else {
        await AssignmentsApi.create(form.course_id, payload);
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this assignment."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"?`)) return;
    try {
      await AssignmentsApi.remove(assignment.assignment_id);
      loadAll();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete this assignment."));
    }
  };

  const totalAssignments = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === "draft").length;
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissionsCount || 0), 0);
  const openCount = assignments.filter((a) => a.status === "open").length;

  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Manage Assignments</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search assignments..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.navLinks}>
            <button
              style={styles.navButton}
              onClick={() => navigate("/admin-dashboard")}
            >
              Dashboard
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/manage-users")}
            >
              Users
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/manage-courses")}
            >
              Courses
            </button>

            <button style={styles.activeButton}>Assignments</button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/manage-certificates")}
            >
              Certificates
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/progress-reports")}
            >
              Reports
            </button>

            <div style={styles.profileWrapper}>
              <button
                style={styles.profileButton}
                onClick={() => setShowAdminMenu(!showAdminMenu)}
              >
                Admin ▾
              </button>

              {showAdminMenu && (
                <div style={styles.dropdown}>
                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/admin-dashboard")}
                  >
                    Dashboard
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/manage-users")}
                  >
                    Manage Users
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/manage-courses")}
                  >
                    Manage Courses
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/progress-reports")}
                  >
                    Progress Reports
                  </p>

                  <p style={styles.logoutItem} onClick={logout}>
                    Logout
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div>
            <p style={styles.label}>ASSIGNMENT MANAGEMENT</p>

            <h1 style={styles.heading}>Manage Assignments</h1>

            <p style={styles.text}>
              Create assignments, set deadlines, monitor status, and review
              employee submissions.
            </p>
          </div>

          <button style={styles.primaryButton} onClick={openAddForm}>+ Add Assignment</button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📝</span>
            <h3 style={styles.statTitle}>Total Assignments</h3>
            <p style={styles.statValue}>{totalAssignments}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>⏳</span>
            <h3 style={styles.statTitle}>Draft</h3>
            <p style={styles.statValue}>{pendingCount}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📤</span>
            <h3 style={styles.statTitle}>Submissions</h3>
            <p style={styles.statValue}>{totalSubmissions}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <h3 style={styles.statTitle}>Open Tasks</h3>
            <p style={styles.statValue}>{openCount}</p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Assignment List</h2>
            <button style={styles.smallButton} onClick={() => window.print()}>Export Assignments</button>
          </div>

          {showForm && (
            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "14px", marginBottom: "20px" }}>
              <h3 style={{ color: "#0B1F5E" }}>{editingId ? "Edit Assignment" : "Add Assignment"}</h3>
              {error && <p style={{ color: "#DC2626" }}>{error}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "10px" }}>
                {!editingId && (
                  <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>{c.title}</option>
                    ))}
                  </select>
                )}
                <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!!editingId} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                  <option value="assignment">Assignment (file upload)</option>
                  <option value="quiz">Quiz</option>
                </select>
                <input type="date" value={form.due_date || ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <input type="number" placeholder="Max score" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", gridColumn: "1 / span 2" }}
                />
                {form.type === "quiz" && (
                  <div style={{ gridColumn: "1 / span 2" }}>
                    <p style={{ color: "#475569", fontSize: "13px", marginBottom: "6px" }}>
                      One question per line: <code>Question text | Option A | Option B | Option C | correctIndex</code> (correctIndex is 0-based)
                    </p>
                    <textarea
                      rows={5}
                      placeholder={"Which is a strong password? | password123 | Tr0ub4dor&3 | 12345 | 1"}
                      value={form.quizText}
                      onChange={(e) => setForm({ ...form, quizText: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginTop: "16px" }}>
                <button style={styles.primaryButton} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>{" "}
                <button style={styles.smallButton} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {loading && <p style={{ color: "#64748B" }}>Loading assignments...</p>}
          <div style={styles.assignmentGrid}>
            {assignments.map((assignment) => (
              <div
                key={assignment.assignment_id}
                style={styles.assignmentCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 28px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(0,0,0,0.05)";
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.assignmentIcon}>📝</span>

                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        assignment.status === "draft"
                          ? "#FEF3C7"
                          : assignment.status === "open"
                          ? "#DBEAFE"
                          : "#DCFCE7",
                      color:
                        assignment.status === "draft"
                          ? "#92400E"
                          : assignment.status === "open"
                          ? "#1D4ED8"
                          : "#166534",
                    }}
                  >
                    {assignment.status}
                  </span>
                </div>

                <h3 style={styles.assignmentTitle}>{assignment.title}</h3>

                <p style={styles.assignmentText}>
                  <strong>Course:</strong> {assignment.courseTitle}
                </p>

                <p style={styles.assignmentText}>
                  <strong>Due Date:</strong> {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "-"}
                </p>

                <p style={styles.assignmentText}>
                  <strong>Submissions:</strong> {assignment.submissionsCount}
                </p>

                <div style={styles.buttonRow}>
                  <button style={styles.editButton} onClick={() => openEditForm(assignment)}>Edit</button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(assignment)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F1F5F9",
    fontFamily: "Arial",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 30px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E2E8F0",
    flexWrap: "wrap",
    gap: "15px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "55px",
  },

  title: {
    margin: 0,
    color: "#0B1F5E",
  },

  subtitle: {
    margin: 0,
    color: "#64748B",
    fontSize: "13px",
  },

  navSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    border: "1px solid #CBD5E1",
    borderRadius: "25px",
    padding: "0 14px",
  },

  searchIcon: {
    fontSize: "16px",
    marginRight: "8px",
    color: "#64748B",
  },

  searchInput: {
    padding: "10px 0",
    width: "240px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
  },

  navLinks: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  navButton: {
    backgroundColor: "#EEF2FF",
    color: "#0B1F5E",
    border: "none",
    padding: "9px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
  },

  activeButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "9px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
  },

  profileWrapper: {
    position: "relative",
  },

  profileButton: {
    backgroundColor: "#0B1F5E",
    color: "#ffffff",
    border: "none",
    padding: "9px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "45px",
    width: "190px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    padding: "10px",
    zIndex: 999,
  },

  dropdownItem: {
    margin: 0,
    padding: "10px",
    cursor: "pointer",
    color: "#0B1F5E",
    borderRadius: "8px",
  },

  logoutItem: {
    margin: 0,
    padding: "10px",
    cursor: "pointer",
    color: "#DC2626",
    fontWeight: "700",
    borderRadius: "8px",
  },

  main: {
    padding: "30px",
  },

  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  label: {
    color: "#2563EB",
    fontWeight: "700",
    margin: 0,
  },

  heading: {
    color: "#0B1F5E",
    fontSize: "36px",
    margin: "10px 0",
  },

  text: {
    color: "#64748B",
    fontSize: "16px",
    lineHeight: "1.6",
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "13px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    padding: "22px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 5px 18px rgba(0,0,0,0.05)",
  },

  statIcon: {
    fontSize: "28px",
  },

  statTitle: {
    color: "#0B1F5E",
    marginBottom: "5px",
  },

  statValue: {
    color: "#2563EB",
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
  },

  panel: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "24px",
    boxShadow: "0 6px 22px rgba(0,0,0,0.05)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },

  panelTitle: {
    color: "#0B1F5E",
    fontSize: "26px",
    margin: 0,
  },

  smallButton: {
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  assignmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "22px",
  },

  assignmentCard: {
    backgroundColor: "#F8FAFC",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  assignmentIcon: {
    fontSize: "30px",
  },

  assignmentTitle: {
    color: "#0B1F5E",
    fontSize: "20px",
    marginBottom: "14px",
  },

  assignmentText: {
    color: "#475569",
    lineHeight: "1.6",
  },

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "13px",
  },

  buttonRow: {
    display: "flex",
    gap: "8px",
    marginTop: "15px",
    flexWrap: "wrap",
  },

  editButton: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  viewButton: {
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default ManageAssignmentsPage;