# /setup-capi — Meta CAPI Setup Assistant

## Usage
```
/setup-capi --platform=shopify --events="Purchase,InitiateCheckout,AddToCart" --pixel-id=123456789
/setup-capi --platform=node --events="Purchase,Lead" --pixel-id=123456789 --test-mode=true
```

## Parameters
- --platform (required): "shopify", "stripe", "node", "python"
- --events (required): Comma-separated — "Purchase,AddToCart,InitiateCheckout,ViewContent,Lead"
- --pixel-id (required): Your Meta Pixel ID
- --test-mode (default: false): Send events to Meta's test event tool
- --output-dir (default: ./capi-implementation/): Directory to write generated files

## Prerequisites
- Meta Pixel ID (Events Manager > Data Sources)
- Meta System User access token: ads_management + business_management permissions
- Node.js 18+ or Python 3.9+
- Existing browser pixel on site (for deduplication)

## Instructions

1. Generate core CAPI event handler (./capi-implementation/capi-handler.js):
   Use facebook-nodejs-business-sdk.
   Create sendCapiEvent(eventName, userData, customData, eventId) with:
   - UserData: hashed email/phone/name via SHA-256, clientIpAddress,
     clientUserAgent, fbc from _fbc cookie, fbp from _fbp cookie
   - CustomData: value, currency, orderId, contentIds
   - ServerEvent: setEventName, setEventTime, setUserData, setCustomData,
     setEventSourceUrl, setActionSource=website, setEventId for dedup
   Include hashPii() helper using crypto.createHash('sha256').

2. Generate event-specific handlers in ./capi-implementation/events/{event-name}.js
   for each event in --events.
   Purchase handler maps: value=order.total_price, currency=order.currency,
   order_id=order.id (also used as event_id for dedup),
   content_ids=order.line_items.map(i=>i.product_id).

3. Generate Shopify webhook handler (if --platform=shopify):
   ./capi-implementation/shopify-webhook.js — Express route POST /webhooks/shopify/:event_type
   Verify HMAC signature from Shopify-Hmac-Sha256 header
   Map orders/paid → Purchase, checkouts/create → InitiateCheckout
   Return 200 within 5 seconds.

4. Generate deduplication config ./capi-implementation/dedup-config.js:
   Strategy: browser pixel fires with eventID matching CAPI's event_id.
   Browser: fbq('track', 'Purchase', data, {eventID: orderId})
   CAPI: setEventId(orderId)
   Same event_id causes Meta to count once, not twice.

5. Generate .env.example with:
   META_CAPI_TOKEN, META_PIXEL_ID, META_TEST_EVENT_CODE, SHOPIFY_WEBHOOK_SECRET

6. Generate test script ./capi-implementation/test-events.js:
   Send one test event per type, use hashed test@example.com,
   report match quality scores from API response.

7. Generate ./capi-implementation/SETUP.md with:
   npm install steps, Shopify webhook configuration, environment variable setup,
   how to read match quality in Events Manager.

## Error Handling
- --pixel-id not provided: stop with clear error
- Unrecognized event name: warn but continue, generate generic handler
- npm install fails in test: provide manual install instructions
