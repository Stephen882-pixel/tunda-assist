# How It Works — The Full Call Flow

## The Big Picture

When a farmer calls the SunCulture support number, here is what happens behind the scenes — in plain terms:

```
Farmer dials the number
       ↓
Vapi picks up the call (like a receptionist)
       ↓
Claude (the AI brain) reads Ivy's instructions and starts listening
       ↓
Farmer speaks — Vapi converts speech to text
       ↓
Claude reads the text and decides what to say or do
       ↓
   If Claude needs information:               If Claude can respond directly:
   It asks this server for help               It speaks back to the farmer
       ↓                                              ↓
   Server looks up the answer            Vapi converts text to speech
       ↓                                       Farmer hears Ivy's voice
   Sends answer back to Claude
       ↓
   Claude speaks the answer to the farmer
       ↓
Conversation continues until the farmer hangs up
       ↓
Vapi sends a full report (transcript, cost, summary) to this server
```

---

## The Three Services and What They Do

### 1. Vapi — The Phone System

Vapi is the service that actually handles the phone call. It:

- Provides a real phone number farmers can call
- Listens to what the farmer says and converts it to text (speech-to-text)
- Sends that text to Claude for processing
- Converts Claude's text responses back into a natural-sounding voice (text-to-speech)
- Manages the timing of the conversation so responses feel fast and natural
- Sends notifications to this server when tools are needed or when a call ends

Think of Vapi as the **ears, voice, and telephone line** of the system.

### 2. Claude — The AI Brain

Claude is the AI model (made by Anthropic) that powers Ivy's intelligence. It:

- Reads Ivy's personality and rules (the "system prompt") before every call
- Understands what the farmer is asking — even if they phrase it in different ways
- Decides whether to respond directly or ask one of the tools for information
- Keeps track of the whole conversation so context is not lost
- Knows never to guess on prices, account details, or product specs — it always uses a tool

Think of Claude as the **brain** that understands and makes decisions.

### 3. This Server — The Knowledge and Tools Backend

This is the NestJS server (the code in this repository). It:

- Provides all 7 tools that Claude can call
- Connects to the SunCulture AMT system to look up real customer account data
- Contains all product knowledge, pricing, troubleshooting guides, and objection responses
- Receives reports when calls end

Think of this server as the **filing cabinet and reference library** that Claude consults.

---

## How a Tool Call Works

When Claude needs information (for example, a farmer asks "how much is the deposit?"), the following happens in about 1 second:

```
1. Claude decides it needs pricing information
2. Claude tells Vapi: "call the get_pricing tool with query_type = deposit_info"
3. Vapi sends an HTTP POST request to this server at POST /vapi/webhook
4. This server receives the request, finds the right tool, and runs it
5. The tool returns the answer as plain text
6. This server sends the text back to Vapi
7. Vapi hands it to Claude
8. Claude speaks it back to the farmer
```

The farmer just hears a natural response — they have no idea any of this happened.

---

## What Happens at the End of a Call

When the farmer hangs up, Vapi sends a final report to this server. The report contains:

- The full transcript of everything said
- How long the call lasted
- The cost of the call (API usage)
- An AI-generated summary of what was discussed

Currently the server logs this report — storing it to a database is a future improvement.

---

## Response Speed

Vapi is designed for low-latency voice conversations. A typical response from Ivy (including a tool call) takes around **700ms to 1.5 seconds** from when the farmer finishes speaking. This is fast enough to feel like a natural conversation.

---

## What This Server Does NOT Handle

- **Audio processing** — Vapi handles all voice encoding and streaming
- **Speech recognition** — Vapi handles transcription
- **Voice synthesis** — Vapi handles text-to-speech
- **LLM routing or prompting** — Vapi sends conversations directly to Claude
- **Phone infrastructure** — Vapi provides the actual phone number and network connection

---

## Telegram Chat Flow

Telegram is handled as a second channel into the same backend, separate from the phone flow:

```
Farmer sends Telegram message
       ↓
Telegram Bot API sends HTTPS POST to POST /telegram/webhook
       ↓
Telegram controller verifies X-Telegram-Bot-Api-Secret-Token
       ↓
AiOrchestratorService classifies the message
       ↓
Either:
- route into an existing SunCulture tool (pricing, products, account, troubleshooting)
- or return a short fallback help message
       ↓
Telegram service calls sendMessage on the Bot API
       ↓
Farmer receives Ivy's reply in Telegram
```

This keeps Telegram-specific parsing inside the Telegram module while reusing the same business knowledge the voice assistant already relies on.

---

## Native socket chat (OpenAI) — not Vapi, not Telegram

A third, **independent** path uses WebSockets and OpenAI, not the Telegram webhook and not the Vapi server URL:

```
Client opens Socket.IO to namespace /chat
       ↓
Client emits thread.join (optional threadId, metadata)
       ↓
Client emits thread.message { text }
       ↓
OpenAiChatService loads recent messages from PostgreSQL, calls OpenAI with tools
       ↓
If the model requests tools, ToolsService runs the same tools as Vapi (pricing, products, etc.)
       ↓
New messages are written to chat_messages; final reply is emitted as message.assistant
```

- **Vapi and Telegram are not used** in this path.
- **Claude** is not involved; the model is set by `OPENAI_CHAT_MODEL` (default `gpt-4o-mini`).

For connection details, events, and security options, read [docs/native-socket-chat.md](native-socket-chat.md).
