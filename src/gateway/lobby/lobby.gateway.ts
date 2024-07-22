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
import { TestRTO } from "./rto/lobby.test.rto";

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
  @AsyncApiSub({
    channel: "lobby/broadcast",
    message: [
      {
        name: "oneOf demo",
        payload: TestRTO,
      },
    ],
  })
  onBroadcast(client: WebSocket, data: any) {
    this.logger.log("Client broadcast to lobby");
    this.server.clients.forEach((e) => {
      if (e.readyState === WebSocket.OPEN) {
        if (e === client) {
          const payload: TestRTO = { msg: "Lobby: welcome!" };
          e.send(JSON.stringify(payload));
        } else {
          e.send("Lobby: Hello everybody");
        }
      }
    });
  }
}
