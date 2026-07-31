# BotWallet Merchant Resource Protocol

BotWallet treats paid access as a resource, not only a product. A resource can be an article, API call, dataset, report, download, ticket, subscription, or physical item.

## Discovery

`GET /resources/:id`

If payment is required, return `402 Payment Required` with a machine-readable offer:

```json
{
  "merchant": "Example Merchant",
  "resourceId": "premium-report-001",
  "title": "Premium market report",
  "priceInCents": 100,
  "currency": "AUD",
  "paymentProvider": "BotWallet"
}
```

## Settlement

After BotWallet has completed the Pinch payment, it calls `POST /resources/:id/settle` with the agent identity or a verified payment receipt. The merchant then marks the resource as available to that agent.

## Retrieval

Retry `GET /resources/:id`. Return `200 OK` with the resource content, download URL, order confirmation, or shipping receipt.

This is the contract demonstrated by BotNews. Pinch Merch uses the same idea for a physical resource: the item is free and the only payable resource cost is $11.00 AUD shipping.
