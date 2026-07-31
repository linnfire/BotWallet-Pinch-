# BotWallet (Pinch)

https://botnews-pinch.vercel.app/

## Why Pinch matters

BotWallet is built around a simple idea:

> **AI agents can become customers.**

## Merchant SDK

`@botwallet/merchant` is a local workspace package that demonstrates how any website or API can return a machine-readable HTTP 402 offer, verify a BotWallet receipt, and unlock a purchase after Pinch confirms payment.

Install from a neighbouring project:

```bash
npm install ../BotWallet/packages/merchant-sdk
```

Within this repository, npm workspaces link the package automatically after `npm install`. It has not been published to npm, so `npm install @botwallet/merchant` only works inside this workspace until it is published under that scope.

Core flow:
1. Agent requests premium content from BotNews.
2. BotNews returns HTTP 402 Payment Required with a machine-readable offer.
3. BotWallet validates Bot Limit budget rules.
4. BotWallet charges through Pinch.
5. BotWallet settles purchase with BotNews.
6. Agent retries and receives premium content.

See [`merchant-protocol.md`](./merchant-protocol.md) for the reusable resource contract for merchants offering paid articles, APIs, downloads, subscriptions, tickets, or physical products.



Today, AI can find information and make decisions, but actually buying something on the internet is much harder. Most websites are built for humans. They expect someone to click buttons, enter card details, and complete a checkout.

AI agents such as ChatGPT and Claude can already help people search, compare, and make decisions. But the point of autonomous AI is to make as few decisions as possible for the human. The next step is for agents to actually take action and buy things on their behalf.

BotWallet gives AI agents a way to make purchases on behalf of their owners, within rules set by the owner.

The idea is basically like giving an assistant your wallet and saying:

> "Find me the best option and buy it, but stay within my rules."

**Pinch is the payment layer that makes this possible.**

BotWallet uses the Pinch credit card API to connect a payment method, tokenise the card details, and make payments when an agent is approved to buy something.

The user enters their card details once. The card is tokenised, so BotWallet does not store the raw card number, expiry date, or CVC. The stored Pinch IDs are then used to make future payments. This makes the payment flow fast and avoids asking the user to enter their card details for every purchase.

Pinch is important because every transaction made by these agents can run through Pinch. Unlike a human, an AI agent could potentially make many transactions across many different services, potentially at a much higher frequency. This creates a large potential payment market for Pinch.

For Pinch, the model is simple: **if an agent makes a transaction, Pinch can process that transaction and earn from the payment flow.** As agents become more common and make more purchases, this could create a new source of transaction volume.

The scope is also very large. The same payment infrastructure could potentially be used for:

* News and premium information
* APIs and data
* Software subscriptions
* Utilities
* Airline tickets and travel
* Clothes and products
* Online marketplaces
* Product websites
* Small businesses
* Large companies
* Almost any online service that sells something

The demand already exists because people buy things in all of these categories. The difference is that an AI agent could eventually do the searching, comparing, and purchasing for them.

This means Pinch could potentially establish an early position in an inevitable future market: **the agent economy**.

As autonomous AI agents become more common, payment providers will need to support agents as a new type of customer. Pinch has an opportunity to become an early payment provider for this market before it becomes crowded.

The rise of autonomous agent projects such as OpenClaw is one example of where this is heading. As agents become more capable, people will expect them to do more tasks for them, including making purchases.

The adoption barrier can also be low. We do not require every website to adopt a completely new payment system. A website that already uses HTTP can implement a machine-readable payment flow using HTTP `402 Payment Required`.

We don't require the world to adopt crypto for AI agents to become customers.

This means a website can tell an agent:

> "This resource costs £X. Pay first, then you can access it."

The agent can then follow the payment flow and use Pinch to make the payment.

This gives Pinch a potential position at the payment layer of a new industry without requiring businesses to replace their entire existing payment infrastructure.

---

## Why Pinch is well suited to this

Pinch already provides the core payment infrastructure needed for this model.

### Tokenisation

BotWallet uses Pinch's credit card payment flow and tokenisation.

The user enters their card details once. The card information is tokenised instead of being stored directly by BotWallet.

This makes it safer and easier for agents to make future purchases without repeatedly asking the user for card details.

### Fast payments

The payment can happen automatically once the agent's purchase is approved.

This is important for autonomous agents because they need to act quickly without waiting for a human to manually complete checkout.

### Every agent transaction can become payment volume

A human might make a few purchases in a day.

An autonomous agent could potentially make many transactions across different websites and services.

If those transactions run through Pinch, Pinch has the potential to earn from each transaction.

The more agents use the internet to buy things, the larger this potential market becomes.

### New data and insights

The agent economy also creates a new category of behavioural and transaction data.

As AI agents become customers, payment infrastructure could provide insight into what this new type of customer is actually buying.

For example:

* What products are agents buying?
* What information are they paying for?
* Which services are agents using most?
* How much money is being spent by agents?
* What types of requests are generating the most transactions?

This data could become valuable for businesses and could help create new industries and services around agent-focused SEO, dynamic pricing, advertising, recommendations, and other ways of optimising for machine customers.

Data is especially valuable when an entirely new customer category is emerging.

Pinch could potentially be in a position to see this activity early because it sits directly in the payment flow.

---

## A new market: the agent economy

Cloudflare's Bot Traffic Analytics has reported that bots make up a significant portion of internet activity, with figures around **34.9%** in its reporting.

Source: https://radar.cloudflare.com/bots

Today, much of this automated traffic does not create direct revenue for the websites it visits.

Bots often scrape information, consume resources, and create traffic without buying anything.

The rise of AI agents changes this.

Instead of asking:

> "How do we stop bots?"

A website owner can start asking:

> **"How do we make money from them?"**

BotWallet changes the model:

> **Bots are not just traffic. They can be customers.**

The number of autonomous AI agents is likely to grow as AI systems become better at taking actions in the real world.

Projects such as OpenClaw show the growing interest in autonomous agents that can perform tasks instead of only answering questions.

This creates a possible future where people say:

> "Find me the best clothes for this trip and buy them."

The agent could search multiple websites, compare options, stay within a budget, and place the order.

BotWallet is built around this idea.

---

# What is BotWallet?

BotWallet is an AI customer wallet for autonomous commerce.

AI agents can autonomously spend money on the internet, within rules set by their owner.

There are two main ways BotWallet could be used:

1. **As its own AI assistant** that searches for options and buys things for the user.
2. **As a tool or plugin for another AI agent**, such as ChatGPT or another AI assistant that needs the ability to make purchases.

The idea is similar to giving an assistant a wallet and saying:

> "Find me the best option and buy it, but stay within my rules."

For example, an agent could search multiple websites, compare products, find the best option, and place an order.

BotWallet uses spending controls to decide what the agent is allowed to buy and how much it can spend.

The goal is to make autonomous agents useful in the real world, not just good at answering questions.

---

# Basically: bots can be customers

Instead of blocking AI bots, websites can charge them and let them buy access automatically.

Payment systems and front ends are mostly designed for humans. Bots often cannot complete normal checkout flows. They may instead scrape websites, create traffic, or use resources without generating revenue.

But what if bots were paying customers?

Now bots can buy information such as news articles, APIs and data. The same model could eventually be used to buy clothes, airline tickets, subscriptions, utilities, and almost anything else available online.

We don't require the world to adopt crypto for AI agents to become customers.

The agent can use existing web infrastructure to discover that a resource requires payment, follow the payment flow, and pay through Pinch.

A website that uses HTTP can potentially implement this type of machine-readable payment flow.

This creates a low-friction way for existing websites and services to start supporting AI agents as customers.

---

# The three parts

BotWallet is designed around three sides of the agent economy:

### 1. The Customer

The AI agent acts on behalf of a person.

It can search, compare options, and make approved purchases using the user's wallet and spending rules.

The user can set:

* Daily spending limits
* Auto-approval limits
* Payment methods
* Recent transaction history

The user only needs to connect their card once. Pinch tokenisation is then used for future payments.

The long-term idea is that the person makes fewer decisions themselves. Instead of manually searching ten websites and checking out, they can tell an agent what they want and let it handle the task.

---

### 2. The Agent

The agent can request something from a website or service.

If the resource requires payment, the website can return a machine-readable `402 Payment Required` response with the price and payment information.

The agent can then:

1. Understand that payment is required.
2. Check the offer.
3. Ask BotWallet to approve the purchase.
4. Check the user's spending rules.
5. Pay through Pinch if approved.
6. Complete the purchase.
7. Retry the original request.

This allows the agent to complete a transaction without needing a human to manually enter payment details every time.

Guardrails for keeping the agent focused on the user's requested task are still being developed.

---

### 3. The Vendor

The vendor is the website, API, or online service selling something.

BotNews is our example vendor.

Instead of seeing bots only as unwanted traffic, a vendor can let them become paying customers.

The same system could be implemented by other websites and online services.

Vendors could potentially see:

* Revenue generated by AI agents
* What agents are requesting
* What products or information they are buying
* Where agent traffic is coming from
* How many requests are coming from agents

BotNews includes a dashboard concept for viewing this type of activity.

This creates a new source of business data. As agents become customers, businesses can start learning what this new type of customer actually wants.

That could help businesses optimise their products and services for agents, rather than only designing everything around human users.

It also creates a new way to think about advertising and discovery. Instead of only relying on traditional banners and video ads, businesses could eventually build services specifically for AI agents, including agent-focused SEO, embedded AI chats, recommendations, and machine-readable product information.

---

# Why this could matter

A large amount of internet activity already comes from bots. Cloudflare's Bot Traffic Analytics tracks the scale of automated traffic across the internet.

As AI agents become more capable, the number of agents browsing, searching, and acting online is likely to increase.

The problem is that many of these bots currently create costs without creating revenue.

BotWallet changes the model:

> **Bots are not just traffic. They can be customers.**

For vendors, this means they can potentially monetise agent traffic instead of simply blocking it.

For AI agents, it means they can move from only finding information to actually taking action.

For Pinch, it creates a potential new category of payment activity where every agent purchase can use Pinch as the payment layer.

This could range from a single purchase by a small business to thousands of automated purchases across large online services.

The opportunity is not limited to one industry. If people buy something online, an agent could potentially buy it for them.

That gives Pinch a chance to establish itself early in a future market that could become much larger as autonomous agents become normal.

---

# How Pinch is used

BotWallet uses Pinch for the complete payment flow.

### 1. Connect a payment method

The user connects a credit card through the Pinch payment flow.

### 2. Tokenise the card

The card details are tokenised in the browser.

BotWallet does not store the raw card number, expiry date, or CVC.

Only the required Pinch IDs are stored.

### 3. Apply spending rules

Before a purchase is made, BotWallet checks the user's wallet rules.

For example:

* Is there enough daily budget?
* Is the purchase below the auto-approval limit?
* Is the agent allowed to make this purchase?

### 4. Make the payment

If the purchase is approved, BotWallet uses Pinch to process the payment.

### 5. Complete the transaction

The merchant receives confirmation of the payment and gives the agent access to the purchased resource.

This means Pinch is not just connected to the wallet. It is the payment infrastructure that allows the agent to actually transact.

---

# The BotNews Demo

BotNews is a simple merchant example showing how a website could charge AI agents.

The agent requests a premium article.

BotNews responds with:

```text
402 Payment Required
```

The response contains the payment offer.

BotWallet then:

1. Reads the offer.
2. Checks the Bot Limit.
3. Approves the payment.
4. Charges the connected payment method through Pinch.
5. Sends the payment receipt to BotNews.
6. Retries the original request.
7. Receives:

```text
200 OK
```

The premium article is then unlocked.

The important part is that the agent can complete the full process automatically.

The same concept could be applied to other websites, APIs, and online services.

---

# HTTP 402

BotWallet uses the existing HTTP `402 Payment Required` status.

This is useful because the website can directly communicate to an agent:

> "This resource requires payment."

The agent does not need to guess how to pay or navigate a human checkout page.

The flow is:

```text
Agent requests resource
        ↓
Website returns 402 Payment Required
        ↓
Agent reads payment offer
        ↓
BotWallet checks spending rules
        ↓
Payment is made through Pinch
        ↓
Merchant records payment
        ↓
Agent retries request
        ↓
Website returns 200 OK
        ↓
Agent receives resource
```

This uses existing web infrastructure instead of requiring every website to adopt a completely new system.

Any website or service that uses HTTP could potentially implement this type of payment flow.

That is one of the key differences from building a completely new payment ecosystem. The goal is to make it easier for existing websites to start accepting AI agents as customers.

---

# CLI Demo

The repository also includes a standalone terminal demo.

Run:

```bash
npm run demo:agent
```

Or:

```bash
npm run demo:agent -- --pay
```

The demo shows the complete machine-to-machine payment flow:

1. The agent requests premium content.
2. BotNews returns `402 Payment Required`.
3. The agent receives the payment offer.
4. BotWallet checks the spending rules.
5. Pinch processes the approved payment.
6. BotNews records the payment.
7. The agent retries the request.
8. BotNews returns `200 OK`.
9. The premium content is unlocked.

The agent, wallet, merchant, and payment provider are connected in a working end-to-end flow.

---

# Pinch Merch Demo

The repository also contains a simple Pinch Merch storefront in [`pinchmerch/`](./pinchmerch).

The agent can use the same wallet and spending rules to make a purchase.

This demonstrates that the system is not limited to news.

The same idea could be used for:

* News
* APIs
* Data
* Clothes
* Travel
* Airline tickets
* Utilities
* Subscriptions
* Products
* Online services

The long-term idea is simple:

> **If an AI agent can find it online, it should eventually be able to buy it online, within rules set by its owner.**

This is why the potential scope is much larger than a news website.

---

# Why we built this

Our original idea was actually the opposite.

We first thought about building a system that could block other bots.

But while brainstorming the idea with GPT-5.6 and Codex, we started asking a different question:

> **What if bots could become customers instead?**

That changed the project.

AI agents are becoming more capable of searching, comparing, and making decisions. The next step is allowing them to actually buy things on behalf of people.

We wanted to build the payment layer that could make that possible.

The result was BotWallet.

Instead of asking:

> "How do we stop bots?"

We started asking:

> "How do we make money from them?"

That led us to build the three-sided system:

* **Customer:** the person who owns the wallet
* **Agent:** the AI that searches and acts
* **Vendor:** the website that sells the product or information

---

# Local development

## 1) BotWallet setup

Copy the environment template:

```bash
cp .env.example .env
```

Set Pinch test credentials in `.env`:

* `PINCH_CLIENT_ID`
* `PINCH_CLIENT_SECRET`
* `PINCH_PUBLISHABLE_KEY`
* `VITE_PINCH_PUBLISHABLE_KEY`
* `PINCH_ENV=test`

Install and run BotWallet:

```bash
npm install
npm run dev
```

BotWallet frontend:

```text
http://localhost:5173
```

BotWallet backend:

```text
http://localhost:8000
```

---

## 2) BotNews setup

In a second terminal:

```bash
cd BotNews
npm install
npm run dev
```

BotNews:

```text
http://localhost:3001
```

Dashboard:

```text
http://localhost:3001/dashboard
```

---

## 3) CLI demo

From the repository root:

```bash
npm run demo:agent
```

Or:

```bash
npm run demo:agent -- --pay
```

Optional CLI environment overrides:

* `BOTNEWS_URL`
* `BOTWALLET_URL`
* `REPORT_ID`
* `AGENT_ID`
* `WALLET_USER_ID`

---

## 4) Pinch Merch storefront

The supplied-image merch site is in [`pinchmerch/`](./pinchmerch).

With BotWallet running, start it with:

```bash
npm run dev:pinchmerch
```

Open:

```text
http://localhost:5174
```

The three shirt buttons make a £50.00 AUD purchase through the connected Bot Limit.

Increase the daily and auto-approve rules first if necessary.

---

# API routes

## BotWallet

* `GET /api/pinch/wallet`
* `POST /api/pinch/connect-wallet`
* `PATCH /api/pinch/wallet`
* `POST /api/agent/purchase-premium`
* `POST /api/agent/unlock-premium`

`unlock-premium` performs the end-to-end BotNews integration:

1. Reads the BotNews offer.
2. Receives the `402 Payment Required` response.
3. Applies budget and approval rules.
4. Charges through Pinch.
5. Calls the BotNews settlement endpoint.
6. Retries the request.
7. Returns the unlocked content.

---

# Environment variables

The root `.env` uses:

* `PINCH_CLIENT_ID`
* `PINCH_CLIENT_SECRET`
* `PINCH_PUBLISHABLE_KEY`
* `VITE_PINCH_PUBLISHABLE_KEY`
* `PINCH_ENV`
* `BOTNEWS_BASE_URL` (default `http://localhost:3001`)
* `BOTNEWS_DEFAULT_REPORT_ID` (default `market-report-001`)
* `BOTWALLET_ALLOWED_ORIGINS` (optional)
* `BOTWALLET_DEV_API_PROXY` (optional local dev proxy override)
* `VITE_BOTWALLET_API_BASE_URL` (optional when frontend and backend are hosted separately)
* `PORT`

Never expose `PINCH_CLIENT_SECRET` in frontend variables.

---

# Deploy to Vercel

Deploy as two Vercel projects from the same GitHub repository.

## Project A: BotWallet

* Root directory: repository root
* Uses `vercel.json` at root
* Build command: `npm run build`
* Output directory: `dist`

Set these BotWallet environment variables in Vercel:

* `PINCH_CLIENT_ID`
* `PINCH_CLIENT_SECRET`
* `PINCH_ENV=test`
* `VITE_PINCH_PUBLISHABLE_KEY`
* `BOTNEWS_BASE_URL=https://YOUR-BOTNEWS-URL.vercel.app`
* `BOTWALLET_ALLOWED_ORIGINS=https://YOUR-BOTWALLET-URL.vercel.app`

## Project B: BotNews

* Root directory: `BotNews`
* Uses `BotNews/vercel.json`
* No secrets required for the current demo implementation

After deployment:

1. Copy the public BotNews URL.
2. Set `BOTNEWS_BASE_URL` in the BotWallet Vercel project.
3. Redeploy BotWallet.


<<<<<<< HEAD
* The current news response is hardcoded for the demo, but the payment architecture is designed to work with other websites, APIs, and online services that implement the same machine-readable payment flow.
* A website does not need to rebuild its entire payment system to support this concept. The goal is for existing HTTP-based services to be able to add a machine-readable payment flow with low adoption friction.
* BotWallet can be used as its own AI assistant or potentially as a payment tool for other AI agents.
* Guardrails for keeping agents focused on the user's requested task are still being developed.

The core idea is:

> **AI agents can become customers, and Pinch can provide the payment infrastructure for the new agent economy.**

The opportunity is much bigger than one news website.

As AI agents become more autonomous, they will need to buy more things. If Pinch becomes an early payment provider for that activity, it could gain transaction volume, new customer data, and an early position in a future industry before the market becomes crowded.
=======
- BotWallet web UI can run the premium unlock flow publicly.
- BotNews is publicly browsable and exposes premium report APIs.
- CLI demo still works locally with default localhost URLs or public URL overrides.
- Wallet persistence is file-based locally and memory-backed when deployed on read-only serverless filesystem.
# BotWallet

## ChatGPT MCP connection

BotWallet exposes an official MCP Streamable HTTP endpoint at `/mcp`. The MCP server reuses the existing server-side wallet, Bot Limit checks, Pinch payment service, and BotNews 402 settlement flow; it never receives card details or exposes Pinch secrets.

1. Install dependencies: `npm install`
2. Set `MCP_AUTH_TOKEN` to a long random value in `.env` (mandatory for production).
3. Start the API/MCP server: `npm run dev:mcp`
4. Test locally with MCP Inspector: `npx @modelcontextprotocol/inspector`, select **Streamable HTTP**, and use `http://localhost:8000/mcp` with `Authorization: Bearer <MCP_AUTH_TOKEN>`.

The MCP tools are `get_wallet_status`, `search_research`, `purchase_premium_content`, `research_with_wallet`, `search_travel_options`, `purchase_travel_bundle`, `search_service_providers`, and `book_service`. Every purchase-capable tool calls the existing server-side Bot Limit and Pinch payment services, so approval and daily limits cannot be bypassed. BotNews is configured as repeatable pay-per-access: a delivered report consumes its access pass and the next request receives a new 402 offer.

For ChatGPT developer-mode testing, deploy this same API at a stable HTTPS URL and connect `https://YOUR-DOMAIN/mcp`. Do not use a temporary tunnel for submission. Configure `MCP_AUTH_TOKEN`, `PINCH_CLIENT_SECRET`, and the BotNews URL only in the deployment's server-side environment. A production, user-facing ChatGPT connection should add OAuth on top of the bearer-token gate before publication.
>>>>>>> ffa40eb (Publish latest BotWallet, BotNews, and planning updates)
