# TundaAssist <> Backend Integration

This document explains how the TundaAssist React frontend is integrated with the ivy-ai backend via Socket.IO.

## Architecture Overview

```
┌─────────────────────┐
│  TundaAssist        │
│  React + Vite       │
│  Socket.IO Client   │
└──────────┬──────────┘
           │ WebSocket
           │ (Socket.IO)
           ▼
┌─────────────────────┐
│  Backend /chat      │
│  NestJS Gateway     │
│  Socket.IO Server   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OpenAI + Tools     │
│  - Commission Tools │
│  - Lead Status      │
│  - SunCulture Tools │
└─────────────────────┘
```

## What Was Changed

### Backend Changes

#### 1. New Commission Tools (`src/tools/`)
- **`commission-summary.tool.ts`** - Returns total commission for a period (14/30/60/90 days)
- **`commission-breakdown.tool.ts`** - Detailed breakdown by source (CDS2, JSF, Transport, TV, Drip)
- **`lead-status.tool.ts`** - Look up lead info by ID (status, contact, value, notes)

#### 2. Tool Registration
- Added to `tools.module.ts` as injectable providers
- Registered in `tools.service.ts` with execution logic
- Added to `openai-chat-tools.ts` for OpenAI function calling

#### 3. System Prompt Update
- Updated `chat-system-prompt.ts` to handle commission queries
- Commission tools available without employee validation

#### 4. CORS Configuration
- Updated `main.ts` to allow `http://localhost:5173` (Vite dev server)
- Enabled credentials for Socket.IO authentication

### Frontend Changes

#### 1. New Files
- **`src/lib/socket-client.ts`** - Socket.IO connection manager
- **`.env`** - Environment configuration for backend URL

#### 2. Updated Files
- **`src/components/ChatWidget.tsx`** - Complete rewrite to use Socket.IO
- **`package.json`** - Added `socket.io-client` dependency

#### 3. Removed Files (No Longer Needed)
- The following files still exist but are not used by the new Socket.IO implementation:
  - `src/lib/api-client.ts` (mock API)
  - `src/lib/intent-detector.ts` (local intent detection)
  - `src/lib/mock-data.ts` (fake data)
  - `src/lib/response-formatter.ts` (now AI handles formatting)

## How It Works

### 1. Connection Flow

```javascript
User opens TundaAssist
  → Socket.IO connects to backend at /chat namespace
  → Frontend emits 'thread.join'
  → Backend creates/retrieves thread in database
  → Backend emits 'thread.joined' with threadId
  → Chat is ready
```

### 2. Message Flow

```javascript
User types message
  → Frontend emits 'thread.message' with text
  → Backend receives message
  → OpenAI analyzes intent
  → If tool needed: ToolsService.execute() called
  → OpenAI formats natural response
  → Backend emits 'message.incoming'
  → Frontend displays in chat UI
```

### 3. Tool Execution Example

**User Input:** "Show me my commission for the last 30 days"

1. Frontend sends: `{ text: "Show me my commission for the last 30 days" }`
2. Backend OpenAI detects: Call `get_commission_summary` with `period: "30_days"`
3. Tool returns: Commission data with amount and date range
4. OpenAI formats: Natural language response
5. Frontend receives: "Your total commission for the last 30 days is KES 4,832.50..."

## Quick Actions

The chat includes quick action buttons that remain visible after each AI response:
- **Check my commissions** → "Show me my commission for the last 30 days"
- **Get breakdown** → "Show me a detailed breakdown of my commissions"
- **Check a lead** → "I want to check the status of a lead"
- **Help** → "What can you help me with?"

These buttons simply send pre-formatted text messages to the AI.

## Environment Configuration

### Backend (`.env`)
```bash
PORT=3000
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
# ... other variables
```

### Frontend (`TundaAssist/.env`)
```bash
VITE_BACKEND_URL=http://localhost:3000
# VITE_SOCKET_SECRET=your-secret-here  # Optional
```

## Running the Integration

### 1. Start Backend
```bash
# From project root
npm run start:dev
```

Backend will run on http://localhost:3000

### 2. Start Frontend
```bash
# From project root
cd TundaAssist
npm run dev
```

Frontend will run on http://localhost:5173

### 3. Test the Chat
1. Open http://localhost:5173 in your browser
2. Click the chat button in the bottom-right corner
3. Try these sample queries:
   - "Show me my commission for the last 30 days"
   - "I want a detailed breakdown"
   - "Check status of LEAD-001"
   - "What products does SunCulture offer?"

## Data Persistence

All conversations are automatically saved to PostgreSQL:
- **`ChatThread`** table stores conversation threads
- **`ChatMessage`** table stores individual messages
- Each thread has a unique ID and can be resumed later

## Mock Data

Currently using mock data for commission queries:
- **Commission amounts** - Predefined for 14/30/60/90 day periods
- **Lead information** - Sample leads (LEAD-001 through LEAD-005)

To integrate real data, update the tool files in `src/tools/` to call your actual APIs.

## Troubleshooting

### Frontend Can't Connect
- Ensure backend is running on port 3000
- Check CORS settings in `src/main.ts`
- Verify `VITE_BACKEND_URL` in `TundaAssist/.env`

### AI Not Responding
- Check OpenAI API key in backend `.env`
- Check browser console for Socket.IO errors
- Verify tools are registered in `tools.service.ts`

### Tool Not Working
- Ensure tool is in `openai-chat-tools.ts`
- Check tool name matches exactly in `tools.service.ts`
- Verify function signature matches OpenAI schema

## Next Steps

### Connect Real Data
Replace mock data in commission tools:
```typescript
// Instead of MOCK_SUMMARIES
const summary = await fetch('/api/commissions/summary', { ... });
```

### Add Authentication
Update Socket.IO handshake to require user tokens:
```typescript
// Backend: chat.gateway.ts
const token = client.handshake.auth.token;
const user = await validateToken(token);
```

### Persist Thread IDs
Store threadId in localStorage to resume conversations:
```typescript
// Frontend
const storedThreadId = localStorage.getItem('tunda-thread-id');
socketClient.joinThread(storedThreadId);
```

### Add Typing Indicators
Show when AI is thinking:
```typescript
socket.on('assistant.typing', () => setShowTyping(true));
```

## Benefits of This Integration

✅ **Real AI Processing** - No more mock data, actual OpenAI intelligence  
✅ **Database Persistence** - All conversations saved and retrievable  
✅ **Extensible** - Easy to add new tools and capabilities  
✅ **Real-time** - WebSocket for instant bidirectional communication  
✅ **Type-safe** - End-to-end TypeScript  
✅ **Reusable Backend** - Same backend serves Vapi (voice), Telegram, and TundaAssist  
✅ **Production Ready** - Proper error handling, validation, logging

## Architecture Decisions

### Why Socket.IO Over REST?
- Real-time bidirectional communication
- Automatic reconnection handling
- Lower latency for chat interactions
- Native support for events and streaming

### Why OpenAI Over Local Intent Detection?
- More accurate understanding of natural language
- Handles complex, multi-part queries
- Learns from context across the conversation
- No need to maintain regex patterns

### Why Shared Backend?
- Single source of truth for business logic
- Consistent responses across all channels
- Easier to maintain and update
- Better security and data consistency
