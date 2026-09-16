import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";

function HomePage() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  ];

  const courseSections = [
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
            onClick={() => navigate("/login")}
          />
        </div>

        <nav style={styles.navLinks}>
          <button
            style={styles.homeButton}
            onClick={() => navigate("/login")}
          >
            Home
          </button>

          <button
            style={styles.loginButton}
            onClick={() => navigate("/login")}
          >
            Login / Signup
          </button>

          <button style={styles.contactButton}>
            Contact Us
          </button>
        </nav>
      </header>

      <section style={styles.heroSection}>
        <div
          style={styles.carouselContainer}
          onClick={() => navigate("/login")}
        >
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
            Learn, track, and grow through one
            centralized platform
          </h2>

          <p style={styles.aboutText}>
            DOST Academy supports employee learning
            by providing access to courses,
            assessments, certifications, and
            progress tracking in one easy-to-use
            system.
          </p>

          <div style={styles.highlightBox}>
            <p>✔ Easy access to learning materials</p>
            <p>✔ Progress and certificate tracking</p>
            <p>✔ Structured training experience</p>
          </div>

          <button
            style={styles.exploreButton}
            onClick={() => navigate("/login")}
          >
            Explore Courses
          </button>
        </div>
      </section>

      <section style={styles.cardsSection}>
        {courseSections.map((section, index) => (
          <div
            key={index}
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
              onClick={() => navigate("/login")}
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
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  searchIcon: {
    position: "relative",
    left: "38px",
    zIndex: 1,
    color: "#64748B",
    fontSize: "18px",
  },

  searchInput: {
    width: "340px",
    padding: "12px 18px 12px 45px",
    borderRadius: "30px",
    border: "1px solid #CBD5E1",
    outline: "none",
    fontSize: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },

  navLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
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

  loginButton: {
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },

  contactButton: {
    backgroundColor: "#0B1F5E",
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
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
    cursor: "pointer",
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

  exploreButton: {
    marginTop: "20px",
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  cardsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    padding: "0 40px 40px",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 15px rgba(0,0,0,0.05)",
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
    fontSize: "20px",
  },

  cardItem: {
    color: "#475569",
  },

  viewButton: {
    marginTop: "10px",
    backgroundColor: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 14px",
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

export default HomePage;