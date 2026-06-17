import api from './api'

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
}

// ── Attendance ────────────────────────────────────────────────
export const attendanceApi = {
  markAttendance:  (data) => api.post('/attendance/mark', data),
  getTodayStatus:  ()     => api.get('/attendance/today'),
  getMyHistory:    (page = 0, size = 20) =>
    api.get(`/attendance/my-history?page=${page}&size=${size}`),
  getMyDashboard:  ()     => api.get('/attendance/my-summary'),
}

// ── Teacher self-service ──────────────────────────────────────
export const teacherApi = {
  getProfile:      ()       => api.get('/teacher/profile'),
  updateProfile:   (data)   => api.patch('/teacher/profile', data),
  getDashboard:    ()       => api.get('/teacher/dashboard'),
  getHistory:      (page, size) =>
    api.get(`/teacher/attendance/history?page=${page}&size=${size}`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Teachers
  getTeachers:       (params) => api.get('/admin/teachers', { params }),
  getTeacher:        (id)     => api.get(`/admin/teachers/${id}`),
  createTeacher:     (data)   => api.post('/admin/teachers', data),
  updateTeacher:     (id, data) => api.put(`/admin/teachers/${id}`, data),
  toggleTeacher:     (id)     => api.patch(`/admin/teachers/${id}/toggle-status`),
  deleteTeacher:     (id)     => api.delete(`/admin/teachers/${id}`),

  // Centers
  getCenters:        ()       => api.get('/admin/centers'),
  getCenter:         (id)     => api.get(`/admin/centers/${id}`),
  createCenter:      (data)   => api.post('/admin/centers', data),
  updateCenter:      (id, data) => api.put(`/admin/centers/${id}`, data),
  toggleCenter:      (id)     => api.patch(`/admin/centers/${id}/toggle-status`),
  deleteCenter:      (id)     => api.delete(`/admin/centers/${id}`),

  // Programs
  getPrograms:       ()       => api.get('/admin/programs'),
  createProgram:     (data)   => api.post('/admin/programs', data),
  updateProgram:     (id, data) => api.put(`/admin/programs/${id}`, data),
  toggleProgram:     (id)     => api.patch(`/admin/programs/${id}/toggle-status`),
  deleteProgram:     (id)     => api.delete(`/admin/programs/${id}`),

  // Attendance
  getAttendance:     (params) => api.get('/admin/attendance', { params }),

  // Export
  exportAttendance:  (params) =>
    api.get('/admin/export/attendance', {
      params,
      responseType: 'blob',
    }),
}
