const TOKEN_KEY = 'tunda_access_token';

export interface AuthAgent {
  sub: string;
  employeeId: string;
  name: string;
  role: 'AGENT' | 'SUPERVISOR' | 'ADMIN';
}

function parseJwt(token: string): AuthAgent | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as AuthAgent;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAgent(): AuthAgent | null {
  const token = getToken();
  return token ? parseJwt(token) : null;
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isSupervisorOrAdmin(): boolean {
  const agent = getAgent();
  return agent?.role === 'SUPERVISOR' || agent?.role === 'ADMIN';
}
