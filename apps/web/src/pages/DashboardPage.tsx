import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, TicketStatus, TicketPriority, fetchTickets } from '../lib/tickets-api';
import { clearToken, getAgent } from '../lib/auth';
import { TicketCard } from '../components/TicketCard';

const ALL = 'ALL' as const;

type StatusFilter = TicketStatus | typeof ALL;
type PriorityFilter = TicketPriority | typeof ALL;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: ALL },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityFilter }[] = [
  { label: 'All Priorities', value: ALL },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const agent = getAgent();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(ALL);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchTickets({
        status: statusFilter === ALL ? undefined : statusFilter,
        priority: priorityFilter === ALL ? undefined : priorityFilter,
        page,
        limit: LIMIT,
      });
      setTickets(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, page]);

  useEffect(() => { void load(); }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [statusFilter, priorityFilter]);

  function handleUpdated(updated: Ticket) {
    setTickets(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  }

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  const totalPages = Math.ceil(total / LIMIT);

  // Stats for the summary bar
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f5' }}>
      {/* ── Top nav ── */}
      <header className="chat-header-gradient" style={{ padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '60px', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(145deg,#f5c842 0%,#e8a800 40%,#2e9e6e 60%,#1a7a50 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#f5c842" /><path d="M8 16 Q16 6 24 16 Q16 26 8 16Z" fill="#2e9e6e" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Tunda Assist</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginLeft: '8px' }}>Supervisor Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
              {agent?.name} · <span style={{ color: '#f5c842', fontWeight: 600 }}>{agent?.role}</span>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '8px',
                background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
        {/* ── Page title + reload ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a2e22' }}>Support Tickets</h1>
            <p style={{ color: '#718096', fontSize: '14px', marginTop: '2px' }}>{total} ticket{total !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => void load()}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e8eeeb',
              background: '#fff', color: '#2e9e6e', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stats strip ── */}
        {!loading && tickets.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <StatChip label="Open" count={openCount} color="#f59e0b" />
            <StatChip label="In Progress" count={inProgressCount} color="#3b82f6" />
            <StatChip label="Resolved" count={resolvedCount} color="#22c55e" />
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status tabs */}
          <div style={{ display: 'flex', background: '#fff', borderRadius: '10px', border: '1px solid #e8eeeb', overflow: 'hidden' }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  background: statusFilter === tab.value ? '#2e9e6e' : 'transparent',
                  color: statusFilter === tab.value ? '#fff' : '#4a5568',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority select */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}
            style={{
              padding: '8px 14px', borderRadius: '10px', border: '1px solid #e8eeeb',
              background: '#fff', color: '#4a5568', fontSize: '13px', fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            {PRIORITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ── Content ── */}
        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '16px', color: '#c53030', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', height: '140px', border: '1px solid #e8eeeb', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '12px', border: '1px solid #e8eeeb',
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <p style={{ color: '#718096', fontSize: '15px' }}>No tickets match the current filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onUpdated={handleUpdated} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            <PaginationBtn label="← Prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
            <span style={{ fontSize: '13px', color: '#718096' }}>Page {page} of {totalPages}</span>
            <PaginationBtn label="Next →" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
          </div>
        )}
      </main>
    </div>
  );
}

function StatChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid #e8eeeb',
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a2e22' }}>{count}</span>
    </div>
  );
}

function PaginationBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e8eeeb',
        background: disabled ? '#f5f7f5' : '#fff', color: disabled ? '#a0aec0' : '#2e9e6e',
        fontWeight: 600, fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}
