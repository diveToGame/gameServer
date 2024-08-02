import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { Logger } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { Ticket } from "src/auth/vo/auth.ticket.vo";

@WebSocketGateway(8080, { path: "lobby", transports: ["websocket"] })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LobbyGateway.name);

  @WebSocketServer()
  private readonly server: Server;
  private readonly socketMap = new Map<WebSocket, Ticket>();

  constructor(private readonly authService: AuthService) {}

  handleConnection() {
    this.logger.log("Someone connected to lobby");
  }

  handleDisconnect(client: WebSocket) {
    this.socketMap.get(client);
    this.logger.log("Client disconnected from lobby:");
  }

  @SubscribeMessage("broadcast")
  // @AsyncApiSub({
  //   channel: "lobby/broadcast",
  //   message: [
  //     {
  //       name: "oneOf demo",
  //       payload: TestRTO,
  //     },
  //   ],
  // })
  onBroadcast(client: WebSocket) {
    this.logger.log("Client broadcast to lobby");
    this.server.clients.forEach((e) => {
      if (e.readyState === WebSocket.OPEN) {
        if (e === client) {
          e.send(JSON.stringify("Lobby: welcome!"));
        } else {
          e.send("Lobby: Hello everybody");
        }
      }
    });
  }
}
