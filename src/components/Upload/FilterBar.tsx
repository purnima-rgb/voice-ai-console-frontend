import React from 'react';
import { University, UNIVERSITIES, UNIVERSITY_NAMES } from '../../types';

export type FilterDataType = 'student-list' | 'grade-sheet' | 'calling-data' | '';

const DATA_TYPE_LABEL: Record<Exclude<FilterDataType, ''>, string> = {
  'student-list': 'Student List',
  'grade-sheet': 'Grade Sheet',
  'calling-data': 'Calling Data',
};

interface FilterBarProps {
  university: University | '';
  program: string;
  dataType: FilterDataType;
  onUniversityChange: (u: University | '') => void;
  onProgramChange: (p: string) => void;
  onDataTypeChange: (d: FilterDataType) => void;
  /**
   * When set, the Data Type dropdown is locked to this value and disabled.
   * Useful on screens like Calling Data Upload where the data type is fixed.
   */
  lockedDataType?: Exclude<FilterDataType, ''>;
}

export default function FilterBar({
  university,
  program,
  dataType,
  onUniversityChange,
  onProgramChange,
  onDataTypeChange,
  lockedDataType,
}: FilterBarProps) {
  const programs = university ? UNIVERSITIES[university] : [];
  const isDataTypeLocked = !!lockedDataType;
  const effectiveDataType = lockedDataType ?? dataType;

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as University | '';
    onUniversityChange(val);
    onProgramChange(''); // reset program on university change
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* University */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            University <span className="text-red-500">*</span>
          </label>
          <select
            value={university}
            onChange={handleUniversityChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select university...</option>
            {(Object.keys(UNIVERSITIES) as University[]).map((u) => (
              <option key={u} value={u}>
                {UNIVERSITY_NAMES[u]}
              </option>
            ))}
          </select>
        </div>

        {/* Program */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Program <span className="text-red-500">*</span>
          </label>
          <select
            value={program}
            onChange={(e) => onProgramChange(e.target.value)}
            disabled={!university}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select program...</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Data Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Data Type <span className="text-red-500">*</span>
          </label>
          <select
            value={effectiveDataType}
            disabled={isDataTypeLocked}
            onChange={(e) => onDataTypeChange(e.target.value as FilterDataType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {isDataTypeLocked ? (
              <option value={lockedDataType}>{DATA_TYPE_LABEL[lockedDataType]}</option>
            ) : (
              <>
                <option value="">Select data type...</option>
                <option value="student-list">Student List</option>
                <option value="grade-sheet">Grade Sheet</option>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
