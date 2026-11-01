# Fino Paradise

A 2D isometric social virtual world for Android. Explore towns, parks, beaches and cafés; customize avatars; decorate personal homes; meet friends; chat; collect pets; and play mini-games.

This is an original project inspired by the social virtual-world genre. All art, characters, maps, names and assets will be original. No proprietary Ameba Pico assets are included.

## Architecture

- Client: Unity 2D and C#, Android first.
- Realtime: Colyseus (Node.js / TypeScript) for world rooms, presence, movement, emotes and live chat.
- Identity and persistence: Firebase Authentication and Cloud Firestore.
- Trust boundary: trusted server validates wallets, inventory, purchases and trades. Clients never write authoritative currency or ownership.

## Repository layout

- Unity/: Unity Android game client.
- Server/: Colyseus multiplayer backend.
- Firebase/: Firestore rules and setup.
- Documentation/: architecture and development guides.

## Milestones

1. Unity project, isometric town and playable avatar.
2. Colyseus rooms and synchronized avatars.
3. Firebase Authentication and player profiles.
4. Friends, chat, private messages and room visits.
5. Homes, furniture, inventory, shops and economy.
6. Pets, mini-games, moderation and release hardening.

See Documentation/ARCHITECTURE.md and Documentation/DEVELOPMENT.md.

## Security

Never commit service-account JSON, signing keys, keystores, passwords or production tokens. Production multiplayer must verify Firebase ID tokens. Economy and trading require server-side transactions, idempotency and audit logs. Add reporting, blocking, moderation and rate limits before public launch.

## License

To be selected before public distribution. Third-party SDKs retain their own licenses.
