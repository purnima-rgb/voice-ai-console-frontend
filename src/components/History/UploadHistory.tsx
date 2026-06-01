import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchUploadHistory,
  downloadErrorReport,
  downloadUnifiedCSVForUpload,
  downloadRawFileForUpload,
} from '../../services/api';
import {
  University,
  UploadRecord,
  UNIVERSITIES,
  UNIVERSITY_NAMES,
} from '../../types';
import Button from '../Common/Button';

/**
 * Upload History — full audit trail of every file uploaded to the system,
 * tagged with (university, program, data type, uploader, timestamp).
 *
 * This is the visible proof that every client upload is persisted at our
 * end. Student list / grade sheet uploads happen infrequently; calling
 * data uploads happen frequently — this page handles both transparently.
 *
 * Filters narrow the list down to a single (university, program, dataType)
 * combination so it's easy to audit, for example, "all calling data
 * uploaded for GGU MBA in the last month".
 */

type DataTypeFilter = '' | 'student-list' | 'grade-sheet' | 'calling-data';

const DATA_TYPE_LABEL: Record<Exclude<DataTypeFilter, ''>, string> = {
  'student-list': 'Student List',
  'grade-sheet':  'Grade Sheet',
  'calling-data': 'Calling Data',
};

const DATA_TYPE_BADGE: Record<Exclude<DataTypeFilter, ''>, string> = {
  'student-list': 'bg-indigo-100 text-indigo-700',
  'grade-sheet':  'bg-purple-100 text-purple-700',
  'calling-data': 'bg-cyan-100 text-cyan-700',
};

const STATUS_BADGE: Record<UploadRecord['status'], { bg: string; label: string }> = {
  success: { bg: 'bg-green-100 text-green-700', label: 'Saved' },
  partial: { bg: 'bg-yellow-100 text-yellow-700', label: 'Partial (legacy)' },
  failed:  { bg: 'bg-red-100 text-red-700',     label: 'Rejected' },
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function UploadHistory() {
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const initialDataType = (searchParams.get('dataType') || '') as DataTypeFilter;
  const [dataType, setDataType]     = useState<DataTypeFilter>(initialDataType);
  const [university, setUniversity] = useState<University | ''>('');
  const [program, setProgram]       = useState('');
  const [uploads, setUploads]       = useState<UploadRecord[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Support agents can only see calling-data history
  const dataTypeOptions: Array<{ value: DataTypeFilter; label: string }> =
    user?.role === 'support_agent'
      ? [{ value: 'calling-data', label: 'Calling Data' }]
      : [
          { value: '',              label: 'All data types' },
          { value: 'student-list',  label: 'Student List' },
          { value: 'grade-sheet',   label: 'Grade Sheet' },
          { value: 'calling-data',  label: 'Calling Data' },
        ];

  // Lock support-agents to calling-data on mount
  useEffect(() => {
    if (user?.role === 'support_agent' && dataType !== 'calling-data') {
      setDataType('calling-data');
    }
  }, [user, dataType]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchUploadHistory({
        dataType: dataType || undefined,
        university: university || undefined,
        program: program || undefined,
      });
      setUploads(res.uploads);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to load upload history.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataType, university, program]);

  const programs = university ? UNIVERSITIES[university] : [];

  // Aggregate stats for the currently-filtered set
  const stats = useMemo(() => {
    const total = uploads.length;
    const totalRows = uploads.reduce((s, u) => s + u.totalRows, 0);
    const validRows = uploads.reduce((s, u) => s + u.validRows, 0);
    const errorRows = uploads.reduce((s, u) => s + u.errorRows, 0);
    const failed = uploads.filter((u) => u.status === 'failed').length;
    return { total, totalRows, validRows, errorRows, failed };
  }, [uploads]);

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-indigo-800">Upload Audit Trail</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Every file you upload &mdash; Student List, Grade Sheet, or Calling Data &mdash;
            is saved here with its University, Program, and timestamp.
            Nothing is overwritten; older uploads remain for audit. The most
            recent successful upload for each student is the active data
            served to the Voice AI system.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data Type</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as DataTypeFilter)}
              disabled={user?.role === 'support_agent'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {dataTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">University</label>
            <select
              value={university}
              onChange={(e) => { setUniversity(e.target.value as University | ''); setProgram(''); }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All universities</option>
              {(Object.keys(UNIVERSITIES) as University[]).map((u) => (
                <option key={u} value={u}>{UNIVERSITY_NAMES[u]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Program</label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              disabled={!university}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All programs</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Uploads</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{stats.totalRows.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Rows</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.validRows.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">Valid Rows</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.errorRows.toLocaleString()}</p>
          <p className="text-xs text-red-600 mt-1">Error Rows</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.failed}</p>
          <p className="text-xs text-yellow-700 mt-1">Rejected Uploads</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Uploads table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Uploads</h3>
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">No uploads found</p>
            <p className="text-xs mt-1">Try changing the filters or upload some data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Data Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">University</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Program</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">File</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Valid</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Errors</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {uploads.map((u, i) => {
                  const badge = STATUS_BADGE[u.status];
                  const dtBadge = DATA_TYPE_BADGE[u.dataType];
                  return (
                    <tr
                      key={u.uploadId}
                      className={i % 2 === 0 ? 'bg-white hover:bg-indigo-50/40' : 'bg-gray-50/50 hover:bg-indigo-50/40'}
                    >
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{formatDate(u.uploadedAt)}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${dtBadge}`}>
                          {DATA_TYPE_LABEL[u.dataType]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                        {u.university ? UNIVERSITY_NAMES[u.university as University] || u.university : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{u.program || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap max-w-[260px] truncate" title={u.fileName}>
                        {u.fileName}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700 whitespace-nowrap font-mono">{u.totalRows}</td>
                      <td className="px-4 py-2.5 text-right text-green-700 whitespace-nowrap font-mono">{u.validRows}</td>
                      <td className={`px-4 py-2.5 text-right whitespace-nowrap font-mono ${u.errorRows > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                        {u.errorRows}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">{u.uploadedBy}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {u.errorRows > 0 && (
                            <button
                              onClick={() => downloadErrorReport(u.uploadId)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              Error report
                            </button>
                          )}
                          {u.dataType === 'calling-data' && u.status === 'success' && (
                            <button
                              onClick={async () => {
                                try {
                                  await downloadUnifiedCSVForUpload(u.uploadId);
                                } catch (err) {
                                  setError((err as Error).message || 'Failed to download unified CSV.');
                                }
                              }}
                              className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline"
                              title="Download the unified Voice AI CSV snapshot generated when this upload landed"
                            >
                              Unified CSV
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                await downloadRawFileForUpload(u.uploadId);
                              } catch (err) {
                                setError((err as Error).message || 'Failed to download original file.');
                              }
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800 hover:underline"
                            title="Download the original uploaded file as the client sent it (from Supabase Storage)"
                          >
                            Original
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
