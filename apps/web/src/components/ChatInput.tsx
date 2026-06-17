import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask a question...',
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px 14px 14px',
        background: '#f5f7f5',
        borderTop: '1px solid #e8eeeb',
        flexShrink: 0,
      }}
    >
      {/* Input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          background: '#fff',
          border: '1.5px solid #dce8e1',
          borderRadius: '12px',
          padding: '0 12px',
          marginBottom: '10px',
        }}
      >
        {/* Star icon */}
        <span style={{ flexShrink: 0, marginRight: '8px', display: 'flex' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4caf7d"
            strokeWidth="1.8"
            strokeLinejoin="round"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: '13.5px',
            color: '#2a3d30',
            padding: '12px 0',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="chat-send-gradient"
        style={{
          width: '100%',
          padding: '13px',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: '14.5px',
          fontWeight: 600,
          letterSpacing: '0.2px',
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          opacity: disabled || !input.trim() ? 0.5 : 1,
          boxShadow: '0 4px 14px rgba(46,158,110,0.35)',
          transition: 'opacity 0.15s, transform 0.1s',
        }}
        onMouseEnter={(e) => {
          if (!disabled && input.trim()) e.currentTarget.style.opacity = '0.92';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = disabled || !input.trim() ? '0.5' : '1';
        }}
      >
        Send
      </button>
    </form>
  );
};
