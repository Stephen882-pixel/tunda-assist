# Tools Reference — What Ivy Can Look Up

## What Are Tools?

Tools are the individual capabilities Ivy has access to during a call. When a farmer asks something that requires a specific answer (like a price or account balance), Ivy calls the relevant tool instead of guessing.

Each tool is a self-contained piece of logic on this server. There are **7 tools** in total.

---

## Tool 1 — `about_sunculture`

**What it's for:** Any question about SunCulture as a company — background, mission, how to pay, insurance, branches, warranties, and account management.

**When Ivy uses it:**
- "Tell me about SunCulture"
- "Where is your nearest branch?"
- "What is your M-Pesa paybill number?"
- "What does SunCulture Protect cover?"
- "How do I unlock my system?"
- "What warranty do I get?"

**Categories it can return:**

| Category | What It Covers |
|---|---|
| `general` | High-level company summary |
| `mission` | SunCulture's purpose and goals |
| `what_we_do` | Products and services overview |
| `products` | Product lineup summary |
| `financing` | PAYGO / Lipa Polepole model |
| `impact` | Number of farmers served, water pumped, etc. |
| `countries` | Countries SunCulture operates in |
| `headquarters` | Head office location |
| `founded` | Company history |
| `funding` | Investors and backing |
| `contact` | Phone numbers and email |
| `payment_options` | M-Pesa paybills, bank details, fraud warnings |
| `insurance` | SunCulture Protect (life + hospital cover via Turaco) |
| `kilimo_boost` | Input financing (seeds, fertilizer, etc.) |
| `branches` | Head office + 15 Sales & Service Centres |
| `free_services` | Delivery, installation, warranty terms |
| `account_management` | USSD code, MySunCulture app, auto-lock/unlock |

**Where the logic lives:** `src/tools/about.tool.ts`

---

## Tool 2 — `get_product_info`

**What it's for:** Detailed product specifications — which pump is right for a farmer, how the product lines compare, and what add-ons are available.

**When Ivy uses it:**
- "Which pump is right for my 2-acre farm?"
- "What is the difference between ClimateSmart Direct and ClimateSmart Battery?"
- "How deep can your pump reach?"
- "Can I add drip irrigation to your system?"
- "What is the flow rate of the RainMaker 2S?"

**Query types:**

| Query Type | What It Returns |
|---|---|
| `catalog_overview` | Summary of all available products |
| `product_line_overview` | Details on ClimateSmart Direct or Battery |
| `variant_details` | Specs for a specific model (e.g. RainMaker 2S Max) |
| `compare_lines` | Side-by-side of Direct vs Battery |
| `recommend_by_farm_size` | Best product for a given acreage |
| `add_ons` | Drip irrigation and TV bundle options |
| `features` | Technical specifications |

**Product lines:**
- `climate_smart_direct` — Works directly off solar panels (no battery)
- `climate_smart_battery` — Has an onboard battery, pumps day or night

**Variants available:** RainMaker 2S, RainMaker 2S Max, RainMaker 2C, RainMaker 2C Kubwa

**Where the logic lives:** `src/tools/products.tool.ts`

---

## Tool 3 — `get_pricing`

**What it's for:** Exact prices, deposit amounts, monthly payment breakdowns, and how the PAYGO financing model works. Ivy never guesses prices — she always calls this tool.

**When Ivy uses it:**
- "How much does the system cost?"
- "What is the deposit?"
- "How much do I pay per month?"
- "How does Lipa Polepole work?"
- "Tell me about the Refer and Earn programme"

**Query types:**

| Query Type | What It Returns |
|---|---|
| `all_products` | Full price list for every product |
| `product_price` | Price for one specific product |
| `paygo_explanation` | How the Lipa Polepole payment plan works |
| `deposit_info` | Deposit amounts for all products |
| `refer_and_earn` | Referral programme details |

**Where the logic lives:** `src/tools/pricing.tool.ts`

---

## Tool 4 — `handle_objection`

**What it's for:** When a farmer hesitates, pushes back, or expresses doubt about buying. Instead of Ivy improvising a response, she retrieves a carefully written, empathetic reply.

**When Ivy uses it:**
- "It's too expensive"
- "The deposit is too high for me"
- "I've heard solar companies take your money and disappear"
- "What if it breaks?"
- "My wife needs to agree first"
- "Let me think about it"
- "My water source is very deep"
- "I already have a petrol pump"
- "How do I know this isn't a scam?"
- "I'm not sure how much water I need"

**Objection types handled:**

| Objection | What It Is |
|---|---|
| `price_too_expensive` | Caller thinks the total price is too high |
| `deposit_too_high` | Caller can't afford the upfront deposit |
| `solar_company_distrust` | Past bad experience with solar companies |
| `what_if_it_breaks` | Worried about reliability and repairs |
| `need_to_consult_family` | Wants to discuss with spouse or family first |
| `let_me_think` | Stalling or not ready to decide |
| `water_source_too_deep` | Concerned pump won't reach their borehole |
| `already_have_petrol_pump` | Sees no reason to switch from petrol |
| `fraud_concerns` | Afraid of being scammed |
| `volume_requirements_unclear` | Unsure if the system can water their whole farm |

**Where the logic lives:** `src/tools/objection-handling.tool.ts`

---

## Tool 5 — `calculate_farm_roi`

**What it's for:** Showing a farmer how much income they could earn with a SunCulture system, based on their specific crop and land size. This makes the value of the investment concrete and personal.

**When Ivy uses it:**
- "Is it worth buying your system?"
- "How much money will I make?"
- "I spend KES 4,000 a month on fuel — will I save money?"
- "Can I pay off the system with my crop income?"

**What Ivy asks before calling this tool:**
1. What crop do you grow?
2. How many acres do you farm?
3. How much do you spend on fuel each month? (0 if they don't use a fuel pump)

**Crops supported:** Tomatoes, Onions, Cabbages, Passion Fruit, Capsicum, Other

**What the response includes:** Estimated income per acre, annual profit projection, comparison of current fuel costs vs SunCulture monthly payment, break-even estimate.

**Where the logic lives:** `src/tools/farm-roi.tool.ts`

---

## Tool 6 — `troubleshoot_system`

**What it's for:** Walking a farmer through safe checks when their SunCulture system is not working. The responses are designed to resolve common issues without requiring a technician visit.

**When Ivy uses it:** Any time a caller says their system is not working.

**Issue types handled:**

| Issue Type | Example Caller Complaint |
|---|---|
| `pump_not_starting` | "My pump won't turn on" |
| `low_water_output` | "The water pressure is very low" |
| `system_locked` | "My system is locked, I made a payment" |
| `battery_not_charging` | "The battery light is not on" |
| `solar_panel_issue` | "I think my solar panel is broken" |
| `controller_lights` | "There are strange lights on the controller" |
| `drip_irrigation_issue` | "My drip lines aren't watering properly" |
| `escalate_technician` | Steps tried, problem not resolved — book a technician |

**Important:** For `system_locked`, Ivy explains the auto-unlock process and directs the farmer to pay via Paybill **862451**. The system unlocks automatically — no technician needed.

**Where the logic lives:** `src/tools/troubleshooting.tool.ts`

---

## Tool 7 — `check_account`

**What it's for:** Looking up a specific customer's live account information from SunCulture's internal system (the AMT platform).

**When Ivy uses it:**
- "What is my account balance?"
- "When is my next payment?"
- "Is my account locked?"
- "Which product do I have?"
- "How much have I paid in total?"

**What Ivy asks first:** The caller's **Kenya National ID number** (numbers only, no spaces or dashes).

**What the response includes:**
- Customer name
- Product name
- Account status (Active, Locked, Paid-off)
- Total amount paid to date
- Outstanding balance
- Next instalment date and amount
- Payment instructions if the account is locked

**Data source:** Live call to the SunCulture AMT API at `amt.sunculture.io`

**Error handling:**
- If the ID is not found: directs caller to USSD `*384*02#` or the toll-free line
- If the AMT system is unreachable: directs caller to USSD or the toll-free line

**Where the logic lives:** `src/tools/account.tool.ts`

---

## Adding a New Tool

If SunCulture needs a new capability (e.g. raising a support ticket, checking delivery status), the steps are:

1. Create a new file in `src/tools/` (e.g. `ticket.tool.ts`)
2. Register it in `src/tools/tools.module.ts`
3. Add a new `case` in `src/tools/tools.service.ts`
4. Create a JSON config file in `tools-config/`
5. Register the tool in the Vapi dashboard (see [vapi-registration.md](./vapi-registration.md))
6. Update Ivy's instructions in `src/vapi/assistant-prompt.ts`
