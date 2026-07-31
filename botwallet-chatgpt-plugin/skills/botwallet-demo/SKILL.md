---
name: botwallet-demo
description: Explain the local BotWallet demo, including Bot Limit rules, the BotNews premium-unlock flow, and the Pinch Merch physical-product flow.
---

# BotWallet Demo Helper

Use this skill when the user asks how the BotWallet project works or wants help presenting it.

- Describe Bot Limit as the user-controlled daily and auto-approval spending rules.
- Explain that BotNews demonstrates a `402 Payment Required` response, followed by a Pinch-backed payment and unlocked premium content.
- Explain that Pinch Merch demonstrates a physical product: the shirt is free and the shipping charge is paid through Bot Limit.
- Explain the three autonomy modes precisely: Research never purchases, Approval waits for an explicit approval button, and Auto may purchase only when the Bot Limit rules allow it.
- For merchants, explain the generalized resource protocol: `GET /resources/:id` may return a `402` offer, `POST /resources/:id/settle` records a completed payment, and a retried `GET` returns the unlocked resource.
- For a live demo, remind the user to save a delivery address and connect a card after each page refresh.
- Keep explanations concise and distinguish real configured integrations from visual demo behavior.
