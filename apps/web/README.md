# Tunda Assist - AI Commission Chatbot

A modern, production-ready AI-powered chatbot built with React + Vite that helps users check commissions, lead status, and answer questions about their business metrics.

## Features

- **Intent Detection**: Automatically understands user queries (commission summary, breakdown, lead status, custom questions)
- **Real-time Chat**: Clean, intuitive chat interface with message history
- **Interactive Options**: Quick-select buttons for common actions
- **Mock Data**: Pre-loaded with sample commission and lead data for demonstration
- **Type-Safe**: Full TypeScript support with strict type checking
- **Responsive Design**: Mobile-friendly chat interface
- **Zero External AI APIs**: Intent detection built with regex patterns and keyword matching

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
# or
pnpm build
```

## Project Structure

```
src/
├── components/
│   ├── ChatWidget.tsx       # Main chat component & logic
│   ├── MessageList.tsx      # Message display
│   ├── ChatInput.tsx        # User input form
│   └── MessageOptions.tsx   # Quick action buttons
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   ├── utils.ts             # Helper functions
│   ├── intent-detector.ts   # AI intent detection
│   ├── response-formatter.ts # Response formatting
│   ├── api-client.ts        # API client (mock)
│   └── mock-data.ts         # Sample data
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css                # Global styles

Config Files:
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── index.html               # HTML template
```

## Usage Examples

### Check Commission for 14 Days
**User Input**: "Check my commissions"
**Bot Response**: Detects commission summary intent, returns amount for last 14 days with option to see breakdown

### Get Breakdown
**User Input**: "I'd like a breakdown of my 30 day commission"
**Bot Response**: Shows detailed breakdown of commission sources for the requested period

### Check Lead Status
**User Input**: "How is John doing?" or "lead john status"
**Bot Response**: Returns status, last contact, and conversion value for the lead

### Custom Questions
**User Input**: Any other question
**Bot Response**: Offers menu of available actions to help user

## Intent Detection

The chatbot recognizes these intents:

- **commission_summary**: User wants to see total commissions for a period
- **commission_breakdown**: User wants detailed breakdown of commission sources
- **lead_status**: User wants information about a specific lead/customer
- **custom_question**: Any other query
- **greeting**: Initial conversation start

### Keywords & Parameters

The intent detector looks for:
- **Commission keywords**: commission, earnings, income, revenue, payout
- **Breakdown keywords**: breakdown, detailed, how much, where
- **Lead keywords**: lead, customer, prospect, client, contact
- **Periods**: 14 days, 30 days, 60 days, 90 days, custom

Example: "Show me my 30 day commission breakdown" → `commission_breakdown` intent with `30_days` period

## API Integration

### Current Implementation (Mock)

The `ApiClient` class provides these methods:

```typescript
// Get commission data for a specific period
getCommissionData(period: CommissionPeriod): Promise<CommissionData>

// Get lead information
getLeadStatus(leadId: string): Promise<LeadStatus>

// Detect intent (client-side implementation)
detectIntent(userInput: string): Promise<{intent, parameters}>
```

### Switching to Real API

To integrate with a real backend:

1. Update `src/lib/api-client.ts`:
```typescript
async getCommissionData(period: CommissionPeriod): Promise<CommissionData> {
  const response = await fetch(`/api/commissions/${period}`);
  return response.json();
}
```

2. Replace mock data in responses with real API calls
3. Add authentication headers as needed

## Mock Data

### Commission Periods
- **14 days**: $3,500
- **30 days**: $7,200
- **60 days**: $15,600
- **90 days**: $25,800

### Sample Leads
- **John Doe**: Active, $15,000 potential value
- **Sarah Smith**: Qualified, $8,500 potential value
- **Mike Johnson**: Pending, $5,000 potential value
- **Emma Williams**: Closed, $25,000 actual value

## State Management

The chatbot uses React hooks for state:

- **chatState**: Stores messages, current intent, conversation phase
- **isLoading**: Tracks API call status

Key actions:
1. User sends message
2. Intent detector analyzes input
3. API client fetches relevant data
4. Response formatter creates bot message
5. Message added to chat history

## Styling

Built with Tailwind CSS:
- **Primary color**: `#4CAF50` (green)
- **Primary dark**: `#2d7a3d` (darker green)
- **Background**: `#f8faf9` (light gray)
- **Accent**: `#ffc107` (yellow)

Color tokens are defined in `tailwind.config.js` for consistent theming.

## Conversation Flow

```
1. GREETING
   → Bot greets user with main menu options
   
2. USER SELECTS ACTION
   → "Check my commissions" / "Check leads" / etc.
   
3. BOT DETECTS INTENT
   → commission_summary / commission_breakdown / lead_status
   
4. FETCH DATA
   → ApiClient retrieves relevant information
   
5. FORMAT RESPONSE
   → ResponseFormatter creates user-friendly message
   
6. SHOW OPTIONS
   → Bot provides next action buttons
   
7. REPEAT
   → User can continue conversation or select new action
```

## Extending the Chatbot

### Add New Intent

1. Add intent type to `src/lib/types.ts`:
```typescript
type Intent = '...' | 'new_intent'
```

2. Add detection logic to `src/lib/intent-detector.ts`:
```typescript
if (this.hasKeywords(input, ['new', 'keywords'])) {
  return { intent: 'new_intent', ... }
}
```

3. Add response formatter to `src/lib/response-formatter.ts`:
```typescript
formatNewIntent(data: any): { message: string; options: MessageOption[] } {
  // Format response
}
```

4. Handle in ChatWidget:
```typescript
case 'new_intent':
  const { message, options } = responseFormatter.formatNewIntent(data)
  // Create message
```

### Add New Data Source

1. Create API method in `src/lib/api-client.ts`
2. Add mock data to `src/lib/mock-data.ts`
3. Reference in ChatWidget or response formatter

## Performance Considerations

- Messages scroll to bottom automatically
- Debounced input handling
- Lazy loading for large message lists
- CSS animations optimized for performance

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
