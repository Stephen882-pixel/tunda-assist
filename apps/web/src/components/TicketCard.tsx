import { useState } from 'react';
import { Ticket, TicketStatus, updateTicket } from '../lib/tickets-api';

const STATUS_COLORS: Record<TicketStatus, { bg: string; text: string; dot: string }> = {
  OPEN:        { bg: '#fff7e6', text: '#b45309', dot: '#f59e0b' },
  IN_PROGRESS: { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  RESOLVED:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HIGH:   { bg: '#fff1f2', text: '#be123c' },
  MEDIUM: { bg: '#fff7e6', text: '#b45309' },
  LOW:    { bg: '#f0fdf4', text: '#15803d' },
};

const CATEGORY_ICONS: Record<string, string> = {
  commission: '💰',
  payment:    '💳',
  technical:  '🔧',
  other:      '📋',
};

interface Props {
  ticket: Ticket;
  onUpdated: (updated: Ticket) => void;
}

export function TicketCard({ ticket, onUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  const sc = STATUS_COLORS[ticket.status];
  const pc = PRIORITY_COLORS[ticket.priority];

  async function changeStatus(status: TicketStatus) {
    if (status === ticket.status) return;
    setSaving(true);
    try {
      const updated = await updateTicket(ticket.id, { status });
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  const createdAt = new Date(ticket.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8eeeb',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '18px' }}>{CATEGORY_ICONS[ticket.category] ?? '📋'}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'capitalize' }}>
            {ticket.category}
          </span>
          {/* Priority badge */}
          <span style={{
            padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
            background: pc.bg, color: pc.text, textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {ticket.priority}
          </span>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
          background: sc.bg, color: sc.text, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      {/* Agent + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#4cca85,#2e9e6e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '12px', fontWeight: 700,
        }}>
          {ticket.agentName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a2e22' }}>{ticket.agentName}</div>
          <div style={{ fontSize: '11px', color: '#718096' }}>{ticket.agentId} · {createdAt}</div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: 1.5, margin: 0 }}>
        {ticket.description}
      </p>

      {/* Status actions */}
      {ticket.status !== 'RESOLVED' && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ticket.status === 'OPEN' && (
            <ActionButton
              label="Mark In Progress"
              color="#3b82f6"
              disabled={saving}
              onClick={() => changeStatus('IN_PROGRESS')}
            />
          )}
          <ActionButton
            label="Mark Resolved"
            color="#22c55e"
            disabled={saving}
            onClick={() => changeStatus('RESOLVED')}
          />
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label, color, disabled, onClick,
}: { label: string; color: string; disabled: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 14px', border: `1.5px solid ${color}`, borderRadius: '8px',
        background: hover ? color : 'transparent', color: hover ? '#fff' : color,
        fontSize: '12px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.15s',
      }}
    >
      {disabled ? '…' : label}
    </button>
  );
}
