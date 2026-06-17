# Vapi Registration — Connecting Tools to the Dashboard

## What Is Registration?

For Ivy to use a tool during a call, that tool must be **registered in the Vapi dashboard**. Registration tells Vapi:

1. The tool's name and what it does (so Claude knows when to call it)
2. What information the tool needs (its input parameters)
3. Where to send the request (the server's webhook URL)

The `tools-config/` folder in this project contains ready-made JSON files for every tool.

---

## The Tools Config Folder

```
tools-config/
├── all-tools.json           ← All 7 tools in one file (for bulk registration)
├── about_sunculture.json
├── get_product_info.json
├── get_pricing.json
├── handle_objection.json
├── calculate_farm_roi.json
├── troubleshoot_system.json
└── check_account.json
```

Each file uses `{{SERVER_URL}}` as a placeholder. Before registering, replace this with your actual server URL:
- **Development:** Your ngrok URL (e.g. `https://abc123.ngrok-free.app`)
- **Production:** Your deployed domain (e.g. `https://api.sunculture.io`)

---

## Option A — Register Tools One by One (Dashboard)

This is the easiest approach if you are setting up for the first time.

1. Log in to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Go to **Tools** in the left sidebar
3. Click **Create Tool**
4. Select **Function**
5. Open one of the JSON files from `tools-config/` (e.g. `get_pricing.json`)
6. Replace `{{SERVER_URL}}` with your server URL
7. Paste the JSON into the dashboard
8. Save

Repeat for each tool.

---

## Option B — Register All Tools at Once (API)

If you prefer to use the terminal, you can register all tools with one command.

First, replace the `{{SERVER_URL}}` placeholder:

```bash
# Replace with your actual server URL
SERVER_URL="https://abc123.ngrok-free.app"

sed "s|{{SERVER_URL}}|$SERVER_URL|g" tools-config/all-tools.json > /tmp/tools-ready.json
```

Then post each tool to the Vapi API:

```bash
VAPI_API_KEY="your-vapi-api-key"

# Register each tool from the array
node -e "
const tools = require('/tmp/tools-ready.json');
tools.forEach(async (tool) => {
  const res = await fetch('https://api.vapi.ai/tool', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer $VAPI_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tool)
  });
  const data = await res.json();
  console.log('Registered:', tool.function.name, '→', data.id);
});
"
```

---

## Attaching Tools to the Assistant

After registering the tools, attach them to Ivy:

1. In the Vapi dashboard, go to **Assistants** → select your assistant
2. Scroll to **Tools**
3. Click **Add Tool** and select each tool from the list
4. Save

---

## Setting the System Prompt

Ivy's personality and rules are stored in the file `src/vapi/assistant-prompt.ts`. The content of that file needs to be pasted into Vapi:

1. Open `src/vapi/assistant-prompt.ts`
2. Copy the text between the backticks (the full `IVY_SYSTEM_PROMPT` value)
3. In the Vapi dashboard, go to **Assistants** → select your assistant
4. Scroll to **Model → System Prompt**
5. Paste the copied text
6. Save

> **Whenever you update the system prompt in code, you must also update it in the Vapi dashboard.**

---

## Recommended Assistant Settings

When creating or updating the assistant in the Vapi dashboard, use these settings:

| Setting | Recommended Value |
|---|---|
| **First Message** | `Thank you for calling SunCulture! How can I help you today?` |
| **Model Provider** | Anthropic |
| **Model** | Claude Sonnet (latest) |
| **Transcriber** | Deepgram Nova 2 (Vapi default) |
| **Voice** | ElevenLabs or OpenAI (whichever sounds most natural) |
| **Server URL** | `https://your-server.com/vapi/webhook` |
| **Max Duration** | 600 seconds (10 minutes) |
| **Background Sound** | Off |

---

## After a Code Change — What Needs Updating?

| What Changed | What to Update in Vapi |
|---|---|
| Server URL (new ngrok / new deployment) | Assistant → Server URL |
| Ivy's tone, rules, or contact numbers | Assistant → System Prompt |
| New tool added to the codebase | Register new tool, attach to assistant |
| Existing tool's parameters changed | Update tool definition in Vapi dashboard |
| Tool's server URL changed | Update tool definition in Vapi dashboard |

---

## Checking if Tools Are Working

After setting everything up, test each tool by calling the Vapi number and triggering each one:

| Tool to Test | What to Say |
|---|---|
| `about_sunculture` | "Where are your branches?" |
| `get_product_info` | "What pump suits a 1-acre farm?" |
| `get_pricing` | "What is the deposit for the RainMaker 2S?" |
| `handle_objection` | "The price is too expensive" |
| `calculate_farm_roi` | "I grow tomatoes on 2 acres, is it worth it?" |
| `troubleshoot_system` | "My pump won't start" |
| `check_account` | "Check my account" (then give a National ID) |

Watch the server logs to confirm each tool is being called and returning a response.
