import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { login, register } from "../api/auth";
import { apiErrorMessage } from "../api/client";

function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });

  const goToLandingPage = (user) => {
    navigate(user.role === "admin" ? "/admin-dashboard" : "/user-home");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password);
      goToLandingPage(user);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not log in. Check your email and password."));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        password_confirmation: signupForm.password,
      });
      goToLandingPage(user);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <img src={logo} alt="DOST Logo" style={styles.logo} />

        <h2 style={styles.title}>DOST Academy System</h2>
        <p style={styles.subtitle}>Centralized Learning Management System</p>

        <div style={styles.tabRow}>
          <button
            style={activeTab === "login" ? styles.activeTab : styles.tab}
            onClick={() => { setActiveTab("login"); setError(""); }}
          >
            Login
          </button>

          <button
            style={activeTab === "signup" ? styles.activeTab : styles.tab}
            onClick={() => { setActiveTab("signup"); setError(""); }}
          >
            Signup
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {activeTab === "login" ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              style={styles.input}
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />

            <div style={styles.options}>
              <label>
                <input type="checkbox" /> Remember
              </label>

              <button type="button" style={styles.forgot} onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={styles.form}>
            <input
              type="text"
              placeholder="Full Name"
              style={styles.input}
              required
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              style={styles.input}
              required
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              style={styles.input}
              required
              minLength={8}
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Creating account..." : "Signup"}
            </button>
          </form>
        )}
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
  },

  tabRow: {
    display: "flex",
    marginBottom: "20px",
    background: "#F1F5F9",
    borderRadius: "10px",
  },

  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  activeTab: {
    flex: 1,
    padding: "10px",
    border: "none",
    background: "#2563EB",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
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

  input: {
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
  },

  options: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    fontSize: "13px",
  },

  forgot: {
    border: "none",
    background: "none",
    color: "#2563EB",
    cursor: "pointer",
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
};

export default LoginPage;
