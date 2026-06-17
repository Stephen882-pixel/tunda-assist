# Setup Guide — Running the Project Locally

## What You Need Before Starting

| Requirement | Purpose | Notes |
|---|---|---|
| **Node.js 20+** | Runs the server | Download from nodejs.org |
| **npm** | Installs packages | Comes with Node.js |
| **ngrok** | Exposes your local server to Vapi | Free account at ngrok.com |
| **Vapi account** | The voice platform | Account at vapi.ai |
| **Anthropic API key** | Powers Claude (the AI brain) | From console.anthropic.com |
| **AMT credentials** | Lets the server look up customer accounts | Provided by SunCulture IT |

---

## Step 1 — Get the Code

If you don't already have the project on your computer:

```bash
git clone <repository-url>
cd ai-voice-agent
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This downloads all the packages the server needs (takes about 1–2 minutes).

---

## Step 3 — Set Up Your Environment File

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Then open `.env` and fill in the values. See [environment-variables.md](./environment-variables.md) for what each one means.

At minimum you need:
- `VAPI_API_KEY` — from the Vapi dashboard
- `AMT_EMPLOYEE_ID` and `AMT_API_KEY` — from SunCulture IT
- `PORT` — leave as `3000` unless something else is using that port

---

## Step 4 — Start the Server

```bash
npm run start:dev
```

You should see output ending with something like:

```
[NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

The server is now running locally on port 3000.

---

## Step 5 — Expose the Server to Vapi Using ngrok

Vapi needs to reach your server over the internet (your laptop is not publicly accessible on its own). ngrok creates a temporary public URL that forwards to your local server.

Open a **new terminal window** and run:

```bash
ngrok http 3000
```

You will see output like:

```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

Copy the `https://abc123.ngrok-free.app` URL — you will need it in the next step.

> **Important:** This URL changes every time you restart ngrok. You must update the Vapi dashboard each time.

---

## Step 6 — Update the Server URL in Vapi

1. Log in to the [Vapi dashboard](https://dashboard.vapi.ai)
2. Go to **Assistants** → select your assistant
3. Scroll to **Server URL**
4. Paste your ngrok URL followed by `/vapi/webhook`:
   ```
   https://abc123.ngrok-free.app/vapi/webhook
   ```
5. Save

---

## Step 7 — Test the Connection

Call your Vapi phone number. Ivy should answer.

Try asking:
- "How much does the RainMaker 2S cost?" — this triggers the `get_pricing` tool
- "My pump isn't working" — this triggers the `troubleshoot_system` tool
- "Check my account" (then give a test National ID) — triggers `check_account`

While the call is happening, watch your server terminal — you will see logs showing each webhook event and tool call.

---

## Daily Development Workflow

Each time you start working:

1. `npm run start:dev` — start the server
2. `ngrok http 3000` — start the tunnel
3. Update the Server URL in Vapi with the new ngrok URL (it changes each session)
4. Call the Vapi number to test

When you make changes to the server code, `start:dev` automatically restarts — you do not need to stop and restart it manually.

---

## Building for Production

To compile the TypeScript code to JavaScript (ready for deployment):

```bash
npm run build
```

To run the compiled production build:

```bash
npm run start:prod
```

In production, replace ngrok with a real domain and update the Vapi assistant Server URL accordingly.

---

## Troubleshooting Common Issues

| Problem | Likely Cause | Fix |
|---|---|---|
| Server won't start | Missing `.env` values | Check that all required variables are set |
| Vapi tool calls fail | Server URL not updated | Update ngrok URL in Vapi dashboard |
| Account lookup fails | Wrong AMT credentials | Check `AMT_EMPLOYEE_ID` and `AMT_API_KEY` in `.env` |
| Ivy doesn't answer | Phone number not linked to assistant | In Vapi dashboard, check Phone Numbers → assign assistant |
| ngrok URL expired | Free ngrok sessions time out | Restart ngrok and update Vapi dashboard again |
