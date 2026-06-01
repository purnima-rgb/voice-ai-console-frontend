export interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_admin' | 'data_manager' | 'support_agent';
}

export interface UploadResult {
  uploadId: string;
  /**
   * True only when every row passed validation. The backend rejects partial
   * uploads — when success=false, no data was saved and the user must fix
   * the errors and re-upload.
   */
  success: boolean;
  totalRows: number;
  /** Always 0 when success=false (partial saves are disallowed). */
  validRows: number;
  errorRows: number;
  errors: ErrorRow[];
  data: Record<string, string>[];
  /**
   * True when a calling-data upload succeeded and the backend generated +
   * stored a Voice AI unified-input CSV snapshot for it. Frontend uses this
   * to decide whether to show the "Download Unified CSV" button.
   */
  unifiedCsvAvailable?: boolean;
}

export interface ErrorRow {
  rowNumber: number;
  data: Record<string, string>;
  errorMessage: string;
}

export type University = 'GGU';
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
};

export const UNIVERSITY_NAMES: Record<University, string> = {
  GGU: 'Golden Gate University',
};

export const ROLE_DISPLAY: Record<User['role'], string> = {
  system_admin: 'System Administrator',
  data_manager: 'Data Manager',
  support_agent: 'Support Agent',
};
