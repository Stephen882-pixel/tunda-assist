import React from 'react';
import { MessageOption } from '../lib/types';

interface MessageOptionsProps {
  options: MessageOption[];
  onSelectOption: (option: MessageOption) => void;
  disabled?: boolean;
}

/**
 * Inline numbered options rendered INSIDE a bot bubble.
 * Matches the design: "1. 14 days\n2. 30 days" etc.
 */
export const MessageOptions: React.FC<MessageOptionsProps> = ({
  options,
  onSelectOption,
  disabled = false,
}) => {
  return (
    <ol
      style={{
        listStyle: 'none',
        padding: '0',
        margin: '6px 0 0 0',
      }}
    >
      {options.map((option, idx) => (
        <li key={option.id} style={{ marginTop: idx > 0 ? '2px' : 0 }}>
          <button
            onClick={() => !disabled && onSelectOption(option)}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 0',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              fontSize: 'inherit',
              color: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.color = '#2e9e6e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit';
            }}
          >
            {idx + 1}. {option.label}
          </button>
        </li>
      ))}
    </ol>
  );
};
