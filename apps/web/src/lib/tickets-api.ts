import { getToken } from './auth';

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
  id: string;
  agentId: string;
  agentName: string;
  category: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsPage {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(employeeId: string, pin: string): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, pin }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || 'Invalid credentials');
  }
  const body = await res.json() as { accessToken: string };
  return body.accessToken;
}

export async function fetchTickets(params: {
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}): Promise<TicketsPage> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.priority) q.set('priority', params.priority);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));

  const res = await fetch(`${BASE}/tickets?${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json() as Promise<TicketsPage>;
}

export async function updateTicket(
  id: string,
  patch: { status?: TicketStatus; priority?: TicketPriority },
): Promise<Ticket> {
  const res = await fetch(`${BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json() as Promise<Ticket>;
}
