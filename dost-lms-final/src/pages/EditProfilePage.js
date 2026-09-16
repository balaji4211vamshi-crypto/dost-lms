import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { getStoredUser, isLoggedIn, updateProfile } from "../api/auth";
import { Enrolments } from "../api/resources";

function EditProfilePage() {
  const navigate = useNavigate();
  const stored = getStoredUser();
  const [form, setForm] = useState({
    name: stored?.name || "",
    email: stored?.email || "",
    department: stored?.department || "",
    job_title: stored?.job_title || "",
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    Enrolments.list()
      .then((res) =>
        setEnrolledCourses(
          (res.data || []).map((e) => ({
            course_id: e.course_id,
            title: e.course?.title || "Course",
            progress: `${e.progress}%`,
          }))
        )
      )
      .catch(() => setEnrolledCourses([]));
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateProfile({
        name: form.name,
        department: form.department,
        job_title: form.job_title,
      });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Edit Profile</p>
          </div>
        </div>

        <button style={styles.homeButton} onClick={() => navigate("/user-home")}>
          Home
        </button>
      </header>

      <main style={styles.container}>
        <section style={styles.profileCard}>
          <h1 style={styles.heading}>Edit Profile</h1>
          <p style={styles.text}>Manage your basic details and learning information.</p>

          {message && <p style={{ color: "#2563EB" }}>{message}</p>}

          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label style={styles.label}>Email</label>
              <input style={styles.input} value={form.email} readOnly />
            </div>

            <div>
              <label style={styles.label}>Department</label>
              <input
                style={styles.input}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div>
              <label style={styles.label}>Job Title</label>
              <input
                style={styles.input}
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>
          </div>

          <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </section>

        <section style={styles.courseCard}>
          <h2 style={styles.sectionTitle}>Enrolled Courses</h2>

          {enrolledCourses.length === 0 && <p style={styles.courseText}>No enrolled courses yet.</p>}
          {enrolledCourses.map((course) => (
            <div key={course.course_id} style={styles.courseRow}>
              <div>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.courseText}>Current Progress: {course.progress}</p>
              </div>

              <button style={styles.viewButton} onClick={() => navigate("/courses")}>
                View
              </button>
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

  homeButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  container: {
    padding: "35px",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "25px",
  },

  profileCard: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },

  courseCard: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },

  heading: {
    color: "#0B1F5E",
    marginBottom: "8px",
  },

  text: {
    color: "#64748B",
    marginBottom: "25px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  label: {
    display: "block",
    color: "#0B1F5E",
    fontWeight: "600",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    backgroundColor: "#F8FAFC",
  },

  saveButton: {
    marginTop: "25px",
    backgroundColor: "#0B1F5E",
    color: "#ffffff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#0B1F5E",
    marginBottom: "20px",
  },

  courseRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "12px",
  },

  courseTitle: {
    margin: 0,
    color: "#0B1F5E",
    fontSize: "16px",
  },

  courseText: {
    margin: "6px 0 0",
    color: "#64748B",
  },

  viewButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default EditProfilePage;