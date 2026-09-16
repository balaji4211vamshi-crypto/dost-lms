import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserLandingPage from "./pages/UserLandingPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import CertificatesPage from "./pages/CertificatesPage";
import EditProfilePage from "./pages/EditProfilePage";
import CourseDetailsPage from "./pages/CourseDetailsPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ManageCoursesPage from "./pages/ManageCoursesPage";
import ManageAssignmentsPage from "./pages/ManageAssignmentsPage";
import ManageCertificatesPage from "./pages/ManageCertificatesPage";
import ProgressReportsPage from "./pages/ProgressReportsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/user-home" element={<UserLandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/course-details" element={<CourseDetailsPage />} />

        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/manage-users" element={<ManageUsersPage />} />
        <Route path="/manage-courses" element={<ManageCoursesPage />} />
        <Route path="/manage-assignments" element={<ManageAssignmentsPage />} />
        <Route path="/manage-certificates" element={<ManageCertificatesPage />} />
        <Route path="/progress-reports" element={<ProgressReportsPage />} />
      </Routes>
    </Router>
  );
}

export default App;