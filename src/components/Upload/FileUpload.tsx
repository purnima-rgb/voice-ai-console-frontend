import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadStudentList, uploadGradeSheet, downloadErrorReport } from '../../services/api';
import { University, UploadResult } from '../../types';
import FilterBar, { FilterDataType } from './FilterBar';
import Button from '../Common/Button';

export default function FileUpload() {
  const { user } = useAuth();

  // Access guard
  if (!user || (user.role !== 'system_admin' && user.role !== 'data_manager')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-gray-500 font-medium">Access Denied</p>
          <p className="text-gray-400 text-sm mt-1">You don't have permission to upload student data.</p>
        </div>
      </div>
    );
  }

  const [university, setUniversity] = useState<University | ''>('');
  const [program, setProgram] = useState('');
  const [dataType, setDataType] = useState<FilterDataType>('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = university && program && dataType && file && !isUploading;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setResult(null);
      setError('');
    } else {
      setError('Only CSV files are accepted.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !university || !program || !dataType) return;
    setIsUploading(true);
    setError('');
    setResult(null);

    try {
      let res: UploadResult;
      if (dataType === 'student-list') {
        res = await uploadStudentList(file, university, program);
      } else {
        res = await uploadGradeSheet(file, university, program);
      }
      setResult(res);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        university={university}
        program={program}
        dataType={dataType}
        onUniversityChange={(u) => { setUniversity(u); handleReset(); }}
        onProgramChange={(p) => { setProgram(p); handleReset(); }}
        onDataTypeChange={(d) => { setDataType(d); handleReset(); }}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base font-semibold text-gray-700">{file.name}</p>
            <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-base font-medium text-gray-600">
              Drag & drop your CSV file here
            </p>
            <p className="text-sm text-gray-400">or click to browse</p>
            <p className="text-xs text-gray-300 mt-1">CSV files only, up to 50MB</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Upload button */}
      {!result && (
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            isLoading={isUploading}
            disabled={!canUpload}
            onClick={handleUpload}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
          {!canUpload && !isUploading && (
            <p className="text-sm text-gray-400">
              {!university ? 'Select a university' :
               !program ? 'Select a program' :
               !dataType ? 'Select data type' :
               'Select a CSV file to upload'}
            </p>
          )}
        </div>
      )}

      {/* Upload result */}
      {result && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{result.totalRows}</p>
              <p className="text-xs text-gray-500 mt-1">Total Rows</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{result.validRows}</p>
              <p className="text-xs text-green-600 mt-1">Valid Rows</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${result.errorRows > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-2xl font-bold ${result.errorRows > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                {result.errorRows}
              </p>
              <p className={`text-xs mt-1 ${result.errorRows > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                Error Rows
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {result.errorRows > 0 && (
              <Button
                variant="danger"
                size="md"
                onClick={() => downloadErrorReport(result.uploadId)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Error Report
              </Button>
            )}
            <Button variant="secondary" size="md" onClick={handleReset}>
              Upload Another File
            </Button>
          </div>

          {/* Data preview */}
          {result.data.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-medium text-gray-700 text-sm">
                  Data Preview (first {result.data.length} rows)
                </h4>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-80 scrollbar-thin">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {Object.keys(result.data[0]).map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.data.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-4 py-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error preview */}
          {result.errors.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-red-100 bg-red-50">
                <h4 className="font-medium text-red-700 text-sm">
                  Error Details (first {result.errors.length} errors)
                </h4>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-60 scrollbar-thin">
                <table className="min-w-full text-xs">
                  <thead className="bg-red-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b border-red-100">Row #</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b border-red-100">Error</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 border-b border-red-100">Email ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {result.errors.map((err, i) => (
                      <tr key={i} className="hover:bg-red-50">
                        <td className="px-4 py-2 text-gray-600">{err.rowNumber}</td>
                        <td className="px-4 py-2 text-red-600">{err.errorMessage}</td>
                        <td className="px-4 py-2 text-gray-500">{err.data['Email ID'] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
