import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dost-logo.png";
import { logout as apiLogout, isLoggedIn } from "../api/auth";
import { Users } from "../api/resources";
import { apiErrorMessage } from "../api/client";

const emptyForm = { name: "", email: "", password: "", role: "employee", department: "", job_title: "" };

function ManageUsersPage() {
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const logout = async () => {
    await apiLogout();
    navigate("/login");
  };

  const loadUsers = () => {
    setLoading(true);
    Users.list({ per_page: 100 })
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingId(user.user_id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      job_title: user.job_title || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await Users.update(editingId, payload);
      } else {
        await Users.create(form);
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save this user."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Deactivate ${user.name}?`)) return;
    try {
      await Users.remove(user.user_id);
      loadUsers();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not deactivate this user."));
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const departmentCount = new Set(users.map((u) => u.department).filter(Boolean)).size;

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />

          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Manage Users</p>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="Search users..."
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

            <button style={styles.activeButton}>Users</button>

            <button
              style={styles.navButton}
              onClick={() => navigate("/manage-courses")}
            >
              Courses
            </button>

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
            <p style={styles.label}>ADMIN MANAGEMENT</p>

            <h1 style={styles.heading}>Manage Users</h1>

            <p style={styles.text}>
              View, add, edit, and manage employee accounts, departments, roles,
              and user status.
            </p>
          </div>

          <button style={styles.primaryButton} onClick={openAddForm}>+ Add User</button>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statTitle}>Total Users</h3>
            <p style={styles.statValue}>{totalUsers}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>✅</span>
            <h3 style={styles.statTitle}>Active Users</h3>
            <p style={styles.statValue}>{totalUsers}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🏢</span>
            <h3 style={styles.statTitle}>Departments</h3>
            <p style={styles.statValue}>{departmentCount}</p>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>🔐</span>
            <h3 style={styles.statTitle}>Admins</h3>
            <p style={styles.statValue}>{adminCount}</p>
          </div>
        </section>

        {showForm && (
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>{editingId ? "Edit User" : "Add User"}</h2>
            {error && <p style={{ color: "#DC2626" }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "12px" }}>
              <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              <input
                placeholder={editingId ? "New password (optional)" : "Password"}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}
              />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
              <input placeholder="Job title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }} />
            </div>
            <div style={{ marginTop: "16px" }}>
              <button style={styles.primaryButton} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>{" "}
              <button style={styles.smallButton} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </section>
        )}

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>User List</h2>
            <button style={styles.smallButton} onClick={() => window.print()}>Export List</button>
          </div>

          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Name</span>
              <span>Email</span>
              <span>Department</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loading && <p style={{ padding: "12px", color: "#64748B" }}>Loading...</p>}
            {!loading && users.length === 0 && <p style={{ padding: "12px", color: "#64748B" }}>No users found.</p>}
            {users.map((user) => (
              <div key={user.user_id} style={styles.tableRow}>
                <span style={styles.userName}>{user.name}</span>
                <span>{user.email}</span>
                <span>{user.department || "-"}</span>
                <span>{user.role}</span>

                <span style={styles.statusBadge}>Active</span>

                <span style={styles.actionButtons}>
                  <button style={styles.editButton} onClick={() => openEditForm(user)}>Edit</button>
                  <button style={styles.deleteButton} onClick={() => handleDelete(user)}>Delete</button>
                </span>
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
    overflowX: "auto",
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

  table: {
    minWidth: "1000px",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1fr 1fr 1.2fr",
    gap: "15px",
    backgroundColor: "#EEF2FF",
    padding: "16px",
    borderRadius: "14px",
    color: "#0B1F5E",
    fontWeight: "700",
    marginBottom: "12px",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1fr 1fr 1.2fr",
    gap: "15px",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: "16px",
    borderRadius: "14px",
    color: "#334155",
    marginBottom: "12px",
  },

  userName: {
    color: "#0B1F5E",
    fontWeight: "700",
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    textAlign: "center",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
  },

  editButton: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    border: "none",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    border: "none",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default ManageUsersPage;