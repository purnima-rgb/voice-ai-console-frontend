import axios from 'axios';
import { UploadResult, UploadRecord, Stats } from '../types';

// API base URL — defaults to local dev backend; override in production
// via the VITE_API_URL env var (set in Vercel project settings).
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function login(email: string, password: string): Promise<{ token: string; user: import('../types').User }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getMe(): Promise<import('../types').User> {
  const res = await api.get('/auth/me');
  return res.data.user;
}

export async function uploadStudentList(
  file: File,
  university: string,
  program: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('university', university);
  formData.append('program', program);

  const res = await api.post('/upload/student-list', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadGradeSheet(
  file: File,
  university: string,
  program: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('university', university);
  formData.append('program', program);

  const res = await api.post('/upload/grade-sheet', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadCallingData(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/upload/calling-data', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function fetchStudentList(university?: string, program?: string): Promise<{ data: Record<string, string>[]; total: number }> {
  const params: Record<string, string> = {};
  if (university) params.university = university;
  if (program) params.program = program;
  const res = await api.get('/data/student-list', { params });
  return res.data;
}

export async function fetchGradeSheet(university?: string, program?: string): Promise<{ data: Record<string, string>[]; total: number }> {
  const params: Record<string, string> = {};
  if (university) params.university = university;
  if (program) params.program = program;
  const res = await api.get('/data/grade-sheet', { params });
  return res.data;
}

export async function fetchCallingData(): Promise<{ data: Record<string, string>[]; total: number }> {
  const res = await api.get('/data/calling-data');
  return res.data;
}

export async function fetchUploadHistory(): Promise<{ uploads: UploadRecord[]; total: number }> {
  const res = await api.get('/data/upload-history');
  return res.data;
}

export async function fetchStats(): Promise<Stats> {
  const res = await api.get('/data/stats');
  return res.data;
}

export async function downloadUnifiedCSV(): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch('http://localhost:3001/api/data/unified-csv', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to download unified CSV');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unified-voice-ai-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadErrorReport(uploadId: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`http://localhost:3001/api/upload/error-report/${uploadId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to download error report');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `error-report-${uploadId}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default api;
