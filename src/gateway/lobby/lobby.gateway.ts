import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { Logger } from "@nestjs/common";
import { AsyncApiPub, AsyncApiSub } from "nestjs-asyncapi";
import { TestDTO } from "./dto/outbound/lobby.test.dto.outbound";

@WebSocketGateway(8080, { path: "lobby", transports: ["websocket"] })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LobbyGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: WebSocket) {
    this.logger.log("Client connected to lobby:");
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log("Client disconnected from lobby:");
  }

  @SubscribeMessage("broadcast")
  @AsyncApiPub({
    channel: "lobby/broadcast",
    message: [
      {
        name: "oneOf pub demo",
        payload: TestDTO,
      },
    ],
  })
  @AsyncApiSub({
    channel: "lobby/broadcast",
    message: [
      {
        name: "oneOf demo",
        payload: TestDTO,
      },
    ],
  })
  onBroadcast(client: WebSocket, data: any) {
    this.logger.log("Client broadcast to lobby");
    this.server.clients.forEach((e) => {
      if (e.readyState === WebSocket.OPEN) {
        if (e === client) {
          const payload: TestDTO = { msg: "Lobby: welcome!" };
          e.send(JSON.stringify(payload));
        } else {
          e.send("Lobby: Hello everybody");
        }
      }
    });
  }
}
