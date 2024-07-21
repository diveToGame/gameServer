import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { log } from "console";
import { Server, WebSocket } from "ws";
import { LogonDTO } from "./dto/LogonDTO";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./user/entity/user.entity";

@WebSocketGateway(8080, { path: "/room", transports: ["websocket"] })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(UserEntity)
    private userRepositoy: Repository<UserEntity>
  ) {}

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

  @SubscribeMessage("logon")
  handleLogon(client: WebSocket, data: LogonDTO) {
    const token = "secret token";

    log("%s login : %s", data.username, data.password);

    const result: Promise<UserEntity> = this.userRepositoy.findOne({
      where: { username: data.username, password: data.password },
    });

    result
      .then((user) => {
        if (data.password.match(user.password)) {
          this.clientMap.set(token, client);
          client.send(JSON.stringify({ event: "logon", data: token }));
        } else {
          client.send(JSON.stringify({ event: "logon", data: null }));
        }
      })
      .catch((e) => {
        client.send(JSON.stringify({ event: "logon", data: null }));
      });
  }

  @SubscribeMessage("events")
  onEvent(client: WebSocket, data: UserEntity) {
    log("test: id: {} / name: {} / pass: {}", data.email, data.username, data.password);
    [1, 2, 3].forEach((item) => {
      client.send(JSON.stringify({ event: "events", data: item }));
    });
  }

  @SubscribeMessage("message")
  onMessage(client: WebSocket, data: number) {
    client.send(JSON.stringify({ event: "message", data }));
  }

  @SubscribeMessage("validate")
  onValidate(client: WebSocket, data: string) {
    if (this.clientMap.has(data)) {
      log("Ready to send OK message");
      this.clientMap.get(data).send(JSON.stringify({ event: "validate", data: "You can come in" }));
    } else {
      client.send(JSON.stringify({ event: "validate", data: "You cannot come in" }));
    }
  }

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

@WebSocketGateway(8080, { path: "lobbyaaaaa", transports: ["websocket"] })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: WebSocket, ...args: any[]) {
    log("Client connected to lobby:", client);
  }

  handleDisconnect(client: WebSocket) {
    log("Client disconnected from lobby:", client);
  }

  @SubscribeMessage("broadcast")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBroadcast(client: WebSocket, data: any) {
    log("Client broadcast to lobby");
    this.server.clients.forEach((e) => {
      if (e.readyState === WebSocket.OPEN) {
        if (e === client) {
          e.send("Lobby: welcome!");
        } else {
          e.send("Lobby: Hello everybody");
        }
      }
    });
  }
}
