import React, { useState, useCallback, useEffect } from 'react';
import { Message, MessageOption } from '../lib/types';
import { generateId } from '../lib/utils';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { socketClient } from '../lib/socket-client';
import type { MessageIncomingEvent } from '../lib/socket-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const SOCKET_SECRET = import.meta.env.VITE_SOCKET_SECRET;

/**
 * Helper – creates a bot Message object.
 */
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

/**
 * Helper – creates a user Message object.
 */
function userMsg(content: string): Message {
  return {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date(),
    messageType: 'text',
  };
}

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // ── Socket.IO Connection Setup ──
  useEffect(() => {
    const connectAndJoin = async () => {
      try {
        console.log('[ChatWidget] Connecting to backend...');
        await socketClient.connect(BACKEND_URL, SOCKET_SECRET);
        setIsConnected(true);
        setConnectionError(null);

        // Join a thread (creates new or resumes existing)
        socketClient.joinThread(undefined, {
          source: 'tunda_assist',
          userAgent: navigator.userAgent,
        });

        // Add initial greeting
        setMessages([
          botMsg(
            "Hi there! I'm Tunda Assist, your commission assistant. How can I help you today?"
          ),
        ]);
      } catch (error) {
        console.error('[ChatWidget] Connection failed:', error);
        setConnectionError('Unable to connect to the server. Please try again later.');
        setIsConnected(false);
      }
    };

    connectAndJoin();

    // Listen for incoming messages from backend
    const unsubscribeMsg = socketClient.onMessage((event: MessageIncomingEvent) => {
      console.log('[ChatWidget] Received message from backend:', event);
      setMessages((prev) => [
        ...prev,
        botMsg(event.content),
      ]);
      setIsLoading(false);
    });

    // Listen for errors
    const unsubscribeErr = socketClient.onError((error) => {
      console.error('[ChatWidget] Socket error:', error);
      setMessages((prev) => [
        ...prev,
        botMsg(`Sorry, there was an error: ${error.message}. Please try again.`),
      ]);
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMsg();
      unsubscribeErr();
      socketClient.disconnect();
    };
  }, []);

  // ── Send Message Handler ──
  const handleSendMessage = useCallback(
    async (userInput: string) => {
      if (!isConnected) {
        setMessages((prev) => [
          ...prev,
          botMsg('Not connected to server. Please refresh the page.'),
        ]);
        return;
      }

      // Add user message to UI
      setMessages((prev) => [...prev, userMsg(userInput)]);
      setIsLoading(true);

      try {
        // Send message to backend via Socket.IO
        socketClient.sendMessage(userInput);
      } catch (error) {
        console.error('[ChatWidget] Failed to send message:', error);
        setMessages((prev) => [
          ...prev,
          botMsg('Failed to send message. Please try again.'),
        ]);
        setIsLoading(false);
      }
    },
    [isConnected]
  );

  // Show connection error if present
  if (connectionError) {
    return (
      <>
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '16px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '300px',
            zIndex: 50,
          }}
        >
          <p style={{ color: '#e53e3e', margin: 0 }}>{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: '#2e9e6e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── Chat Window ── */}
      <div
        style={{
          position: 'fixed',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(isExpanded
            ? { inset: 0 }
            : { bottom: '24px', right: '24px', width: '340px', height: '600px', maxHeight: '85vh' }
          ),
          ...(isOpen
            ? { opacity: 1, transform: 'scale(1) translateY(0)', pointerEvents: 'auto' as const }
            : { opacity: 0, transform: 'scale(0.95) translateY(16px)', pointerEvents: 'none' as const }
          ),
        }}
      >
        {/* ── Header ── */}
        <div
          className="chat-header-gradient"
          style={{
            padding: '18px 18px 18px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #f5c842 0%, #e8a800 40%, #2e9e6e 60%, #1a7a50 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#f5c842" />
              <path d="M8 16 Q16 6 24 16 Q16 26 8 16Z" fill="#2e9e6e" />
            </svg>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.2px',
              }}
            >
              Tunda Assist
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isConnected ? '#6de8a0' : '#gray',
                  boxShadow: isConnected ? '0 0 6px #6de8a0' : 'none',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500 }}>
                {isConnected ? 'AI Assistant Active' : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Expand */}
            <button
              onClick={() => setIsExpanded((e) => !e)}
              title={isExpanded ? 'Collapse' : 'Expand'}
              style={{
                width: '28px',
                height: '28px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            {/* Close */}
            <button
              onClick={() => { setIsOpen(false); setIsExpanded(false); }}
              title="Close"
              style={{
                width: '28px',
                height: '28px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body: Chat Messages ── */}
        <MessageList
          messages={messages}
          onSelectOption={() => {}} // No options anymore
          isLoading={isLoading}
        />

        {/* ── Footer / Input ── */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || !isConnected}
          placeholder={isConnected ? "Ask a question..." : "Connecting..."}
        />
      </div>

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="chat-send-gradient"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(46,158,110,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
        title="Open Tunda Assist"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
};
