import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, MessageOption } from '../lib/types';
import { generateId } from '../lib/utils';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { socketClient } from '../lib/socket-client';
import { isSupervisorOrAdmin, getToken } from '../lib/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8191';
const SOCKET_SECRET = import.meta.env.VITE_SOCKET_SECRET;

function botMsg(content: string, options: MessageOption[] = []): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    messageType: options.length > 0 ? 'options' : 'text',
    options,
  };
}

function userMsg(content: string): Message {
  return {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date(),
    messageType: 'text',
  };
}

export function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const alreadyConnected = useRef(false);

  // Capture the PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Socket connection
  useEffect(() => {
    if (alreadyConnected.current) return;
    alreadyConnected.current = true;

    const connectAndJoin = async () => {
      try {
        await socketClient.connect(BACKEND_URL, SOCKET_SECRET);
        setIsConnected(true);
        setConnectionError(null);
        socketClient.joinThread(undefined, { source: 'tunda_pwa', userAgent: navigator.userAgent });
        setMessages([botMsg("Hi there! I'm Tunda Assist, your commission assistant. How can I help you today?")]);
      } catch {
        setConnectionError('Unable to connect. Please check your connection and retry.');
        setIsConnected(false);
      }
    };

    void connectAndJoin();

    const unsubMsg = socketClient.onMessage((event) => {
      setMessages(prev => [...prev, botMsg(event.content)]);
      setIsLoading(false);
    });

    const unsubErr = socketClient.onError((error) => {
      setMessages(prev => [...prev, botMsg(`Sorry, something went wrong: ${error.message}`)]);
      setIsLoading(false);
    });

    return () => {
      unsubMsg();
      unsubErr();
      socketClient.disconnect();
      alreadyConnected.current = false;
    };
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!isConnected) {
      setMessages(prev => [...prev, botMsg('Not connected. Please refresh.')]);
      return;
    }
    setMessages(prev => [...prev, userMsg(text)]);
    setIsLoading(true);
    try {
      socketClient.sendMessage(text);
    } catch {
      setMessages(prev => [...prev, botMsg('Failed to send. Please try again.')]);
      setIsLoading(false);
    }
  }, [isConnected]);

  async function handleInstall() {
    if (!installPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (installPrompt as any).prompt();
    setShowInstallBanner(false);
    setInstallPrompt(null);
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100%',
      background: '#f5f7f5', overflow: 'hidden',
    }}>
      {/* ── Install Banner ── */}
      {showInstallBanner && (
        <div style={{
          background: '#f5c842', padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a2e22' }}>
            📲 Install Tunda Assist as an app for offline access
          </span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleInstall}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                background: '#1a5c42', color: '#fff', fontSize: '12px',
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{
                padding: '6px 10px', borderRadius: '8px',
                border: '1.5px solid rgba(26,46,34,0.3)', background: 'transparent',
                color: '#1a2e22', fontSize: '12px', cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="chat-header-gradient" style={{ flexShrink: 0, padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '12px' }}>
          {/* Logo */}
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(145deg,#f5c842 0%,#e8a800 40%,#2e9e6e 60%,#1a7a50 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#f5c842"/>
              <path d="M8 16 Q16 6 24 16 Q16 26 8 16Z" fill="#2e9e6e"/>
            </svg>
          </div>

          {/* Title + status */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>Tunda Assist</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: isConnected ? '#6de8a0' : '#f5c842',
                boxShadow: isConnected ? '0 0 6px #6de8a0' : 'none',
                display: 'inline-block',
              }}/>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500 }}>
                {connectionError ? 'Connection error' : isConnected ? 'AI Assistant Active' : 'Connecting…'}
              </span>
            </div>
          </div>

          {/* Supervisor shortcut — only visible when logged in as supervisor */}
          {getToken() && isSupervisorOrAdmin() && (
            <button
              onClick={() => navigate('/dashboard')}
              title="Open Dashboard"
              style={{
                padding: '6px 12px', borderRadius: '8px', border: 'none',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </button>
          )}
        </div>
      </header>

      {/* ── Connection error bar ── */}
      {connectionError && (
        <div style={{
          background: '#fff5f5', borderBottom: '1px solid #fed7d7',
          padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ color: '#c53030', fontSize: '13px' }}>{connectionError}</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '5px 12px', borderRadius: '6px', border: 'none',
              background: '#c53030', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <MessageList
        messages={messages}
        onSelectOption={() => {}}
        isLoading={isLoading}
      />

      {/* ── Input ── */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || !isConnected}
        placeholder={isConnected ? 'Ask about your commissions…' : 'Connecting…'}
      />
    </div>
  );
}
