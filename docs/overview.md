# SunCulture AI Voice Agent — Project Overview

## What Is This?

This is the **SunCulture AI Voice Agent** — a system that answers phone calls on behalf of SunCulture's customer support team. When a farmer calls the SunCulture support line, instead of waiting for a human agent, they are greeted by **Ivy** — an AI assistant that can answer questions, check account balances, walk through troubleshooting steps, and explain product options and pricing.

Ivy speaks and listens like a real person. The caller does not need to press buttons or navigate menus — they just talk naturally, and Ivy understands and responds.

---

## What Can Ivy Do?

Ivy can handle the most common reasons farmers call SunCulture:

| Caller's Question | What Ivy Does |
|---|---|
| "How much does your pump cost?" | Looks up the exact price and explains the payment plan |
| "My pump isn't working" | Walks the caller through safe checks to diagnose the problem |
| "What is my account balance?" | Looks up the caller's account using their National ID |
| "Is it worth buying your system?" | Calculates expected farm income based on their crop and land |
| "I don't trust solar companies" | Responds with a calm, scripted reassurance |
| "Tell me about SunCulture" | Shares company background, insurance, branch locations, etc. |

---

## Who Built This For?

- **Business owner**: SunCulture Kenya
- **Target users (callers)**: Smallholder farmers in Kenya, many of whom speak English as a second language
- **Internal users**: SunCulture customer support and technical teams

---

## The Main Parts

The system has three pieces that work together:

```
1. VAPI (the phone system)
   ↓ routes the call and handles the voice
2. CLAUDE (the AI brain)
   ↓ understands what the caller said and decides what to do
3. THIS SERVER (the knowledge + tools backend)
   ↓ provides accurate answers, account data, and business logic
```

None of these parts work alone — they all depend on each other. The full picture is explained in [how-it-works.md](./how-it-works.md).

---

## Quick Links

| Document | What It Covers |
|---|---|
| [how-it-works.md](./how-it-works.md) | The full call flow — what happens from ring to hang-up |
| [ivy-the-assistant.md](./ivy-the-assistant.md) | Ivy's personality, rules, and conversation style |
| [tools-reference.md](./tools-reference.md) | Every capability Ivy has and what triggers it |
| [setup-guide.md](./setup-guide.md) | How to run the project locally and connect it to Vapi |
| [vapi-registration.md](./vapi-registration.md) | How to register tools in the Vapi dashboard |
| [environment-variables.md](./environment-variables.md) | All the credentials and settings the server needs |
| [project-structure.md](./project-structure.md) | What every file and folder does |
