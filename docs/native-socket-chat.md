# Native socket chat (OpenAI + tools)

## Purpose

The **`/chat` Socket.IO namespace** provides a **text-only, real-time** channel that matches the Vapi *pattern* (LLM decides which SunCulture **tools** to run; this server executes them via [`ToolsService`](../src/tools/tools.service.ts)), but **without Vapi, Claude, or the phone network**.

It is **independent** of Telegram and the Vapi webhooks. Do not share transport code between those modules unless you are deliberately unifying them.

- **LLM:** OpenAI Chat Completions with `tools` (see [`openai-chat.service.ts`](../src/chat/open-ai-chat.service.ts))
- **Transport:** WebSockets via `socket.io` and Nest’s [`ChatGateway`](../src/chat/chat.gateway.ts)
- **History:** `ChatThread` and `ChatMessage` in PostgreSQL (see [schema](../prisma/schema.prisma))
- **Tool JSON schemas:** [`openai-chat-tools.ts`](../src/chat/openai-chat-tools.ts) — keep aligned with the Vapi tool definitions in the dashboard when both exist.

## Connection

Default HTTP server (see `PORT` in [environment-variables](./environment-variables.md)). Socket.IO uses the same port.

- **Namespace path:** `/chat` (e.g. `io('http://localhost:3000/chat')` in `socket.io-client`).

Optional shared secret: if `CHAT_SOCKET_SECRET` is set in the environment, every connection must send the same value as `auth.token` (or the `token` query param). Otherwise any client can connect (development only).

## Events (client → server)

| Event | Body | |
|--------|------|---|
| `thread.join` | `{ threadId?: string, metadata?: object }` | If `threadId` is omitted, a new UUID thread is created. If provided and not found, a thread is created with that id. |
| `thread.message` | `{ text: string }` | Must run **after** a successful `thread.join` in that socket session. |

## Events (server → client)

| Event | Body |
|--------|------|
| `thread.joined` | `{ threadId: string, created: boolean }` |
| `message.user` | `{ id: string, text: string }` (persisted user row) — **emitted as soon as the user turn is saved**, before the model runs |
| `message.assistant` | `{ id: string, text: string }` (final model reply) — delivered after the OpenAI + tool loop completes |
| `error` | `{ code: string, message: string }` e.g. `NO_THREAD`, `CHAT_FAILED`, `THREAD_JOIN_FAILED` |

The server sends **full** assistant text when the tool loop has finished (no token streaming in the first version).

## REST (history for UIs)

Same origin as the HTTP API (no separate port). Use these to list threads and load past messages before or alongside Socket.IO.

| Method | Path | |
|--------|------|---|
| `GET` | `/chat/threads?page=1&limit=30` | Paginated threads, most recently updated first; each row includes a short `preview` from the latest message. |
| `GET` | `/chat/threads/:threadId/messages` | All messages in chronological order (`user`, `assistant`, `tool`, `system` roles as stored). |

Documented in Swagger under the `chat` tag (`/api/docs`).

## Example: `socket.io-client`

```bash
npm install socket.io-client
```

```javascript
import { io } from 'socket.io-client';

const base = 'http://localhost:3000';
const secret = process.env.CHAT_SOCKET_SECRET; // optional

const socket = io(`${base}/chat`, {
  auth: secret ? { token: secret } : undefined,
  transports: ['websocket'],
});

socket.on('connect', () => {
  socket.emit('thread.join', { metadata: { client: 'docs-example' } });
});

socket.on('thread.joined', (p) => {
  console.log('thread', p.threadId);
  socket.emit('thread.message', { text: 'What is the deposit for a RainMaker2S system?' });
});

socket.on('message.user', (m) => console.log('user', m));
socket.on('message.assistant', (m) => console.log('assistant', m));
socket.on('error', (e) => console.error(e));
```

## Environment

See [environment-variables.md](./environment-variables.md) for `OPENAI_API_KEY`, optional `OPENAI_CHAT_MODEL`, `OPENAI_MAX_CONTEXT_MESSAGES`, `OPENAI_MAX_TOOL_ITERATIONS`, and `CHAT_SOCKET_SECRET`.

## Security and data

- Chat rows may include **PII** if users paste National IDs or the model calls `check_account`. Handle retention like any other support channel.
- **Never commit** real API keys; use secrets in production hosting.

## Swagger

See the `chat` tag at `/api/docs` for query parameters and response shapes.
