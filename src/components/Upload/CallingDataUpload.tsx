import React, { useState, useCallback, useRef } from 'react';
import { uploadCallingData, downloadErrorReport } from '../../services/api';
import { University, UploadResult } from '../../types';
import Button from '../Common/Button';
import FilterBar from './FilterBar';

export default function CallingDataUpload() {
  const [university, setUniversity] = useState<University | ''>('');
  const [program, setProgram] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtersComplete = !!(university && program);
  const canUpload = filtersComplete && !!file && !isUploading;

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
    if (!file || !university || !program) return;
    setIsUploading(true);
    setError('');
    setResult(null);
    try {
      const res = await uploadCallingData(file, university, program);
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
        dataType="calling-data"
        onUniversityChange={setUniversity}
        onProgramChange={setProgram}
        onDataTypeChange={() => {}}
        lockedDataType="calling-data"
      />

      {/* Info banner */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-cyan-700">Calling Data Upload</p>
          <p className="text-xs text-cyan-600 mt-0.5">
            Upload the unified Voice AI calling output CSV. Required columns: Email ID, First Name,
            Last Name, Contact, University, Program, Query Type, Scheduled Date, Scheduled Time, Agent Name.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-cyan-400 bg-cyan-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-cyan-300 hover:bg-cyan-50',
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-base font-medium text-gray-600">
              Drag & drop your Calling Data CSV here
            </p>
            <p className="text-sm text-gray-400">or click to browse</p>
            <p className="text-xs text-gray-300 mt-1">CSV files only, up to 50MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
            {isUploading ? 'Uploading...' : 'Upload Calling Data'}
          </Button>
          {!filtersComplete && (
            <span className="text-sm text-gray-400">
              {!university ? 'Select a university' : 'Select a program'}
            </span>
          )}
          {filtersComplete && !file && (
            <span className="text-sm text-gray-400">Choose a CSV file to upload</span>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
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

          {/* Actions */}
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
              <div className="px-5 py-3 border-b border-gray-100">
                <h4 className="font-medium text-gray-700 text-sm">
                  Calling Data Preview (first {result.data.length} rows)
                </h4>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-96 scrollbar-thin">
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
        </div>
      )}
    </div>
  );
}
