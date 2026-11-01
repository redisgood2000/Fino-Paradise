import { Room, type Client } from "colyseus";
import { schema, t } from "@colyseus/schema";

const Player = schema({
  uid: t.string(),
  displayName: t.string(),
  avatarId: t.string(),
  x: t.number().default(0),
  y: t.number().default(0),
  facing: t.string().default("down"),
}, "Player");

const WorldState = schema({
  worldId: t.string().default("sunny-town"),
  players: t.map(Player),
}, "WorldState");

type JoinOptions = {
  firebaseIdToken?: string;
  displayName?: string;
  avatarId?: string;
  worldId?: string;
};

const clean = (value: unknown, max: number): string =>
  String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);

export class WorldRoom extends Room {
  state = new WorldState();
  maxClients = Number(process.env.MAX_PLAYERS_PER_ROOM ?? 40);

  onCreate(options: JoinOptions) {
    this.state.worldId = clean(options.worldId || "sunny-town", 48) || "sunny-town";

    this.onMessage("move", (client, payload: unknown) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof payload !== "object" || payload === null) return;

      const data = payload as { dx?: unknown; dy?: unknown };
      const dx = Number(data.dx);
      const dy = Number(data.dy);
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;

      // Client sends directional input, never absolute coordinates.
      const magnitude = Math.hypot(dx, dy);
      if (magnitude > 1.01) return;
      const speed = 3.0;
      const step = 0.1;
      const divisor = Math.max(1, magnitude);
      player.x = Math.max(-50, Math.min(50, player.x + dx / divisor * speed * step));
      player.y = Math.max(-50, Math.min(50, player.y + dy / divisor * speed * step));
    });

    this.onMessage("chat", (client, payload: unknown) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof payload !== "object" || payload === null) return;
      const message = clean((payload as { text?: unknown }).text, 240);
      if (!message) return;
      this.broadcast("chat", {
        uid: player.uid,
        displayName: player.displayName,
        text: message,
        sentAt: Date.now(),
      });
    });

    this.onMessage("emote", (client, payload: unknown) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof payload !== "object" || payload === null) return;
      const emoteId = clean((payload as { emoteId?: unknown }).emoteId, 24);
      if (!["wave", "dance", "laugh", "heart", "sit"].includes(emoteId)) return;
      this.broadcast("emote", { uid: player.uid, emoteId });
    });
  }

  async onAuth(_client: Client, options: JoinOptions) {
    if (process.env.NODE_ENV === "production") {
      if (!options.firebaseIdToken) throw new Error("Authentication required");
      // TODO: verify Firebase ID token using firebase-admin before production.
      throw new Error("Firebase Admin token verification is not configured");
    }

    // Development-only identity; never enable this path in production.
    const uid = clean(options.firebaseIdToken, 128);
    if (!uid) throw new Error("Development identity token is required");
    return {
      uid,
      displayName: clean(options.displayName || "Fino Player", 24) || "Fino Player",
    };
  }

  onJoin(client: Client, options: JoinOptions, auth: { uid: string; displayName: string }) {
    this.state.players.set(client.sessionId, new Player({
      uid: auth.uid,
      displayName: auth.displayName,
      avatarId: clean(options.avatarId || "avatar-default", 64),
    }));
    this.broadcast("presence", { event: "joined", uid: auth.uid, displayName: auth.displayName });
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) this.broadcast("presence", { event: "left", uid: player.uid });
    this.state.players.delete(client.sessionId);
  }
}
