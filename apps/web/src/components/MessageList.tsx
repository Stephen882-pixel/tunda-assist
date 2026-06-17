import React, { useEffect, useRef } from 'react';
import { Message, BreakdownData } from '../lib/types';
import { formatDate } from '../lib/utils';
import { MessageOptions } from './MessageOptions';

interface MessageListProps {
  messages: Message[];
  onSelectOption: (message: Message, option: any) => void;
  isLoading?: boolean;
}

/* ── Breakdown Card ── */
const BreakdownCard: React.FC<{ data: BreakdownData }> = ({ data }) => (
  <div style={{ width: '100%', marginTop: '4px' }}>
    <div
      style={{
        background: '#fff',
        borderRadius: '14px',
        border: '1px solid #edf2ef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f0f8f3',
          borderBottom: '1px solid #edf2ef',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e3028' }}>
          📊 Breakdown – {data.periodLabel}
        </p>
      </div>

      {data.sections.map((section, sIdx) => (
        <div key={sIdx}>
          {/* Section title */}
          <div
            style={{
              padding: '10px 14px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '13px' }}>{section.icon}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#8a9e92',
                textTransform: 'uppercase',
                letterSpacing: '0.7px',
              }}
            >
              {section.title}
            </span>
          </div>

          {/* Items */}
          <div style={{ padding: '2px 14px 10px' }}>
            {section.items.map((item, iIdx) => (
              <div
                key={iIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom:
                    iIdx < section.items.length - 1 ? '1px solid #f3f6f4' : 'none',
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#2a3d30' }}>{item.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#2e9e6e',
                    background: '#e8f5ee',
                    padding: '2px 10px',
                    borderRadius: '999px',
                  }}
                >
                  Ksh {item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Divider between sections */}
          {sIdx < data.sections.length - 1 && (
            <div style={{ borderTop: '1px solid #edf2ef' }} />
          )}
        </div>
      ))}
    </div>
  </div>
);

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectOption,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="chat-scroll"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: '#f5f7f5',
      }}
    >
      {messages.map((message, idx) => {
        const isUser = message.role === 'user';
        return (
          <div
            key={message.id}
            className="message-enter"
            style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              animationDelay: `${idx * 0.04}s`,
            }}
          >
            <div
              style={{
                maxWidth: isUser ? '72%' : '82%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* ── Bubble ── */}
              <div
                className={isUser ? 'chat-user-bubble' : ''}
                style={{
                  ...(isUser
                    ? {
                        color: '#fff',
                        borderRadius: '18px 18px 4px 18px',
                        padding: '10px 14px 8px',
                        fontSize: '13.5px',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        boxShadow: '0 3px 10px rgba(46,158,110,0.3)',
                      }
                    : {
                        background: '#fff',
                        color: '#1e3028',
                        borderRadius: '18px 18px 18px 4px',
                        padding: '11px 14px 8px',
                        fontSize: '13px',
                        lineHeight: 1.55,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #edf2ef',
                      }),
                }}
              >
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</p>

                {/* ── Inline Options (numbered list inside bubble) ── */}
                {message.options && message.options.length > 0 && (
                  <MessageOptions
                    options={message.options}
                    onSelectOption={(option) => onSelectOption(message, option)}
                  />
                )}

                {/* ── Timestamp inside bubble ── */}
                <span
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    color: isUser ? 'rgba(255,255,255,0.6)' : 'rgba(80,80,80,0.45)',
                    marginTop: '5px',
                    textAlign: isUser ? 'right' : 'left',
                  }}
                >
                  {formatDate(message.timestamp)}
                </span>
              </div>

              {/* ── Breakdown Card (below bubble) ── */}
              {message.breakdownData && (
                <BreakdownCard data={message.breakdownData} />
              )}
            </div>
          </div>
        );
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="message-enter" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '18px 18px 18px 4px',
              padding: '12px 18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #edf2ef',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div className="animate-bounce" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b0c4b8' }} />
            <div className="animate-bounce" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b0c4b8', animationDelay: '0.15s' }} />
            <div className="animate-bounce" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b0c4b8', animationDelay: '0.3s' }} />
          </div>
        </div>
      )}
    </div>
  );
};
