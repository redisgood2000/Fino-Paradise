# Fino Paradise architecture

## Runtime topology

Unity Android client handles rendering, input, avatar presentation, home editing and mini-games. It connects to a Colyseus server for realtime room state and to Firebase Authentication for identity. A trusted backend using Firebase Admin SDK persists profiles, inventory, homes, friendships and economy records.

## Authority boundaries

| Domain | Authority | Client responsibility |
|---|---|---|
| Position and room presence | Colyseus room | Send input; interpolate remote avatars |
| Account identity | Firebase Auth verified by server | Sign in and pass ID token |
| Public profile | Firestore rules and server validation | Display and submit permitted edits |
| Coins and diamonds | Trusted backend only | Display server-issued balance |
| Inventory and purchases | Trusted backend only | Request purchase and render result |
| Trading | Trusted backend transaction | Propose, accept or reject |
| Home layout | Validated persistence API | Edit locally and submit bounded placements |
| Chat | Realtime server plus moderation | Send bounded text; mute, report and block |

## Multiplayer model

Each public destination is a Colyseus room with a stable world ID such as sunny-town, beach or cafe. Rooms have configurable player caps. Clients send directional input, not authoritative coordinates. The server validates movement speed, world bounds, collision and message rate. Remote clients interpolate server snapshots. Chat is length-limited and rate-limited. Private messages must be authenticated, authorized and persisted under a clear retention policy.

## Persistence model

Suggested Firestore collections:
- users/{uid}: display name, avatar selection and profile metadata.
- users/{uid}/inventory/{itemInstanceId}: owned item instances.
- homes/{uid}: theme and validated furniture placements.
- friendships/{pairId}: canonical pair ID and relationship status.
- catalog/{itemId}: server-managed item catalog.
- trades/{tradeId}: state machine, participants, item IDs and version.
- wallets/{uid}: server-managed balances.
- ledger/{entryId}: append-only economy audit entries.

Firestore rules deny client writes to wallets, inventory, trades, catalog and ledger. Trusted server code uses Firebase Admin SDK and Firestore transactions.

## Scale and reliability

Start with one Colyseus process and room capacity limits. Add Redis presence and driver only after measuring concurrency. Production requires WSS, health checks, structured logs, reconnect handling, rate limits and load tests.
