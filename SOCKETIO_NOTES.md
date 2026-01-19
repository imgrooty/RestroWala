# Socket.io on Vercel - Important Notes

## Current Implementation

This application uses Socket.io for real-time features via the Next.js Pages Router API (`/pages/api/socketio.ts`).

## Vercel Serverless Limitations

⚠️ **Important**: Socket.io has known limitations on Vercel's serverless platform:

1. **Stateless Functions**: Each serverless function invocation is stateless and short-lived
2. **No Persistent WebSocket Connections**: WebSocket connections may be dropped when functions scale to zero
3. **Connection Pooling Issues**: Multiple serverless instances cannot share Socket.io connections
4. **Development vs Production**: Works well in development (`npm run dev`) but may be unreliable in production

## Recommended Alternatives for Production

### Option 1: Vercel KV + Server-Sent Events (Recommended)

Replace Socket.io with Vercel KV for pub/sub and use Server-Sent Events (SSE) for client updates.

**Pros:**
- Native Vercel integration
- Better serverless compatibility
- Lower latency
- Cost-effective

**Implementation:**
```typescript
// Use Vercel KV for pub/sub
import { kv } from '@vercel/kv';

// Publish event
await kv.publish('orders', JSON.stringify(orderData));

// Subscribe with SSE endpoint
// Client connects to /api/events endpoint for real-time updates
```

### Option 2: Pusher / Ably

Use a managed real-time service like Pusher or Ably.

**Pros:**
- Fully managed
- Reliable at scale
- Easy to integrate
- Free tier available

**Implementation:**
```typescript
// Install: npm install pusher
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

// Trigger event
pusher.trigger('orders', 'status-changed', data);
```

### Option 3: Polling

Implement polling for real-time updates (simplest approach).

**Pros:**
- Works everywhere
- No additional services needed
- Easy to implement

**Cons:**
- Higher latency
- More API calls
- Less efficient

**Implementation:**
```typescript
// Client polls every 3-5 seconds
const interval = setInterval(async () => {
  const response = await fetch('/api/orders/updates');
  const updates = await response.json();
  // Update UI with new data
}, 5000);
```

### Option 4: Deploy Socket.io Separately

Keep Socket.io but deploy it on a platform that supports persistent connections.

**Recommended Platforms:**
- [Railway](https://railway.app) - Easy deployment, affordable
- [Render](https://render.com) - Free tier available
- [Fly.io](https://fly.io) - Edge deployment
- [Heroku](https://heroku.com) - Classic option

**Architecture:**
1. Deploy Next.js app on Vercel (without Socket.io)
2. Deploy Socket.io server separately
3. Configure CORS to allow Vercel domain
4. Update client to connect to separate Socket.io URL

```typescript
// Update client connection
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001');
```

## Testing Socket.io on Vercel

To test if Socket.io works in your deployment:

1. Deploy to Vercel
2. Open browser console
3. Check for Socket.io connection logs
4. Test real-time features (order updates, table status)
5. Monitor for dropped connections

If you experience issues:
- Connections drop frequently
- Events are not received
- Long delays in updates

Then consider implementing one of the alternatives above.

## Migration Guide

### From Socket.io to Pusher

1. **Install Pusher**
   ```bash
   npm install pusher pusher-js
   ```

2. **Replace Server-side Events**
   ```typescript
   // OLD: lib/socket.ts
   export const emitOrderStatusChanged = (data) => {
     global.io.emit('order:status-changed', data);
   };
   
   // NEW: lib/pusher.ts
   export const emitOrderStatusChanged = (data) => {
     pusher.trigger('orders', 'status-changed', data);
   };
   ```

3. **Replace Client-side Connection**
   ```typescript
   // OLD: useSocket.ts
   const socket = io();
   socket.on('order:status-changed', handleUpdate);
   
   // NEW: usePusher.ts
   const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY);
   const channel = pusher.subscribe('orders');
   channel.bind('status-changed', handleUpdate);
   ```

## Current State

The Socket.io implementation is configured and may work on Vercel for:
- ✅ Low traffic applications
- ✅ Development/testing
- ⚠️ Short-lived connections

It may **not** work reliably for:
- ❌ High traffic applications
- ❌ Long-lived connections
- ❌ Critical real-time features

## Recommendation

For production use on Vercel, we recommend:
1. **Start with current implementation** - Test if it meets your needs
2. **Monitor connection stability** - Watch for dropped connections
3. **Implement fallback** - Add polling as backup
4. **Plan migration** - If issues occur, migrate to Pusher/Ably or deploy Socket.io separately

## Additional Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Pusher Documentation](https://pusher.com/docs)
- [Ably Documentation](https://ably.com/docs)
- [Socket.io on Serverless](https://socket.io/docs/v4/serverless/)

---

Last Updated: 2026-01-19
