import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, getStoredUser, isLoggedIn } from "../api/auth";
import { Enrolments, Certificates, Submissions, Assignments } from "../api/resources";

function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = getStoredUser();

  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ courses: 0, assignments: 0, certificates: 0, completed: 0 });
  const [overview, setOverview] = useState({ avgProgress: 0, learningArea: "-", certificatesEarned: 0, status: "-" });

  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const [enrolmentsRes, certificatesRes, submissionsRes] = await Promise.all([
          Enrolments.list(),
          Certificates.list(),
          Submissions.mine(),
        ]);

        const enrolments = enrolmentsRes.data || [];
        const certificates = certificatesRes.data || [];
        const submissions = submissionsRes.data || [];

        setCourses(
          enrolments.slice(0, 5).map((e) => ({
            title: e.course?.title || "Course",
            status: e.status === "completed" ? "Completed" : e.status === "in_progress" ? "Ongoing" : "Not started",
            progress: e.progress,
          }))
        );

        setActivities(
          submissions.slice(0, 5).map((s) => ({
            title: `Submitted ${s.assignment?.title || "an assignment"}`,
            time: timeAgo(s.submitted_at),
          }))
        );

        const completedCount = enrolments.filter((e) => e.status === "completed").length;
        const avgProgress = enrolments.length
          ? Math.round(enrolments.reduce((sum, e) => sum + e.progress, 0) / enrolments.length)
          : 0;

        // Upcoming assignments: open assignments in enrolled courses not yet submitted.
        const submittedIds = new Set(submissions.map((s) => s.assignment_id));
        const activeCourses = enrolments.filter((e) => e.status !== "completed").slice(0, 4);
        const perCourseAssignments = await Promise.all(
          activeCourses.map((e) => Assignments.listForCourse(e.course_id).catch(() => []))
        );
        const upcoming = perCourseAssignments
          .flat()
          .filter((a) => a.status === "open" && !submittedIds.has(a.assignment_id))
          .slice(0, 3)
          .map((a) => ({
            title: a.title,
            due: a.due_date ? `Due ${new Date(a.due_date).toLocaleDateString()}` : "No due date",
            status: a.type === "quiz" ? "Quiz" : "Pending",
          }));
        setAssignments(upcoming);

        setStats({
          courses: enrolments.length,
          assignments: upcoming.length,
          certificates: certificates.length,
          completed: completedCount,
        });

        setOverview({
          avgProgress,
          learningArea: enrolments[0]?.course?.department || "General",
          certificatesEarned: certificates.length,
          status: avgProgress >= 50 ? "On track" : "Getting started",
        });
      } catch (err) {
        // Leave panels empty on failure — the rest of the dashboard still renders.
      }
    })();
  }, [navigate]);

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Employee Dashboard</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search dashboard..."
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

            <button style={styles.activeButton}>Dashboard</button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/courses")}
            >
              Courses
            </button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/assignments")}
            >
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
                {user ? user.name : "My Profile"} ▾
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
        <section style={styles.welcomeCard}>
          <div>
            <h1 style={styles.heading}>Welcome back{user ? `, ${user.name}` : ""}</h1>

            <p style={styles.text}>
              Track your courses, assignments, certificates, and learning
              progress in one place.
            </p>
          </div>

          <button
            style={styles.continueButton}
            onClick={() => navigate("/courses")}
          >
            Continue Learning
          </button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📘</span>
            <h3>Courses</h3>
            <p style={styles.statValue}>{stats.courses}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📝</span>
            <h3>Assignments</h3>
            <p style={styles.statValue}>{stats.assignments}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎓</span>
            <h3>Certificates</h3>
            <p style={styles.statValue}>{stats.certificates}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <h3>Completed</h3>
            <p style={styles.statValue}>{stats.completed}</p>
          </div>
        </section>

        <section style={styles.dashboardGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>My Courses</h2>

              <button
                style={styles.linkButton}
                onClick={() => navigate("/courses")}
              >
                View all
              </button>
            </div>

            {courses.length === 0 && <p style={styles.itemSub}>No enrolled courses yet.</p>}
            {courses.map((course, index) => (
              <div key={index} style={styles.courseItem}>
                <div>
                  <h3 style={styles.itemTitle}>{course.title}</h3>
                  <p style={styles.itemSub}>{course.status}</p>
                </div>

                <div style={styles.progressWrapper}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>

                  <strong style={styles.progressText}>
                    {course.progress}%
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent Activity</h2>

              <button style={styles.linkButton}>Updates</button>
            </div>

            {activities.length === 0 && <p style={styles.itemSub}>No recent activity yet.</p>}
            {activities.map((activity, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={styles.greenDot}></span>

                <div>
                  <h3 style={styles.itemTitle}>{activity.title}</h3>
                  <p style={styles.itemSub}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Upcoming Assignments</h2>

              <button
                style={styles.linkButton}
                onClick={() => navigate("/assignments")}
              >
                This week
              </button>
            </div>

            {assignments.length === 0 && <p style={styles.itemSub}>Nothing due right now.</p>}
            {assignments.map((assignment, index) => (
              <div key={index} style={styles.assignmentItem}>
                <div>
                  <h3 style={styles.itemTitle}>{assignment.title}</h3>
                  <p style={styles.itemSub}>{assignment.due}</p>
                </div>

                <span
                  style={{
                    ...styles.badge,
                    backgroundColor:
                      assignment.status === "Pending" ? "#FEE2E2" : "#DBEAFE",
                    color:
                      assignment.status === "Pending" ? "#B91C1C" : "#1D4ED8",
                  }}
                >
                  {assignment.status}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Learning Overview</h2>

              <button style={styles.linkButton}>Summary</button>
            </div>

            <div style={styles.overviewRow}>
              <span>Average Progress</span>
              <strong>{overview.avgProgress}%</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Learning Area</span>
              <strong>{overview.learningArea}</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Certificates Earned</span>
              <strong>{overview.certificatesEarned}</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Learning Status</span>
              <strong>{overview.status}</strong>
            </div>
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

  welcomeCard: {
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
  },

  continueButton: {
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

  statValue: {
    color: "#2563EB",
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
  },

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "30px",
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
    fontSize: "28px",
    margin: 0,
  },

  linkButton: {
    background: "none",
    border: "none",
    color: "#2563EB",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
  },

  courseItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "16px",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    alignItems: "center",
    gap: "18px",
  },

  itemTitle: {
    color: "#0B1F5E",
    margin: 0,
    fontSize: "18px",
  },

  itemSub: {
    color: "#64748B",
    margin: "8px 0 0",
  },

  progressWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  progressBar: {
    flex: 1,
    height: "10px",
    backgroundColor: "#E5E7EB",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: "20px",
  },

  progressText: {
    color: "#0B1F5E",
  },

  activityItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  greenDot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: "#22C55E",
  },

  assignmentItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  badge: {
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "700",
  },

  overviewRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "17px 0",
    borderBottom: "1px solid #E5E7EB",
    color: "#0B1F5E",
    fontSize: "17px",
  },
};

export default DashboardPage;