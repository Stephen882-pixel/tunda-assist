# Tunda Assist - Chatbot Flow Documentation

## Overview

This document details the complete conversation flow, intent detection logic, and response handling in the Tunda Assist chatbot.

## Conversation Phases

### 1. Greeting Phase
- **Trigger**: App initialization or start of conversation
- **Bot Action**: Displays welcome message with main menu options
- **Options Shown**:
  - Check my commissions
  - Check customer or Leads
  - Calculate Commissions

**Example Response**:
```
Hi there! I'm Tunda Assist, your AI commission assistant. What would you like to check?

[Check my commissions] [Check customers] [Calculate Commissions]
```

### 2. User Input Processing
- **Trigger**: User types message and sends
- **Bot Action**: Analyzes input using intent detector
- **Result**: Determines intent type and extracts parameters

### 3. Data Retrieval
- **Trigger**: Intent detected with required parameters
- **Bot Action**: Calls appropriate API endpoint
- **Delay**: Simulated 500ms network delay
- **Result**: Structured data returned

### 4. Response Formatting
- **Trigger**: Data received from API
- **Bot Action**: Formats data into user-friendly message
- **Result**: Message with follow-up options

### 5. Options Display
- **Trigger**: Response generated
- **Bot Action**: Shows available next actions as buttons
- **User Action**: Selects option or types new question

## Intent Detection Logic

### Commission Summary Intent

**Triggers**:
- User mentions "commission", "earnings", "income", "revenue", or "payout"
- Does NOT mention "breakdown"

**Keywords**: 
```
commission, earnings, income, revenue, payout, check
```

**Parameter Extraction**:
- Looks for period indicators: "14", "30", "60", "90", "days", "month"
- Defaults to "14_days" if not specified

**Example Inputs**:
- "Check my commissions"
- "What's my earnings?"
- "Show me revenue for the month"
- "Last 30 day payout"

**Expected Response**:
```
Commission amount for the [PERIOD] is [AMOUNT]

[Breakdown] [Something else]
```

### Commission Breakdown Intent

**Triggers**:
- User mentions "commission" AND ("breakdown", "detailed", "how much", "where")

**Keywords**:
```
commission + (breakdown, detailed, how much, where)
```

**Parameter Extraction**:
- Same period extraction as commission summary
- Defaults to "14_days" if not specified

**Example Inputs**:
- "Show me breakdown of my commissions"
- "How much did I earn from each source?"
- "Detailed 60 day commission report"
- "Where did my 30 day revenue come from?"

**Expected Response**:
```
Commission breakdown for [PERIOD]:
Total: [AMOUNT]

Breakdown:
• Sales commission: [AMOUNT]
• Referral bonus: [AMOUNT]
• Performance bonus: [AMOUNT]

[Check commission periods] [Check customers or Leads] [Calculate Commissions] [Check a break down of commissions]
```

### Lead Status Intent

**Triggers**:
- User mentions "lead", "customer", "prospect", "client", or "contact"

**Keywords**:
```
lead, customer, prospect, client, contact
```

**Parameter Extraction**:
- Looks for lead name after keywords
- Patterns: "lead john", "customer smith", "prospect williams"
- Defaults to "default" lead if not found

**Example Inputs**:
- "How is John doing?"
- "Check lead Sarah"
- "Customer Mike status"
- "Where are we with prospect Emma?"

**Expected Response**:
```
Lead: [NAME]
Status: [STATUS]
Last Contact: [DATE/TIME]
Conversion Value: [AMOUNT]

[Check commission periods] [Check customers or Leads] [Calculate Commissions] [Check a break down of commissions]
```

### Custom Question Intent

**Triggers**:
- User input doesn't match other intents clearly
- Default fallback for unclear requests

**Confidence**: Low (0.3)

**Example Inputs**:
- Random questions not matching other patterns
- Typos or unclear phrasing

**Expected Response**:
```
I understand you're asking about: "[USER_QUESTION]". I can help you with:

1. Check commission periods
2. Check customers or Leads
3. Calculate Commissions
4. Check a break down of commissions

Which would you prefer?

[Check commission periods] [Check customers or Leads] [Calculate Commissions] [Check a break down of commissions]
```

### Greeting Intent

**Triggers**:
- User types greeting words at start of conversation

**Keywords**:
```
hi, hello, hey, greetings, good morning, good afternoon, good evening
```

**Expected Response**: Same as greeting phase

## Sample Conversation Flows

### Flow 1: Check Commission with Breakdown

```
1. BOT (Greeting):
   "Hi there! I'm Tunda Assist..."
   [Check my commissions] [Check customer or Leads] [Calculate Commissions]

2. USER:
   "Check my commissions"
   
3. BOT (Intent: commission_summary, Period: 14_days):
   "Commission amount for the 14 days is $3,500"
   [Breakdown] [Something else]

4. USER:
   "Breakdown"
   
5. BOT (Intent: commission_breakdown, Period: 14_days):
   "Commission breakdown for 14 days:
    Total: $3,500
    
    Breakdown:
    • Sales commission: $1,800
    • Referral bonus: $1,000
    • Performance bonus: $700"
   [Check commission periods] [Check customers or Leads] [Calculate Commissions] [Check a break down of commissions]
```

### Flow 2: Check Lead Status

```
1. BOT (Greeting):
   "Hi there! I'm Tunda Assist..."
   [Check my commissions] [Check customer or Leads] [Calculate Commissions]

2. USER:
   "How is John doing?"
   
3. BOT (Intent: lead_status, LeadId: john):
   "Lead: John Doe
    Status: active
    Last Contact: 2024-01-18 02:30 PM
    Conversion Value: $15,000"
   [Check commission periods] [Check customers or Leads] [Calculate Commissions] [Check a break down of commissions]
```

### Flow 3: Custom Question

```
1. BOT (Greeting):
   "Hi there! I'm Tunda Assist..."
   [Check my commissions] [Check customer or Leads] [Calculate Commissions]

2. USER:
   "What can you help me with?"
   
3. BOT (Intent: custom_question):
   "I understand you're asking about: 'What can you help me with?'. 
    I can help you with:
    
    1. Check commission periods
    2. Check customers or Leads
    3. Calculate Commissions
    4. Check a break down of commissions
    
    Which would you prefer?"
   [Check commission periods] [Check customers or Leads] [Calculate Commissions] [Check a break down of commissions]

4. USER:
   "Check customers or Leads"
   
5. BOT: (Leads display flow)
```

## Data Flow Diagram

```
User Input
    ↓
Intent Detector
    ├─ Analyzes keywords
    ├─ Extracts parameters
    └─ Returns: Intent + Parameters
    ↓
ChatWidget Handler
    ├─ Adds user message to state
    └─ Branches by intent type
    ↓
API Client (Mock/Real)
    ├─ getCommissionData()
    ├─ getLeadStatus()
    └─ Returns structured data
    ↓
Response Formatter
    ├─ Formats message
    ├─ Includes follow-up options
    └─ Returns: Message + Options
    ↓
Message List
    ├─ Displays message
    ├─ Shows option buttons
    └─ Awaits user selection
    ↓
Next Cycle or End
```

## Intent Confidence Levels

```
greeting:               1.0   (100% confident)
commission_summary:     0.85  (85% confident)
commission_breakdown:   0.9   (90% confident)
lead_status:            0.8   (80% confident)
custom_question:        0.3   (30% confident)
unknown:                0.0   (fallback)
```

## Error Handling

### API Call Failures
- **Current**: Simulated with setTimeout (always succeeds)
- **Real API**: Wrapped in try-catch
- **User Feedback**: "Sorry, I encountered an error. Please try again."

### Unknown Leads
- **Behavior**: Returns default lead with "Lead not found" message
- **User Experience**: Still provides lead status format

### Invalid Parameters
- **Behavior**: Defaults to safe values (e.g., "14_days" for period)
- **User Experience**: No error shown, sensible default applied

## Period Parameter Handling

```
User Input          → Detected Period → Fallback
"14"                → 14_days          → -
"two weeks"         → 14_days          → -
"30"                → 30_days          → -
"month"             → 30_days          → -
"60"                → 60_days          → -
"two months"        → 60_days          → -
"90"                → 90_days          → -
"three months"      → 90_days          → -
"quarter"           → 90_days          → -
"custom"            → custom           → -
(no match)          → (none)           → 14_days
```

## Type Definitions Reference

See `src/lib/types.ts` for complete TypeScript interfaces:

```typescript
// Intent types
type Intent = 'commission_summary' | 'commission_breakdown' | 'lead_status' | 'custom_question' | 'greeting' | 'unknown'

// Message structure
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  options?: MessageOption[]
  metadata?: {
    intent?: Intent
    period?: CommissionPeriod
    leadId?: string
  }
}

// Options for quick selections
interface MessageOption {
  id: string
  label: string
  value: string
  action?: 'select_option' | 'show_options'
}
```

## Extension Points

### Adding New Intent

1. **Update types.ts**: Add to `Intent` union
2. **Update intent-detector.ts**: Add keywords and detection logic
3. **Update response-formatter.ts**: Add formatting method
4. **Update ChatWidget.tsx**: Add case in switch statement
5. **Update mock-data.ts**: Add mock data if needed

### Adding New Period

1. **Update types.ts**: Add to `CommissionPeriod` union
2. **Update intent-detector.ts**: Add keywords to periodKeywords
3. **Update mock-data.ts**: Add commission data for period
4. **Update response-formatter.ts**: Update period labels if needed

### Switching to Real API

1. **Update api-client.ts**: Replace mock methods with real fetch calls
2. **Add authentication**: Add headers/tokens as needed
3. **Handle errors**: Add proper error handling and retry logic
4. **Update mock-data.ts**: Can be removed if using real API

## Testing Conversation Examples

Try these inputs in the chatbot:

### Commission Queries
- "Check my commissions"
- "What's my 30 day earnings?"
- "Show me revenue breakdown"
- "How much did I earn last month?"

### Lead Queries
- "How is John doing?"
- "Lead Sarah status"
- "Customer Mike"
- "Check prospect Emma"

### Custom Queries
- "Hello"
- "Hi there"
- "What can you help with?"
- "I want to know about my performance"

Each input will trigger different intents and response flows as documented above.
