# Tickets & Security Plan

## 1. Ticket Creation

### Goal
Allow agents to report issues directly from the chatbot, automatically creating a tracked support ticket.

### Prisma Model

```prisma
enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
}

model SupportTicket {
  id          String         @id @default(uuid())
  agentId     String         @map("agent_id")
  agentName   String         @map("agent_name")
  category    String
  description String
  status      TicketStatus   @default(OPEN)
  priority    TicketPriority @default(MEDIUM)
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  @@map("support_tickets")
}
```

### NestJS Module

Follow the same pattern as the existing `call-reports` module:

```
src/tickets/
  tickets.module.ts
  tickets.controller.ts
  tickets.service.ts
  tickets.repository.ts
  dto/
    create-ticket.dto.ts
    update-ticket.dto.ts
    query-ticket.dto.ts
    ticket-response.dto.ts
```

### OpenAI Tool

Register a `create_ticket` tool in `openai-chat-tools.ts`. The AI calls it automatically when it detects phrases like:
- "I have a problem"
- "my payment is wrong"
- "I want to report an issue"

```typescript
{
  type: 'function',
  function: {
    name: 'create_ticket',
    description: 'Create a support ticket when the agent reports an issue',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['commission', 'payment', 'technical', 'other'] },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
      },
      required: ['category', 'description'],
    },
  },
}
```

### Commission Flow Integration

Add a new state `ISSUE_REPORTING` to `commission-flow.service.ts` with guided options:

```
Tunda Assist: "What type of issue are you experiencing?
  1️⃣ Commission discrepancy
  2️⃣ Missing payment
  3️⃣ Technical problem
  4️⃣ Other"
```

On submission, the socket gateway emits a confirmation event with the ticket ID back to the chat.

---

## 2. Security — Authentication, Authorization & Roles

### The Problem

Currently the only protection is a session identity lock — whoever types the employee ID first owns the session. Anyone who knows an employee ID can view another agent's commissions. This is a real vulnerability that needs to be closed before production.

### Authentication

**Step 1 — Identity + PIN/OTP**

After the agent enters their employee ID, require a second factor:
- **PIN**: a pre-set 4-digit PIN stored (hashed) against the agent record
- **OTP**: a one-time code sent to their registered phone number via SMS or WhatsApp

On success, issue a signed **JWT** that travels with all subsequent WebSocket messages.

**Packages needed:**
```bash
pnpm add @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
```

**Step 2 — WebSocket Auth**

The Socket.IO gateway already accepts an `auth` payload at connection time (see `CHAT_SOCKET_SECRET` in config). Validate the JWT there:

```typescript
// chat.gateway.ts — handleConnection()
const token = client.handshake.auth?.token;
const agent = this.jwtService.verify(token);
client.data.agent = agent; // attach verified identity to socket
```

All subsequent messages use `client.data.agent` — no more trusting the client to send their own employee ID.

### Agent Model

Add an `Agent` model to Prisma as the source of truth for identity (replaces CSV-only lookup for auth purposes):

```prisma
enum AgentRole {
  AGENT
  SUPERVISOR
  ADMIN
}

model Agent {
  id         String    @id @default(uuid())
  employeeId String    @unique @map("employee_id")
  name       String
  phone      String
  pinHash    String    @map("pin_hash")
  role       AgentRole @default(AGENT)
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  tickets    SupportTicket[]

  @@map("agents")
}
```

### Roles & Permissions

Three roles with clearly scoped access:

| Role | Permissions |
|---|---|
| `AGENT` | View own commissions only, create tickets for self |
| `SUPERVISOR` | View all agents' data, view/manage/resolve tickets |
| `ADMIN` | Full access, manage agents and roles |

**Implementation — `@Roles()` decorator + `RolesGuard`:**

```typescript
// common/decorators/roles.decorator.ts
export const Roles = (...roles: AgentRole[]) => SetMetadata('roles', roles);

// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<AgentRole[]>('roles', context.getHandler());
    const agent = context.switchToHttp().getRequest().user;
    return required.includes(agent.role);
  }
}
```

**Usage on controllers:**

```typescript
@Get()
@Roles(AgentRole.SUPERVISOR, AgentRole.ADMIN)
findAll() { ... }
```

### Auth Module Structure

```
src/auth/
  auth.module.ts
  auth.controller.ts     // POST /auth/login
  auth.service.ts        // verify employee ID + PIN, issue JWT
  jwt.strategy.ts        // passport-jwt strategy
  jwt-auth.guard.ts      // guards HTTP routes
  ws-auth.guard.ts       // guards WebSocket gateway
```

---

## Recommended Build Order

| Step | What | Why |
|---|---|---|
| 1 | Auth module (JWT + PIN) | Everything else depends on verified identity |
| 2 | Ticket module | Self-contained, immediately useful |
| 3 | Roles + guards | Protect REST endpoints and WebSocket gateway |
| 4 | Supervisor dashboard (React) | New page to view and manage tickets |
