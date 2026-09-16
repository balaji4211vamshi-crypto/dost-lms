import client from "./client";

// --- Courses ---
export const Courses = {
  list: (params) => client.get("/courses", { params }).then((r) => r.data),
  get: (id) => client.get(`/courses/${id}`).then((r) => r.data),
  create: (payload) => client.post("/courses", payload).then((r) => r.data),
  update: (id, payload) => client.put(`/courses/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/courses/${id}`).then((r) => r.data),
  uploadMaterial: (courseId, formData) =>
    client
      .post(`/courses/${courseId}/materials`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  removeMaterial: (courseId, materialId) =>
    client.delete(`/courses/${courseId}/materials/${materialId}`).then((r) => r.data),
};

// --- Enrolments ---
export const Enrolments = {
  list: (params) => client.get("/enrolments", { params }).then((r) => r.data),
  enrol: (courseId) => client.post(`/courses/${courseId}/enrol`).then((r) => r.data),
  updateProgress: (enrolmentId, payload) =>
    client.put(`/enrolments/${enrolmentId}/progress`, payload).then((r) => r.data),
  unenrol: (enrolmentId) => client.delete(`/enrolments/${enrolmentId}`).then((r) => r.data),
};

// --- Assignments & quizzes ---
export const Assignments = {
  listForCourse: (courseId) => client.get(`/courses/${courseId}/assignments`).then((r) => r.data),
  get: (id) => client.get(`/assignments/${id}`).then((r) => r.data),
  create: (courseId, payload) => client.post(`/courses/${courseId}/assignments`, payload).then((r) => r.data),
  update: (id, payload) => client.put(`/assignments/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/assignments/${id}`).then((r) => r.data),
};

// --- Submissions ---
export const Submissions = {
  mine: (params) => client.get("/my-submissions", { params }).then((r) => r.data),
  forAssignment: (assignmentId, params) =>
    client.get(`/assignments/${assignmentId}/submissions`, { params }).then((r) => r.data),
  submitQuiz: (assignmentId, answers) =>
    client.post(`/assignments/${assignmentId}/submissions`, { quiz_answers: answers }).then((r) => r.data),
  submitFile: (assignmentId, formData) =>
    client
      .post(`/assignments/${assignmentId}/submissions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  grade: (submissionId, payload) => client.put(`/submissions/${submissionId}/grade`, payload).then((r) => r.data),
};

// --- Certificates ---
export const Certificates = {
  list: (params) => client.get("/certificates", { params }).then((r) => r.data),
  issue: (courseId, userId) =>
    client.post(`/courses/${courseId}/certificates/issue`, { user_id: userId }).then((r) => r.data),
  downloadUrl: (certificateId) => `${client.defaults.baseURL}/certificates/${certificateId}/download`,
  download: async (certificateId, filename) => {
    const response = await client.get(`/certificates/${certificateId}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || `certificate-${certificateId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// --- Progress reports ---
export const ProgressReports = {
  list: (params) => client.get("/progress-reports", { params }).then((r) => r.data),
};

// --- Admin: users ---
export const Users = {
  list: (params) => client.get("/users", { params }).then((r) => r.data),
  get: (id) => client.get(`/users/${id}`).then((r) => r.data),
  create: (payload) => client.post("/users", payload).then((r) => r.data),
  update: (id, payload) => client.put(`/users/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/users/${id}`).then((r) => r.data),
};

// --- Mock external LMS integration (US18/US19) ---
export const Lms = {
  status: () => client.get("/lms/status").then((r) => r.data),
  syncCourse: (courseId) => client.post(`/lms/courses/${courseId}/sync`).then((r) => r.data),
  syncCertificate: (certificateId) => client.post(`/lms/certificates/${certificateId}/sync`).then((r) => r.data),
};
