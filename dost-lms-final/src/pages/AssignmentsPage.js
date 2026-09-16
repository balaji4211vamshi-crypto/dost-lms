import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Enrolments, Assignments as AssignmentsApi, Submissions } from "../api/resources";

function AssignmentsPage() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

  const loadAssignments = () => {
    setLoading(true);
    Promise.all([Enrolments.list(), Submissions.mine()])
      .then(async ([enrolmentsRes, submissionsRes]) => {
        const enrolments = enrolmentsRes.data || [];
        const submissions = submissionsRes.data || [];
        const submissionByAssignment = {};
        submissions.forEach((s) => { submissionByAssignment[s.assignment_id] = s; });

        const perCourse = await Promise.all(
          enrolments.map((e) => AssignmentsApi.listForCourse(e.course_id).then((list) =>
            list.map((a) => ({ ...a, courseTitle: e.course?.title || "Course" }))
          ).catch(() => []))
        );

        const flat = perCourse.flat().map((a) => {
          const submission = submissionByAssignment[a.assignment_id];
          let status = "Pending";
          if (submission) {
            status = submission.graded_at ? (submission.result === "pass" ? "Passed" : "Failed") : "Submitted";
          }
          return { ...a, status, submission };
        });

        setAssignments(flat);
      })
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const toggleOpen = (assignment) => {
    setNotice("");
    if (openId === assignment.assignment_id) {
      setOpenId(null);
      return;
    }
    setOpenId(assignment.assignment_id);
    setQuizAnswers({});
  };

  const submitQuiz = async (assignment) => {
    const answers = (assignment.quiz_questions || []).map((_, i) => quizAnswers[i] ?? -1);
    setSubmitting(true);
    setNotice("");
    try {
      await Submissions.submitQuiz(assignment.assignment_id, answers);
      setNotice("Quiz submitted and graded!");
      setOpenId(null);
      loadAssignments();
    } catch (err) {
      setNotice(err?.response?.data?.message || "Could not submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitFile = async (assignment, file) => {
    if (!file) {
      setNotice("Choose a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setSubmitting(true);
    setNotice("");
    try {
      await Submissions.submitFile(assignment.assignment_id, formData);
      setNotice("Assignment submitted!");
      setOpenId(null);
      loadAssignments();
    } catch (err) {
      setNotice(err?.response?.data?.message || "Could not submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === "Pending").length;
  const submittedCount = assignments.filter((a) => a.status !== "Pending").length;

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Assignments</p>
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
              onClick={() => navigate("/user-home")}
            >
              Home
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/courses")}
            >
              Courses
            </button>

            <button style={styles.activeButton}>
              Assignments
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/certificates")}
            >
              Certificates
            </button>

            <div style={styles.profileWrapper}>
              <button
                style={styles.profileButton}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                My Profile ▾
              </button>

              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/courses")}
                  >
                    Courses
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/assignments")}
                  >
                    Assignments
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/edit-profile")}
                  >
                    Edit Profile
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() => navigate("/certificates")}
                  >
                    Certificates
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
          <p style={styles.label}>MY TASKS</p>
          <h1 style={styles.heading}>Assignments</h1>
          <p style={styles.text}>
            View your course assignments, deadlines, and submission status.
          </p>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Total Assignments</h3>
            <p style={styles.statValue}>{totalCount}</p>
          </div>

          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Pending</h3>
            <p style={styles.statValue}>{pendingCount}</p>
          </div>

          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Submitted</h3>
            <p style={styles.statValue}>{submittedCount}</p>
          </div>
        </section>

        {notice && <p style={{ color: "#2563EB", marginBottom: "16px" }}>{notice}</p>}
        {loading && <p style={{ color: "#64748B" }}>Loading assignments...</p>}
        {!loading && assignments.length === 0 && (
          <p style={{ color: "#64748B" }}>No assignments yet — enrol in a course to see its assignments here.</p>
        )}

        <section style={styles.assignmentGrid}>
          {assignments.map((assignment) => (
            <div key={assignment.assignment_id} style={styles.assignmentCard}>
              <div style={styles.cardTop}>
                <span style={styles.assignmentIcon}>{assignment.type === "quiz" ? "🧠" : "📝"}</span>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      assignment.status === "Pending" ? "#FEF3C7" :
                      assignment.status === "Failed" ? "#FEE2E2" : "#DCFCE7",
                    color:
                      assignment.status === "Pending" ? "#92400E" :
                      assignment.status === "Failed" ? "#B91C1C" : "#166534",
                  }}
                >
                  {assignment.status}
                </span>
              </div>

              <h2 style={styles.assignmentTitle}>{assignment.title}</h2>

              <p style={styles.assignmentText}>
                <strong>Course:</strong> {assignment.courseTitle}
              </p>

              <p style={styles.assignmentText}>
                <strong>Due Date:</strong> {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"}
              </p>

              {assignment.submission && assignment.submission.graded_at && (
                <p style={styles.assignmentText}>
                  <strong>Score:</strong> {assignment.submission.score} / {assignment.max_score}
                </p>
              )}

              {assignment.status === "Pending" && (
                <button style={styles.submitButton} onClick={() => toggleOpen(assignment)}>
                  {openId === assignment.assignment_id ? "Close" : (assignment.type === "quiz" ? "Take Quiz" : "Submit Assignment")}
                </button>
              )}

              {openId === assignment.assignment_id && assignment.type === "quiz" && (
                <div style={{ marginTop: "16px", textAlign: "left" }}>
                  {(assignment.quiz_questions || []).map((q, qi) => (
                    <div key={qi} style={{ marginBottom: "12px" }}>
                      <p style={{ fontWeight: 600, color: "#0B1F5E" }}>{qi + 1}. {q.question}</p>
                      {(q.options || []).map((opt, oi) => (
                        <label key={oi} style={{ display: "block", color: "#475569", padding: "2px 0" }}>
                          <input
                            type="radio"
                            name={`q-${assignment.assignment_id}-${qi}`}
                            checked={quizAnswers[qi] === oi}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                          />{" "}
                          {opt}
                        </label>
                      ))}
                    </div>
                  ))}
                  <button style={styles.submitButton} disabled={submitting} onClick={() => submitQuiz(assignment)}>
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </div>
              )}

              {openId === assignment.assignment_id && assignment.type !== "quiz" && (
                <div style={{ marginTop: "16px", textAlign: "left" }}>
                  <input
                    type="file"
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, file: e.target.files[0] })}
                  />
                  <br />
                  <button
                    style={{ ...styles.submitButton, marginTop: "10px" }}
                    disabled={submitting}
                    onClick={() => submitFile(assignment, quizAnswers.file)}
                  >
                    {submitting ? "Submitting..." : "Submit File"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #EEF2FF, #F8FAFC)",
    fontFamily: "Arial",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #E2E8F0",
    flexWrap: "wrap",
    gap: "12px",
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
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  navButton: {
    backgroundColor: "#EEF2FF",
    color: "#0B1F5E",
    border: "none",
    padding: "10px 18px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
  },

  activeButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
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
    padding: "10px 18px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "48px",
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
    padding: "35px",
  },

  heroCard: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    marginBottom: "25px",
  },

  label: {
    color: "#2563EB",
    fontWeight: "700",
    margin: 0,
  },

  heading: {
    color: "#0B1F5E",
    fontSize: "34px",
    marginBottom: "10px",
  },

  text: {
    color: "#64748B",
    fontSize: "16px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  statTitle: {
    color: "#0B1F5E",
    fontSize: "16px",
  },

  statValue: {
    color: "#2563EB",
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
  },

  assignmentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "22px",
  },

  assignmentCard: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
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

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },

  assignmentTitle: {
    color: "#0B1F5E",
    fontSize: "21px",
    marginBottom: "14px",
  },

  assignmentText: {
    color: "#475569",
    lineHeight: "1.6",
  },

  submitButton: {
    marginTop: "15px",
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default AssignmentsPage;