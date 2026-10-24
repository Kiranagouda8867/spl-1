import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
};

export const usersService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  listUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

export const coursesService = {
  list: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  enrollStudents: (id, studentIds) => api.post(`/courses/${id}/enroll`, { studentIds }),
  assignFaculty: (id, facultyIds) => api.post(`/courses/${id}/faculty`, { facultyIds }),
  removeStudent: (courseId, studentId) => api.delete(`/courses/${courseId}/enroll/${studentId}`),
};

export const assignmentsService = {
  list: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

export const submissionsService = {
  submit: (formData) => api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMine: (params) => api.get('/submissions/mine', { params }),
  getMySubmissionForAssignment: (assignmentId) =>
    api.get(`/submissions/mine/${assignmentId}`),
  getForAssignment: (assignmentId, params) =>
    api.get(`/submissions/assignment/${assignmentId}`, { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  downloadUrl: (id) => `/api/submissions/${id}/download`,
};

export const evaluationsService = {
  grade: (data) => api.post('/evaluations', data),
  getForSubmission: (submissionId) => api.get(`/evaluations/submission/${submissionId}`),
  getForAssignment: (assignmentId) => api.get(`/evaluations/assignment/${assignmentId}`),
  exportCSV: (assignmentId) =>
    api.get(`/evaluations/assignment/${assignmentId}/export`, { responseType: 'blob' }),
  getMine: () => api.get('/evaluations/mine'),
};

export const notificationsService = {
  list: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  createUser: (data) => api.post('/admin/users', data),
};

export const healthService = {
  check: () => api.get('/health'),
  ready: () => api.get('/health/ready'),
};
