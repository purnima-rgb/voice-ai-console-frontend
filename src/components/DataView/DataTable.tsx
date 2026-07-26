import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUploadHistory, fetchUploadRows } from '../../services/api';
import {
  University,
  UNIVERSITIES,
  UNIVERSITY_NAMES,
  AgentUseCase,
  AGENT_USE_CASES,
  AGENT_DISPLAY_NAMES,
  UploadRecord,
} from '../../types';
import Button from '../Common/Button';

/**
 * View Data — browse the validated rows from a specific agent-data upload.
 *
 * Agent uploads don't accumulate into one aggregate table the way the old
 * student-list/grade-sheet/calling-data flow did — each upload is its own
 * immutable snapshot. So this screen: filter uploads by University / Program
 * / Agent, pick one from the list, and view its stored rows.
 */
export default function DataTable() {
  const { user } = useAuth();

  if (!user || (user.role !== 'system_admin' && user.role !== 'data_manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-500 font-medium">Access Denied</p>
          <p className="text-gray-400 text-sm mt-1">You don't have permission to view this data.</p>
        </div>
      </div>
    );
  }

  const [university, setUniversity] = useState<University | ''>('');
  const [program, setProgram] = useState('');
  const [agentType, setAgentType] = useState<AgentUseCase | ''>('');
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState('');
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState('');

  const programs = university ? UNIVERSITIES[university] : [];

  const loadUploads = async () => {
    setLoadingUploads(true);
    setError('');
    try {
      const res = await fetchUploadHistory({
        dataType: agentType || undefined,
        university: university || undefined,
        program: program || undefined,
      });
      const successful = res.uploads.filter((u) => u.status === 'success');
      setUploads(successful);
      setSelectedUploadId(successful[0]?.uploadId || '');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to load upload history'
      );
    } finally {
      setLoadingUploads(false);
    }
  };

  useEffect(() => {
    loadUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [university, program, agentType]);

  useEffect(() => {
    if (!selectedUploadId) {
      setData([]);
      setTotal(0);
      return;
    }
    setLoadingRows(true);
    setError('');
    fetchUploadRows(selectedUploadId)
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        setError(
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Failed to load upload rows'
        );
      })
      .finally(() => setLoadingRows(false));
  }, [selectedUploadId]);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUniversity(e.target.value as University | '');
    setProgram('');
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const selectedUpload = useMemo(
    () => uploads.find((u) => u.uploadId === selectedUploadId),
    [uploads, selectedUploadId]
  );

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">University</label>
          <select
            value={university}
            onChange={handleUniversityChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Agent</label>
          <select
            value={agentType}
            onChange={(e) => setAgentType(e.target.value as AgentUseCase | '')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All agents</option>
            {AGENT_USE_CASES.map((a) => (
              <option key={a} value={a}>{AGENT_DISPLAY_NAMES[a]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Upload</label>
          <select
            value={selectedUploadId}
            onChange={(e) => setSelectedUploadId(e.target.value)}
            disabled={uploads.length === 0}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {uploads.length === 0 && <option value="">No successful uploads found</option>}
            {uploads.map((u) => (
              <option key={u.uploadId} value={u.uploadId}>
                {new Date(u.uploadedAt).toLocaleString()} — {u.fileName} ({u.validRows} rows)
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <Button variant="secondary" size="md" onClick={loadUploads} disabled={loadingUploads}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-700 text-sm">
              {selectedUpload
                ? `${AGENT_DISPLAY_NAMES[selectedUpload.dataType as AgentUseCase] || selectedUpload.dataType} — ${selectedUpload.university || 'all'} / ${selectedUpload.program || 'all'}`
                : 'Select an upload'}
            </h3>
            <span className="text-xs text-gray-400">
              {columns.length} columns &bull; {total} rows
            </span>
          </div>
        </div>

        {loadingUploads || loadingRows ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs mt-1">Upload agent data first, or adjust the filters above.</p>
          </div>
        ) : (
          /* Both horizontal AND vertical scrollbars — hard requirement */
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] scrollbar-thin">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50 whitespace-nowrap">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-colors hover:bg-indigo-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{i + 1}</td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2.5 text-gray-600 whitespace-nowrap max-w-[250px] truncate text-xs"
                        title={row[col]}
                      >
                        {row[col] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
