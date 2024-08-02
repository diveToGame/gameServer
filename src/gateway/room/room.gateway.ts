import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { log } from "console";
import { Server } from "ws";

@WebSocketGateway(8080, { path: "/room", transports: ["websocket"] })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  clientMap = new Map<string, WebSocket>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: WebSocket, ...args: any[]) {
    log("Client connected to room");
  }

  handleDisconnect(client: WebSocket) {
    // Remove client from map
    for (const [key, value] of this.clientMap.entries()) {
      if (value === client) {
        this.clientMap.delete(key);
        break;
      }
    }
  }

  @SubscribeMessage("validate")
  onValidate() {}

  @SubscribeMessage("broadcast")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBroadcast(client: WebSocket, data: any) {
    log("Client broadcast to room");
    this.server.clients.forEach((e) => {
      if (e.readyState === WebSocket.OPEN) {
        e.send("Room: Hello everybody");
      }
    });
  }
}
