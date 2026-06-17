# API Integration Guide

This document explains how to integrate the Tunda Assist chatbot with a real backend API.

## Current Architecture

The chatbot currently uses a **client-side mock API** with:
- Intent detection (built-in, no API call needed)
- Mock commission data
- Mock lead data

The `ApiClient` class in `src/lib/api-client.ts` provides the interface for all backend calls.

## Switching to Real API

### Step 1: Update API Client Configuration

**File**: `src/lib/api-client.ts`

```typescript
export class ApiClient {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  
  // Rest of the class...
}
```

Add environment variable to `.env.local`:
```
VITE_API_URL=https://your-api-domain.com/api
```

Update API client to use the environment variable:
```typescript
private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### Step 2: Implement Real API Methods

#### Get Commission Data

**Backend Endpoint Expected**:
```
GET /api/commissions/{period}

Parameters:
  period: string (14_days | 30_days | 60_days | 90_days | custom)

Response:
{
  "period": "30_days",
  "amount": 7200,
  "currency": "USD",
  "details": [
    {
      "date": "2024-01-05",
      "description": "Sales commission",
      "amount": 4000
    },
    ...
  ]
}
```

**Implementation**:
```typescript
async getCommissionData(period: CommissionPeriod): Promise<CommissionData> {
  const response = await fetch(`${this.baseUrl}/commissions/${period}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch commission data: ${response.statusText}`);
  }
  
  return response.json();
}
```

#### Get Lead Status

**Backend Endpoint Expected**:
```
GET /api/leads/{leadId}

Parameters:
  leadId: string (lead identifier, e.g., "john", "sarah-smith")

Response:
{
  "leadId": "lead-john-001",
  "leadName": "John Doe",
  "status": "active",
  "lastContact": "2024-01-18 02:30 PM",
  "conversionValue": 15000,
  "notes": "High-value prospect, interested in premium plan"
}
```

**Implementation**:
```typescript
async getLeadStatus(leadId: string): Promise<LeadStatus> {
  const response = await fetch(`${this.baseUrl}/leads/${leadId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lead status: ${response.statusText}`);
  }
  
  return response.json();
}
```

#### Intent Detection (Optional - Server-Side)

If you want to move intent detection to the backend:

**Backend Endpoint Expected**:
```
POST /api/intent

Body:
{
  "userInput": "Check my 30 day commissions"
}

Response:
{
  "intent": "commission_summary",
  "confidence": 0.85,
  "parameters": {
    "period": "30_days"
  }
}
```

**Implementation**:
```typescript
async detectIntent(userInput: string): Promise<IntentDetectionResult> {
  const response = await fetch(`${this.baseUrl}/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to detect intent: ${response.statusText}`);
  }
  
  return response.json();
}
```

### Step 3: Add Authentication

If your API requires authentication:

```typescript
export class ApiClient {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  private authToken: string = '';

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  async getCommissionData(period: CommissionPeriod): Promise<CommissionData> {
    const response = await fetch(`${this.baseUrl}/commissions/${period}`, {
      headers: this.getHeaders()
    });
    
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch commission data: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Update other methods similarly...
}
```

Usage in ChatWidget:
```typescript
// On user login
const token = await login(email, password);
apiClient.setAuthToken(token);
```

### Step 4: Add Error Handling

Update ChatWidget to handle real API errors:

```typescript
const handleSendMessage = async (userInput: string) => {
  // ... existing code ...
  
  try {
    // ... intent detection and API calls ...
  } catch (error) {
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    const errorBotMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: errorMessage,
      timestamp: new Date(),
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, errorBotMessage],
    }));
  } finally {
    setIsLoading(false);
  }
};
```

### Step 5: Add Retry Logic

For production reliability:

```typescript
export class ApiClient {
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  private async withRetry<T>(
    fn: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryable(error)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  private isRetryable(error: any): boolean {
    // Retry on network errors, not on 4xx errors
    return error instanceof TypeError || 
           (error instanceof Error && error.message.includes('network'));
  }

  async getCommissionData(period: CommissionPeriod): Promise<CommissionData> {
    return this.withRetry(() =>
      fetch(`${this.baseUrl}/commissions/${period}`, {
        headers: this.getHeaders()
      }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
    );
  }

  // Update other methods similarly...
}
```

## Backend API Example (Node.js/Express)

Here's a minimal example of what your backend could look like:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Commission data endpoint
app.get('/api/commissions/:period', (req, res) => {
  const { period } = req.params;
  
  const commissions: Record<string, any> = {
    '14_days': {
      period: '14_days',
      amount: 3500,
      currency: 'USD',
      details: [
        { date: '2024-01-10', description: 'Sales commission', amount: 1800 },
        { date: '2024-01-15', description: 'Referral bonus', amount: 1000 },
        { date: '2024-01-18', description: 'Performance bonus', amount: 700 },
      ]
    },
    // ... more periods
  };
  
  const data = commissions[period];
  if (!data) {
    return res.status(404).json({ error: 'Period not found' });
  }
  
  res.json(data);
});

// Lead status endpoint
app.get('/api/leads/:leadId', (req, res) => {
  const { leadId } = req.params;
  
  const leads: Record<string, any> = {
    'john': {
      leadId: 'lead-john-001',
      leadName: 'John Doe',
      status: 'active',
      lastContact: '2024-01-18 02:30 PM',
      conversionValue: 15000,
      notes: 'High-value prospect'
    },
    // ... more leads
  };
  
  const lead = leads[leadId];
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  
  res.json(lead);
});

// Intent detection endpoint
app.post('/api/intent', (req, res) => {
  const { userInput } = req.body;
  
  // Your NLP/intent detection logic here
  let intent = 'custom_question';
  let period = '14_days';
  
  if (userInput.includes('commission')) {
    intent = 'commission_summary';
    if (userInput.includes('30')) period = '30_days';
    if (userInput.includes('60')) period = '60_days';
    if (userInput.includes('90')) period = '90_days';
  }
  
  res.json({
    intent,
    confidence: 0.85,
    parameters: { period }
  });
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

## Type Definitions for Backend

Ensure your backend returns data matching these TypeScript types:

```typescript
// From src/lib/types.ts
interface CommissionData {
  period: CommissionPeriod;
  amount: number;
  currency: string;
  details?: CommissionDetail[];
}

interface CommissionDetail {
  date: string;
  description: string;
  amount: number;
}

interface LeadStatus {
  leadId: string;
  leadName: string;
  status: 'active' | 'closed' | 'pending' | 'qualified';
  lastContact: string;
  conversionValue?: number;
  notes?: string;
}

interface IntentDetectionResult {
  intent: Intent;
  confidence: number;
  parameters: {
    period?: CommissionPeriod;
    leadId?: string;
    customInput?: string;
  };
}
```

## Testing the Integration

### 1. Test with curl

```bash
# Get commission data
curl http://localhost:3001/api/commissions/30_days

# Get lead status
curl http://localhost:3001/api/leads/john

# Detect intent
curl -X POST http://localhost:3001/api/intent \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Check my 30 day commissions"}'
```

### 2. Test in chatbot

1. Start both frontend and backend servers
2. Open chatbot in browser
3. Send messages and verify:
   - Intent detection works correctly
   - API calls return expected data
   - Responses display correctly

### 3. Check network requests

Open browser DevTools Network tab:
- Look for requests to your backend
- Verify response status codes
- Check response payloads

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

**Backend (Express)**:
```typescript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

### API Timeout

Add timeout handling:
```typescript
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};
```

### Authentication Issues

Ensure tokens are:
- Properly set before API calls
- Not expired
- Included in all requests requiring auth

## Going to Production

1. **Update environment variables**:
   - Change API URL to production domain
   - Set up proper authentication

2. **Test thoroughly**:
   - Test all conversation flows
   - Test error scenarios
   - Test with real data

3. **Monitor**:
   - Log API errors
   - Monitor response times
   - Track failed requests

4. **Security**:
   - Use HTTPS only
   - Validate all user inputs
   - Never expose secrets in client code
   - Implement proper rate limiting

5. **Caching** (Optional):
   - Cache commission data for period
   - Invalidate cache when data changes
   - Use SWR for automatic revalidation

## Migration Checklist

- [ ] API endpoints documented
- [ ] API client methods implemented
- [ ] Authentication working
- [ ] Error handling in place
- [ ] Retry logic implemented
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Tested locally with backend
- [ ] Tested on staging
- [ ] Security review completed
- [ ] Performance tested
- [ ] Monitoring set up
- [ ] Documentation updated
