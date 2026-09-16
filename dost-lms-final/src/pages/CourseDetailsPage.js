import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Courses, Enrolments } from "../api/resources";

function CourseDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");

  const courseId = location.state?.courseId;

  const handleLogout = async () => {
    await apiLogout();
    navigate("/login");
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    if (!courseId) {
      navigate("/courses");
      return;
    }
    Courses.get(courseId)
      .then((data) => setCourse(data))
      .catch(() => setMessage("Could not load this course."))
      .finally(() => setLoading(false));
  }, [courseId, navigate]);

  const handleEnrol = async () => {
    setEnrolling(true);
    setMessage("");
    try {
      await Enrolments.enrol(courseId);
      const refreshed = await Courses.get(courseId);
      setCourse(refreshed);
      setMessage("You're enrolled! Head to Assignments to get started.");
    } catch (err) {
      setMessage("Could not enrol in this course. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={styles.page}>
        <p style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Course not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Course Details</p>
          </div>
        </div>

        <div style={styles.navLinks}>
          <button
            style={styles.navButton}
            onClick={() => navigate("/user-home")}
          >
            Home
          </button>

          <button
            style={styles.activeButton}
            onClick={() => navigate("/courses")}
          >
            Courses
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
                <p style={styles.dropdownItem} onClick={() => navigate("/dashboard")}>
                  Dashboard
                </p>

                <p style={styles.dropdownItem} onClick={() => navigate("/assignments")}>
                  Assignments
                </p>

                <p style={styles.dropdownItem} onClick={() => navigate("/edit-profile")}>
                  Edit Profile
                </p>

                <p style={styles.dropdownItem} onClick={() => navigate("/certificates")}>
                  Certificates
                </p>

                <p style={styles.logoutItem} onClick={handleLogout}>
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.leftSection}>
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            alt="Course"
            style={styles.courseImage}
          />
        </div>

        <div style={styles.rightSection}>
          <p style={styles.label}>COURSE DETAILS</p>

          <h1 style={styles.heading}>{course.title}</h1>

          <p style={styles.description}>{course.description}</p>

          <div style={styles.infoBox}>
            <p><strong>Duration:</strong> {course.duration || "-"}</p>
            <p><strong>Level:</strong> {course.level}</p>
            <p><strong>Department:</strong> {course.department || "-"}</p>
            {course.my_enrolment && (
              <p><strong>Your progress:</strong> {course.my_enrolment.progress}% ({course.my_enrolment.status.replace("_", " ")})</p>
            )}
          </div>

          {message && <p style={{ color: "#2563EB", marginBottom: "12px" }}>{message}</p>}

          {course.my_enrolment ? (
            <button style={styles.navButton} onClick={() => navigate("/assignments")}>
              Go to Assignments
            </button>
          ) : (
            <button style={styles.enrollButton} onClick={handleEnrol} disabled={enrolling}>
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}

          {course.materials && course.materials.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ color: "#0B1F5E" }}>Course Materials</h3>
              {course.materials.map((material) => (
                <p key={material.material_id} style={{ margin: "8px 0" }}>
                  <a href={material.url} target="_blank" rel="noreferrer">{material.title}</a>
                </p>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)",
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

  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    padding: "50px",
    alignItems: "center",
  },

  leftSection: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },

  courseImage: {
    width: "100%",
    borderRadius: "15px",
    height: "400px",
    objectFit: "cover",
  },

  rightSection: {
    backgroundColor: "#ffffff",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },

  label: {
    color: "#2563EB",
    fontWeight: "700",
  },

  heading: {
    color: "#0B1F5E",
    fontSize: "36px",
    marginBottom: "15px",
  },

  description: {
    color: "#475569",
    lineHeight: "1.8",
    marginBottom: "20px",
  },

  infoBox: {
    backgroundColor: "#F8FAFC",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "20px",
    lineHeight: "1.8",
    color: "#0B1F5E",
  },

  enrollButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },
};

export default CourseDetailsPage;