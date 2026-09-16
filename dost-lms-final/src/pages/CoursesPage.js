import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Courses } from "../api/resources";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789",
];

function groupByDepartment(courses) {
  const groups = {};
  courses.forEach((course, index) => {
    const dept = course.department || "General";
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push({
      ...course,
      image: PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length],
    });
  });
  return Object.keys(groups).map((name) => ({ name, courses: groups[name] }));
}

function CoursesPage() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    Courses.list({ search: search || undefined, per_page: 100 })
      .then((res) => setDepartments(groupByDepartment(res.data || [])))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, search]);


  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

  const CourseCard = ({ course }) => (
    <div
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 15px rgba(0,0,0,0.05)";
      }}
    >
      <img
        src={course.image}
        alt={course.title}
        style={styles.courseImage}
      />

      <h3 style={styles.courseTitle}>
        {course.title}
      </h3>

      <p style={styles.description}>
        {course.description}
      </p>

      <p style={styles.courseText}>
        Duration: {course.duration}
      </p>

      <p style={styles.courseText}>
        Level: {course.level}
      </p>

      <button
        style={styles.button}
        onClick={() =>
          navigate("/course-details", { state: { courseId: course.course_id } })
        }
      >
        View Course
      </button>
    </div>
  );

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img
            src={logo}
            alt="DOST Logo"
            style={styles.logo}
          />

          <div>
            <h2 style={styles.title}>
              DOST Academy
            </h2>

            <p style={styles.subtitle}>
              Centralized Learning Platform
            </p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search courses..."
              style={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.navLinks}>
            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/user-home")
              }
            >
              Home
            </button>

            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Dashboard
            </button>

            <button style={styles.activeButton}>
              Courses
            </button>

            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/assignments")
              }
            >
              Assignments
            </button>

            <button
              style={styles.navButton}
              onClick={() =>
                navigate("/certificates")
              }
            >
              Certificates
            </button>

            <div style={styles.profileWrapper}>
              <button
                style={styles.profileButton}
                onClick={() =>
                  setShowProfileMenu(
                    !showProfileMenu
                  )
                }
              >
                My Profile ▾
              </button>

              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <p
                    style={styles.dropdownItem}
                    onClick={() =>
                      navigate("/dashboard")
                    }
                  >
                    Dashboard
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() =>
                      navigate("/courses")
                    }
                  >
                    Courses
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() =>
                      navigate("/assignments")
                    }
                  >
                    Assignments
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() =>
                      navigate(
                        "/edit-profile"
                      )
                    }
                  >
                    Edit Profile
                  </p>

                  <p
                    style={styles.dropdownItem}
                    onClick={() =>
                      navigate(
                        "/certificates"
                      )
                    }
                  >
                    Certificates
                  </p>

                  <p
                    style={styles.logoutItem}
                    onClick={logout}
                  >
                    Logout
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {loading && <p style={{ textAlign: "center", color: "#64748B", padding: "20px" }}>Loading courses...</p>}
      {!loading && departments.length === 0 && (
        <p style={{ textAlign: "center", color: "#64748B", padding: "20px" }}>No courses found.</p>
      )}
      {departments.map(
        (department, index) => (
          <section
            key={index}
            style={styles.courseSection}
          >
            <h2 style={styles.sectionTitle}>
              {department.name}
            </h2>

            <div style={styles.grid}>
              {department.courses.map(
                (course, courseIndex) => (
                  <CourseCard
                    key={courseIndex}
                    course={course}
                  />
                )
              )}
            </div>
          </section>
        )
      )}
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

  courseSection: {
    padding: "35px 40px 10px",
  },

  sectionTitle: {
    color: "#0B1F5E",
    marginBottom: "20px",
    fontSize: "28px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "18px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
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
  },

  description: {
    color: "#475569",
    lineHeight: "1.5",
    marginBottom: "12px",
  },

  courseText: {
    color: "#475569",
    marginBottom: "8px",
  },

  button: {
    marginTop: "12px",
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default CoursesPage;