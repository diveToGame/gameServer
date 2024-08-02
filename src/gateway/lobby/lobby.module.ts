import { AuthModule } from "./../../auth/auth.module";
import { Module } from "@nestjs/common";
import { LobbyGateway } from "./lobby.gateway";

@Module({
  imports: [AuthModule],
  providers: [LobbyGateway],
})
export class LobbyModule {}
