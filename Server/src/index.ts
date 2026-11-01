import "dotenv/config";
import { defineRoom, defineServer } from "colyseus";
import { WorldRoom } from "./rooms/WorldRoom.js";

const port = Number.parseInt(process.env.PORT ?? "2567", 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}

const server = defineServer({
  rooms: {
    world: defineRoom(WorldRoom),
  },
});

await server.listen(port);
console.log("Fino Paradise realtime server listening on port " + port);
