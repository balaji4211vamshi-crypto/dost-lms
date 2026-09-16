import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, getStoredUser, isLoggedIn } from "../api/auth";

function UserLandingPage() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const user = getStoredUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  const images = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  ];

  const sections = [
    {
      title: "Most Enrolled Courses",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    },

    {
      title: "Top Rated Courses",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978",
    },

    {
      title: "Free Courses",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    },

    {
      title: "Curriculum-Based Courses",
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    },

    {
      title: "Cybersecurity Courses",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    },

    {
      title: "Digital Transformation Courses",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    },

    {
      title: "Leadership Courses",
      image:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    },

    {
      title: "Career Development Courses",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    },

    {
      title: "Recommended Courses",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

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
            <h2 style={styles.title}>DOST Academy</h2>

            <p style={styles.subtitle}>
              Learning Management System
            </p>
          </div>
        </div>

        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>

          <input
            type="text"
            placeholder="Search courses..."
            style={styles.searchInput}
          />
        </div>

        <nav style={styles.navLinks}>
          <button
            style={styles.homeButton}
            onClick={() => navigate("/user-home")}
          >
            Home
          </button>

          <div style={styles.profileWrapper}>
            <button
              style={styles.profileButton}
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
            >
              {user ? user.name : "My Profile"} ▾
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
                    navigate("/edit-profile")
                  }
                >
                  Edit Profile
                </p>

                <p
                  style={styles.dropdownItem}
                  onClick={() =>
                    navigate("/certificates")
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
        </nav>
      </header>

      <section style={styles.heroSection}>
        <div style={styles.carouselContainer}>
          <img
            src={images[currentImage]}
            alt="DOST Academy slide"
            style={styles.carouselImage}
          />

          <div style={styles.dotsContainer}>
            {images.map((_, index) => (
              <span
                key={index}
                style={{
                  ...styles.dot,
                  backgroundColor:
                    currentImage === index
                      ? "#2563EB"
                      : "#CBD5E1",
                }}
              />
            ))}
          </div>
        </div>

        <div style={styles.aboutSection}>
          <p style={styles.smallLabel}>About Us</p>

          <h2 style={styles.aboutTitle}>
            Learn, track, and grow through one centralized
            platform
          </h2>

          <p style={styles.aboutText}>
            DOST Academy supports employee learning
            through courses, assessments,
            certifications, and progress tracking.
          </p>

          <div style={styles.highlightBox}>
            <p>✔ Easy access to learning materials</p>
            <p>✔ Progress and certificate tracking</p>
            <p>✔ Structured training experience</p>
          </div>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/courses")}
          >
            Explore Courses
          </button>
        </div>
      </section>

      <section style={styles.cardsSection}>
        {sections.map((section, index) => (
          <div
            key={index}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-8px)";

              e.currentTarget.style.boxShadow =
                "0 12px 28px rgba(0,0,0,0.14)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";

              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(0,0,0,0.05)";
            }}
          >
            <div style={styles.imageWrapper}>
              <img
                src={section.image}
                alt={section.title}
                style={styles.cardImage}
              />
            </div>

            <h2 style={styles.cardTitle}>
              {section.title}
            </h2>

            {section.title ===
              "Most Enrolled Courses" && (
              <>
                <p style={styles.cardItem}>
                  Project Management
                </p>

                <p style={styles.cardItem}>
                  Cloud Computing Basics
                </p>

                <p style={styles.cardItem}>
                  Data Analytics
                </p>
              </>
            )}

            {section.title ===
              "Top Rated Courses" && (
              <>
                <p style={styles.cardItem}>
                  Cybersecurity Fundamentals
                </p>

                <p style={styles.cardItem}>
                  AI & Machine Learning
                </p>

                <p style={styles.cardItem}>
                  Leadership Excellence
                </p>
              </>
            )}

            {section.title === "Free Courses" && (
              <>
                <p style={styles.cardItem}>
                  Introduction to Python
                </p>

                <p style={styles.cardItem}>
                  Communication Skills
                </p>

                <p style={styles.cardItem}>
                  Microsoft Excel Basics
                </p>
              </>
            )}

            {section.title ===
              "Curriculum-Based Courses" && (
              <>
                <p style={styles.cardItem}>
                  Database Management
                </p>

                <p style={styles.cardItem}>
                  Software Engineering
                </p>

                <p style={styles.cardItem}>
                  Network Security
                </p>
              </>
            )}

            {section.title ===
              "Cybersecurity Courses" && (
              <>
                <p style={styles.cardItem}>
                  Ethical Hacking
                </p>

                <p style={styles.cardItem}>
                  Digital Forensics
                </p>

                <p style={styles.cardItem}>
                  Information Security
                </p>
              </>
            )}

            {section.title ===
              "Digital Transformation Courses" && (
              <>
                <p style={styles.cardItem}>
                  Cloud Infrastructure
                </p>

                <p style={styles.cardItem}>
                  Business Automation
                </p>

                <p style={styles.cardItem}>
                  Data Transformation
                </p>
              </>
            )}

            {section.title ===
              "Leadership Courses" && (
              <>
                <p style={styles.cardItem}>
                  Strategic Leadership
                </p>

                <p style={styles.cardItem}>
                  Team Management
                </p>

                <p style={styles.cardItem}>
                  Decision Making
                </p>
              </>
            )}

            {section.title ===
              "Career Development Courses" && (
              <>
                <p style={styles.cardItem}>
                  Resume Building
                </p>

                <p style={styles.cardItem}>
                  Interview Preparation
                </p>

                <p style={styles.cardItem}>
                  Professional Communication
                </p>
              </>
            )}

            {section.title ===
              "Recommended Courses" && (
              <>
                <p style={styles.cardItem}>
                  Advanced React Development
                </p>

                <p style={styles.cardItem}>
                  Cloud Security
                </p>

                <p style={styles.cardItem}>
                  UI/UX Fundamentals
                </p>
              </>
            )}

            <button
              style={styles.viewButton}
              onClick={() => navigate("/courses")}
            >
              View Courses
            </button>
          </div>
        ))}
      </section>

      <section style={styles.contactSection}>
        <h2 style={styles.contactTitle}>Contact Us</h2>

        <div style={styles.contactIcons}>
          <span>📧 info@dost.gov.ph</span>
          <span>📞 (+632) 8837 2071</span>
          <span>Facebook</span>
          <span>Instagram</span>
        </div>
      </section>

      <footer style={styles.footer}>
        © 2026 DOST Academy. All rights reserved.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #F0F7FF, #EAF2FB, #F5F3FF)",
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
    width: "60px",
  },

  title: {
    margin: 0,
    color: "#0B1F5E",
  },

  subtitle: {
    margin: 0,
    color: "#64748B",
    fontSize: "14px",
  },

  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #CBD5E1",
    borderRadius: "30px",
    padding: "0 14px",
    width: "340px",
    height: "48px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  searchIcon: {
    fontSize: "18px",
    marginRight: "10px",
    color: "#64748B",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "15px",
    color: "#0B1F5E",
    backgroundColor: "transparent",
  },

  navLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  homeButton: {
    backgroundColor: "#DBEAFE",
    color: "#2563EB",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },

  profileWrapper: {
    position: "relative",
  },

  profileButton: {
    backgroundColor: "#0B1F5E",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
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

  heroSection: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
    padding: "40px",
  },

  carouselContainer: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },

  carouselImage: {
    width: "100%",
    height: "430px",
    objectFit: "cover",
    borderRadius: "15px",
  },

  dotsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "15px",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },

  aboutSection: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },

  smallLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },

  aboutTitle: {
    color: "#0B1F5E",
    fontSize: "28px",
  },

  aboutText: {
    color: "#475569",
    lineHeight: "1.7",
  },

  highlightBox: {
    backgroundColor: "#EEF2FF",
    padding: "15px",
    borderRadius: "12px",
    color: "#0B1F5E",
  },

  primaryButton: {
    marginTop: "10px",
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },

  cardsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    padding: "0 50px 40px",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "18px",
    borderRadius: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  imageWrapper: {
    width: "100%",
    height: "155px",
    overflow: "hidden",
    borderRadius: "14px",
    marginBottom: "14px",
  },

  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter:
      "brightness(0.92) contrast(1.08) saturate(1.15)",
  },

  cardTitle: {
    color: "#0B1F5E",
    fontSize: "19px",
    marginBottom: "10px",
  },

  cardItem: {
    color: "#475569",
    fontSize: "14px",
    margin: "6px 0",
  },

  viewButton: {
    marginTop: "10px",
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "9px 13px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },

  contactSection: {
    textAlign: "center",
    padding: "30px",
  },

  contactTitle: {
    color: "#0B1F5E",
  },

  contactIcons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  footer: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#ffffff",
  },
};

export default UserLandingPage;