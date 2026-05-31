import { useMemo, useState } from 'react';
import Button from '../Common/Button';

/**
 * Reference data screen.
 *
 * Shows the expected layout + sample rows for both Student List and Grade
 * Sheet uploads, with each column visually marked as mandatory or optional.
 * Clients use this as a template when preparing their own files.
 *
 * Both data types use the "opt-out" validation model: every column present
 * in the uploaded file is required EXCEPT those listed as optional. Column
 * names vary across MBA / DBA / GGU ET, but the optional set stays fixed.
 */

// ─────────────────────────────────────────────────────────────────────────────
//   Student List dataset
// ─────────────────────────────────────────────────────────────────────────────

const STUDENT_OPTIONAL = new Set([
  'Last Name',
  'Prism User ID',
  'GGU User ID',
  'GGU Email',
  'Region',
  'Concentration',
]);

/** Columns whose values should be Excel-text-formatted (long digit strings). */
const STUDENT_TEXT_COLS = new Set([
  'Contact',
  'User ID',
  'GGU User ID',
  'Prism User ID',
]);

const STUDENT_HEADERS = [
  'Email', 'First Name', 'Last Name', 'User ID', 'Prism User ID',
  'GGU User ID', 'GGU Email', 'Cohort #', 'Cohort ID', 'Launch Month',
  'GGU Term Id', 'Batch', 'Status', 'Country of  Residence', 'Region',
  'Contact', 'Package Key', 'Status Details', 'Cohort Status', 'Concentration',
  'Learner Type',
];

const STUDENT_ROWS: string[][] = [
  [
    'naveena.manoj03@mail.com', 'Naveena', 'Manoj', '6032552', '', '622263',
    'nmanoj1@my.ggu.edu', 'C17', '5594', '24/10', '22/UU', 'Domestic',
    'Inactive', 'India', 'Tier 1', '918928220913', 'masters-management-ggu-pp',
    'Graduated', 'Closed', 'MBA.MKT.WDW', 'Fresh',
  ],
  [
    'jaya.choudhary286@outlook.com', 'Jaya', 'Choudhary', '6017168', '', '622266',
    'jchoudhary889@my.ggu.edu', 'C17', '5594', '24/10', '22/UU', 'Domestic',
    'Inactive', 'India', 'Tier 1', '916300063921', 'master-v1-manag-ggu-psv2',
    'Deferred Out', 'Closed', 'MBA.MKT.WDW', 'Fresh',
  ],
  [
    'aditya.mangla05@mail.com', 'Aditya', 'Mangla', '6056777', '', '622252',
    'amangla1@my.ggu.edu', 'C17', '5594', '24/10', '22/FU', 'Domestic',
    'Inactive', 'India', 'Tier 1', '919891100178', 'masters-management-ggu-pp',
    'Deferred Out', 'Closed', 'MBA.ADL.WDW', 'Fresh',
  ],
  [
    'durga.blr@yahoo.com', 'Durga', 'Varada', '6063085', '', '622267',
    'dvarada2@my.ggu.edu', 'C17', '5594', '24/10', '23/WU', 'International',
    'Inactive', 'Hong Kong', 'APAC', '85295949234', 'mba-globallmba-ggu-pp',
    'Graduated', 'Closed', 'MBA.ADL.WDW', 'Fresh',
  ],
  [
    'ali.swidos1@gmail.com', 'Mohammed', 'H', '6107085', '', '622248',
    'malisobhani1@my.ggu.edu', 'C17', '5594', '24/10', '23/SU', 'Domestic',
    'Inactive', 'India', 'Tier 1', '919867233812', 'master-v2-manag-ggu-psv2',
    'Graduated', 'Closed', 'MBA.FIN.WDW', 'Fresh',
  ],
  [
    'eden.lemy@mail.com', 'My', 'Le', '6112677', '', '622231',
    'mle1@my.ggu.edu', 'C17', '5594', '24/10', '24/10', 'International',
    'Inactive', 'Vietnam', 'Vietnam', '84869717452', 'mba-globallmba-ggu-pp',
    'Graduated', 'Closed', 'MBA.ADL.WDW', 'Fresh',
  ],
  [
    'nimmi.n99@mail.com', 'Nimmi', 'Nair', '6168690', '', '622204',
    'nnair1@my.ggu.edu', 'C17', '5594', '24/10', '24/10', 'Domestic',
    'Inactive', 'Qatar', 'Tier 1', '919650317228', 'mba-globallmba-ggu-pp',
    'Graduated', 'Closed', 'MBA.BUSA.WDW', 'Fresh',
  ],
];

// ─────────────────────────────────────────────────────────────────────────────
//   Grade Sheet dataset
//
//   The displayed table shows the FLAT composite headers our parser produces
//   ("Fundamentals of Business - Grade", "Fundamentals of Business - GPA", …).
//   The downloaded CSV uses the original GGU multi-row layout (title row +
//   summary header row + course-name row + main header row) so the client
//   can use it directly as a template in Excel.
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_OPTIONAL_BASE = new Set([
  'Slot / Concentration',
  'GGU Learner Status',
  'Last Name',
]);

const GRADE_TEXT_COLS = new Set([
  'GGU User ID',
  'User ID',
]);

const GRADE_COURSES = [
  'Fundamentals of Business',
  'Management and Leadership',
  'Marketing Management',
  'Foundations of Business Analytics',
  'Corporate Finance',
  'Teamwork and Organization',
  'Information Technologies',
  'Operations and Supply Chain',
  'Context of Business',
  'Strategic analysis and design',
  'Business Plan',
  'Concentration 1',
  'Concentration 2',
  'Concentration 3',
];

const GRADE_HEADERS_BASE = [
  'GGU Student Email ID', 'Email', 'GGU User ID', 'User ID', 'First Name',
  'Last Name', 'GGU Entry Term', 'Cohort ID', 'Slot / Concentration', 'Batch',
  'GGU Learner Status', 'Status', 'Course Completed', 'Overall CGPA',
  'Courses Incomplete',
];

const GRADE_HEADERS = [
  ...GRADE_HEADERS_BASE,
  ...GRADE_COURSES.flatMap((c) => [`${c} - Grade`, `${c} - GPA`]),
];

/**
 * All per-course Grade/GPA cells can legitimately be empty (e.g. a student
 * hasn't taken Concentration 3 yet). Treat them as optional in the visual
 * legend too — matches what the backend validator does.
 */
const GRADE_OPTIONAL = new Set<string>([
  ...GRADE_OPTIONAL_BASE,
  ...GRADE_COURSES.flatMap((c) => [`${c} - Grade`, `${c} - GPA`]),
]);

const GRADE_ROWS: string[][] = [
  [
    'jchoudhary889@my.ggu.edu', 'jaya.choudhary286@outlook.com', '622266', '6017168', 'Jaya', 'Choudhary',
    '24/10', '5594', '', 'Domestic', '', 'Inactive', '13', '3.31', '1',
    'B', '3', 'A-', '3.7', 'B-', '2.7', 'A-', '3.7', 'B+', '3.3', 'C-', '1.7',
    'A', '4', 'B+', '3.3', 'B', '3', 'A', '4', 'A+', '4', 'B+', '3.3',
    'D', '1', 'B+', '3.3',
  ],
  [
    'amangla1@my.ggu.edu', 'aditya.mangla05@mail.com', '622252', '6056777', 'Aditya', 'Mangla',
    '24/10', '5594', '', 'Domestic', '', 'Inactive', '0', '0.11', '14',
    'F', '0', 'F', '0', 'F', '0', 'D+', '1.3', 'F', '0', 'F', '0',
    'IF', '0', 'F', '0', 'F', '0', 'F', '0', 'F', '0', 'F', '0',
    'F', '0', 'F', '0',
  ],
  [
    'rtolani2@my.ggu.edu', 'rishi.tolani02@outlook.com', '622262', '6099025', 'Rishi', 'Tolani',
    '24/10', '5594', '', 'Domestic', '', 'Inactive', '9', '2.5', '5',
    'A+', '4', 'A', '4', 'C+', '2.3', 'B', '3', 'F', '0', 'F', '0',
    'IF', '0', 'A', '4', 'B', '3', 'B', '3', 'A+', '4', 'B-', '2.7',
    'D', '1', 'F', '0',
  ],
  [
    'thinglawala1@my.ggu.edu', 'taher.hinglawala88@outlook.com', '622245', '6115463', 'Taher', '',
    '24/10', '5594', '', 'Domestic', '', 'Inactive', '11', '3.16', '3',
    'A', '4', 'A', '4', 'B-', '2.7', 'B', '3', 'A-', '3.7', 'A-', '3.7',
    'B', '3', 'C-', '1.7', 'A-', '3.7', 'A-', '3.7', 'A', '4', 'D-', '0.7',
    'F', '0', 'D', '1',
  ],
  [
    'rhazra1@my.ggu.edu', 'rajib.sap1993@gmail.com', '622269', '6101277', 'Rajib', 'Hazra',
    '24/10', '5594', '', 'Domestic', '', 'Inactive', '0', '0', '11',
    'F', '0', 'F', '0', 'F', '0', 'F', '0', 'F', '0', 'F', '0',
    'F', '0', 'F', '0', 'F', '0', 'F', '0', 'F', '0', '', '',
    '', '', '', '',
  ],
  [
    'mkasare1@my.ggu.edu', 'mihir.kasare@mail.com', '622270', '5798245', 'Mihir', 'Kasare',
    '24/10', '5594', '', 'Domestic', '', 'Inactive', '13', '3.29', '0',
    'A-', '3.7', 'A-', '3.7', 'C-', '1.7', 'A', '4', 'B+', '3.3', 'A-', '3.7',
    'C-', '1.7', 'B-', '2.7', 'A', '4', 'A', '4', 'A', '4', 'B', '3',
    '', '', 'B', '3',
  ],
];

// ─────────────────────────────────────────────────────────────────────────────
//   CSV helpers
// ─────────────────────────────────────────────────────────────────────────────

function escapeCSV(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/** Excel text-cell formula — see SampleData earlier notes. */
function excelTextCell(v: string): string {
  return `"=""${v.replace(/"/g, '""')}"""`;
}

function buildStudentCSV(): string {
  const header = STUDENT_HEADERS.map(escapeCSV).join(',');
  const lines = STUDENT_ROWS.map((row) =>
    row.map((value, idx) => {
      const col = STUDENT_HEADERS[idx];
      const v = value || '';
      if (v && STUDENT_TEXT_COLS.has(col)) return excelTextCell(v);
      return escapeCSV(v);
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

/**
 * Build a Grade Sheet CSV in the original GGU multi-row layout the client
 * already uses. Row 1: title + per-course Credit values. Row 2: summary
 * headers. Row 3: course names (one per Grade/GPA pair). Row 4: main field
 * headers. Rows 5+: data. This matches what GGU exports and what our
 * parseGradesheetCSV() expects.
 */
function buildGradeSheetCSV(): string {
  const numTrailingCols = GRADE_COURSES.length * 2; // 28
  const blanks = (n: number) => Array(n).fill('').map(escapeCSV).join(',');

  // Row 1: "MBA Master Grade Sheet" in col 1; "Credit" at col 14; "3" at every
  // odd column starting from col 16 (one Credit per course, covering pair).
  const row1Parts: string[] = ['MBA Master Grade Sheet'];
  for (let i = 1; i < 13; i++) row1Parts.push('');
  row1Parts.push('Credit');
  row1Parts.push('');
  for (let i = 0; i < GRADE_COURSES.length; i++) {
    row1Parts.push('3');
    row1Parts.push('');
  }

  // Row 2: summary header labels at col 13,14,15
  const row2Parts: string[] = [];
  for (let i = 0; i < 12; i++) row2Parts.push('');
  row2Parts.push('Course Completed');
  row2Parts.push('Overall CGPA');
  row2Parts.push('Courses Incomplete');
  row2Parts.push(blanks(numTrailingCols));

  // Row 3: course names at col 16, 18, 20, ... (each pair Grade/GPA)
  const row3Parts: string[] = [];
  for (let i = 0; i < 15; i++) row3Parts.push('');
  for (const course of GRADE_COURSES) {
    row3Parts.push(escapeCSV(course));
    row3Parts.push('');
  }

  // Row 4: main field headers
  const row4Parts: string[] = GRADE_HEADERS_BASE.map(escapeCSV);
  for (let i = 0; i < GRADE_COURSES.length; i++) {
    row4Parts.push('Grade');
    row4Parts.push('GPA');
  }

  const dataLines = GRADE_ROWS.map((row) =>
    row.map((value, idx) => {
      const col = GRADE_HEADERS[idx];
      const v = value || '';
      if (v && GRADE_TEXT_COLS.has(col)) return excelTextCell(v);
      return escapeCSV(v);
    }).join(',')
  );

  return [
    row1Parts.join(','),
    row2Parts.join(','),
    row3Parts.join(','),
    row4Parts.join(','),
    ...dataLines,
  ].join('\n');
}

function downloadCSV(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
//   Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface ReferenceTableProps {
  title: string;
  description: string;
  optionalNote: string;
  headers: string[];
  rows: string[][];
  /** Full optional set — used for table-cell coloring + mandatory/optional counts. */
  optional: Set<string>;
  /**
   * Subset of optional column names to display as chips. If omitted, ALL
   * optional headers are listed (good when the optional set is small). For
   * the Grade Sheet — where we don't want to list every "<Course> - Grade"
   * /"<Course> - GPA" — pass just the distinct base ones.
   */
  optionalChips?: string[];
  onDownload: () => void;
  downloadLabel: string;
}

function ReferenceTable({
  title, description, optionalNote, headers, rows, optional, optionalChips,
  onDownload, downloadLabel,
}: ReferenceTableProps) {
  const mandatoryHeaders = useMemo(
    () => headers.filter((h) => !optional.has(h)),
    [headers, optional]
  );
  const optionalHeaders = useMemo(
    () => headers.filter((h) => optional.has(h)),
    [headers, optional]
  );
  const chipHeaders = optionalChips ?? optionalHeaders;

  return (
    <div className="space-y-6">
      {/* Description banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-blue-800">{title}</h2>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Legend + download */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-700">Mandatory</span>
            <span className="text-xs text-gray-400">({mandatoryHeaders.length} columns)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-700">Optional</span>
            <span className="text-xs text-gray-400">({optionalHeaders.length} columns)</span>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={onDownload}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloadLabel}
        </Button>
      </div>

      {/* Optional columns chips */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">Optional columns (can be left blank)</h3>
        <div className="flex flex-wrap gap-2">
          {chipHeaders.map((h) => (
            <span
              key={h}
              className="inline-flex items-center px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-xs rounded-full"
            >
              {h}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">{optionalNote}</p>
      </div>

      {/* Sample data table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Sample Data</h3>
          <span className="text-xs text-gray-400">
            {headers.length} columns &bull; {rows.length} sample rows
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 border-b border-gray-200 bg-gray-50 whitespace-nowrap">
                  #
                </th>
                {headers.map((h) => {
                  const opt = optional.has(h);
                  return (
                    <th
                      key={h}
                      className={[
                        'px-3 py-3 text-left font-semibold border-b border-gray-200 whitespace-nowrap bg-gray-50',
                        opt ? 'text-gray-500' : 'text-gray-700',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={[
                            'inline-block w-2 h-2 rounded-full',
                            opt ? 'bg-gray-400' : 'bg-red-500',
                          ].join(' ')}
                          title={opt ? 'Optional' : 'Mandatory'}
                        />
                        {h}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{i + 1}</td>
                  {headers.map((h, j) => {
                    const v = row[j] || '';
                    const opt = optional.has(h);
                    return (
                      <td
                        key={h}
                        className={[
                          'px-3 py-2.5 whitespace-nowrap max-w-[220px] truncate',
                          opt ? 'text-gray-400' : 'text-gray-700',
                          !v ? 'italic text-gray-300' : '',
                        ].join(' ')}
                        title={v}
                      >
                        {v || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Hover any header for tooltip details. Mandatory cells must have values
        on every row; missing values appear in the downloadable error report
        after upload.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//   Page component with tabs
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'student-list' | 'grade-sheet';

const TAB_LABEL: Record<Tab, string> = {
  'student-list': 'Student List',
  'grade-sheet':  'Grade Sheet',
};

export default function SampleData() {
  const [tab, setTab] = useState<Tab>('student-list');

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === 'student-list' && (
        <ReferenceTable
          title="Student List — Reference"
          description="Use this as a template when preparing your Student List CSV for upload. Column names vary across MBA / DBA / GGU ET, but the optional list stays the same. Any column not listed as optional is required — a missing value will appear in the error report."
          optionalNote="These columns are the same across all courses (MBA, DBA, GGU ET). Even if your course adds new columns we haven't seen, they'll be treated as mandatory unless added to this list."
          headers={STUDENT_HEADERS}
          rows={STUDENT_ROWS}
          optional={STUDENT_OPTIONAL}
          onDownload={() => downloadCSV(buildStudentCSV(), 'GGU-MBA-Student-List-Sample.csv')}
          downloadLabel="Download Sample CSV"
        />
      )}

      {tab === 'grade-sheet' && (
        <ReferenceTable
          title="Grade Sheet — Reference"
          description="Use this as a template when preparing your Grade Sheet CSV for upload. The file uses GGU's multi-row header layout (title + summary headers + course names + main field headers). Course names vary across MBA / DBA / GGU ET — the per-course Grade and GPA cells are always optional regardless of how many courses your program has."
          optionalNote="The 3 columns above are always optional. In addition, every per-course Grade and GPA cell is optional — a student may not yet have attempted a course (e.g. blank Concentration 1/2/3 grades for someone still in progress). That rule applies to every program automatically; no need to list each course by name."
          headers={GRADE_HEADERS}
          rows={GRADE_ROWS}
          optional={GRADE_OPTIONAL}
          optionalChips={Array.from(GRADE_OPTIONAL_BASE)}
          onDownload={() => downloadCSV(buildGradeSheetCSV(), 'GGU-MBA-Grade-Sheet-Sample.csv')}
          downloadLabel="Download Sample CSV"
        />
      )}
    </div>
  );
}
