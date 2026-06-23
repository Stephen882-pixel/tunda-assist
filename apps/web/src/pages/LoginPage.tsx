import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/tickets-api';
import { saveToken, getAgent } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login(employeeId, pin);
      saveToken(token);
      const agent = getAgent();
      if (agent?.role === 'SUPERVISOR' || agent?.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        setError('Access denied. Supervisor or Admin role required.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f5' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}>
        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {/* Header */}
          <div className="chat-header-gradient" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(145deg,#f5c842 0%,#e8a800 40%,#2e9e6e 60%,#1a7a50 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#f5c842" /><path d="M8 16 Q16 6 24 16 Q16 26 8 16Z" fill="#2e9e6e" /></svg>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>Tunda Assist</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Supervisor Portal</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2e22', marginBottom: '24px' }}>Sign In</h2>

            {error && (
              <div style={{
                background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px',
                padding: '12px 14px', marginBottom: '20px', color: '#c53030', fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px' }}>
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
                placeholder="e.g. 41643611"
                style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#2e9e6e'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px' }}>
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                placeholder="4-digit PIN"
                maxLength={4}
                style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  letterSpacing: '6px', transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#2e9e6e'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || pin.length !== 4 || !employeeId}
              className="chat-send-gradient"
              style={{
                width: '100%', padding: '12px', border: 'none', borderRadius: '8px',
                color: '#fff', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: (loading || pin.length !== 4 || !employeeId) ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
