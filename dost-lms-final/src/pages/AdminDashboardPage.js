import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Users, Courses, Certificates, ProgressReports, Assignments as AssignmentsApi } from "../api/resources";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({ employees: 0, courses: 0, assignments: 0, certificates: 0 });
  const [overview, setOverview] = useState({
    topDepartment: "-",
    topCourse: "-",
    avgCompletion: 0,
    pendingAssignments: 0,
  });

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
        const [employeesRes, coursesRes, certificatesRes, progressRes] = await Promise.all([
          Users.list({ role: "employee", per_page: 1 }),
          Courses.list({ per_page: 100 }),
          Certificates.list({ all: 1, per_page: 1 }),
          ProgressReports.list({ all: 1, per_page: 100 }),
        ]);

        const courses = coursesRes.data || [];
        const assignmentsTotal = courses.reduce((sum, c) => sum + (c.assignments_count || 0), 0);

        const deptEnrolments = {};
        let topCourse = { title: "-", enrolments_count: -1 };
        courses.forEach((c) => {
          const dept = c.department || "General";
          deptEnrolments[dept] = (deptEnrolments[dept] || 0) + (c.enrolments_count || 0);
          if ((c.enrolments_count || 0) > topCourse.enrolments_count) {
            topCourse = c;
          }
        });
        const topDepartment = Object.keys(deptEnrolments).sort((a, b) => deptEnrolments[b] - deptEnrolments[a])[0] || "-";

        const perCourseAssignments = await Promise.all(
          courses.slice(0, 20).map((c) => AssignmentsApi.listForCourse(c.course_id).catch(() => []))
        );
        const pendingAssignments = perCourseAssignments.flat().filter((a) => a.status === "open").length;

        const reports = progressRes.data || [];
        const avgCompletion = reports.length
          ? Math.round(reports.reduce((sum, r) => sum + r.progress, 0) / reports.length)
          : 0;

        setStats({
          employees: employeesRes.total || 0,
          courses: coursesRes.total || 0,
          assignments: assignmentsTotal,
          certificates: certificatesRes.total || 0,
        });

        setOverview({
          topDepartment,
          topCourse: topCourse.title,
          avgCompletion,
          pendingAssignments,
        });

        setRecentActivities(
          (certificatesRes.data || []).slice(0, 3).map((c) => ({
            title: `Certificate issued for ${c.course?.title || "a course"}`,
            time: c.issued_date ? new Date(c.issued_date).toLocaleDateString() : "-",
          }))
        );
      } catch (err) {
        // Leave defaults on failure.
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
            <p style={styles.subtitle}>Admin Dashboard</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search admin dashboard..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.navLinks}>
            <button style={styles.activeButton}>Dashboard</button>

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

            <button
              style={styles.navButton}
              onClick={() => navigate("/manage-assignments")}
            >
              Assignments
            </button>

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
            <p style={styles.label}>ADMIN PANEL</p>

            <h1 style={styles.heading}>Welcome Admin</h1>

            <p style={styles.text}>
              Manage employees, courses, assignments, certificates, and learning
              progress from one centralized dashboard.
            </p>
          </div>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/manage-users")}
          >
            Manage Users
          </button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statTitle}>Employees</h3>
            <p style={styles.statValue}>{stats.employees}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📘</span>
            <h3 style={styles.statTitle}>Courses</h3>
            <p style={styles.statValue}>{stats.courses}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📝</span>
            <h3 style={styles.statTitle}>Assignments</h3>
            <p style={styles.statValue}>{stats.assignments}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎓</span>
            <h3 style={styles.statTitle}>Certificates</h3>
            <p style={styles.statValue}>{stats.certificates}</p>
          </div>
        </section>

        <section style={styles.dashboardGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Quick Management</h2>
            </div>

            <div style={styles.quickGrid}>
              <div
                style={styles.quickCard}
                onClick={() => navigate("/manage-users")}
              >
                <span style={styles.quickIcon}>👥</span>
                <h3 style={styles.quickTitle}>Manage Users</h3>
                <p style={styles.quickText}>
                  Add, edit, and manage employee accounts.
                </p>
              </div>

              <div
                style={styles.quickCard}
                onClick={() => navigate("/manage-courses")}
              >
                <span style={styles.quickIcon}>📘</span>
                <h3 style={styles.quickTitle}>Manage Courses</h3>
                <p style={styles.quickText}>
                  Create, update, and organize courses.
                </p>
              </div>

              <div
                style={styles.quickCard}
                onClick={() => navigate("/manage-assignments")}
              >
                <span style={styles.quickIcon}>📝</span>
                <h3 style={styles.quickTitle}>Manage Assignments</h3>
                <p style={styles.quickText}>
                  Add assignments and monitor submissions.
                </p>
              </div>

              <div
                style={styles.quickCard}
                onClick={() => navigate("/manage-certificates")}
              >
                <span style={styles.quickIcon}>🎓</span>
                <h3 style={styles.quickTitle}>Manage Certificates</h3>
                <p style={styles.quickText}>
                  View and generate learning certificates.
                </p>
              </div>

              <div
                style={styles.quickCard}
                onClick={() => navigate("/progress-reports")}
              >
                <span style={styles.quickIcon}>📊</span>
                <h3 style={styles.quickTitle}>Progress Reports</h3>
                <p style={styles.quickText}>
                  Track employee learning performance.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent Activity</h2>
            </div>

            {recentActivities.length === 0 && <p style={styles.itemSub}>No recent activity yet.</p>}
            {recentActivities.map((activity, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={styles.greenDot}></span>

                <div>
                  <h3 style={styles.itemTitle}>{activity.title}</h3>
                  <p style={styles.itemSub}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.bottomGrid}>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>System Overview</h2>

            <div style={styles.overviewRow}>
              <span>Most Active Department</span>
              <strong>{overview.topDepartment}</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Highest Enrolled Course</span>
              <strong>{overview.topCourse}</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Average Course Completion</span>
              <strong>{overview.avgCompletion}%</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Pending Assignments</span>
              <strong>{overview.pendingAssignments}</strong>
            </div>
          </div>

          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Admin Notes</h2>

            <p style={styles.noteText}>
              This admin dashboard manages users, courses, assignments,
              certificates, and progress reports. All values above are live
              from the Laravel backend and MySQL database.
            </p>
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

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "30px",
    marginBottom: "30px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
    fontSize: "26px",
    margin: 0,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  quickCard: {
    backgroundColor: "#F8FAFC",
    padding: "20px",
    borderRadius: "18px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  quickIcon: {
    fontSize: "28px",
  },

  quickTitle: {
    color: "#0B1F5E",
    marginBottom: "8px",
  },

  quickText: {
    color: "#64748B",
    fontSize: "14px",
    lineHeight: "1.5",
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

  itemTitle: {
    color: "#0B1F5E",
    margin: 0,
    fontSize: "17px",
  },

  itemSub: {
    color: "#64748B",
    margin: "8px 0 0",
  },

  overviewRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "17px 0",
    borderBottom: "1px solid #E5E7EB",
    color: "#0B1F5E",
    fontSize: "16px",
    gap: "15px",
  },

  noteText: {
    color: "#64748B",
    lineHeight: "1.8",
    fontSize: "16px",
  },
};

export default AdminDashboardPage;