import { useMemo } from 'react';
import Button from '../Common/Button';

/**
 * Reference sample data for the Student List CSV upload.
 *
 * - The 5 optional columns are flagged so the client knows which fields they
 *   can leave blank without triggering validation errors.
 * - For DBA / GGU ET courses, exact column names may vary, but the optional
 *   set stays the same: Prism User ID, GGU User ID, GGU Email, Region,
 *   Concentration. Everything else in the uploaded CSV is mandatory.
 */
const OPTIONAL_COLUMNS = new Set([
  'Last Name',
  'Prism User ID',
  'GGU User ID',
  'GGU Email',
  'Region',
  'Concentration',
]);

/**
 * Columns whose values must be preserved as text even when they look like
 * numbers. Long phone numbers like 918928220913 would otherwise be displayed
 * as scientific notation (9.18928E+11) when the file is opened in Excel.
 */
const TEXT_COLUMNS = new Set([
  'Contact',
  'User ID',
  'GGU User ID',
  'Prism User ID',
]);

const SAMPLE_HEADERS = [
  'Email',
  'First Name',
  'Last Name',
  'User ID',
  'Prism User ID',
  'GGU User ID',
  'GGU Email',
  'Cohort #',
  'Cohort ID',
  'Launch Month',
  'GGU Term Id',
  'Batch',
  'Status',
  'Country of  Residence',
  'Region',
  'Contact',
  'Package Key',
  'Status Details',
  'Cohort Status',
  'Concentration',
  'Learner Type',
];

const SAMPLE_ROWS: string[][] = [
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

/** Standard CSV escape: wrap in quotes + double inner quotes if needed. */
function escapeCSV(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/**
 * Excel text-cell formula:  ="918928220913"
 * Forces Excel to treat long digit strings as TEXT — preserves phone
 * numbers / IDs as-is instead of rendering them in scientific notation
 * (e.g. 9.18928E+11). The literal payload contains a quote so it has to
 * be CSV-escaped: the on-disk form is  "=""918928220913"""
 * Google Sheets recognizes this too; plain text viewers will show the
 * raw ="..." which is acceptable for a reference file.
 */
function excelTextCell(v: string): string {
  return `"=""${v.replace(/"/g, '""')}"""`;
}

function buildSampleCSV(): string {
  const header = SAMPLE_HEADERS.map(escapeCSV).join(',');
  const lines = SAMPLE_ROWS.map((row) =>
    row.map((value, colIdx) => {
      const header = SAMPLE_HEADERS[colIdx];
      const v = value || '';
      if (v && TEXT_COLUMNS.has(header)) return excelTextCell(v);
      return escapeCSV(v);
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

function downloadSampleCSV() {
  const csv = buildSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GGU-MBA-Student-List-Sample.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SampleData() {
  const mandatoryHeaders = useMemo(
    () => SAMPLE_HEADERS.filter((h) => !OPTIONAL_COLUMNS.has(h)),
    []
  );
  const optionalHeaders = useMemo(
    () => SAMPLE_HEADERS.filter((h) => OPTIONAL_COLUMNS.has(h)),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-blue-800">Student List — Sample &amp; Reference</h2>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">
            Use this as a template when preparing your Student List CSV for upload.
            Below you'll see the expected columns, sample data, and which fields
            are <span className="font-semibold">mandatory</span> vs <span className="font-semibold">optional</span>.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Column names vary across courses (MBA, DBA, GGU ET), but the
            optional list always stays the same. Any column not listed as
            optional is required &mdash; a missing value will appear in the
            error report.
          </p>
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
        <Button variant="primary" size="md" onClick={downloadSampleCSV}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Sample CSV
        </Button>
      </div>

      {/* Optional columns list */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">Optional columns (can be left blank)</h3>
        <div className="flex flex-wrap gap-2">
          {optionalHeaders.map((h) => (
            <span
              key={h}
              className="inline-flex items-center px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-xs rounded-full"
            >
              {h}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          These columns are the same across all courses (MBA, DBA, GGU ET).
          Even if your course adds new columns we haven't seen, they'll be
          treated as mandatory unless added to this list.
        </p>
      </div>

      {/* Sample data table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Sample Data (GGU MBA Student List)</h3>
          <span className="text-xs text-gray-400">
            {SAMPLE_HEADERS.length} columns &bull; {SAMPLE_ROWS.length} sample rows
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-gray-500 border-b border-gray-200 bg-gray-50 whitespace-nowrap">
                  #
                </th>
                {SAMPLE_HEADERS.map((h) => {
                  const opt = OPTIONAL_COLUMNS.has(h);
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
              {SAMPLE_ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{i + 1}</td>
                  {SAMPLE_HEADERS.map((h, j) => {
                    const v = row[j] || '';
                    const opt = OPTIONAL_COLUMNS.has(h);
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

      {/* Footnote */}
      <p className="text-xs text-gray-400 text-center">
        Hover any header for tooltip details. Mandatory cells must have values
        on every row; missing values appear in the downloadable error report
        after upload.
      </p>
    </div>
  );
}
