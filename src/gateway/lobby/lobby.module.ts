import { Module } from "@nestjs/common";
import { LobbyGateway } from "./lobby.gateway";
import { AuthService } from "src/auth/auth.service";

@Module({
  imports: [AuthService],
  providers: [LobbyGateway],
})
export class LobbyModule {}
