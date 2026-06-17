import React from 'react';
import { MessageOption } from '../lib/types';

interface WelcomeScreenProps {
  options: MessageOption[];
  onSelectOption: (option: MessageOption) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  options,
  onSelectOption,
}) => {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#f5f7f5' }}>
      <div style={{ padding: '22px 16px 16px' }}>
        {/* Heading */}
        <p
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#1a2e22',
            marginBottom: '14px',
          }}
        >
          What would you like to check?
        </p>

        {/* Section label */}
        <p
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.9px',
            color: '#8a9e92',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Common Questions
        </p>

        {/* Quick buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(option)}
              style={{
                background: '#fff',
                border: '1.5px solid #e8eeeb',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4caf7d';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(76,175,125,0.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e8eeeb';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#e8f5ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2e9e6e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              {/* Label */}
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: '#2a3d30',
                }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
