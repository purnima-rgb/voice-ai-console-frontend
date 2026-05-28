import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStats, fetchUploadHistory } from '../../services/api';
import { Stats, UploadRecord } from '../../types';

const statusColors: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

const dataTypeLabels: Record<string, string> = {
  'student-list': 'Student List',
  'grade-sheet': 'Grade Sheet',
  'calling-data': 'Calling Data',
};

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchStats(), fetchUploadHistory()])
      .then(([s, h]) => {
        setStats(s);
        setHistory(h.uploads.slice(0, 10));
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards: StatCard[] = [
    {
      label: 'Uploads Today',
      value: stats?.totalUploadsToday ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Students in System',
      value: stats?.totalStudents ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Calling Records',
      value: stats?.totalCallingRecords ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Last Sync',
      value: stats?.lastSyncTime
        ? new Date(stats.lastSyncTime).toLocaleString()
        : 'Never',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome back, {user?.name}!</h2>
        <p className="text-indigo-100 text-sm mt-1">
          Here's an overview of your Voice AI data management console.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm"
              >
                <div className={`rounded-xl p-3 ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent uploads */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Recent Upload History</h3>
              <p className="text-sm text-gray-500 mt-0.5">Latest 10 file uploads</p>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No uploads yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                      <th className="px-6 py-3 text-left font-medium">File</th>
                      <th className="px-6 py-3 text-left font-medium">Type</th>
                      <th className="px-6 py-3 text-left font-medium">University</th>
                      <th className="px-6 py-3 text-left font-medium">Total</th>
                      <th className="px-6 py-3 text-left font-medium">Valid</th>
                      <th className="px-6 py-3 text-left font-medium">Errors</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-left font-medium">Uploaded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((record) => (
                      <tr key={record.uploadId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 max-w-[200px] truncate font-medium text-gray-700">
                          {record.fileName}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {dataTypeLabels[record.dataType] || record.dataType}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {record.university || '—'}
                          {record.program ? ` / ${record.program}` : ''}
                        </td>
                        <td className="px-6 py-3 text-gray-600">{record.totalRows}</td>
                        <td className="px-6 py-3 text-green-600 font-medium">{record.validRows}</td>
                        <td className="px-6 py-3 text-red-500">{record.errorRows}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[record.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(record.uploadedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
