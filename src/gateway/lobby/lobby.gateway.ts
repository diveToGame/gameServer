import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { AddressInfo, Server, WebSocket } from "ws";
import { Logger, UseGuards } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { RoomVO } from "./vo/lobby.room.vo";

@UseGuards(AuthGuard)
@WebSocketGateway({ path: "/lobby", transports: ["websocket"] }) // WebSocket 경로를 지정합니다.
export class LobbyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  readonly server: Server;

  private readonly logger = new Logger(LobbyGateway.name);

  private readonly TIMEOUT_DURATION = 30000;

  private rooms: Map<number, RoomVO> = new Map();

  constructor(private readonly authService: AuthService) {}

  afterInit() {
    console.log("WebSocket server is running on port:");
  }

  getPort(): number {
    const address = this.server.address() as AddressInfo;

    return address.port;
  }

  handleConnection(client: WebSocket) {
    console.log("Client connected");

    const timeout = setTimeout(() => {
      console.log("Client timed out due to inactivity");
      client.close();
    }, this.TIMEOUT_DURATION);

    client.on("message", () => {
      clearTimeout(timeout);
    });

    client.on("close", () => {
      console.log("Client disconnected");
      clearTimeout(timeout);
      // this.leaveAllRooms(client);
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log("Client disconnected");
    // this.leaveAllRooms(client);
  }

  @SubscribeMessage("joinLobby")
  async handleJoinLobby(@MessageBody() data: { accessToken: string }, @ConnectedSocket() client: WebSocket) {
    client.send(JSON.stringify({ event: "joinedLobby", data: { message: "Welcome to the lobby!" } }));
  }

  // @SubscribeMessage("refreshLobby")
  // async handleRefreshLobby(@MessageBody() data: { accessToken: string }, @ConnectedSocket() client: WebSocket) {

  // }

  // @SubscribeMessage("createRoom")
  // async handleCreateRoom(
  //   @MessageBody() data: { roomName: string; accessToken: string },
  //   @ConnectedSocket() client: WebSocket
  // ) {
  //   const roomName = data.roomName;

  //   this.rooms.set(roomName, new Set([client]));
  //   client.send(JSON.stringify({ event: "roomCreated", data: { roomName } }));
  // }

  // @SubscribeMessage("joinRoom")
  // async handleJoinRoom(
  //   @MessageBody() data: { roomName: string; accessToken: string },
  //   @ConnectedSocket() client: WebSocket
  // ) {
  //   const roomName = data.roomName;
  //   if (!this.rooms.has(roomName)) {
  //     client.send(JSON.stringify({ event: "error", data: { message: "Room does not exist" } }));
  //     return;
  //   }
  //   this.rooms.get(roomName).add(client);
  //   client.send(JSON.stringify({ event: "joinedRoom", data: { roomName } }));
  // }

  // @SubscribeMessage("leaveRoom")
  // async handleLeaveRoom(
  //   @MessageBody() data: { roomName: string; accessToken: string },
  //   @ConnectedSocket() client: WebSocket
  // ) {
  //   const roomName = data.roomName;
  //   if (this.rooms.has(roomName)) {
  //     const room = this.rooms.get(roomName);
  //     room.delete(client);
  //     if (room.size === 0) {
  //       this.rooms.delete(roomName);
  //     }
  //   }
  //   client.send(JSON.stringify({ event: "leftRoom", data: { roomName } }));
  // }

  // private leaveAllRooms(client: WebSocket) {
  //   this.rooms.forEach((clients, roomName) => {
  //     clients.delete(client);
  //     if (clients.size === 0) {
  //       this.rooms.delete(roomName);
  //     }
  //   });
  // }
}
