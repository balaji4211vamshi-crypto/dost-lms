import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { forgotPassword } from "../api/auth";
import { apiErrorMessage } from "../api/client";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not send the reset link. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <img src={logo} alt="DOST Logo" style={styles.logo} />

        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.subtitle}>
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        {sent ? (
          <p style={styles.success}>
            If an account exists for that email, a password reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              style={styles.input}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link to="/login" style={styles.backLink}>
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)",
    fontFamily: "Arial",
  },

  container: {
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },

  logo: {
    width: "90px",
    marginBottom: "15px",
  },

  title: {
    margin: "10px 0 5px",
    color: "#0B1F5E",
  },

  subtitle: {
    marginBottom: "20px",
    color: "#64748B",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  error: {
    color: "#DC2626",
    fontSize: "13px",
    marginBottom: "12px",
  },

  success: {
    color: "#16A34A",
    fontSize: "14px",
    marginBottom: "20px",
  },

  input: {
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
  },

  button: {
    padding: "12px",
    backgroundColor: "#0B1F5E",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },

  backLink: {
    display: "inline-block",
    marginTop: "20px",
    color: "#2563EB",
    fontSize: "13px",
    textDecoration: "none",
  },
};

export default ForgotPasswordPage;
