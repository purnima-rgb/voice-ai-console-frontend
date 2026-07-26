import { useEffect, useMemo, useState } from 'react';
import { fetchAgentMapping, AgentMapping } from '../../services/api';
import Button from '../Common/Button';

/**
 * Agent Mapping reference page — accessible to all roles. Lists the
 * finalized Voice AI agents and their IDs, used when preparing an
 * agent-data upload file (the agent_id column must match one of these).
 *
 * Source list lives in the backend at config/agentMapping.ts. Update
 * that file when new agents are commissioned.
 */

function escapeCSV(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function excelTextCell(v: string): string {
  return `"=""${v.replace(/"/g, '""')}"""`;
}

function downloadAgentCSV(agents: AgentMapping[]) {
  const lines = [
    'Agent Name,Agent ID',
    ...agents.map((a) => `${escapeCSV(a.agentName)},${excelTextCell(a.agentId)}`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'agent-mapping.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AgentMappingPage() {
  const [agents, setAgents] = useState<AgentMapping[]>([]);
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAgentMapping()
      .then((res) => { if (!cancelled) setAgents(res.agents); })
      .catch((err) => {
        if (!cancelled) {
          setError(
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Failed to load agent mapping.'
          );
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.agentName.toLowerCase().includes(q) ||
        a.agentId.toLowerCase().includes(q)
    );
  }, [agents, query]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
        <svg className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-emerald-800">Agent Name &amp; ID Reference</h2>
          <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
            Look up the right <span className="font-semibold">Agent ID</span> when preparing
            your agent-data upload file. The <span className="font-mono">agent_id</span> column
            must match the value below for the agent you selected on the Upload screen — a
            mismatch rejects the whole file.
          </p>
          <p className="text-sm text-emerald-700 mt-2">
            Use the search box to find an agent by name or ID. Click
            <span className="font-mono bg-emerald-100 px-1 mx-1 rounded">Copy</span>
            to copy an Agent ID to your clipboard.
          </p>
        </div>
      </div>

      {/* Search + download */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex-1 min-w-[240px] max-w-md">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by agent name or ID..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Button variant="primary" size="md" onClick={() => downloadAgentCSV(agents)} disabled={agents.length === 0}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Mapping CSV
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Mapping table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Agents</h3>
          <span className="text-xs text-gray-400">
            {filtered.length} of {agents.length} shown
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-sm font-medium">No agents match your search.</p>
            <p className="text-xs mt-1">Try a different keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Agent Name (Reason)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">Agent ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a, i) => (
                  <tr key={a.agentId} className={i % 2 === 0 ? 'bg-white hover:bg-indigo-50/40' : 'bg-gray-50/50 hover:bg-indigo-50/40'}>
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-2.5 text-gray-800">{a.agentName}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-xs whitespace-nowrap">{a.agentId}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => navigator.clipboard.writeText(a.agentId)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                        title="Copy Agent ID to clipboard"
                      >
                        Copy
                      </button>
                    </td>
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
