import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { resetPassword } from "../api/auth";
import { apiErrorMessage } from "../api/client";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const missingLink = !email || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not reset your password. The link may have expired."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <img src={logo} alt="DOST Logo" style={styles.logo} />

        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>
          {email ? `Setting a new password for ${email}` : "Enter a new password for your account."}
        </p>

        {missingLink && (
          <p style={styles.error}>
            This reset link is missing information. Please use the link from your email, or
            request a new one.
          </p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {success ? (
          <p style={styles.success}>
            Password reset successful. Redirecting you to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="password"
              placeholder="New password (min. 8 characters)"
              style={styles.input}
              required
              minLength={8}
              disabled={missingLink}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              style={styles.input}
              required
              minLength={8}
              disabled={missingLink}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />

            <button type="submit" style={styles.button} disabled={loading || missingLink}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <Link to="/forgot-password" style={styles.backLink}>
          Request a new link
        </Link>
        <br />
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
    marginTop: "12px",
    color: "#2563EB",
    fontSize: "13px",
    textDecoration: "none",
  },
};

export default ResetPasswordPage;
