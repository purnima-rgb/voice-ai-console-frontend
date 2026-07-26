import { useMemo, useState } from 'react';
import Button from '../Common/Button';
import {
  AgentUseCase,
  AGENT_USE_CASES,
  AGENT_DISPLAY_NAMES,
  AGENT_IDS,
  AGENT_OPTIONAL_COLUMNS,
  AGENT_SPECIFIC_COLUMNS,
} from '../../types';

/**
 * Reference data screen.
 *
 * Shows the finalized input data format for each of the 5 Voice AI agents
 * currently running live campaigns (GGU / MBA). Source: upGrad Input Data
 * Format Finalization.xlsx (shared by client). Clients use this as a
 * template when preparing the pre-formatted file they upload for each
 * agent/use case.
 *
 * Column order matches the finalized format exactly: the 11 mandatory
 * unified columns, then the 3 common optional columns (Email, Program Name,
 * Cohort ID), then the agent-specific columns. Mandatory columns are
 * strictly validated on upload; optional + agent-specific columns are
 * merged into the unified file's user_metadata JSON.
 */

const COMMON_HEADERS = [
  'user_id',
  'Email',
  'user_first_name',
  'user_last_name',
  'user_contact',
  'from_number',
  'user_country_of_residence',
  'timezone',
  'date_of_call',
  'time_of_call',
  'reason',
  'Program Name',
  'agent_id',
  'Cohort ID',
];

/** Columns whose values should be Excel-text-formatted (long digit strings). */
const TEXT_COLS = new Set(['user_id', 'user_contact', 'from_number', 'agent_id']);

function buildHeaders(agent: AgentUseCase): string[] {
  return [...COMMON_HEADERS, ...AGENT_SPECIFIC_COLUMNS[agent]];
}

const AGENT_DESCRIPTIONS: Record<AgentUseCase, string> = {
  'live-session-reminder':
    'Reminds students of an upcoming live session. Upload one row per student per session — the Session Date/Start/End Time columns tell the agent when the class happens.',
  'deferral-request':
    'Follows up with students who requested a program deferral due to work or personal demands, referencing the course they deferred from and next batch details.',
  'missed-assignment-deadline':
    'Calls students who missed an assignment deadline to offer an extension, referencing the original deadline and the extended one.',
  'new-program-onboarding':
    'Walks new students through onboarding milestones — orientation, welcome webinar, batch launch, and their first graded course and live session.',
  'deadline-reminder':
    'Reminds students of an approaching assignment deadline for a specific course before it passes.',
};

// ─────────────────────────────────────────────────────────────────────────────
//   Sample rows — clean, correctly-formatted examples for each agent.
//   from_number keeps its leading zero and user_contact is a full digit
//   string (no scientific notation) — the two formats most often corrupted
//   when the source Excel column isn't formatted as Text.
// ─────────────────────────────────────────────────────────────────────────────

const AGENT_SAMPLE_ROWS: Record<AgentUseCase, string[][]> = {
  'live-session-reminder': [
    [
      '6515104', 'vignesh.ps@example.com', 'Vignesh', 'P S', '919944211234', '01169323435',
      'India', 'Asia/Kolkata', '2026-07-11', '21:00:00', 'Live Session Reminder', 'GGU MBA',
      AGENT_IDS['live-session-reminder'], 'ENG-C1',
      'Concentration 3 - Web and Social Network Analytics', 'Sat', '2026-07-11',
      '21:00:00', '22:00:00', 'Live Session', 'Dr. Tanisha Medewala',
      'Concentration 3 - Web and Social Network Analytics',
    ],
    [
      '5102481', 'rishabh.mudgal@example.com', 'Rishabh', 'Mudgal', '919872211234', '01169323435',
      'India', 'Asia/Kolkata', '2026-07-11', '15:30:00', 'Live Session Reminder', 'GGU MBA',
      AGENT_IDS['live-session-reminder'], 'ENG-C1',
      'Concentration 3 - Strategic Leadership', 'Sat', '2026-07-11',
      '15:30:00', '17:00:00', 'Live Session', 'Dr. Ranna Bhatt',
      'Concentration 3 - Strategic Leadership',
    ],
  ],
  'deferral-request': [
    [
      '6367723', 'thu.hien@example.com', 'Thu', 'Hien', '84986074271', '01169323435',
      'Vietnam', 'Asia/Ho_Chi_Minh', '2026-07-07', '11:15:00', 'Deferral Request', 'GGU MBA',
      AGENT_IDS['deferral-request'], 'ENG-C1',
      'Marketing Management', '2026-09-01', '25',
    ],
    [
      '6378485', 'hoang.bui@example.com', 'Hoang', 'Bui', '84378498748', '01169323435',
      'Vietnam', 'Asia/Ho_Chi_Minh', '2026-07-07', '11:15:00', 'Deferral Request', 'GGU MBA',
      AGENT_IDS['deferral-request'], 'ENG-C2',
      'Corporate Finance', '2026-09-01', '25',
    ],
  ],
  'missed-assignment-deadline': [
    [
      '6367723', 'thu.hien@example.com', 'Thu', 'Hien', '84986074271', '01169323435',
      'Vietnam', 'Asia/Ho_Chi_Minh', '2026-07-24', '11:15:00', 'Missed Assignment Deadline', 'GGU MBA',
      AGENT_IDS['missed-assignment-deadline'], 'ENG-C1',
      'Course Assignment 2', '2026-07-20', '2026-07-27',
    ],
    [
      '6378485', 'hoang.bui@example.com', 'Hoang', 'Bui', '84378498748', '01169323435',
      'Vietnam', 'Asia/Ho_Chi_Minh', '2026-07-24', '11:15:00', 'Missed Assignment Deadline', 'GGU MBA',
      AGENT_IDS['missed-assignment-deadline'], 'ENG-C2',
      'Course Assignment 3', '2026-07-21', '2026-07-28',
    ],
  ],
  'new-program-onboarding': [
    [
      '6367723', 'thu.hien@example.com', 'Thu', 'Hien', '84986074271', '01169323435',
      'Vietnam', 'Asia/Ho_Chi_Minh', '2026-07-10', '11:15:00', 'New Program Onboarding', 'GGU MBA',
      AGENT_IDS['new-program-onboarding'], 'ENG-C3',
      '2026-07-11', '2026-07-12', '2026-07-15', 'Marketing Management', '2026-07-15', '2026-08-19',
    ],
    [
      '6378485', 'hoang.bui@example.com', 'Hoang', 'Bui', '84378498748', '01169323435',
      'Vietnam', 'Asia/Ho_Chi_Minh', '2026-07-10', '11:15:00', 'New Program Onboarding', 'GGU MBA',
      AGENT_IDS['new-program-onboarding'], 'ENG-C4',
      '2026-07-18', '2026-07-19', '2026-07-22', 'Corporate Finance', '2026-07-22', '2026-08-26',
    ],
  ],
  'deadline-reminder': [
    [
      '6452211', 'yesmin.sultana@example.com', 'Yesmin', 'Sultana', '919101467587', '01169323435',
      'India', 'Asia/Kolkata', '2026-07-23', '11:15:00', 'Deadline Reminder', 'GGU MBA',
      AGENT_IDS['deadline-reminder'], 'ENG-C1',
      'Concentration 1', 'Course Assignment', '2026-07-24',
    ],
    [
      '3899817', 'ranjith.s@example.com', 'Ranjith', 'S', '918861916520', '01169323435',
      'India', 'Asia/Kolkata', '2026-07-23', '11:15:00', 'Deadline Reminder', 'GGU MBA',
      AGENT_IDS['deadline-reminder'], 'ENG-C1',
      'Concentration 1', 'Course Assignment', '2026-07-24',
    ],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//   CSV helpers
// ─────────────────────────────────────────────────────────────────────────────

function escapeCSV(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/** Excel text-cell formula so long digit strings survive opening in Excel. */
function excelTextCell(v: string): string {
  return `"=""${v.replace(/"/g, '""')}"""`;
}

function buildAgentCSV(agent: AgentUseCase): string {
  const headers = buildHeaders(agent);
  const header = headers.map(escapeCSV).join(',');
  const lines = AGENT_SAMPLE_ROWS[agent].map((row) =>
    row.map((value, idx) => {
      const col = headers[idx];
      const v = value || '';
      if (v && TEXT_COLS.has(col)) return excelTextCell(v);
      return escapeCSV(v);
    }).join(',')
  );
  return [header, ...lines].join('\n');
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
  optional: Set<string>;
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
            <span className="text-sm text-gray-700">Optional / metadata</span>
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
        <h3 className="font-semibold text-gray-800 text-sm mb-3">
          Optional / metadata columns (merged into user_metadata)
        </h3>
        {chipHeaders.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {chipHeaders.map((h) => (
              <span
                key={h}
                className="inline-flex items-center px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-xs rounded-full"
              >
                {h}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 leading-relaxed">{optionalNote}</p>
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
        on every row; missing or malformed values appear in the downloadable
        error report after upload.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//   Page component with tabs — one per finalized agent
// ─────────────────────────────────────────────────────────────────────────────

export default function SampleData() {
  const [tab, setTab] = useState<AgentUseCase>(AGENT_USE_CASES[0]);

  const optionalSet = useMemo(
    () => new Set([...AGENT_OPTIONAL_COLUMNS, ...AGENT_SPECIFIC_COLUMNS[tab]]),
    [tab]
  );

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {AGENT_USE_CASES.map((a) => (
          <button
            key={a}
            onClick={() => setTab(a)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              tab === a
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {AGENT_DISPLAY_NAMES[a]}
          </button>
        ))}
      </div>

      <ReferenceTable
        key={tab}
        title={`${AGENT_DISPLAY_NAMES[tab]} — Reference`}
        description={AGENT_DESCRIPTIONS[tab]}
        optionalNote="Email, Program Name, Cohort ID, and every agent-specific column above are merged into the unified file's user_metadata JSON (not individually validated). The 11 mandatory columns must have a value on every row."
        headers={buildHeaders(tab)}
        rows={AGENT_SAMPLE_ROWS[tab]}
        optional={optionalSet}
        onDownload={() => downloadCSV(buildAgentCSV(tab), `GGU-MBA-${tab}-Sample.csv`)}
        downloadLabel="Download Sample CSV"
      />
    </div>
  );
}
