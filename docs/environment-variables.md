# Environment Variables

## What Are Environment Variables?

Environment variables are settings and credentials that the server reads at startup. They are stored in a file called `.env` in the project root. This file is never committed to version control (it's in `.gitignore`) to keep credentials safe.

An example file called `.env.example` is committed — it shows which variables are needed but has no real values.

---

## The `.env` File

Create this file by copying the example:

```bash
cp .env.example .env
```

Then fill in the actual values.

---

## All Variables Explained

### `PORT`
**What it does:** Sets which port the server listens on.
**Default:** `3000`
**Example:** `PORT=3000`

You only need to change this if something else on your machine is already using port 3000.

---

### `VAPI_API_KEY`
**What it does:** Authenticates requests to the Vapi API (used if the server makes outbound calls to Vapi — e.g. to fetch call logs).
**Where to find it:** Vapi dashboard → Account → API Keys
**Example:** `VAPI_API_KEY=vapi_xxxxxxxxxxxxxxxx`

---

### `PUBLIC_URL`
**What it does:** The publicly accessible URL of this server. Used so Vapi knows where to send webhook events.
**Development:** Set this to your ngrok URL (e.g. `https://abc123.ngrok-free.app`)
**Production:** Set this to your deployed domain (e.g. `https://api.sunculture.io`)
**Example:** `PUBLIC_URL=https://abc123.ngrok-free.app`

> In development, this changes every time you restart ngrok. Update both `.env` and the Vapi dashboard when it changes.

---

### `TELEGRAM_BOT_TOKEN`
**What it does:** Authenticates this server when sending messages or registering webhooks with the Telegram Bot API.
**Where to find it:** BotFather on Telegram when you create your bot
**Example:** `TELEGRAM_BOT_TOKEN=123456:ABC-your-rotated-token`

> If the token was ever shared in chat, rotate it in BotFather before using it here.

---

### `TELEGRAM_WEBHOOK_SECRET`
**What it does:** Shared secret used to verify that incoming requests to `POST /telegram/webhook` really came from Telegram.
**How to choose it:** Use a long random string
**Example:** `TELEGRAM_WEBHOOK_SECRET=ivy-telegram-webhook-secret-2026`

Telegram sends this value back in the `X-Telegram-Bot-Api-Secret-Token` header when the webhook is configured with a secret.

---

### `AMT_BASE_URL`
**What it does:** The base URL of the SunCulture AMT (Account Management Tool) API — the internal system that holds customer account data.
**Default:** `https://amt.sunculture.io/api`
**Example:** `AMT_BASE_URL=https://amt.sunculture.io/api`

You only need to change this if SunCulture moves the AMT system to a different address.

---

### `AMT_EMPLOYEE_ID`
**What it does:** The employee ID used to authenticate with the AMT API. This identifies which system or employee is making the account lookup request.
**Where to find it:** Provided by SunCulture IT
**Example:** `AMT_EMPLOYEE_ID=7594`

---

### `AMT_API_KEY`
**What it does:** The secret key used alongside the employee ID to authenticate with the AMT API.
**Where to find it:** Provided by SunCulture IT
**Example:** `AMT_API_KEY=eaf70cc3-3ae1-4774-ba12-cbfb835a2c6e`

> Keep this value secret. Anyone with this key and employee ID can look up customer accounts.

---

### `OPENAI_API_KEY`
**What it does:** Authenticates requests to the OpenAI API for the **native Socket.IO chat** (`/chat` namespace). Not used by Vapi (Vapi uses its own model configuration in the dashboard).
**Where to find it:** OpenAI Platform → API keys
**Example:** `OPENAI_API_KEY=sk-...`

If this is missing, `thread.message` fails with a clear error when users try to chat.

---

### `OPENAI_CHAT_MODEL`
**What it does:** Chat Completions model name for native chat.
**Default:** `gpt-4o-mini`
**Example:** `OPENAI_CHAT_MODEL=gpt-4o`

---

### `OPENAI_MAX_CONTEXT_MESSAGES`
**What it does:** Maximum number of recent `ChatMessage` rows (all roles) loaded as context for each OpenAI request. Older messages are dropped (tail of the thread).
**Default:** `40`
**Example:** `OPENAI_MAX_CONTEXT_MESSAGES=40`

---

### `OPENAI_MAX_TOOL_ITERATIONS`
**What it does:** Upper bound on how many **model** calls (rounds) are allowed in one `thread.message` turn when the model keeps requesting tools. Prevents infinite loops.
**Default:** `8`
**Example:** `OPENAI_MAX_TOOL_ITERATIONS=8`

---

### `CHAT_SOCKET_SECRET`
**What it does:** If set, clients must present the same value when connecting to the `/chat` Socket.IO namespace (`auth.token` or `token` query string). Use a long random string in production.
**Default:** empty (no check — fine for local development only)
**Example:** `CHAT_SOCKET_SECRET=my-long-random-secret`

---

### `DATABASE_URL` and `DB_ADAPTER`
**What they do:** PostgreSQL connection for Prisma (including `ChatThread` / `ChatMessage` for native chat). See `.env.example` for the usual format.
**Note:** Run database migrations after pulling changes that add chat tables.

---

## Complete `.env.example`

```env
# Server
PORT=3000
PUBLIC_URL=https://xxxx.ngrok-free.app

# Vapi
VAPI_API_KEY=your-vapi-api-key-here

# Telegram
TELEGRAM_BOT_TOKEN=your-rotated-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-random-webhook-secret

# SunCulture AMT API (customer account lookup)
AMT_BASE_URL=https://amt.sunculture.io/api
AMT_EMPLOYEE_ID=your-employee-id
AMT_API_KEY=your-amt-api-key

# Native WebSocket chat (OpenAI) — see docs/native-socket-chat.md
OPENAI_API_KEY=sk-your-openai-key
# Optional: OPENAI_CHAT_MODEL, OPENAI_MAX_CONTEXT_MESSAGES, OPENAI_MAX_TOOL_ITERATIONS, CHAT_SOCKET_SECRET

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_voice_agent
DB_ADAPTER=pg
```

---

## Security Notes

- **Never commit `.env`** to git — it contains real credentials
- **Protect `OPENAI_API_KEY`** — it can incur usage charges; restrict who can deploy it
- **Rotate `AMT_API_KEY`** if you suspect it has been exposed
- **Rotate `TELEGRAM_BOT_TOKEN`** immediately if it has ever been pasted into a chat, ticket, or screenshot
- **Do not share** the `.env` file over chat, email, or Slack — use a password manager or secrets vault
- In production, use environment variables set in your hosting platform instead of a `.env` file
