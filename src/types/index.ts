export interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_admin' | 'data_manager' | 'support_agent';
}

export interface UploadResult {
  uploadId: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ErrorRow[];
  data: Record<string, string>[];
}

export interface ErrorRow {
  rowNumber: number;
  data: Record<string, string>;
  errorMessage: string;
}

export type University = 'GGU' | 'Edgewood' | 'Rushford' | 'ESGCI';
export type DataType = 'student-list' | 'grade-sheet' | 'calling-data';

export interface UploadRecord {
  uploadId: string;
  fileName: string;
  dataType: DataType;
  university?: University;
  program?: string;
  uploadedAt: string;
  uploadedBy: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: 'success' | 'partial' | 'failed';
}

export interface Stats {
  totalUploadsToday: number;
  totalStudents: number;
  totalCallingRecords: number;
  lastSyncTime: string | null;
}

export const UNIVERSITIES: Record<University, string[]> = {
  GGU: ['MBA', 'DBA', 'MS Management'],
  Edgewood: ['MBA', 'DBA'],
  Rushford: ['MBA', 'Executive MBA'],
  ESGCI: ['MBA', 'MSc Management'],
};

export const UNIVERSITY_NAMES: Record<University, string> = {
  GGU: 'Golden Gate University',
  Edgewood: 'Edgewood University',
  Rushford: 'Rushford Business School',
  ESGCI: 'ESGCI Paris',
};

export const ROLE_DISPLAY: Record<User['role'], string> = {
  system_admin: 'System Administrator',
  data_manager: 'Data Manager',
  support_agent: 'Support Agent',
};
