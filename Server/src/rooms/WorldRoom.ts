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

type Direction = { x: number; y: number };

const clean = (value: unknown, max: number): string =>
  String(value ?? "").replace(/[\\u0000-\\u001f\\u007f]/g, "").trim().slice(0, max);

export class WorldRoom extends Room {
  state = new WorldState();
  maxClients = Number(process.env.MAX_PLAYERS_PER_ROOM ?? 40);
  private readonly inputs = new Map<string, Direction>();

  onCreate(options: JoinOptions) {
    this.state.worldId = clean(options.worldId || "sunny-town", 48) || "sunny-town";

    // Server-owned simulation: packet frequency cannot increase movement speed.
    this.setSimulationInterval((deltaTime) => {
      const dt = Math.min(Math.max(deltaTime / 1000, 0), 0.1);
      const speed = 3.0;

      for (const [sessionId, player] of this.state.players) {
        const direction = this.inputs.get(sessionId);
        if (!direction) continue;

        player.x = Math.max(-50, Math.min(50, player.x + direction.x * speed * dt));
        player.y = Math.max(-50, Math.min(50, player.y + direction.y * speed * dt));
      }
    }, 50);

    this.onMessage("move", (client, payload: unknown) => {
      if (!this.state.players.has(client.sessionId)) return;
      if (typeof payload !== "object" || payload === null) return;

      const data = payload as { dx?: unknown; dy?: unknown };
      const dx = Number(data.dx);
      const dy = Number(data.dy);
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;

      const magnitude = Math.hypot(dx, dy);
      if (magnitude > 1.01) return;
      const divisor = Math.max(1, magnitude);
      this.inputs.set(client.sessionId, { x: dx / divisor, y: dy / divisor });
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
      // TODO: verify the Firebase ID token using firebase-admin and return decoded uid.
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
    const player = new Player();
    player.uid = auth.uid;
    player.displayName = auth.displayName;
    player.avatarId = clean(options.avatarId || "avatar-default", 64);
    this.state.players.set(client.sessionId, player);
    this.inputs.set(client.sessionId, { x: 0, y: 0 });
    this.broadcast("presence", { event: "joined", uid: auth.uid, displayName: auth.displayName });
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) this.broadcast("presence", { event: "left", uid: player.uid });
    this.inputs.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
  }
}
