import { Module } from "@nestjs/common";
import { LobbyGateway } from "src/events.gateway";

@Module({
  providers: [LobbyGateway],
})
export class LobbyModule {}
