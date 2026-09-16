import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Certificates, Enrolments } from "../api/resources";

function CertificatesPage() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [inProgressCount, setInProgressCount] = useState(0);
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
    Promise.all([Certificates.list(), Enrolments.list()])
      .then(([certRes, enrolRes]) => {
        setCertificates(
          (certRes.data || []).map((c) => ({
            certificate_id: c.certificate_id,
            title: c.course?.title || "Course",
            date: c.issued_date ? new Date(c.issued_date).toLocaleDateString() : "-",
            certNumber: c.certificate_number,
            status: "Completed",
          }))
        );
        setInProgressCount((enrolRes.data || []).filter((e) => e.status === "in_progress").length);
      })
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDownload = (cert) => {
    Certificates.download(cert.certificate_id, `${cert.certNumber}.pdf`).catch(() => {
      alert("Could not download the certificate.");
    });
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Certificates</p>
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

            <button
              style={styles.navButton}
              onClick={() => navigate("/assignments")}
            >
              Assignments
            </button>

            <button style={styles.activeButton}>
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

      <main style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.label}>MY ACHIEVEMENTS</p>
          <h1 style={styles.heading}>Certificates</h1>
          <p style={styles.text}>
            View your completed course certificates and learning achievements.
          </p>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Certificates</h3>
            <p style={styles.statValue}>{certificates.length}</p>
          </div>

          <div style={styles.statCard}>
            <h3>Completed Courses</h3>
            <p style={styles.statValue}>{certificates.length}</p>
          </div>

          <div style={styles.statCard}>
            <h3>In Progress</h3>
            <p style={styles.statValue}>{inProgressCount}</p>
          </div>
        </section>

        {loading && <p style={{ color: "#64748B" }}>Loading certificates...</p>}
        {!loading && certificates.length === 0 && (
          <p style={{ color: "#64748B" }}>No certificates yet — complete a course to earn one.</p>
        )}
        <section style={styles.grid}>
          {certificates.map((cert) => (
            <div key={cert.certificate_id} style={styles.card}>
              <div style={styles.certTop}>
                <span style={styles.certIcon}>🎓</span>
                <span style={styles.status}>{cert.status}</span>
              </div>

              <h2 style={styles.certTitle}>{cert.title}</h2>

              <p style={styles.certText}>
                <strong>Issued Date:</strong> {cert.date}
              </p>

              <p style={styles.certText}>
                <strong>Certificate ID:</strong> {cert.certNumber}
              </p>

              <div style={styles.buttonRow}>
                <button style={styles.downloadButton} onClick={() => handleDownload(cert)}>
                  Download
                </button>
              </div>
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
    gap: "15px",
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
    alignItems: "center",
    flexWrap: "wrap",
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
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.15)",
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

  container: {
    padding: "35px",
  },

  hero: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.06)",
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
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  statValue: {
    color: "#2563EB",
    fontSize: "30px",
    fontWeight: "700",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "22px",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
    borderTop: "5px solid #2563EB",
  },

  certTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  certIcon: {
    fontSize: "32px",
  },

  status: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },

  certTitle: {
    color: "#0B1F5E",
    fontSize: "21px",
    marginBottom: "14px",
  },

  certText: {
    color: "#475569",
    lineHeight: "1.6",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  downloadButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  viewButton: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default CertificatesPage;