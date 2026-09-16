import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Courses } from "../api/resources";
import { apiErrorMessage } from "../api/client";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
];

const emptyForm = { title: "", department: "", duration: "", level: "Beginner", description: "", is_published: true };

function ManageCoursesPage() {
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCourses = () => {
    setLoading(true);
    Courses.list({ per_page: 100 })
      .then((res) =>
        setCourses((res.data || []).map((c, i) => ({ ...c, image: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length] })))
      )
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setEditingId(course.course_id);
    setForm({
      title: course.title,
      department: course.department || "",
      duration: course.duration || "",
      level: course.level,
      description: course.description || "",
      is_published: course.is_published,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await Courses.update(editingId, form);
      } else {
        await Courses.create(form);
      }
      setShowForm(false);
      loadCourses();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this course."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"?`)) return;
    try {
      await Courses.remove(course.course_id);
      loadCourses();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not delete this course."));
    }
  };

  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.is_published).length;
  const departmentCount = new Set(courses.map((c) => c.department).filter(Boolean)).size;
  const enrolledTotal = courses.reduce((sum, c) => sum + (c.enrolments_count || 0), 0);

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
            <p style={styles.subtitle}>Manage Courses</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search courses..."
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

            <button style={styles.activeButton}>Courses</button>

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
            <p style={styles.label}>COURSE MANAGEMENT</p>

            <h1 style={styles.heading}>Manage Courses</h1>

            <p style={styles.text}>
              Add, update, organize, and monitor courses across departments.
            </p>
          </div>

          <button style={styles.primaryButton} onClick={openAddForm}>+ Add Course</button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>📘</span>
            <h3 style={styles.statTitle}>Total Courses</h3>
            <p style={styles.statValue}>{totalCourses}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <h3 style={styles.statTitle}>Active Courses</h3>
            <p style={styles.statValue}>{activeCourses}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🏢</span>
            <h3 style={styles.statTitle}>Departments</h3>
            <p style={styles.statValue}>{departmentCount}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🎓</span>
            <h3 style={styles.statTitle}>Enrolled Users</h3>
            <p style={styles.statValue}>{enrolledTotal}</p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Course List</h2>
            <button style={styles.smallButton} onClick={() => window.print()}>Export Courses</button>
          </div>

          {showForm && (
            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "14px", marginBottom: "20px" }}>
              <h3 style={{ color: "#0B1F5E" }}>{editingId ? "Edit Course" : "Add Course"}</h3>
              {error && <p style={{ color: "#DC2626" }}>{error}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "10px" }}>
                <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                <input placeholder="Duration (e.g. 4 weeks)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", gridColumn: "1 / span 2" }}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />{" "}
                  Published
                </label>
              </div>
              <div style={{ marginTop: "16px" }}>
                <button style={styles.primaryButton} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>{" "}
                <button style={styles.smallButton} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {loading && <p style={{ color: "#64748B" }}>Loading courses...</p>}
          <div style={styles.courseGrid}>
            {courses.map((course) => (
              <div
                key={course.course_id}
                style={styles.courseCard}
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
                <img
                  src={course.image}
                  alt={course.title}
                  style={styles.courseImage}
                />

                <h3 style={styles.courseTitle}>{course.title}</h3>

                <p style={styles.courseText}>
                  <strong>Department:</strong> {course.department}
                </p>

                <p style={styles.courseText}>
                  <strong>Duration:</strong> {course.duration}
                </p>

                <p style={styles.courseText}>
                  <strong>Level:</strong> {course.level}
                </p>

                <span style={styles.statusBadge}>{course.is_published ? "Active" : "Draft"}</span>

                <div style={styles.buttonRow}>
                  <button style={styles.editButton} onClick={() => openEditForm(course)}>Edit</button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(course)}>Delete</button>
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

  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px",
  },

  courseCard: {
    backgroundColor: "#F8FAFC",
    padding: "18px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  courseImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "14px",
    marginBottom: "15px",
  },

  courseTitle: {
    color: "#0B1F5E",
    marginBottom: "10px",
    fontSize: "18px",
  },

  courseText: {
    color: "#475569",
    marginBottom: "8px",
    fontSize: "14px",
  },

  statusBadge: {
    display: "inline-block",
    backgroundColor: "#DCFCE7",
    color: "#166534",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    marginTop: "8px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  editButton: {
    flex: 1,
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    border: "none",
    padding: "9px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    border: "none",
    padding: "9px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default ManageCoursesPage;