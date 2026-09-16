import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Courses, Certificates, Enrolments } from "../api/resources";
import { apiErrorMessage } from "../api/client";

function ManageCertificatesPage() {
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [eligibleLearners, setEligibleLearners] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");

  const loadCertificates = () => {
    setLoading(true);
    Certificates.list({ all: 1, per_page: 100 })
      .then((res) => setCertificates(res.data || []))
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadCertificates();
    Courses.list({ per_page: 100 }).then((res) => setCourses(res.data || [])).catch(() => setCourses([]));
  }, [navigate]);

  const openForm = () => {
    setShowForm(true);
    setError("");
    setSelectedCourse("");
    setSelectedUser("");
    setEligibleLearners([]);
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedUser("");
    if (!courseId) {
      setEligibleLearners([]);
      return;
    }
    try {
      const res = await Enrolments.list({ all: 1, course_id: courseId, per_page: 100 });
      setEligibleLearners((res.data || []).filter((e) => e.status === "completed"));
    } catch (err) {
      setEligibleLearners([]);
    }
  };

  const handleIssue = async () => {
    if (!selectedCourse || !selectedUser) {
      setError("Choose a course and a learner first.");
      return;
    }
    setIssuing(true);
    setError("");
    try {
      await Certificates.issue(selectedCourse, selectedUser);
      setShowForm(false);
      loadCertificates();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not issue this certificate."));
    } finally {
      setIssuing(false);
    }
  };

  const handleDownload = (certificate) => {
    Certificates.download(certificate.certificate_id, `${certificate.certificate_number}.pdf`).catch(() => {
      alert("Could not download this certificate.");
    });
  };

  const totalCertificates = certificates.length;
  const employeesCertified = new Set(certificates.map((c) => c.user_id)).size;

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
            <p style={styles.subtitle}>Manage Certificates</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search certificates..."
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

            <button style={styles.activeButton}>Certificates</button>

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
            <p style={styles.label}>CERTIFICATE MANAGEMENT</p>

            <h1 style={styles.heading}>Manage Certificates</h1>

            <p style={styles.text}>
              Generate, view, and manage employee learning certificates from one
              centralized admin panel.
            </p>
          </div>

          <button style={styles.primaryButton} onClick={openForm}>+ Generate Certificate</button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎓</span>
            <h3 style={styles.statTitle}>Total Certificates</h3>
            <p style={styles.statValue}>{totalCertificates}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <h3 style={styles.statTitle}>Issued</h3>
            <p style={styles.statValue}>{totalCertificates}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>⏳</span>
            <h3 style={styles.statTitle}>Pending</h3>
            <p style={styles.statValue}>0</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statTitle}>Employees Certified</h3>
            <p style={styles.statValue}>{employeesCertified}</p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Certificate Records</h2>
            <button style={styles.smallButton} onClick={() => window.print()}>Export Records</button>
          </div>

          {showForm && (
            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "14px", marginBottom: "20px" }}>
              <h3 style={{ color: "#0B1F5E" }}>Generate Certificate</h3>
              {error && <p style={{ color: "#DC2626" }}>{error}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "10px" }}>
                <select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>{c.title}</option>
                  ))}
                </select>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                  <option value="">Select learner (completed only)...</option>
                  {eligibleLearners.map((e) => (
                    <option key={e.user_id} value={e.user_id}>{e.user?.name || `User #${e.user_id}`}</option>
                  ))}
                </select>
              </div>
              {selectedCourse && eligibleLearners.length === 0 && (
                <p style={{ color: "#92400E", marginTop: "10px" }}>No learners have completed this course yet.</p>
              )}
              <div style={{ marginTop: "16px" }}>
                <button style={styles.primaryButton} onClick={handleIssue} disabled={issuing}>
                  {issuing ? "Issuing..." : "Issue Certificate"}
                </button>{" "}
                <button style={styles.smallButton} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {loading && <p style={{ color: "#64748B" }}>Loading certificates...</p>}
          <div style={styles.certificateGrid}>
            {certificates.map((certificate) => (
              <div
                key={certificate.certificate_id}
                style={styles.certificateCard}
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
                  <span style={styles.certIcon}>🎓</span>

                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                    }}
                  >
                    Issued
                  </span>
                </div>

                <h3 style={styles.certTitle}>{certificate.course?.title || "Course"}</h3>

                <p style={styles.certText}>
                  <strong>Employee:</strong> {certificate.user?.name || "-"}
                </p>

                <p style={styles.certText}>
                  <strong>Certificate ID:</strong> {certificate.certificate_number}
                </p>

                <p style={styles.certText}>
                  <strong>Issued Date:</strong> {certificate.issued_date ? new Date(certificate.issued_date).toLocaleDateString() : "-"}
                </p>

                <div style={styles.buttonRow}>
                  <button style={styles.downloadButton} onClick={() => handleDownload(certificate)}>Download</button>
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

  certificateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "22px",
  },

  certificateCard: {
    backgroundColor: "#F8FAFC",
    padding: "22px",
    borderRadius: "18px",
    borderTop: "5px solid #2563EB",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  certIcon: {
    fontSize: "32px",
  },

  certTitle: {
    color: "#0B1F5E",
    fontSize: "20px",
    marginBottom: "14px",
  },

  certText: {
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

  viewButton: {
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  downloadButton: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  editButton: {
    backgroundColor: "#F0FDF4",
    color: "#166534",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default ManageCertificatesPage;