# Project Structure — What Every File Does

## Top-Level Layout

```
ai-voice-agent/
├── src/                  ← All the server code lives here
├── tools-config/         ← JSON files for registering tools in Vapi
├── training-materials/   ← Reference documents used to build the agent
├── docs/                 ← This documentation
├── test/                 ← Automated tests
├── dist/                 ← Compiled code (generated, not edited)
├── node_modules/         ← Installed packages (generated, not edited)
├── .env                  ← Your local credentials (never committed)
├── .env.example          ← Template showing which credentials are needed
├── package.json          ← Project dependencies and run commands
└── tsconfig.json         ← TypeScript settings
```

---

## The `src/` Folder (Server Code)

This is where all the actual logic lives. It is split into four areas:

### `src/main.ts`
The entry point. When you run `npm run start:dev`, this file starts the server and begins listening for requests on the configured port. It registers a Socket.IO adapter so the `/chat` WebSocket namespace runs on the same HTTP port as the REST API.

### `src/app.module.ts`
The root configuration file. It loads environment variables and wires together the main feature modules, including `VapiModule` (phone webhooks), `TelegramModule`, and `ChatModule` (native OpenAI WebSocket chat).

---

### `src/config/`

| File | What It Does |
|---|---|
| `configuration.ts` | Reads environment variables from `.env` and makes them available to the rest of the server in a structured, type-safe way. All settings (port, AMT credentials, etc.) flow through this file. |

---

### `src/vapi/` — Call Handling

This folder handles everything related to incoming events from Vapi.

| File | What It Does |
|---|---|
| `vapi.module.ts` | Registers the Vapi-related code as a NestJS module and connects it to the Tools module. |
| `vapi.controller.ts` | Receives all incoming HTTP requests from Vapi at `POST /vapi/webhook`. Reads the event type and hands it to the service. Think of it as the front door. |
| `vapi.service.ts` | Processes the events received by the controller. For tool calls: asks ToolsService to run the right tool and formats the response. For end-of-call reports: logs the transcript and call data. |
| `assistant-prompt.ts` | Contains Ivy's full system prompt — personality, rules, tool guidance, key phone numbers. Paste this into the Vapi dashboard under Assistant → System Prompt. |

**The webhook flow:**
```
Vapi sends POST /vapi/webhook
    → vapi.controller.ts receives it
    → vapi.service.ts reads the event type
    → if "tool-calls": asks tools.service.ts to run the tool
    → sends the result back to Vapi
```

---

### `src/tools/` — Business Logic

This folder contains all the knowledge and logic Ivy uses to answer questions. Each file is a self-contained "capability."

| File | What It Does |
|---|---|
| `tools.module.ts` | Registers all tools as injectable services so they can be used anywhere in the app. |
| `tools.service.ts` | The central dispatcher. When a tool call comes in with a name like `get_pricing`, this file routes it to the correct tool class. Every new tool added to the project must be registered here. |
| `about.tool.ts` | Returns company information across 17 categories — history, mission, payment options, insurance, branches, warranties, account management, and more. |
| `products.tool.ts` | Returns product specifications and recommendations. Covers both ClimateSmart Direct and ClimateSmart Battery lines, all pump variants, and add-ons. |
| `pricing.tool.ts` | Returns exact pricing, deposit amounts, monthly PAYGO payments, and explains the Lipa Polepole financing model. All prices are hardcoded and reviewed — Ivy never guesses. |
| `objection-handling.tool.ts` | Returns scripted responses to 10 types of sales objections (price, deposit, trust, reliability, etc.). Responses are empathetic and non-pushy. |
| `farm-roi.tool.ts` | Calculates expected farm income and return on investment based on crop type, farm size, and current fuel costs. Helps farmers see the financial case for the system. |
| `troubleshooting.tool.ts` | Guides farmers through safe diagnostic steps for 7 types of system issues. Ends with escalation to a technician if unresolved. |
| `account.tool.ts` | Makes a live HTTP call to the SunCulture AMT API to look up a customer's account by their National ID. Returns name, product, status, balance, and next payment. |

### `src/chat/` — Native WebSocket + OpenAI chat

A separate **text** channel: Socket.IO under the `/chat` namespace, OpenAI with tool calls, and persistence in `ChatThread` / `ChatMessage`. It reuses the same `ToolsService` as Vapi. See [docs/native-socket-chat.md](native-socket-chat.md) for the event protocol and environment variables.

| File | What it does |
|---|---|
| `chat.module.ts` | Wires the chat gateway, thread service, and OpenAI loop; imports `ToolsModule` and `PrismaModule` only. |
| `chat.gateway.ts` | Handles `thread.join` and `thread.message`; optional `CHAT_SOCKET_SECRET` handshake. |
| `open-ai-chat.service.ts` | Calls OpenAI Chat Completions, runs the tool loop, and appends user/assistant/tool rows to the database. |
| `chat-thread.service.ts` | Creates threads, loads context windows, and appends `ChatMessage` rows. |
| `openai-chat-tools.ts` | JSON `tools` definitions for OpenAI (names must match `ToolsService.execute`). |
| `chat-system-prompt.ts` | The Ivy text chat system prompt (independent of the Vapi dashboard copy). |
| `socket-io.adapter.ts` | Configures the Socket.IO server on the same HTTP process as Express. |

---

## The `tools-config/` Folder (Vapi Registration)

These files are **not used by the server** — they are reference files you use to register tools in the Vapi dashboard.

| File | What It Is |
|---|---|
| `all-tools.json` | All 7 tools in a single JSON array. Use this for bulk registration via the Vapi API. |
| `about_sunculture.json` | Tool definition for `about_sunculture` |
| `get_product_info.json` | Tool definition for `get_product_info` |
| `get_pricing.json` | Tool definition for `get_pricing` |
| `handle_objection.json` | Tool definition for `handle_objection` |
| `calculate_farm_roi.json` | Tool definition for `calculate_farm_roi` |
| `troubleshoot_system.json` | Tool definition for `troubleshoot_system` |
| `check_account.json` | Tool definition for `check_account` |

Each file contains the tool name, description, and parameter schema in the format Vapi expects. The `server.url` field uses `{{SERVER_URL}}` as a placeholder — replace it with your actual server URL before registering.

See [vapi-registration.md](./vapi-registration.md) for how to use these files.

---

## The `training-materials/` Folder

Reference documents used to inform how Ivy was built:

| File | What It Is |
|---|---|
| `SunCulture_Ivy_VoiceAgent_KnowledgeBase_v2.md` | The primary reference document. Contains Ivy's persona, conversation flows, product knowledge, objection scripts, troubleshooting guides, payment options, insurance details, and agent limitations. |
| `SunCulture_FSA_Script_Library_v2_OptimusPrime.pdf` | Sales script library used by human Field Sales Agents — used as a reference for tone and common scenarios. |
| `Sc_Product_Guidebook-APR-0622-v1.pdf` | Official product guide with technical specifications. |

These files are not loaded at runtime — they were used to write the tool response content and the system prompt.

---

## How the Pieces Connect

```
                    ┌─────────────────────────────────────┐
                    │         Vapi Dashboard               │
                    │  - Phone number                      │
                    │  - Assistant (Claude + system prompt)│
                    │  - 7 registered tools                │
                    └───────────────┬─────────────────────┘
                                    │ webhooks
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                        This Server                            │
│                                                              │
│  POST /vapi/webhook                                          │
│  └── vapi.controller.ts                                      │
│       └── vapi.service.ts                                    │
│            └── tools.service.ts ─── routes to:              │
│                 ├── about.tool.ts                            │
│                 ├── products.tool.ts                         │
│                 ├── pricing.tool.ts                          │
│                 ├── objection-handling.tool.ts               │
│                 ├── farm-roi.tool.ts                         │
│                 ├── troubleshooting.tool.ts                  │
│                 └── account.tool.ts ─── HTTP ──► AMT API    │
└──────────────────────────────────────────────────────────────┘
```
