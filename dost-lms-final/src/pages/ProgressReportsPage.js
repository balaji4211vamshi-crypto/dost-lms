import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { ProgressReports, Certificates } from "../api/resources";

function ProgressReportsPage() {
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [reports, setReports] = useState([]);
  const [certIssuedCount, setCertIssuedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    Promise.all([
      ProgressReports.list({ all: 1, per_page: 100 }),
      Certificates.list({ all: 1, per_page: 100 }),
    ])
      .then(([reportsRes, certRes]) => {
        const certifiedPairs = new Set(
          (certRes.data || []).map((c) => `${c.user_id}-${c.course_id}`)
        );
        setCertIssuedCount(certRes.data?.length || 0);
        setReports(
          (reportsRes.data || []).map((r) => ({
            employee: r.user?.name || "Employee",
            department: r.user?.department || "-",
            course: r.course?.title || "Course",
            progress: r.progress,
            assignmentStatus: r.progress >= 100 ? "Submitted" : r.progress > 0 ? "In Progress" : "Pending",
            certificateStatus: certifiedPairs.has(`${r.user_id}-${r.course_id}`) ? "Issued" : "Not Issued",
          }))
        );
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const avgProgress = reports.length
    ? Math.round(reports.reduce((sum, r) => sum + r.progress, 0) / reports.length)
    : 0;
  const submittedCount = reports.filter((r) => r.assignmentStatus === "Submitted").length;
  const trackedEmployees = new Set(reports.map((r) => r.employee)).size;

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Progress Reports</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search reports..."
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

            <button style={styles.activeButton}>Reports</button>

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
                    onClick={() => navigate("/manage-certificates")}
                  >
                    Manage Certificates
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
            <p style={styles.label}>LEARNING ANALYTICS</p>

            <h1 style={styles.heading}>Progress Reports</h1>

            <p style={styles.text}>
              Monitor employee course progress, assignment completion, and
              certificate status across departments.
            </p>
          </div>

          <button style={styles.primaryButton} onClick={() => window.print()}>Export Report</button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statTitle}>Tracked Employees</h3>
            <p style={styles.statValue}>{trackedEmployees}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📊</span>
            <h3 style={styles.statTitle}>Average Progress</h3>
            <p style={styles.statValue}>{avgProgress}%</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>📝</span>
            <h3 style={styles.statTitle}>Submitted Tasks</h3>
            <p style={styles.statValue}>{submittedCount}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎓</span>
            <h3 style={styles.statTitle}>Certificates Issued</h3>
            <p style={styles.statValue}>{certIssuedCount}</p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Employee Learning Progress</h2>
            <button style={styles.smallButton}>Download CSV</button>
          </div>

          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Employee</span>
              <span>Department</span>
              <span>Course</span>
              <span>Progress</span>
              <span>Assignment</span>
              <span>Certificate</span>
            </div>

            {loading && <p style={{ padding: "12px", color: "#64748B" }}>Loading...</p>}
            {!loading && reports.length === 0 && <p style={{ padding: "12px", color: "#64748B" }}>No data yet.</p>}
            {reports.map((report, index) => (
              <div key={index} style={styles.tableRow}>
                <span style={styles.userName}>{report.employee}</span>

                <span>{report.department}</span>

                <span>{report.course}</span>

                <span>
                  <div style={styles.progressWrapper}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${report.progress}%`,
                        }}
                      />
                    </div>

                    <strong style={styles.progressText}>
                      {report.progress}%
                    </strong>
                  </div>
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      report.assignmentStatus === "Submitted"
                        ? "#DCFCE7"
                        : report.assignmentStatus === "In Progress"
                        ? "#DBEAFE"
                        : "#FEF3C7",
                    color:
                      report.assignmentStatus === "Submitted"
                        ? "#166534"
                        : report.assignmentStatus === "In Progress"
                        ? "#1D4ED8"
                        : "#92400E",
                  }}
                >
                  {report.assignmentStatus}
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      report.certificateStatus === "Issued"
                        ? "#DCFCE7"
                        : "#FEE2E2",
                    color:
                      report.certificateStatus === "Issued"
                        ? "#166534"
                        : "#B91C1C",
                  }}
                >
                  {report.certificateStatus}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.bottomGrid}>
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Department Summary</h2>

            <div style={styles.overviewRow}>
              <span>Most Active Department</span>
              <strong>IT Department</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Highest Course Progress</span>
              <strong>Thermodynamics - 90%</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Lowest Course Progress</span>
              <strong>Cloud Computing Basics - 45%</strong>
            </div>

            <div style={styles.overviewRow}>
              <span>Pending Certificates</span>
              <strong>3</strong>
            </div>
          </div>

          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Report Notes</h2>

            <p style={styles.noteText}>
              This page allows administrators to monitor employee training
              progress. In the final system, this data will be generated from
              course enrollments, assignment submissions, and certificate records
              stored in the backend database.
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

  panel: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "24px",
    boxShadow: "0 6px 22px rgba(0,0,0,0.05)",
    overflowX: "auto",
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

  table: {
    minWidth: "1050px",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.4fr 1.5fr 1.2fr 1.2fr 1.2fr",
    gap: "15px",
    backgroundColor: "#EEF2FF",
    padding: "16px",
    borderRadius: "14px",
    color: "#0B1F5E",
    fontWeight: "700",
    marginBottom: "12px",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.4fr 1.5fr 1.2fr 1.2fr 1.2fr",
    gap: "15px",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: "16px",
    borderRadius: "14px",
    color: "#334155",
    marginBottom: "12px",
  },

  userName: {
    color: "#0B1F5E",
    fontWeight: "700",
  },

  progressWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "13px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    marginTop: "30px",
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

export default ProgressReportsPage;